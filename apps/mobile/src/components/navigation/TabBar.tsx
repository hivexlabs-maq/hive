import React, { useRef, useEffect, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';
import { shadowSmall } from '@/theme/shadows';
import { Text } from '@/components/ui/Text';

const TAB_HEIGHT = 64;
const PILL_HEIGHT = 40;
const PILL_BORDER_RADIUS = 20;
const MIN_TAP_SIZE = 44;

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabCount = state.routes.length;

  const pillX = useRef(new Animated.Value(0)).current;
  const tabWidthRef = useRef(0);

  useEffect(() => {
    if (tabWidthRef.current > 0) {
      Animated.spring(pillX, {
        toValue: state.index * tabWidthRef.current,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [state.index, pillX]);

  const onLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      const containerWidth = event.nativeEvent.layout.width;
      tabWidthRef.current = containerWidth / tabCount;
      pillX.setValue(state.index * tabWidthRef.current);
    },
    [tabCount, state.index, pillX],
  );

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
      onLayout={onLayout}
    >
      {/* Animated pill indicator */}
      <Animated.View
        style={[
          styles.pill,
          { transform: [{ translateX: pillX }] },
        ]}
      >
        <View style={styles.pillInner} />
      </Animated.View>

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        const iconColor = isFocused ? colors.primary.amber : colors.text.tertiary;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            {options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: 24 })}
            <Text
              variant="tiny"
              color={isFocused ? colors.primary.amber : colors.text.tertiary}
              style={styles.label}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.surface,
    height: TAB_HEIGHT + 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
    ...shadowSmall,
  },
  pill: {
    position: 'absolute',
    top: (TAB_HEIGHT - PILL_HEIGHT) / 2,
    left: 0,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillInner: {
    width: '70%',
    height: '100%',
    backgroundColor: colors.primary.amberLight + '30',
    borderRadius: PILL_BORDER_RADIUS,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MIN_TAP_SIZE,
    height: TAB_HEIGHT,
    paddingVertical: spacing.xs,
  },
  label: {
    marginTop: 2,
  },
});

export default TabBar;
