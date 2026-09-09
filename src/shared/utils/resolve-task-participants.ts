/**
 * Resolve poster + assigned tasker IDs from a task payload for chat bootstrap.
 */
export function resolveTaskChatParticipants(task: any): {
  posterId: string | null;
  taskerId: string | null;
} {
  if (!task) {
    return { posterId: null, taskerId: null };
  }

  const posterRaw =
    task.createdBy?._id ||
    task.createdBy ||
    task.posterId?._id ||
    task.posterId ||
    task.userId?._id ||
    task.userId ||
    null;

  const taskerRaw =
    task.assignedTo?._id ||
    task.assignedTo ||
    task.taskerId?._id ||
    task.taskerId ||
    task.acceptedOffer?.taskTakerId?._id ||
    task.acceptedOffer?.taskTakerId ||
    task.acceptedOffer?.userId?._id ||
    task.acceptedOffer?.userId ||
    null;

  const toId = (value: unknown): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && '_id' in value) {
      return String((value as { _id: unknown })._id);
    }
    return String(value);
  };

  return {
    posterId: toId(posterRaw),
    taskerId: toId(taskerRaw),
  };
}
