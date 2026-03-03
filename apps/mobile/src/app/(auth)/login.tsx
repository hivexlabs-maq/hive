import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, layout } from '@/theme';
import { Text, Button, TextInput } from '@/components/ui';
import { LottieWrapper, HoneycombPattern } from '@/components/animation';
import { ScreenContainer } from '@/components/layout';
import { useOTP } from '@/features/auth/hooks/useOTP';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { fetchUserProfile } from '@/features/auth/services/authService';
import { getRoleRoute } from '@/types/navigation';

type SignInRole = 'teacher' | 'parent';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Login screen — choose Teacher or Parent, enter email, then receive OTP.
 * New signups get a profile with the selected role (via Supabase trigger).
 */
export default function LoginScreen() {
  const router = useRouter();
  const { isSending, error, sendOTP } = useOTP();
  const { user, role, setProfile, setRole } = useAuthStore();

  const [signInAs, setSignInAs] = useState<SignInRole>('parent');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // ── Already signed in: redirect to role-based home ───────────────────
  useEffect(() => {
    if (!user?.id) return;
    if (role) {
      router.replace(getRoleRoute(role) as never);
      return;
    }
    fetchUserProfile(user.id).then((result) => {
      if (result) {
        setProfile(result.profile);
        setRole(result.role);
        router.replace(getRoleRoute(result.role) as never);
      }
    });
  }, [user?.id, role, setProfile, setRole, router]);

  // ── Validation ──────────────────────────────────────────────────────
  const validateEmail = useCallback((value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError('Email is required.');
      return false;
    }
    // Simple RFC-ish check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(undefined);
    return true;
  }, []);

  // ── Send OTP handler ───────────────────────────────────────────────
  const handleSendCode = useCallback(async () => {
    const trimmed = email.trim();
    if (!validateEmail(trimmed)) return;

    const success = await sendOTP(trimmed, signInAs);
    if (success) {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email: trimmed, role: signInAs },
      } as never);
    }
  }, [email, signInAs, validateEmail, sendOTP, router]);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <ScreenContainer scroll keyboard>
      {/* Honeycomb decoration */}
      <View style={styles.honeycombContainer}>
        <HoneycombPattern rows={4} cols={8} size={28} style={styles.honeycomb} />
      </View>

      <View style={styles.content}>
        {/* Lottie animation */}
        <View style={styles.lottieContainer}>
          <LottieWrapper
            source="https://assets.lottiefiles.com/packages/lf20_hu9cd9.json"
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>

        {/* Heading */}
        <Text variant="h1" center style={styles.heading}>
          Welcome to Hive
        </Text>

        {/* Subtitle */}
        <Text
          variant="body"
          color={colors.text.secondary}
          center
          style={styles.subtitle}
        >
          Sign in with your email
        </Text>

        {/* Role selector: Teacher or Parent */}
        <Text variant="bodyBold" style={styles.roleLabel}>
          I am a
        </Text>
        <View style={styles.roleRow}>
          <Pressable
            onPress={() => setSignInAs('teacher')}
            style={[
              styles.roleOption,
              signInAs === 'teacher' && styles.roleOptionSelected,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: signInAs === 'teacher' }}
            accessibilityLabel="Sign in as Teacher"
          >
            <Ionicons
              name="school-outline"
              size={22}
              color={signInAs === 'teacher' ? colors.primary.amberDark : colors.text.secondary}
            />
            <Text
              variant="body"
              color={signInAs === 'teacher' ? colors.primary.amberDark : colors.text.secondary}
              style={styles.roleOptionText}
            >
              Teacher
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSignInAs('parent')}
            style={[
              styles.roleOption,
              signInAs === 'parent' && styles.roleOptionSelected,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: signInAs === 'parent' }}
            accessibilityLabel="Sign in as Parent"
          >
            <Ionicons
              name="people-outline"
              size={22}
              color={signInAs === 'parent' ? colors.primary.amberDark : colors.text.secondary}
            />
            <Text
              variant="body"
              color={signInAs === 'parent' ? colors.primary.amberDark : colors.text.secondary}
              style={styles.roleOptionText}
            >
              Parent
            </Text>
          </Pressable>
        </View>

        {/* Email input */}
        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="go"
          onSubmitEditing={handleSendCode}
          editable={!isSending}
          containerStyle={styles.input}
        />

        {/* Server error */}
        {error && (
          <Text variant="bodySmall" color={colors.error.main} style={styles.error}>
            {error}
          </Text>
        )}

        {/* Send button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleSendCode}
          loading={isSending}
          disabled={isSending}
          style={styles.button}
        >
          Send Code
        </Button>
      </View>
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  honeycombContainer: {
    position: 'absolute',
    top: -20,
    right: -40,
    opacity: 0.5,
  },
  honeycomb: {
    // Positioned by parent
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  lottieContainer: {
    width: 180,
    height: 180,
    marginBottom: spacing.lg,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  heading: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  roleLabel: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.lg,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: layout.inputRadius,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  roleOptionSelected: {
    borderColor: colors.primary.amber,
    backgroundColor: colors.primary.amberLight + '20',
  },
  roleOptionText: {
    fontFamily: 'Nunito_600SemiBold',
  },
  input: {
    width: '100%',
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: layout.buttonRadius,
  },
});
