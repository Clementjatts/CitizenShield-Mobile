import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
}

// Wrapping the component with forwardRef to handle refs properly
const CustomButton = forwardRef<TouchableOpacity, CustomButtonProps>(({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
    loading = false,
    variant = 'primary',
}, ref) => {
    const { colors } = useTheme();

    const getButtonStyle = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'secondary':
                return { backgroundColor: colors.card };
            case 'outline':
                return { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 2 };
            default:
                return {};
        }
    };

    const getTextColor = (): string => {
        switch (variant) {
            case 'primary':
                return colors.card;
            case 'secondary':
                return colors.text;
            case 'outline':
                return colors.primary;
            default:
                return colors.text;
        }
    };

    return (
        <TouchableOpacity
            ref={ref}  // Forward the ref to TouchableOpacity
            style={[styles.button, getButtonStyle(), disabled && styles.disabledButton, style]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;