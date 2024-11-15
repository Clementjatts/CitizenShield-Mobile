import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Platform, Animated } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapType, Region } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';

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
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(markerScale, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start(() => pulseMarker());
        };

        pulseMarker();
    }, []);

    const mapStyle = [
        {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "weight": "2.00"
                }
            ]
        },
        {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#9c9c9c"
                }
            ]
        },
        {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#f2f2f2"
                }
            ]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "all",
            "stylers": [
                {
                    "saturation": -100
                },
                {
                    "lightness": 45
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#7b7b7b"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#46bcec"
                },
                {
                    "visibility": "on"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#c8d7d4"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#070707"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        }
    ];

    return (
        <MapView
            ref={mapRef}
            style={[styles.map, style]}
            provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
            mapType={mapType}
            customMapStyle={mapStyle}
            initialRegion={{
                latitude: currentLocation?.latitude || 37.78825,
                longitude: currentLocation?.longitude || -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
            showsUserLocation={false}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
        >
            {currentLocation && (
                <Marker
                    coordinate={currentLocation}
                    title="You are here"
                >
                    <Animated.View style={[styles.markerContainer, { transform: [{ scale: markerScale }] }]}>
                        <View style={styles.marker} />
                    </Animated.View>
                </Marker>
            )}
        </MapView>
    );
});

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(231, 76, 60, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e74c3c',
        borderWidth: 2,
        borderColor: 'white',
    },
});

export default CustomMapView;