import React from 'react';

import { ScreenContainer } from '@/components/layout';
import { HeaderBar } from '@/components/navigation';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Teacher notifications screen — powered by the shared `<NotificationCenter>`.
 *
 * Displays the authenticated teacher's notification feed with pull-to-refresh,
 * infinite scrolling, and swipe-to-dismiss.
 */
export default function NotificationsScreen() {
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <HeaderBar title="Notifications" />
      <NotificationCenter />
    </ScreenContainer>
  );
}
