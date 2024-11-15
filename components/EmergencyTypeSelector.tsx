import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface EmergencyType {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
}

interface EmergencyTypeSelectorProps {
    onSelect: (typeId: string) => void;
    selectedType: string | null;
}

const EMERGENCY_TYPES: EmergencyType[] = [
    { id: '1', title: 'Personal Safety Threat', icon: 'warning' },
    { id: '2', title: 'Law Enforcement Assistance', icon: 'shield' },
    { id: '3', title: 'Medical Emergency', icon: 'medical' },
    { id: '4', title: 'Fire', icon: 'flame' },
    { id: '5', title: 'Traffic Accident', icon: 'car' },
    { id: '6', title: 'Natural Disaster', icon: 'earth' },
    { id: '7', title: 'Domestic Violence', icon: 'home' },
    { id: '8', title: 'Mental Health Crisis', icon: 'heart' },
];

const { width } = Dimensions.get('window');

const EmergencyTypeSelector: React.FC<EmergencyTypeSelectorProps> = ({ onSelect, selectedType }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {EMERGENCY_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.card,
                            {
                                backgroundColor: selectedType === type.id ? colors.primary : colors.card,
                                borderColor: colors.primary,
                            },
                        ]}
                        onPress={() => onSelect(type.id)}
                    >
                        <Ionicons
                            name={type.icon}
                            size={24}
                            color={selectedType === type.id ? colors.card : colors.primary}
                            style={styles.icon}
                        />
                        <Text
                            style={[
                                styles.cardTitle,
                                {
                                    color: selectedType === type.id ? colors.card : colors.text,
                                },
                            ]}
                        >
                            {type.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1,
    },
    icon: {
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default EmergencyTypeSelector;