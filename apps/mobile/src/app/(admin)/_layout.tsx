import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';
import { TabBar } from '@/components/navigation/TabBar';

// ---------------------------------------------------------------------------
// Tab icon helper
// ---------------------------------------------------------------------------

function tabIcon(
  name: keyof typeof Ionicons.glyphMap,
  nameFocused: keyof typeof Ionicons.glyphMap,
) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? nameFocused : name} size={size} color={color} />
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * Admin tab layout with four tabs: Dashboard, Users, Schools, Notifications.
 *
 * Uses the custom `<TabBar>` component that features a spring-animated pill
 * indicator in the Hive design language.
 */
export default function AdminLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.amber,
        tabBarInactiveTintColor: colors.text.tertiary,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: tabIcon('stats-chart-outline', 'stats-chart'),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: tabIcon('people-outline', 'people'),
        }}
      />
      <Tabs.Screen
        name="schools"
        options={{
          title: 'Schools',
          tabBarIcon: tabIcon('school-outline', 'school'),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: tabIcon('notifications-outline', 'notifications'),
        }}
      />
    </Tabs>
  );
}
