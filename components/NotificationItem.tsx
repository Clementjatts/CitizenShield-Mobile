import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationItemProps {
    title: string;
    message: string;
    timestamp: string;
    isGeneral?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    title,
    message,
    timestamp,
    isGeneral = true,
}) => {
    const { colors } = useTheme();
    const [showFullMessage, setShowFullMessage] = useState(false);

    const toggleFullMessage = () => {
        setShowFullMessage(!showFullMessage);
    };

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.container,
                    { backgroundColor: colors.card }
                ]}
                onPress={toggleFullMessage}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={isGeneral ? "people-outline" : "person-outline"}
                        size={24}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
                        {message}
                    </Text>
                    <Text style={[styles.timestamp, { color: colors.text }]}>
                        {new Date(timestamp).toLocaleString()}
                    </Text>
                </View>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                    style={styles.chevron}
                />
            </TouchableOpacity>

            <Modal
                visible={showFullMessage}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowFullMessage(false)}
            >
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setShowFullMessage(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <View style={styles.headerIconContainer}>
                                <Ionicons
                                    name={isGeneral ? "people-outline" : "person-outline"}
                                    size={24}
                                    color={colors.primary}
                                />
                                <Text style={[styles.headerType, { color: colors.text }]}>
                                    {isGeneral ? 'General Notification' : 'Personal Notification'}
                                </Text>
                            </View>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.modalBody}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    {title}
                                </Text>
                                <Text style={[styles.modalMessage, { color: colors.text }]}>
                                    {message}
                                </Text>
                                <Text style={[styles.modalTimestamp, { color: colors.text }]}>
                                    {new Date(timestamp).toLocaleString()}
                                </Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.dismissButton, { backgroundColor: colors.primary }]}
                            onPress={() => setShowFullMessage(false)}
                        >
                            <Text style={styles.dismissButtonText}>Dismiss</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    iconContainer: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.7,
    },
    chevron: {
        alignSelf: 'center',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: '60%',
        maxHeight: '90%',
    },
    modalHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    closeButton: {
        padding: 4,
        alignSelf: 'flex-end',
    },
    headerIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    headerType: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    modalScroll: {
        flex: 1,
    },
    modalBody: {
        padding: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    modalMessage: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    modalTimestamp: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 8,
    },
    dismissButton: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    dismissButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NotificationItem;