import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '@/theme';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { HeaderBar } from '@/components/navigation/HeaderBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SchoolCard } from '@/features/admin/components/SchoolCard';
import { AddSchoolSheet } from '@/features/admin/components/AddSchoolSheet';
import { useAdminSchools } from '@/features/admin/hooks/useAdminSchools';
import type { AdminSchool, CreateSchoolData } from '@/features/admin/services/adminService';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Admin schools screen with an infinite-scroll list of school cards, a FAB
 * to add a new school, and an empty state placeholder.
 */
export default function SchoolsScreen() {
  const {
    schools,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    createSchool,
    isCreating,
  } = useAdminSchools();

  // ── Add sheet state ───────────────────────────────────────────────
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  const handleAddPress = useCallback(() => {
    setAddSheetVisible(true);
  }, []);

  const handleAddClose = useCallback(() => {
    setAddSheetVisible(false);
  }, []);

  const handleAddSubmit = useCallback(
    async (data: CreateSchoolData) => {
      await createSchool(data);
      setAddSheetVisible(false);
    },
    [createSchool],
  );

  // ── List handlers ─────────────────────────────────────────────────
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: AdminSchool }) => (
      <SchoolCard school={item} />
    ),
    [],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary.amber} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        title="No schools yet"
        message="Tap the + button to add your first school."
      />
    );
  }, [isLoading]);

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <HeaderBar title="Schools" />

      <View style={styles.container}>
        <FlashList
          data={schools}
          renderItem={renderItem}
          estimatedItemSize={200}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary.amber}
              colors={[colors.primary.amber]}
            />
          }
          contentContainerStyle={styles.listContent}
        />

        {/* FAB */}
        <Pressable
          onPress={handleAddPress}
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add school"
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </Pressable>
      </View>

      {/* Add school bottom sheet */}
      <AddSchoolSheet
        isVisible={addSheetVisible}
        onClose={handleAddClose}
        onSubmit={handleAddSubmit}
        isSubmitting={isCreating}
      />
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + 80, // extra space for FAB
  },
  separator: {
    height: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.amber,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    backgroundColor: colors.primary.amberDark,
    transform: [{ scale: 0.95 }],
  },
});
