export type PendingAccountScreen =
  | 'payment'
  | 'account-info'
  | 'notifications'
  | 'account'
  | 'credits'
  | 'invite-friends'
  | 'create-service'
  | 'my-services';

export interface PendingAccountNavigation {
  screen: PendingAccountScreen;
  focus?: string;
  reviewId?: string;
  taskId?: string;
}

let pending: PendingAccountNavigation | null = null;

export function setPendingAccountNavigation(next: PendingAccountNavigation): void {
  pending = next;
}

export function consumePendingAccountNavigation(): PendingAccountNavigation | null {
  const value = pending;
  pending = null;
  return value;
}
