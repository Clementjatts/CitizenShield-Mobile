import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

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