import { formatUserName } from '@/src/utils/formatUserName';

export interface TaskChatParticipants {
  posterId?: string;
  taskerId?: string;
  posterName?: string;
  taskerName?: string;
  posterAvatar?: string;
  taskerAvatar?: string;
  taskTitle?: string;
}

/**
 * Resolve poster/tasker IDs from a task object (same rules as TaskActionButtons).
 */
export function resolveTaskChatParticipants(task: any): TaskChatParticipants {
  if (!task) return {};

  const createdByObj = typeof task.createdBy === 'object' ? task.createdBy : null;
  const posterId =
    asString(createdByObj?._id) ||
    (typeof task.createdBy === 'string' ? task.createdBy : undefined);
  const posterName = createdByObj
    ? formatUserName(createdByObj.firstName, createdByObj.lastName)
    : '';
  const posterAvatar = createdByObj?.avatar || createdByObj?.profilePicture || '';

  let taskerId: string | undefined;
  let taskerName = '';
  let taskerAvatar = '';
  const assignedTo = task.assignedTo;

  if (typeof assignedTo === 'object' && assignedTo?._id) {
    taskerId = assignedTo._id;
    taskerName = formatUserName(assignedTo.firstName, assignedTo.lastName);
    taskerAvatar = assignedTo.avatar || assignedTo.profilePicture || '';
  } else if (typeof assignedTo === 'string') {
    taskerId = assignedTo;
  } else if (Array.isArray(task.offers)) {
    const acceptedOffer = task.offers.find((o: any) => o.status === 'accepted');
    if (acceptedOffer) {
      const taskTaker: any = acceptedOffer.taskTaker || acceptedOffer.taskTakerId;
      if (typeof taskTaker === 'object') {
        taskerId = taskTaker?._id;
        taskerName = formatUserName(taskTaker?.firstName, taskTaker?.lastName);
        taskerAvatar = taskTaker?.avatar || taskTaker?.profilePicture || '';
      } else if (typeof taskTaker === 'string') {
        taskerId = taskTaker;
      }
    }
  }

  return {
    posterId,
    taskerId,
    posterName,
    taskerName,
    posterAvatar,
    taskerAvatar,
    taskTitle: task.title,
  };
}

function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}
