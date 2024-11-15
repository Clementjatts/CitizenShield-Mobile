import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Share, Platform, Alert, Text, Dimensions, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { MapType, Region } from 'react-native-maps';
import { router } from 'expo-router';
import SOSButton from '../../components/SOSButton';
import ProfileHeader from '../../components/ProfileHeader';
import CustomMapView, { CustomMapViewRef } from '../../components/MapView';
import EmergencyTypeSelector from '../../components/EmergencyTypeSelector';
import { auth, db } from '../../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Add this after the imports but before other code
const getEmergencyTypeText = (typeId: string): string => {
  const emergencyTypes = {
    '1': 'Personal Safety Threat',
    '2': 'Law Enforcement Assistance',
    '3': 'Medical Emergency',
    '4': 'Fire',
    '5': 'Traffic Accident',
    '6': 'Natural Disaster',
    '7': 'Domestic Violence',
    '8': 'Mental Health Crisis'
  };
  return emergencyTypes[typeId as keyof typeof emergencyTypes] || 'Unknown Emergency';
};

Dimensions.get('window');

export default function HomeScreen() {
  const { colors } = useTheme();
  const [mapType, setMapType] = useState<MapType>('standard');
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
  const mapRef = useRef<CustomMapViewRef>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animatedButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        setCurrentLocation(newLocation);

        // Update user's location in Firestore
        if (auth.currentUser) {
          const geocode = await Location.reverseGeocodeAsync(newLocation);
          const address = geocode[0] ? `${geocode[0].city}, ${geocode[0].region}` : 'Unknown location';

          await setDoc(doc(db, 'users', auth.currentUser.uid), {
            location: {
              coords: newLocation,
              address: address
            }
          }, { merge: true });
        }
      } catch (error) {
        const errorMessage = handleFirebaseError(error);
        Alert.alert('Error', errorMessage);
      }
    };

    fetchUserLocation();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Function to handle when the SOS button is activated
  const handleSOSActivate = async (emergencyType: string, location: LocationCoords) => {
    try {
      if (!auth.currentUser) {
        Alert.alert('Error', 'You must be logged in to activate SOS.');
        return;
      }

      const emergencyData = {
        type: getEmergencyTypeText(emergencyType), // Store the full text instead of just the ID
        location: location,
        userId: auth.currentUser.uid,
        timestamp: new Date()
      };

      await setDoc(
        doc(db, 'emergencies', `${auth.currentUser.uid}_${Date.now()}`),
        emergencyData
      );

    } catch (error) {
      const errorMessage = handleFirebaseError(error);
      Alert.alert('Error', `Failed to activate emergency: ${errorMessage}`);
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
        Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
      }
    } else {
      Alert.alert('Unable to share', 'Current location is not available.');
    }
  };

  // Function to reset the map view to the current location
  const resetLocation = () => {
    if (currentLocation && mapRef.current) {
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  // Function to handle selecting an emergency type
  const handleEmergencyTypeSelect = (typeId: string) => {
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
    router.push('/emergency-contacts');
  };

  // Function to navigate to the Police Database screen
  const navigateToPoliceDatabase = () => {
    router.push('/police-database');
  };

  // The main part that shows up on the screen
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
          style={[styles.mapControlButton, { backgroundColor: colors.card }]}
          onPress={resetLocation}
        >
          <Ionicons name="locate" size={20} color={colors.text} />
        </Pressable>
        <Pressable
          style={[styles.mapControlButton, { backgroundColor: colors.card }]}
          onPress={shareLocation}
        >
          <Ionicons name="share-social" size={20} color={colors.text} />
        </Pressable>
        <Pressable
          style={[styles.mapControlButton, { backgroundColor: colors.card }]}
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
        >
          <Ionicons name="map-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Buttons for Add Contacts and Police Contact */}
      <View style={styles.buttonContainer}>
        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: animatedButtonScale }] }]}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.primary + 'CC' : colors.primary }
            ]}
            onPress={navigateToEmergencyContacts}
            onPressIn={() => animateButton(true)}
            onPressOut={() => animateButton(false)}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconBackground}>
                <Ionicons name="person-add" size={18} color="white" />
              </View>
              <Text style={styles.buttonText}>Add Contacts</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: animatedButtonScale }] }]}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.primary + 'CC' : colors.primary }
            ]}
            onPress={navigateToPoliceDatabase}
            onPressIn={() => animateButton(true)}
            onPressOut={() => animateButton(false)}
          >
            <View style={styles.buttonContent}>
              <View style={styles.iconBackground}>
                <Ionicons name="shield" size={18} color="white" />
              </View>
              <Text style={styles.buttonText}>Police Contact</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* SOS button and Emergency Type Selector */}
      <View style={styles.overlayContainer}>
        <View style={styles.sosContainer}>
          <SOSButton
            style={styles.sosButton}
            onActivate={handleSOSActivate}
            selectedEmergencyType={selectedEmergencyType}
          />
          <Animated.View style={[styles.instructionContainer, { opacity: fadeAnim }]}>
            <Text style={styles.instructionText}>
              Select an emergency type and double tap the button to alert your emergency contacts
            </Text>
          </Animated.View>
        </View>
        <EmergencyTypeSelector onSelect={handleEmergencyTypeSelect} selectedType={selectedEmergencyType} />
      </View>
    </View>
  );
}

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    top: '60%',
    transform: [{ translateY: -70 }],
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonContainer: {
    position: 'absolute',
    top: 180,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  button: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  iconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  sosContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sosButton: {
    marginBottom: 10,
  },
  instructionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    maxWidth: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
