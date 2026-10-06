import type { NotificationNavigationTarget } from "./notification-navigation";

let pendingTarget: NotificationNavigationTarget | null = null;
let lastNavigatedTargetKey = "";
let lastNavigatedTime = 0;

export function setPendingNotificationTarget(target: NotificationNavigationTarget): void {
  pendingTarget = target;
  console.log("📌 [NotificationNavigation] Pending notification target queued:", target);
}

export function getPendingNotificationTarget(): NotificationNavigationTarget | null {
  return pendingTarget;
}

export function consumePendingNotificationTarget(): NotificationNavigationTarget | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}

export function canNavigateToTarget(target: NotificationNavigationTarget): boolean {
  // ts is a per-tap stamp, so leave it out: both the FCM and Expo listeners can report the
  // same tap with different stamps and it still has to count as one navigation
  const { ts: _ts, ...stableParams } = (target.params || {}) as Record<string, string>;
  const targetKey = target.pathname + ":" + JSON.stringify(stableParams);
  const now = Date.now();
  // Prevent duplicate navigation within 1.5 seconds
  if (targetKey === lastNavigatedTargetKey && now - lastNavigatedTime < 1500) {
    return false;
  }
  lastNavigatedTargetKey = targetKey;
  lastNavigatedTime = now;
  return true;
}

// While the app's start-up redirect (app/index.tsx) is still deciding where to send the user,
// a notification tap must wait: that redirect used to run after the tap had navigated and
// replaced it with Home, which is why cold-start taps landed on the Home screen.
let launchRedirectPending = false;

export function setLaunchRedirectPending(pending: boolean): void {
  launchRedirectPending = pending;
}

export function isLaunchRedirectPending(): boolean {
  return launchRedirectPending;
}
