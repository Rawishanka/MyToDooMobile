import type { Router } from 'expo-router';
import type { StoredNotification } from '@/src/services/notification-storage';
import {
  setPendingAccountNavigation,
  type PendingAccountNavigation,
} from '@/src/shared/utils/pending-account-navigation';

export interface NotificationNavigationTarget {
  pathname: string;
  params?: Record<string, string>;
}

function normalizeType(value?: string): string {
  return (value || '').trim().toUpperCase().replace(/-/g, '_');
}

function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function getNotificationData(notification: StoredNotification): Record<string, any> {
  return notification.data || {};
}

function getEventType(notification: StoredNotification): string {
  const data = getNotificationData(notification);
  return normalizeType(
    data.type ||
      data.notificationType ||
      data.eventType ||
      notification.type
  );
}

function getResourceType(notification: StoredNotification): string {
  const data = getNotificationData(notification);
  return normalizeType(data.resourceType || notification.type);
}

function getCombinedText(notification: StoredNotification): string {
  const data = getNotificationData(notification);
  return `${notification.title || ''} ${notification.body || ''} ${data.message || ''} ${data.title || ''} ${data.body || ''}`.toLowerCase();
}

function textIncludes(notification: StoredNotification, ...phrases: string[]): boolean {
  const text = getCombinedText(notification);
  return phrases.some((phrase) => text.includes(phrase.toLowerCase()));
}

function getTaskId(notification: StoredNotification): string | undefined {
  const data = getNotificationData(notification);
  const resourceType = getResourceType(notification);

  return (
    asString(data.taskId) ||
    asString(data.task_id) ||
    (resourceType === 'TASK' ? asString(data.resourceId) : undefined)
  );
}

function getOfferId(notification: StoredNotification): string | undefined {
  const data = getNotificationData(notification);
  const resourceType = getResourceType(notification);

  return (
    asString(data.offerId) ||
    asString(data.offer_id) ||
    (resourceType === 'OFFER' ? asString(data.resourceId) : undefined)
  );
}

function getChatId(notification: StoredNotification): string | undefined {
  const data = getNotificationData(notification);
  const resourceType = getResourceType(notification);

  return (
    asString(data.chatId) ||
    asString(data.chat_id) ||
    ((resourceType === 'CHAT' || resourceType === 'MESSAGE') ? asString(data.resourceId) : undefined)
  );
}

function getPosterId(notification: StoredNotification): string | undefined {
  const data = getNotificationData(notification);
  return asString(data.posterId) || asString(data.poster_id);
}

function getTaskerId(notification: StoredNotification): string | undefined {
  const data = getNotificationData(notification);
  return asString(data.taskerId) || asString(data.tasker_id);
}

function getUserRole(notification: StoredNotification): string | undefined {
  const data = getNotificationData(notification);
  return asString(data.userRole) || asString(data.role);
}

function taskDetailTarget(
  taskId: string,
  extraParams?: Record<string, string>
): NotificationNavigationTarget {
  return {
    pathname: '/task-detail',
    params: { taskId, ...extraParams },
  };
}

function myTasksTarget(extraParams?: Record<string, string>): NotificationNavigationTarget {
  return {
    pathname: '/(tabs)/my-tasks',
    params: extraParams,
  };
}

function profilePaymentTarget(focus?: string): NotificationNavigationTarget {
  const pending: PendingAccountNavigation = { screen: 'payment', focus };
  setPendingAccountNavigation(pending);
  return {
    pathname: '/(tabs)/account',
    params: {
      screen: 'payment',
      focus: focus || 'abn',
      ts: String(Date.now()),
    },
  };
}

function profileRatingsTarget(notification: StoredNotification): NotificationNavigationTarget {
  const data = getNotificationData(notification);
  const taskId = getTaskId(notification);
  const reviewId = asString(data.reviewId) || asString(data.review_id);

  setPendingAccountNavigation({
    screen: 'account',
    focus: 'ratings',
    reviewId,
    taskId,
  });

  return {
    pathname: '/(tabs)/account',
    params: {
      focus: 'ratings',
      ...(reviewId ? { reviewId } : {}),
      ...(taskId ? { taskId } : {}),
      ts: String(Date.now()),
    },
  };
}

function chatTarget(notification: StoredNotification): NotificationNavigationTarget {
  const taskId = getTaskId(notification);
  const chatId = getChatId(notification);
  const posterId = getPosterId(notification);
  const taskerId = getTaskerId(notification);
  const data = getNotificationData(notification);

  if (chatId || taskId) {
    return {
      pathname: '/task-chat',
      params: {
        ...(taskId ? { taskId } : {}),
        ...(chatId ? { chatId } : {}),
        ...(posterId ? { posterId } : {}),
        ...(taskerId ? { taskerId } : {}),
        ...(asString(data.taskTitle) ? { taskTitle: asString(data.taskTitle)! } : {}),
        ...(asString(data.posterName) ? { posterName: asString(data.posterName)! } : {}),
        ...(asString(data.taskerName) ? { taskerName: asString(data.taskerName)! } : {}),
      },
    };
  }

  return { pathname: '/(tabs)/message' };
}

function isProfileOrAbnNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  if (
    [
      'ABN_REQUIRED',
      'ABN_VERIFICATION',
      'PROFILE_INCOMPLETE',
      'COMPLETE_PROFILE',
      'PAYOUT_REQUIRED',
      'STRIPE_CONNECT_REQUIRED',
      'PAYMENT_ACCOUNT_REQUIRED',
      'VERIFY_ABN',
    ].includes(eventType)
  ) {
    return true;
  }

  return textIncludes(
    notification,
    'complete your profile',
    'complete your profile to get paid',
    'profile to get paid',
    'verify your abn',
    'verify your 11-digit abn',
    '11-digit abn',
    'add and verify your abn',
    'add your abn',
    'abn required',
    'abn verification',
    'get paid',
    'payout account',
    'payment account',
    'setup payout',
    'stripe connect',
    'before setting up payouts',
    'before payment can be released'
  );
}

function isChatNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  const resourceType = getResourceType(notification);

  if (resourceType === 'CHAT' || resourceType === 'MESSAGE') {
    return true;
  }

  if (
    [
      'NEW_MESSAGE',
      'MESSAGE_RECEIVED',
      'CHAT_MESSAGE',
      'NEW_CHAT_MESSAGE',
      'MESSAGE',
    ].includes(eventType)
  ) {
    return true;
  }

  if (getChatId(notification)) {
    return true;
  }

  return textIncludes(
    notification,
    'new message',
    'sent you a message',
    'message from',
    'chat message'
  );
}

function isReviewNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  const resourceType = getResourceType(notification);

  if (
    [
      'REVIEW_RECEIVED',
      'NEW_REVIEW',
      'REVIEW_REQUEST',
      'RATING_RECEIVED',
    ].includes(eventType) ||
    resourceType === 'REVIEW'
  ) {
    return true;
  }

  return textIncludes(
    notification,
    'new review received',
    'rated you',
    'left you a review',
    'star review',
    'stars for',
    '/5 stars'
  );
}

function isLoginNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  return eventType === 'LOGIN' || eventType === 'AUTH' || textIncludes(notification, 'logged in successfully', 'login successful');
}

function isTaskCompletedNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  if (
    [
      'TASK_COMPLETED',
      'TASK_PENDING_COMPLETION',
      'COMPLETION_CONFIRMED',
      'TASK_APPROVED',
    ].includes(eventType)
  ) {
    return true;
  }

  return textIncludes(
    notification,
    'task completed',
    'successfully completed',
    'marked as complete',
    'pending completion',
    'confirm completion'
  );
}

function isOfferAcceptedNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  return (
    eventType === 'OFFER_ACCEPTED' ||
    textIncludes(notification, 'offer was accepted', 'your offer has been accepted')
  );
}

function isOfferRejectedNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  return (
    eventType === 'OFFER_REJECTED' ||
    textIncludes(notification, 'offer was not accepted', 'offer rejected')
  );
}

function isOfferMadeNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  return (
    ['OFFER_MADE', 'NEW_OFFER'].includes(eventType) ||
    textIncludes(notification, 'new offer', 'submitted an offer', 'made an offer')
  );
}

function isQuestionNotification(notification: StoredNotification): boolean {
  const eventType = getEventType(notification);
  const resourceType = getResourceType(notification);

  if (
    [
      'QUESTION_ASKED',
      'QUESTION_ANSWERED',
      'NEW_QUESTION',
      'QUESTION_ANSWER',
    ].includes(eventType) ||
    resourceType === 'QUESTION'
  ) {
    return true;
  }

  return textIncludes(
    notification,
    'asked a question',
    'new question',
    'question answered',
    'answered your question',
    'answered a question',
    'posted a question',
    'question on your task'
  );
}

function questionTaskDetailTarget(taskId: string): NotificationNavigationTarget {
  return taskDetailTarget(taskId, { tab: 'questions' });
}

function completedTaskTarget(
  notification: StoredNotification,
  taskId?: string
): NotificationNavigationTarget {
  const role = getUserRole(notification);
  const isPoster = role?.toLowerCase() === 'poster';

  if (taskId) {
    return taskDetailTarget(taskId, {
      fromUserRole: isPoster ? 'Poster' : 'Tasker',
      fromStatus: 'completed',
    });
  }

  return myTasksTarget({
    role: isPoster ? 'Poster' : 'Tasker',
    tab: 'completed',
  });
}

/**
 * Resolve the in-app screen for a stored / API notification.
 */
export function getNotificationNavigationTarget(
  notification: StoredNotification
): NotificationNavigationTarget | null {
  if (isLoginNotification(notification)) {
    return null;
  }

  if (isProfileOrAbnNotification(notification)) {
    return profilePaymentTarget('abn');
  }

  if (isReviewNotification(notification)) {
    return profileRatingsTarget(notification);
  }

  const eventType = getEventType(notification);
  const resourceType = getResourceType(notification);
  const taskId = getTaskId(notification);
  const chatId = getChatId(notification);
  void getOfferId(notification);

  if (isChatNotification(notification)) {
    return chatTarget(notification);
  }

  if (isTaskCompletedNotification(notification)) {
    return completedTaskTarget(notification, taskId);
  }

  if (isOfferAcceptedNotification(notification)) {
    if (taskId) {
      return taskDetailTarget(taskId, {
        fromUserRole: 'Tasker',
        fromStatus: 'assigned',
      });
    }
    return myTasksTarget({ role: 'Tasker', tab: 'assigned' });
  }

  if (isOfferRejectedNotification(notification)) {
    if (taskId) return taskDetailTarget(taskId, { fromUserRole: 'Tasker', fromStatus: 'offers' });
    return myTasksTarget({ role: 'Tasker', tab: 'offers' });
  }

  if (isOfferMadeNotification(notification)) {
    if (taskId) return taskDetailTarget(taskId, { fromUserRole: 'Poster', fromStatus: 'offers' });
    return myTasksTarget({ role: 'Poster', tab: 'posted' });
  }

  if (isQuestionNotification(notification)) {
    if (taskId) return questionTaskDetailTarget(taskId);
    return myTasksTarget();
  }

  switch (eventType) {
    case 'NEW_TASK':
    case 'TASK_CREATED':
    case 'NEW_TASK_AVAILABLE':
      if (taskId) return taskDetailTarget(taskId);
      return { pathname: '/(tabs)/browse' };

    case 'TASK_STATUS_CHANGED':
      if (taskId) return taskDetailTarget(taskId);
      return myTasksTarget();

    case 'QUESTION_ASKED':
    case 'QUESTION_ANSWERED':
      if (taskId) return questionTaskDetailTarget(taskId);
      return myTasksTarget();

    case 'REVIEW_RECEIVED':
    case 'NEW_REVIEW':
    case 'REVIEW_REQUEST':
      return profileRatingsTarget(notification);

    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_SENT':
    case 'PAYMENT_RELEASED':
      if (taskId) return taskDetailTarget(taskId, { fromStatus: 'completed' });
      return profilePaymentTarget();

    case 'RECEIPT_READY': {
      const role = getUserRole(notification);
      const normalizedRole =
        role?.toLowerCase() === 'poster' || role?.toLowerCase() === 'creator'
          ? 'Poster'
          : 'Tasker';
      if (taskId) {
        return {
          pathname: '/payment-receipt',
          params: {
            taskId,
            userRole: normalizedRole,
          },
        };
      }
      return myTasksTarget({
        role: normalizedRole,
        tab: 'completed',
      });
    }

    case 'DELETION_REQUEST_APPROVED':
    case 'DELETION_REQUEST_REJECTED':
      return null;

    default:
      break;
  }

  switch (resourceType) {
    case 'CHAT':
      return chatTarget(notification);
    case 'PAYMENT':
      if (taskId) return taskDetailTarget(taskId);
      return profilePaymentTarget();
    case 'OFFER':
      if (taskId) return taskDetailTarget(taskId);
      break;
    case 'QUESTION':
      if (taskId) return questionTaskDetailTarget(taskId);
      break;
    case 'TASK':
      if (taskId) return taskDetailTarget(taskId);
      break;
    case 'PROFILE':
    case 'ABN':
    case 'USER':
      return profilePaymentTarget('abn');
    case 'REVIEW':
      return profileRatingsTarget(notification);
    case 'AUTH':
      return null;
    default:
      break;
  }

  if (taskId) return taskDetailTarget(taskId);
  if (chatId) return chatTarget(notification);

  return null;
}

export function navigateFromNotification(
  router: Router,
  notification: StoredNotification
): boolean {
  const target = getNotificationNavigationTarget(notification);
  if (!target) return false;

  if (target.pathname === '/(tabs)/account') {
    if (target.params?.screen === 'payment') {
      setPendingAccountNavigation({
        screen: 'payment',
        focus: target.params.focus || 'abn',
      });
    } else if (target.params?.focus === 'ratings') {
      setPendingAccountNavigation({
        screen: 'account',
        focus: 'ratings',
        reviewId: target.params.reviewId,
        taskId: target.params.taskId,
      });
    }
  }

  try {
    router.push({
      pathname: target.pathname as any,
      params: target.params,
    });
    return true;
  } catch (error) {
    console.error('❌ navigateFromNotification failed:', error);
    if (target.pathname === '/task-chat') {
      try {
        router.push('/(tabs)/message' as any);
        return true;
      } catch (fallbackError) {
        console.error('❌ Chat notification fallback navigation failed:', fallbackError);
      }
    }
    return false;
  }
}

export function navigateFromNotificationData(
  router: Router,
  data?: Record<string, any>,
  meta?: { title?: string; body?: string; resourceType?: string }
): boolean {
  if (!data) return false;

  const notification: StoredNotification = {
    id: 'push_notification',
    title: meta?.title || asString(data.title) || '',
    body: meta?.body || asString(data.body) || asString(data.message) || '',
    data,
    type: asString(data.resourceType) || meta?.resourceType || asString(data.type) || 'unknown',
    createdAt: new Date().toISOString(),
    isRead: true,
  };

  return navigateFromNotification(router, notification);
}
