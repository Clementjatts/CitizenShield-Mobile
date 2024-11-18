import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import CustomTabBar from '../../components/CustomTabBar';

export default function MainLayout() {
  useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >

      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />

      <Tabs.Screen
        name="blog"
        options={{
          title: 'Blog',
        }}
      />
    </Tabs>
  );
}
