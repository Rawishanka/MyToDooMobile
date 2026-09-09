export function resolveTaskBudget(task: any): number {
  return Number(task?.budget ?? task?.finalAmount ?? task?.taskBudget ?? 0) || 0;
}
