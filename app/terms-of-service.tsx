import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Pressable } from 'react-native';
import { Text } from '../components/Themed';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

export default function TermsOfServiceScreen() {
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
            </View>
            <ScrollView style={styles.container}>
                <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    Welcome to CitizenShield. By using our app, you agree to these Terms of Service.
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    By accessing or using CitizenShield, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Use of the Service</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    You agree to use CitizenShield only for lawful purposes and in accordance with these Terms of Service. You are responsible for maintaining the confidentiality of your account information.
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Content</Text>
                <Text style={[styles.paragraph, { color: colors.text }]}>
                    You are solely responsible for the content you post on CitizenShield. You agree not to post content that is illegal, abusive, or violates the rights of others.
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