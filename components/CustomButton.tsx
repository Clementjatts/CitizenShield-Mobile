/**
 * CustomButton Component
 * A reusable button component with customizable styles and variants
 * Supports different button types (primary, secondary, outline) and states (loading, disabled)
 */

import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

/**
 * Props for the CustomButton component
 * @interface CustomButtonProps
 * @property {string} title - Text to display on the button
 * @property {() => void} onPress - Function to call when button is pressed
 * @property {ViewStyle} [style] - Additional styles for the button container
 * @property {TextStyle} [textStyle] - Additional styles for the button text
 * @property {boolean} [loading] - Whether to show loading indicator
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {string} [variant='primary'] - Button style variant (primary/secondary/outline)
 * @property {string} [size='medium'] - Button size (small/medium/large)
 * @property {boolean} [fullWidth] - Whether the button should take up the full width of its parent
 * @property {string} [color] - Custom color for the button
 */
interface CustomButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    color?: string;
}

/**
 * CustomButton Component
 * A versatile button component that adapts to the current theme
 * 
 * @param {CustomButtonProps} props - Component props
 * @param {React.Ref<View>} ref - Reference to the button element
 * @returns {React.ReactElement} Rendered component
 */
const CustomButton = forwardRef<View, CustomButtonProps>(({
    title,
    onPress,
    style,
    textStyle,
    loading = false,
    disabled = false,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    color,
}, ref) => {
    const { colors } = useTheme();

    /**
     * Determines the button style based on variant and state
     */
    const getButtonStyle = () => {
        const baseStyle: ViewStyle = {
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.6 : 1,
        };

        if (fullWidth) {
            baseStyle.width = '100%';
        }

        switch (size) {
            case 'small':
                baseStyle.paddingVertical = 8;
                baseStyle.paddingHorizontal = 16;
                break;
            case 'large':
                baseStyle.paddingVertical = 16;
                baseStyle.paddingHorizontal = 32;
                break;
        }

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyle,
                    backgroundColor: color || colors.primary,
                };
            case 'secondary':
                return {
                    ...baseStyle,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                };
            case 'outline':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: color || colors.primary,
                };
            default:
                return baseStyle;
        }
    };

    /**
     * Determines the text style based on variant and state
     */
    const getTextStyle = () => {
        const baseStyle: TextStyle = {
            fontSize: 16,
            fontWeight: '600',
        };

        switch (size) {
            case 'small':
                baseStyle.fontSize = 14;
                break;
            case 'large':
                baseStyle.fontSize = 18;
                break;
        }

        switch (variant) {
            case 'primary':
                return {
                    ...baseStyle,
                    color: '#FFFFFF',
                };
            case 'secondary':
                return {
                    ...baseStyle,
                    color: colors.text,
                };
            case 'outline':
                return {
                    ...baseStyle,
                    color: color || colors.primary,
                };
            default:
                return baseStyle;
        }
    };

    return (
        <TouchableOpacity
            ref={ref}
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
            ) : (
                <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
});

export default CustomButton;