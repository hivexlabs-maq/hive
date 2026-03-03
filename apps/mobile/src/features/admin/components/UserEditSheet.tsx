import React, { useCallback, useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, layout } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { AdminUser } from '@/features/admin/services/adminService';
import type { UserRole } from '@/types/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserEditSheetProps {
  /** The user to edit, or null when hidden. */
  user: AdminUser | null;
  /** Whether the sheet is visible. */
  isVisible: boolean;
  /** Called when the sheet is dismissed. */
  onClose: () => void;
  /** Called with the updated role when the user taps Save. */
  onSave: (userId: string, role: UserRole) => void;
  /** Whether a save is currently in progress. */
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Role options
// ---------------------------------------------------------------------------

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'teacher', label: 'Teacher', icon: 'school-outline' },
  { value: 'parent', label: 'Parent', icon: 'people-outline' },
  { value: 'admin', label: 'Admin', icon: 'shield-outline' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `<UserEditSheet>` -- a bottom sheet that allows editing a user's role.
 *
 * Presents the user's avatar, name and email, a set of radio-style role
 * selectors, and a Save button.
 */
export function UserEditSheet({
  user,
  isVisible,
  onClose,
  onSave,
  isSaving = false,
}: UserEditSheetProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');

  useEffect(() => {
    if (user) setSelectedRole(user.role);
  }, [user]);

  const handleSave = useCallback(() => {
    if (user) onSave(user.id, selectedRole);
  }, [user, selectedRole, onSave]);

  if (!user) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleBar} />
          <View style={styles.content}>
        {/* User header */}
        <View style={styles.header}>
          <Avatar
            uri={user.avatar_url}
            name={user.full_name}
            size="lg"
          />
          <View style={styles.headerInfo}>
            <Text variant="h4" numberOfLines={1}>
              {user.full_name}
            </Text>
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Role selector */}
        <Text variant="bodyBold" style={styles.sectionLabel}>
          Role
        </Text>

        <View style={styles.roleList}>
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setSelectedRole(option.value)}
                style={[
                  styles.roleOption,
                  isSelected && styles.roleOptionSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? colors.primary.amber : colors.text.secondary}
                />
                <Text
                  variant="body"
                  color={isSelected ? colors.text.primary : colors.text.secondary}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Save button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSave}
          loading={isSaving}
          disabled={selectedRole === user.role}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.lg,
  },
  handleBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  roleList: {
    gap: spacing.sm,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.surface,
  },
  roleOptionSelected: {
    borderColor: colors.primary.amber,
    backgroundColor: colors.primary.amber + '0D', // ~5% opacity
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary.amber,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.amber,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});

export default UserEditSheet;
