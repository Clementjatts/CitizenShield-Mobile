import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Pressable } from 'react-native';
import { Text } from '../components/Themed';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <ScrollView style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    CitizenShield is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Information We Collect</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    We collect information you provide directly to us, such as when you create an account, report an incident, or contact us for support.
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>How We Use Your Information</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to protect the safety and security of our users and the public.
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Sharing and Disclosure</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    We do not sell your personal information. We may share information with law enforcement agencies when required by law or to protect public safety.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 15,
        lineHeight: 24,
    },
});