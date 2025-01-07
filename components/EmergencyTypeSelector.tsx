import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
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
    selectedType: EmergencyTypeId | null;
    onSelect: (type: EmergencyTypeId) => void;
    onEmergencyTrigger: (type: EmergencyTypeId) => void;
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
    selectedType,
    onSelect,
    onEmergencyTrigger,
}) => {
    const { colors } = useTheme();
    const lastTapRef = useRef<{ time: number; id: EmergencyTypeId } | null>(null);
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    const handlePress = (typeId: EmergencyTypeId) => {
        const now = Date.now();
        const lastTap = lastTapRef.current;

        if (lastTap && lastTap.id === typeId && now - lastTap.time < DOUBLE_TAP_DELAY) {
            // Double tap detected
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onEmergencyTrigger(typeId);
            lastTapRef.current = null;
        } else {
            // First tap
            lastTapRef.current = { time: now, id: typeId };
            onSelect(typeId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const renderGridItems = () => {
        const rows = [];
        for (let i = 0; i < EMERGENCY_TYPES.length; i += 4) {
            const rowItems = EMERGENCY_TYPES.slice(i, i + 4);
            const row = (
                <View key={i} style={styles.gridContainer}>
                    {rowItems.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: emergencyTypeColors[type.id],
                                },
                                selectedType === type.id && styles.selectedCard
                            ]}
                            onPress={() => handlePress(type.id)}
                        >
                            <Ionicons
                                name={type.icon}
                                size={24}
                                color={'#FFFFFF'}
                                style={styles.cardIcon}
                            />
                            <Text
                                style={[
                                    styles.cardText,
                                ]}
                                numberOfLines={1}
                            >
                                {type.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
            rows.push(row);
        }
        return rows;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {renderGridItems()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 20 : 10, // Reduced bottom margin
        left: 0,
        right: 0,
        paddingHorizontal: 12, // Reduced horizontal padding
    },
    scrollViewContent: {
        paddingVertical: 4, // Reduced vertical padding
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 6, // Reduced gap
    },
    card: {
        width: '22%', // Slightly reduced width
        aspectRatio: 0.9, // Slightly reduced height while maintaining reasonable proportions
        borderRadius: 12, // Slightly reduced border radius
        padding: 6, // Reduced padding
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
    },
    selectedCard: {
        transform: [{ scale: 1.05 }],
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 8,
    },
    cardIcon: {
        marginBottom: 4,
    },
    cardText: {
        fontSize: 10, // Reduced font size
        fontWeight: '600',
        textAlign: 'center',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});

export default EmergencyTypeSelector;