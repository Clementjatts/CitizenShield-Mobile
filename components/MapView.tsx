/**
 * CustomMapView Component
 * A customizable map component that displays user location and supports various map interactions.
 * This component wraps react-native-maps with additional styling and animation features.
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Platform, Animated, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapType, Region, Callout } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkMapStyle } from '../constants/mapStyles';

/**
 * Props interface for the CustomMapView component
 * @interface CustomMapViewProps
 * @property {object} style - Optional custom styles for the container
 * @property {MapType} mapType - The type of map to display (standard, satellite, etc.)
 * @property {object} currentLocation - The current location coordinates (lat/long)
 */
interface CustomMapViewProps {
    style?: object;
    mapType: MapType;
    currentLocation: { latitude: number; longitude: number } | null;
}

/**
 * Ref interface for the CustomMapView component
 * Exposes methods that can be called from the parent component
 * @interface CustomMapViewRef
 */
export interface CustomMapViewRef {
    animateToRegion: (region: Region, duration: number) => void;
}

/**
 * CustomMapView Component
 * @param {CustomMapViewProps} props - Component props
 * @param {React.Ref} ref - Forwarded ref for accessing component methods
 * @returns {React.ReactElement} Rendered component
 */
const CustomMapView = forwardRef<CustomMapViewRef, CustomMapViewProps>(({ style, mapType, currentLocation }, ref) => {
    const { colors } = useTheme();
    // Animation value for marker pulsing effect
    const markerScale = useRef(new Animated.Value(1)).current;
    // Reference to the underlying MapView component
    const mapRef = useRef<MapView>(null);

    /**
     * Expose the animateToRegion method to parent components
     * Allows programmatic control of map region
     */
    useImperativeHandle(ref, () => ({
        animateToRegion: (region: Region, duration: number) => {
            mapRef.current?.animateToRegion(region, duration);
        },
    }));

    /**
     * Set up the pulsing animation effect for the location marker
     * Creates an infinite loop of scaling up and down
     */
    useEffect(() => {
        const pulseMarker = () => {
            Animated.sequence([
                Animated.timing(markerScale, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(markerScale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start(() => pulseMarker());
        };

        pulseMarker();
    }, []);

    return (
        <View style={[styles.container, style]}>
            {/* Main MapView component with configuration */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
                mapType={mapType}
                customMapStyle={darkMapStyle}
                showsUserLocation
                showsMyLocationButton
                showsCompass
                showsScale
                rotateEnabled
                scrollEnabled
                zoomEnabled
                pitchEnabled
                initialRegion={currentLocation ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                } : undefined}
            >
                {/* Custom animated marker for current location */}
                {currentLocation && (
                    <Marker
                        coordinate={{
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }}
                    >
                        <Animated.View style={[styles.markerContainer, { transform: [{ scale: markerScale }] }]}>
                            <View style={styles.marker}>
                                <MaterialCommunityIcons name="map-marker" size={40} color={colors.primary} />
                                <View style={styles.markerDot} />
                            </View>
                        </Animated.View>
                        {/* Callout (info window) for the marker */}
                        <Callout>
                            <BlurView intensity={90} tint="dark" style={styles.callout}>
                                <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.primary} />
                            </BlurView>
                        </Callout>
                    </Marker>
                )}
            </MapView>
        </View>
    );
});

/**
 * Component styles
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 20,
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        top: '50%',
        left: '50%',
        marginLeft: -6,
        marginTop: -6,
    },
    callout: {
        padding: 8,
        borderRadius: 8,
        minWidth: 40,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CustomMapView;