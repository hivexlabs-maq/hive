import { supabase } from '@/lib/supabase';
import type { Tables, UserRole } from '@/types/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileWithRole {
  profile: Tables<'profiles'>;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Request Supabase to send an email OTP to `email`.
 * Throws on network / server errors.
 */
export async function sendOTP(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Don't require email confirmation — send 6-digit OTP directly
      shouldCreateUser: true,
      data: {},
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * Verify the OTP `token` for the given `email`.
 * On success the Supabase SDK automatically stores the session.
 * Throws on invalid token or network errors.
 */
export async function verifyOTP(
  email: string,
  token: string,
): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email', // works for both OTP and magic link tokens
  });

  if (error) {
    throw error;
  }
}

/**
 * Fetch the `profiles` row for `userId`.
 * Returns the profile with its role, or `null` if the row doesn't exist yet
 * (e.g. new user before onboarding completes).
 */
export async function fetchUserProfile(
  userId: string,
): Promise<ProfileWithRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    profile: data,
    role: data.role,
  };
}

/**
 * Sign the current user out.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
