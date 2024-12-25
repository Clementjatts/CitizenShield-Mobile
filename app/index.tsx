import React, { useEffect } from 'react';
import { StyleSheet, Image, View, Animated, Pressable, Dimensions } from 'react-native';
import { Text } from '../components/Themed';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';

// Get the width of the screen
const { width } = Dimensions.get('window');

export default function LaunchScreen() {
    // Get colors from the current theme
    const { colors } = useTheme();
    
    // Set up animations
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    useEffect(() => {
        // Start fade-in and slide-up animations when the component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Function to handle login button press
    const handleLogIn = () => {
        router.replace('/login');
    };

    // Function to handle signup button press
    const handleSignUp = () => {
        router.replace('/signup');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Animated logo container */}
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoCircle}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>
            <View style={styles.bottomContainer}>
                {/* Animated description container */}
                <Animated.View
                    style={[
                        styles.descriptionContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={[styles.descriptionText, { color: colors.text }]}>
                        Protect your community.
                    </Text>
                    <Text style={[styles.descriptionText, { color: colors.text }]}>
                        Report incidents. Stay safe.
                    </Text>
                </Animated.View>
                {/* Button container */}
                <View style={styles.buttonContainer}>
                    {/* Login button */}
                    <Pressable
                        style={[styles.button, styles.loginButton, { backgroundColor: colors.primary }]}
                        onPress={handleLogIn}
                    >
                        <Text style={[styles.buttonText, { color: colors.background }]}>Log In</Text>
                    </Pressable>
                    {/* Signup button */}
                    <Pressable
                        style={[styles.button, styles.signupButton, { borderColor: colors.primary }]}
                        onPress={handleSignUp}
                    >
                        <Text style={[styles.buttonText, { color: colors.primary }]}>Sign up</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

// Styles for the components
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoCircle: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 20,
    },
    logo: {
        width: '70%',
        height: '70%',
        maxWidth: '70%',
        maxHeight: '70%',
    },
    bottomContainer: {
        width: '100%',
    },
    descriptionContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    descriptionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: '500',
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    loginButton: {
        marginBottom: 10,
    },
    signupButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
    },
});
