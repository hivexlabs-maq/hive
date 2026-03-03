import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';
import { TabBar } from '@/components/navigation';

// ---------------------------------------------------------------------------
// Tab Layout
// ---------------------------------------------------------------------------

/**
 * Teacher tab layout -- 3 tabs:
 * - Dashboard (grid icon)
 * - Upload (camera icon)
 * - Notifications (bell icon)
 *
 * Uses the custom `<TabBar>` component with animated pill indicator.
 */
export default function TeacherLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Dashboard tab',
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarLabel: 'Upload',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Upload photos tab',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Notifications tab',
        }}
      />
    </Tabs>
  );
}
