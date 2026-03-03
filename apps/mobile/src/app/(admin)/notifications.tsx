import React from 'react';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { HeaderBar } from '@/components/navigation/HeaderBar';
import { EmptyState } from '@/components/feedback/EmptyState';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Admin notifications screen -- placeholder for future implementation.
 *
 * Currently displays an empty state with a descriptive message.
 */
export default function NotificationsScreen() {
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <HeaderBar title="Notifications" />
      <EmptyState
        title="No notifications"
        message="Admin notifications will appear here once the feature is enabled."
      />
    </ScreenContainer>
  );
}
