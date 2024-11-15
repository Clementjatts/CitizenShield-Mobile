import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';
import { useTheme } from '@react-navigation/native';
import { auth } from '../config/firebaseConfig';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  const handleHomePress = () => {
    if (auth.currentUser) {
      router.replace('/(main)/home');
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        This screen doesn't exist.
      </Text>

      <TouchableOpacity
        onPress={handleHomePress}
        style={[styles.link, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.linkText}>Return to home screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  link: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});