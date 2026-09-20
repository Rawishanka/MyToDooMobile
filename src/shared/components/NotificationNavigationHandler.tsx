import React, { useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import {
  navigateFromNotificationData,
  navigateFromNotification,
} from "@/src/shared/utils/notification-navigation";
import {
  consumePendingNotificationTarget,
  canNavigateToTarget,
} from "@/src/shared/utils/pending-notification-navigation";

let messaging: any = null;
try {
  messaging = require("@react-native-firebase/messaging").default;
} catch (_) {}

let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch (_) {}

/**
 * Component mounted inside RootNavigationContent (inside <Stack>).
 * Ensures that whenever a push notification is tapped:
 * 1. Cold start / Quit state notifications waiting during splash screen are executed.
 * 2. Background and foreground notification taps navigate to the correct screen.
 */
export function NotificationNavigationHandler() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const processPendingNavigation = () => {
      const pending = consumePendingNotificationTarget();
      if (pending && isMounted) {
        console.log("🚀 [NotificationNavigationHandler] Executing pending notification navigation:", pending);
        try {
          router.push({
            pathname: pending.pathname as any,
            params: pending.params,
          });
        } catch (err) {
          console.error("❌ Failed to navigate to pending notification:", err);
        }
      }
    };

    // 1. Check if a pending notification was queued while splash screen was showing
    const timer = setTimeout(processPendingNavigation, 300);

    // 2. Check for native FCM initial notification (quit state)
    if (messaging) {
      try {
        messaging()
          .getInitialNotification()
          .then((remoteMessage: any) => {
            if (remoteMessage && isMounted) {
              console.log("🔔 [NotificationNavigationHandler] Quit state FCM notification detected:", remoteMessage);
              setTimeout(() => {
                navigateFromNotificationData(router, remoteMessage.data, {
                  title: remoteMessage.notification?.title,
                  body: remoteMessage.notification?.body,
                });
              }, 400);
            }
          })
          .catch((err: any) => {
            console.warn("⚠️ Error checking FCM initial notification:", err);
          });
      } catch (err) {
        console.warn("⚠️ FCM getInitialNotification error:", err);
      }
    }

    // 3. Check for Expo Notifications initial response (quit state local notification)
    if (Notifications?.getLastNotificationResponseAsync) {
      try {
        Notifications.getLastNotificationResponseAsync()
          .then((response: any) => {
            if (response && isMounted) {
              const content = response.notification?.request?.content;
              const data = content?.data || {};
              if (data && Object.keys(data).length > 0) {
                console.log("🔔 [NotificationNavigationHandler] Quit state local notification detected:", content);
                setTimeout(() => {
                  navigateFromNotificationData(router, data, {
                    title: content?.title,
                    body: content?.body,
                  });
                }, 400);
              }
            }
          })
          .catch(() => {});
      } catch (_) {}
    }

    // 4. Background notification listener (FCM)
    let unsubscribeFCM: (() => void) | null = null;
    if (messaging) {
      try {
        unsubscribeFCM = messaging().onNotificationOpenedApp((remoteMessage: any) => {
          if (remoteMessage && isMounted) {
            console.log("🔔 [NotificationNavigationHandler] Background FCM notification tapped:", remoteMessage);
            navigateFromNotificationData(router, remoteMessage.data, {
              title: remoteMessage.notification?.title,
              body: remoteMessage.notification?.body,
            });
          }
        });
      } catch (err) {
        console.warn("⚠️ FCM onNotificationOpenedApp error:", err);
      }
    }

    // 5. Local notification response listener (Expo Notifications)
    let subscriptionExpo: any = null;
    if (Notifications?.addNotificationResponseReceivedListener) {
      try {
        subscriptionExpo = Notifications.addNotificationResponseReceivedListener((response: any) => {
          if (!isMounted) return;
          const content = response?.notification?.request?.content;
          const data = content?.data || {};
          if (data && Object.keys(data).length > 0) {
            console.log("🔔 [NotificationNavigationHandler] Notification response received:", content);
            navigateFromNotificationData(router, data, {
              title: content?.title,
              body: content?.body,
            });
          }
        });
      } catch (err) {
        console.warn("⚠️ Expo addNotificationResponseReceivedListener error:", err);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (unsubscribeFCM) unsubscribeFCM();
      if (subscriptionExpo?.remove) subscriptionExpo.remove();
    };
  }, [router]);

  return null;
}
