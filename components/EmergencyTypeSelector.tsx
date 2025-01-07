import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

interface EmergencyType {
    id: EmergencyTypeId;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
}

type EmergencyTypeId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16';

interface EmergencyTypeSelectorProps {
    visible: boolean;
    onClose: () => void;
    selectedType?: EmergencyTypeId | null;
    onSelect: (type: EmergencyTypeId) => void;
    onEmergencyTrigger?: (type: EmergencyTypeId) => void;
    disabled?: boolean;
}

const EMERGENCY_TYPES: EmergencyType[] = [
    { id: '1', title: 'Life Threat', icon: 'warning-outline' },
    { id: '2', title: 'Police Abuse', icon: 'shield-outline' },
    { id: '3', title: 'Medical', icon: 'medical-outline' },
    { id: '4', title: 'Fire', icon: 'flame-outline' },
    { id: '5', title: 'Traffic', icon: 'car-outline' },
    { id: '6', title: 'Disaster', icon: 'alert-circle-outline' },
    { id: '7', title: 'Domestic', icon: 'home-outline' },
    { id: '8', title: 'Mental', icon: 'heart-outline' },
    { id: '9', title: 'Kidnap', icon: 'person-remove-outline' },
    { id: '10', title: 'Burglary', icon: 'key-outline' },
    { id: '11', title: 'Assault', icon: 'hand-right-outline' },
    { id: '12', title: 'Stalking', icon: 'eye-outline' },
    { id: '13', title: 'Robbery', icon: 'cash-outline' },
    { id: '14', title: 'Shooting', icon: 'radio-outline' },
    { id: '15', title: 'Terrorism', icon: 'alert-outline' },
    { id: '16', title: 'Riot', icon: 'people-outline' }
];

const emergencyTypeColors: Record<EmergencyTypeId, string> = {
    '1': '#FF3B30', // Life Threat - Red
    '2': '#5856D6', // Police Abuse - Purple
    '3': '#32ADE6', // Medical - Blue
    '4': '#FF9500', // Fire - Orange
    '5': '#FFCC00', // Traffic - Yellow
    '6': '#FF2D55', // Disaster - Pink
    '7': '#AF52DE', // Domestic - Purple
    '8': '#5AC8FA', // Mental - Light Blue
    '9': '#FF6B6B', // Kidnap - Coral
    '10': '#4A90E2', // Burglary - Blue
    '11': '#FF4F81', // Assault - Pink Red
    '12': '#9B59B6', // Stalking - Purple
    '13': '#E67E22', // Robbery - Orange
    '14': '#E74C3C', // Shooting - Red
    '15': '#C0392B', // Terrorism - Dark Red
    '16': '#8E44AD', // Riot - Deep Purple
};

const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({
    visible,
    onClose,
    selectedType,
    onSelect,
    onEmergencyTrigger,
    disabled,
}) => {
    const { colors } = useTheme();
    const lastTapRef = useRef<{ time: number; id: EmergencyTypeId } | null>(null);
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    const handlePress = (typeId: EmergencyTypeId) => {
        if (disabled) return;

        const now = Date.now();
        const lastTap = lastTapRef.current;

        if (lastTap && lastTap.id === typeId && now - lastTap.time < DOUBLE_TAP_DELAY) {
            // Double tap detected
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onEmergencyTrigger && onEmergencyTrigger(typeId);
            lastTapRef.current = null;
        } else {
            // First tap
            lastTapRef.current = { time: now, id: typeId };
            onSelect(typeId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const renderGridItems = () => {
        return (
            <View style={styles.grid}>
                {EMERGENCY_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.item,
                            {
                                backgroundColor: emergencyTypeColors[type.id],
                                opacity: selectedType === type.id ? 0.9 : 1,
                            },
                            selectedType === type.id && styles.selectedItem,
                            disabled && styles.disabledItem,
                        ]}
                        onPress={() => handlePress(type.id)}
                        disabled={disabled}
                    >
                        <View style={styles.itemContent}>
                            <Ionicons
                                name={type.icon}
                                size={20}
                                color={selectedType === type.id ? colors.primary : 'white'}
                                style={styles.icon}
                            />
                            <Text style={[styles.text, { color: 'white' }]}>
                                {type.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {renderGridItems()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 16 : 16,
        height: '45%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 8,
    },
    item: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    selectedItem: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF10',
    },
    disabledItem: {
        opacity: 0.5,
    },
    itemContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 4,
    },
    text: {
        fontSize: 11,
        textAlign: 'center',
        color: '#333',
        fontWeight: '500',
    },
    selectedText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default EmergencyTypeSelector;