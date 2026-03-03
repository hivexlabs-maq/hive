import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, spacing, layout } from '@/theme';
import { Text, Button, TextInput } from '@/components/ui';
import { LottieWrapper, HoneycombPattern } from '@/components/animation';
import { ScreenContainer } from '@/components/layout';
import { useOTP } from '@/features/auth/hooks/useOTP';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { fetchUserProfile } from '@/features/auth/services/authService';
import { getRoleRoute } from '@/types/navigation';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Login screen — collects the user's email and sends a one-time password.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { isSending, error, sendOTP } = useOTP();
  const { user, role, setProfile, setRole } = useAuthStore();

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

    const success = await sendOTP(trimmed);
    if (success) {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email: trimmed },
      } as never);
    }
  }, [email, validateEmail, sendOTP, router]);

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
          Your child's precious moments, safely preserved
        </Text>

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
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
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
