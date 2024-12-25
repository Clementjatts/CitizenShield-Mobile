import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '@react-navigation/native';

interface IconConfig {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useThemeContext();
  const { colors } = useTheme();

  const cycleTheme = () => {
    // Cycle through: system -> light -> dark -> system
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getThemeIcon = (): IconConfig => {
    if (theme === 'system') {
      return {
        name: actualTheme === 'light' ? 'phone-portrait-outline' : 'phone-portrait',
        color: colors.text
      };
    }
    return {
      name: actualTheme === 'light' ? 'sunny-outline' : 'moon-outline',
      color: colors.text
    };
  };

  const icon = getThemeIcon();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={cycleTheme}
      >
        <Ionicons 
          name={icon.name}
          size={24}
          color={icon.color}
        />
        <Text style={[styles.text, { color: colors.text }]}>
          {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
  },
});
