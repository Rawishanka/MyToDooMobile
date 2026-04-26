/**
 * Notification Events
 *
 * A tiny event bus used to immediately signal `useMergedUnreadCount` that
 * notifications have changed (deleted / marked as read), so the badge count
 * clears instantly instead of waiting for the next 30-60s poll.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to notification-change events. Returns an unsubscribe function. */
export function onNotificationsChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Fire this whenever notifications are deleted or marked as read. */
export function emitNotificationsChanged(): void {
  listeners.forEach(fn => fn());
}
