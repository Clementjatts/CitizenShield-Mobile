import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Share, Platform, Alert, Dimensions, Animated, } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { MapType, Region } from "react-native-maps";
import * as SMS from "expo-sms";
import { router } from "expo-router";
import { AppState, AppStateStatus } from "react-native";
import ProfileHeader from "../../components/ProfileHeader";
import CustomMapView, { CustomMapViewRef } from "../../components/MapView";
import EmergencyTypeSelector from "../../components/EmergencyTypeSelector";
import { auth, db } from "../../config/firebaseConfig";
import { doc, setDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { handleFirebaseError } from "../../utils/errorHandler";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface EmergencyData {
  type: string;
  location: LocationCoords;
  timestamp: string;
  userId: string;
  status: string;
}

type EmergencyTypeId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16";

const TRACKING_DURATION = 2 * 60 * 60 * 1000;
const UPDATE_INTERVAL = 15 * 60 * 1000;

Dimensions.get("window");

const getEmergencyTypeText = (typeId: string): string => {
  const emergencyTypes = {
    "1": "Life Threat",
    "2": "Police Abuse",
    "3": "Medical",
    "4": "Fire",
    "5": "Traffic",
    "6": "Disaster",
    "7": "Domestic",
    "8": "Mental",
    "9": "Kidnap",
    "10": "Burglary",
    "11": "Assault",
    "12": "Stalking",
    "13": "Robbery",
    "14": "Shooting",
    "15": "Terrorism",
    "16": "Riot"
  };
  return (
    emergencyTypes[typeId as keyof typeof emergencyTypes] || "Unknown Emergency"
  );
};

const sendEmergencySMS = async (
  emergencyType: string,
  location: LocationCoords
) => {
  if (!auth.currentUser) {
    throw new Error("User must be logged in to send emergency SMS");
  }

  // Fetch emergency contacts
  const contactsSnapshot = await getDocs(
    query(
      collection(db, "emergencyContacts"),
      where("userId", "==", auth.currentUser.uid)
    )
  );

  const contacts = contactsSnapshot.docs.map((doc) => doc.data().phoneNumber);

  if (contacts.length === 0) {
    throw new Error(
      "No emergency contacts found. Please add emergency contacts first."
    );
  }

  // Create emergency message
  const message =
    `EMERGENCY ALERT: I need immediate assistance!\n\n` +
    `Type: ${getEmergencyTypeText(emergencyType)}\n\n` +
    `My current location: https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}\n\n` +
    `This is an automated emergency alert from CitizenShield.`;

  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("SMS is not available on this device");
    }

    await SMS.sendSMSAsync(contacts, message);
    return { contactCount: contacts.length };
  } catch (error) {
    throw new Error("Failed to send SMS: " + error);
  }
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const [mapType, setMapType] = useState<MapType>("standard");
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    null
  );
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyTypeId | null>(null);
  const mapRef = useRef<CustomMapViewRef>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animatedButtonScale = useRef(new Animated.Value(1)).current;
  const [isLoading, setIsLoading] = useState(false);

  // New state variables for location tracking
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState<number | null>(
    null
  );
  const appState = useRef(AppState.currentState);
  const locationUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const currentEmergencyId = useRef<string | null>(null);

  useEffect(() => {
    // Initial setup for location and animation
    const fetchUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(newLocation);

        // Update user's location in Firestore
        if (auth.currentUser) {
          const geocode = await Location.reverseGeocodeAsync(newLocation);
          const address = geocode[0]
            ? `${geocode[0].city}, ${geocode[0].region}`
            : "Unknown location";

          await setDoc(
            doc(db, "users", auth.currentUser.uid),
            {
              location: {
                coords: newLocation,
                address: address,
              },
            },
            { merge: true }
          );
        }
      } catch (error) {
        const errorMessage = handleFirebaseError(error);
        Alert.alert("Error", errorMessage);
      }
    };

    fetchUserLocation();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Set up app state change listener
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      stopLocationTracking();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      isTracking &&
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has come to foreground
      if (currentEmergencyId.current) {
        resumeLocationTracking(currentEmergencyId.current);
      }
    } else if (
      isTracking &&
      appState.current === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has gone to background
      pauseLocationTracking();
    }
    appState.current = nextAppState;
  };

  const startLocationTracking = async (emergencyId: string) => {
    setIsTracking(true);
    setTrackingStartTime(Date.now());
    currentEmergencyId.current = emergencyId;

    // Schedule the first update
    scheduleNextUpdate(emergencyId);
  };

  const scheduleNextUpdate = async (emergencyId: string) => {
    if (!isTracking || !trackingStartTime) return;

    const timeElapsed = Date.now() - trackingStartTime;
    if (timeElapsed >= TRACKING_DURATION) {
      stopLocationTracking();
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      await updateEmergencyLocation(emergencyId, location.coords);

      // Schedule next update
      locationUpdateTimer.current = setTimeout(() => {
        scheduleNextUpdate(emergencyId);
      }, UPDATE_INTERVAL);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const updateEmergencyLocation = async (
    emergencyId: string,
    coords: { latitude: number; longitude: number }
  ) => {
    try {
      const locationUpdate = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date(),
        emergencyId: emergencyId,
      };

      await addDoc(
        collection(db, `emergencies/${emergencyId}/locationUpdates`),
        locationUpdate
      );
    } catch (error) {
      console.error("Error updating emergency location:", error);
    }
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    setTrackingStartTime(null);
    currentEmergencyId.current = null;
    if (locationUpdateTimer.current) {
      clearTimeout(locationUpdateTimer.current);
      locationUpdateTimer.current = null;
    }
  };

  const pauseLocationTracking = () => {
    if (locationUpdateTimer.current) {
      clearTimeout(locationUpdateTimer.current);
      locationUpdateTimer.current = null;
    }
  };

  const resumeLocationTracking = async (emergencyId: string) => {
    if (isTracking && trackingStartTime) {
      scheduleNextUpdate(emergencyId);
    }
  };

  const handleEmergencyTrigger = async (typeId: EmergencyTypeId) => {
    try {
      setIsLoading(true);
      
      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Unable to get your location. Please enable location services and try again.');
        return;
      }

      // Send SMS to emergency contacts
      await sendEmergencySMS(typeId, location);

      // Save emergency to database
      await saveEmergencyAlert({
        type: typeId,
        location: location,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || '',
        status: 'active'
      });

      // Show success message
      Alert.alert(
        'Emergency Alert Sent',
        'Your emergency contacts have been notified of your situation.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  };

  const saveEmergencyAlert = async (emergencyData: EmergencyData) => {
    try {
      await addDoc(collection(db, "emergencies"), emergencyData);
    } catch (error) {
      console.error("Error saving emergency alert:", error);
    }
  };

  // Function to share the current location
  const shareLocation = async () => {
    if (currentLocation) {
      try {
        const result = await Share.share({
          message: `My current location: https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`,
        });
        if (result.action === Share.sharedAction) {
          // shared successfully
        } else if (result.action === Share.dismissedAction) {
          // sharing was dismissed
        }
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    } else {
      Alert.alert("Unable to share", "Current location is not available.");
    }
  };

  // Function to reset the map view to the current location
  const resetLocation = () => {
    if (currentLocation && mapRef.current) {
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Function to handle selecting an emergency type
  const handleEmergencyTypeSelect = (typeId: EmergencyTypeId) => {
    setSelectedEmergencyType(typeId);
  };

  // Function to animate the button when pressed
  const animateButton = (pressed: boolean) => {
    Animated.spring(animatedButtonScale, {
      toValue: pressed ? 0.95 : 1,
      useNativeDriver: true,
    }).start();
  };

  // Function to navigate to the Emergency Contacts screen
  const navigateToEmergencyContacts = () => {
    router.push("/emergency-contacts");
  };

  // Function to navigate to the Police Database screen
  const navigateToPoliceDatabase = () => {
    router.push("/police-database");
  };

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <View style={styles.mapContainer}>
        <CustomMapView
          ref={mapRef}
          style={styles.map}
          mapType={mapType}
          currentLocation={currentLocation}
        />
      </View>

      {/* Map control buttons */}
      <View style={styles.mapControls}>
        <Pressable
          style={[
            styles.mapControlButton,
            { backgroundColor: "white" }
          ]}
          onPress={resetLocation}
        >
          <Ionicons name="locate" size={18} color="#007AFF" />
        </Pressable>
        <Pressable
          style={[
            styles.mapControlButton,
            { backgroundColor: "white" }
          ]}
          onPress={shareLocation}
        >
          <Ionicons name="share-social" size={18} color="#007AFF" />
        </Pressable>
        <Pressable
          style={[
            styles.mapControlButton,
            { backgroundColor: "white" }
          ]}
          onPress={() =>
            setMapType(mapType === "standard" ? "satellite" : "standard")
          }
        >
          <Ionicons
            name={mapType === "standard" ? "map" : "map-outline"}
            size={18}
            color="#007AFF"
          />
        </Pressable>
      </View>

      {/* Buttons for Add Contacts and Police Contact */}
      <View style={styles.buttonContainer}>
        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale: animatedButtonScale }] },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={navigateToEmergencyContacts}
            onPressIn={() => animateButton(true)}
            onPressOut={() => animateButton(false)}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconBackground}>
                <Ionicons name="person-add" size={16} color="white" />
              </View>
              <Text style={styles.buttonText}>Add Contacts</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonWrapper,
            { transform: [{ scale: animatedButtonScale }] },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={navigateToPoliceDatabase}
            onPressIn={() => animateButton(true)}
            onPressOut={() => animateButton(false)}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconBackground}>
                <Ionicons name="shield" size={16} color="white" />
              </View>
              <Text style={styles.buttonText}>Police Contact</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Emergency Type Selector */}
      <View style={styles.overlayContainer}>
        <EmergencyTypeSelector
          selectedType={selectedEmergencyType}
          onSelect={setSelectedEmergencyType}
          onEmergencyTrigger={handleEmergencyTrigger}
        />
      </View>
    </View>
  );
}

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: Platform.OS === 'ios' ? 240 : 220, // Position below the contact buttons
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 12,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mapControlButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  buttonContainer: {
    position: "absolute",
    left: 16, // Changed from right to left
    top: Platform.OS === 'ios' ? 180 : 160,
    zIndex: 2000,
    flexDirection: "column",
    gap: 8,
    backgroundColor: 'transparent',
  },
  buttonWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: 140,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  iconBackground: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
