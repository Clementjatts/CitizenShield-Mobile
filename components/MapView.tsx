import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, Platform, Animated, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapType, Region, Callout } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomMapViewProps {
    style?: object;
    mapType: MapType;
    currentLocation: { latitude: number; longitude: number } | null;
}

export interface CustomMapViewRef {
    animateToRegion: (region: Region, duration: number) => void;
}

const CustomMapView = forwardRef<CustomMapViewRef, CustomMapViewProps>(({ style, mapType, currentLocation }, ref) => {
    const { colors } = useTheme();
    const markerScale = useRef(new Animated.Value(1)).current;
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region | null>(null);

    useImperativeHandle(ref, () => ({
        animateToRegion: (region: Region, duration: number) => {
            mapRef.current?.animateToRegion(region, duration);
        },
    }));

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

    // Premium modern map style
    const mapStyle = [
        {
            "elementType": "geometry",
            "stylers": [{ "color": "#242f3e" }]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#746855" }]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#242f3e" }]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#d59563" }]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#d59563" }]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": "#263c3f" }]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#6b9a76" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#38414e" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#212a37" }]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9ca5b3" }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{ "color": "#746855" }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#1f2835" }]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#f3d19c" }]
        },
        {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{ "color": "#2f3948" }]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#17263c" }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#515c6d" }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#17263c" }]
        }
    ];

    return (
        <View style={[styles.container, style]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
                mapType={mapType}
                customMapStyle={mapStyle}
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
                        <Callout>
                            <BlurView intensity={90} tint="dark" style={styles.callout}>
                                <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.primary} />
                                <View style={styles.calloutTextContainer}>
                                    <View style={styles.calloutPin} />
                                </View>
                            </BlurView>
                        </Callout>
                    </Marker>
                )}
            </MapView>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 20,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        alignItems: 'center',
    },
    markerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        top: '50%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    callout: {
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 120,
    },
    calloutTextContainer: {
        marginLeft: 10,
    },
    calloutPin: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        bottom: -15,
        left: '50%',
        marginLeft: -5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default CustomMapView;