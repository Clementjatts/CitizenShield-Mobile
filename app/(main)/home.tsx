import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Share,
  Platform,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { MapType, Region } from "react-native-maps";
import * as SMS from "expo-sms";
import { useRouter } from "expo-router";
import { AppState, AppStateStatus } from "react-native";
import ProfileHeader from "../../components/ProfileHeader";
import CustomMapView, { CustomMapViewRef } from "../../components/MapView";
import EmergencyTypeSelector from "../../components/EmergencyTypeSelector";
import { auth, db } from "../../config/firebaseConfig";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { handleFirebaseError } from "../../utils/errorHandler";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Interface for location coordinates
 * Used for tracking and displaying user's position on the map
 */
interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * Interface for emergency incident data
 * Contains all necessary information about an emergency event
 */
interface EmergencyData {
  type: string;
  location: LocationCoords;
  timestamp: string;
  userId: string;
  status: string;
}

/**
 * Type definition for emergency categories
 * Maps numeric IDs to different types of emergencies
 */
type EmergencyTypeId =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16";

/**
 * Constants for location tracking
 * TRACKING_DURATION: Total duration to track location (2 hours)
 * UPDATE_INTERVAL: Frequency of location updates (15 minutes)
 */
const TRACKING_DURATION = 2 * 60 * 60 * 1000;
const UPDATE_INTERVAL = 15 * 60 * 1000;

Dimensions.get("window");

/**
 * Maps emergency type IDs to their human-readable descriptions
 * Returns the emergency type text or 'Unknown Emergency' if type not found
 */
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
    "16": "Riot",
  };
  return (
    emergencyTypes[typeId as keyof typeof emergencyTypes] || "Unknown Emergency"
  );
};

/**
 * Sends emergency SMS to user's emergency contacts
 * Includes emergency type and location in the message
 * @throws Error if user not logged in or no contacts found
 */
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

/**
 * Main home screen component
 * Handles emergency reporting, location tracking, and map display
 * Includes real-time location updates and emergency type selection
 */
const HomeScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const mapViewRef = useRef<CustomMapViewRef>(null);
  const [mapType, setMapType] = useState<MapType>("standard");
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(
    null
  );
  const [showEmergencyTypes, setShowEmergencyTypes] = useState(true);
  const animatedButtonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyTypeId | null>(null);

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
    if (!currentLocation) {
      Alert.alert("Error", "Unable to get your current location. Please ensure location services are enabled.");
      return;
    }

    setIsLoading(true);
    try {
      // Create emergency data
      const emergencyData: EmergencyData = {
        type: typeId,
        location: currentLocation,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid || "",
        status: "active"
      };

      // Start location tracking
      setIsTracking(true);
      setTrackingStartTime(Date.now());

      // Store emergency in Firestore
      const emergencyRef = await addDoc(collection(db, "emergencies"), emergencyData);
      currentEmergencyId.current = emergencyRef.id;

      // Send emergency SMS
      const emergencyTypeText = getEmergencyTypeText(typeId);
      await sendEmergencySMS(emergencyTypeText, currentLocation);

      // Show success message
      Alert.alert(
        "Emergency Alert Sent",
        "Your emergency contacts have been notified and authorities have been alerted. Stay safe."
      );
    } catch (error) {
      console.error("Error triggering emergency:", error);
      Alert.alert("Error", "Failed to send emergency alert. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyTypeSelect = (typeId: EmergencyTypeId) => {
    setSelectedEmergencyType(typeId);
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
    if (currentLocation && mapViewRef.current) {
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapViewRef.current.animateToRegion(region, 1000);
    }
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
      <View style={styles.headerContainer}>
        <ProfileHeader />
      </View>

      <View style={styles.mapContainer}>
        <CustomMapView
          ref={mapViewRef}
          style={styles.map}
          mapType={mapType}
          currentLocation={currentLocation}
        />

        <View style={[styles.mapControls, { right: 16 }]}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={shareLocation}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.9)"]}
              style={styles.controlButtonCircle}
            >
              <Ionicons name="share-outline" size={22} color={colors.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.emergencyTypeContainer}>
        <EmergencyTypeSelector
          visible={showEmergencyTypes}
          onClose={() => setShowEmergencyTypes(false)}
          onSelect={handleEmergencyTypeSelect}
          onEmergencyTrigger={handleEmergencyTrigger}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    width: "100%",
    height: Platform.OS === "ios" ? 140 : 120,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 0,
    borderRadius: 0,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: "absolute",
    top: 210,
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 6,
  },
  mapControlButton: {
    borderRadius: 30,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  controlButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  emergencyTypeContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default HomeScreen;
