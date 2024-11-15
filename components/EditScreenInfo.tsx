import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { Text } from './Themed';
import { Ionicons } from '@expo/vector-icons';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Open up the code for this screen:
        </Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{path}</Text>
        </View>
        <Text style={styles.infoText}>
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>
      <Pressable style={styles.helpButton}>
        <Ionicons name="help-circle-outline" size={20} color="#fff" />
        <Text style={styles.helpButtonText}>
          Tap here if your app doesn't automatically update
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  codeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
  },
  codeText: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#ddd',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  helpButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
});