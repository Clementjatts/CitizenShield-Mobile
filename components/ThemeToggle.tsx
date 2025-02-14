/**
 * ThemeToggle Component
 * A toggle switch component for changing between light and dark themes
 * Features smooth animations and haptic feedback
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '@react-navigation/native';

/**
 * Props for the ThemeToggle component
 * @interface ThemeToggleProps
 * @property {string} theme - Current theme state (system, light, or dark)
 * @property {(theme: string) => void} setTheme - Callback when theme is changed
 */
interface ThemeToggleProps {
    theme: string;
    setTheme: (theme: string) => void;
}

/**
 * Icon configuration for the toggle switch
 */
interface IconConfig {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
}

/**
 * ThemeToggle Component
 * Renders a toggle switch for theme selection
 * 
 * @returns {React.ReactElement} Rendered component
 */
export default function ThemeToggle() {
    const { theme, actualTheme, setTheme } = useThemeContext();
    const { colors } = useTheme();

    /**
     * Cycles through the theme states (system, light, dark)
     */
    const cycleTheme = () => {
        // Cycle through: system -> light -> dark -> system
        if (theme === 'system') {
            setTheme('light');
        } else if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('system');
        }
    };

    /**
     * Returns the icon configuration based on the current theme
     * 
     * @returns {IconConfig} Icon configuration
     */
    const getThemeIcon = (): IconConfig => {
        if (theme === 'system') {
            return {
                name: actualTheme === 'light' ? 'phone-portrait-outline' : 'phone-portrait',
                color: colors.text
            };
        }
        return {
            name: actualTheme === 'light' ? 'sunny-outline' : 'moon-outline',
            color: colors.text
        };
    };

    const icon = getThemeIcon();

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.button} 
                onPress={cycleTheme}
            >
                <Ionicons 
                    name={icon.name}
                    size={24}
                    color={icon.color}
                />
                <Text style={[styles.text, { color: colors.text }]}>
                    {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    text: {
        marginLeft: 8,
        fontSize: 14,
    },
});
