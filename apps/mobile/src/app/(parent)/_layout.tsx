import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/theme';
import { TabBar } from '@/components/navigation';

// ---------------------------------------------------------------------------
// Tab icon helper
// ---------------------------------------------------------------------------

function tabIcon(
  name: keyof typeof Ionicons.glyphMap,
  nameOutline: keyof typeof Ionicons.glyphMap,
) {
  return ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => (
    <Ionicons
      name={focused ? name : nameOutline}
      size={size}
      color={color}
    />
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * Parent tab layout.
 *
 * Three tabs:
 * 1. **Feed** -- photo feed for the parent's children.
 * 2. **Orders** -- order history (placeholder until Phase 9).
 * 3. **Notifications** -- notification centre (placeholder until Phase 11).
 */
export default function ParentLayout() {
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
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: tabIcon('images', 'images-outline'),
          tabBarAccessibilityLabel: 'Photo Feed',
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: tabIcon('cart', 'cart-outline'),
          tabBarAccessibilityLabel: 'Order History',
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: tabIcon('notifications', 'notifications-outline'),
          tabBarAccessibilityLabel: 'Notifications',
        }}
      />

      {/* Hide the dynamic photo/[id] route from the tab bar */}
      <Tabs.Screen
        name="photo/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
