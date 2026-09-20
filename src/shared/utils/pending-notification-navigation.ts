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
  const targetKey = target.pathname + ":" + JSON.stringify(target.params || {});
  const now = Date.now();
  // Prevent duplicate navigation within 1.5 seconds
  if (targetKey === lastNavigatedTargetKey && now - lastNavigatedTime < 1500) {
    return false;
  }
  lastNavigatedTargetKey = targetKey;
  lastNavigatedTime = now;
  return true;
}
