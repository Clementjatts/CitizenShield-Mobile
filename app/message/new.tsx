import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text } from '../../components/Themed';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewMessageScreen() {
  const { colors } = useTheme();
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!recipient.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to send messages');
        return;
      }

      const chatRef = await addDoc(collection(db, 'chats'), {
        participants: [currentUser.uid, recipient],
        lastMessage: message,
        lastMessageTimestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        text: message,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      router.back();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Message</Text>
      </View>
      
      <View style={styles.content}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Recipient"
          placeholderTextColor={colors.text}
          value={recipient}
          onChangeText={setRecipient}
        />
        <TextInput
          style={[styles.messageInput, { color: colors.text, borderColor: colors.border }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.text}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSend}
        >
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  messageInput: {
    height: 150,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  sendButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
