import { CreateTaskRequest } from '@/src/api/types/tasks';
import { useCreateTaskStore } from '@/src/store/create-task-store';
import { PendingActionType, usePendingActionStore } from '@/src/store/pending-action-store';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Execute pending actions after successful login
 */
export async function executePendingAction() {
  const { pendingAction, clearPendingAction } = usePendingActionStore.getState();
  
  if (!pendingAction) {
    console.log("ℹ️ No pending action to execute");
    return;
  }

  console.log("🚀 Executing pending action:", pendingAction);

  try {
    switch (pendingAction.type) {
      case 'post-task':
        await executePostTask(pendingAction.data, pendingAction.returnPath);
        break;
      
      default:
        console.warn("⚠️ Unknown pending action type:", pendingAction.type);
        break;
    }
    
    // Clear the pending action after successful execution
    clearPendingAction();
    
  } catch (error: any) {
    console.error("❌ Error executing pending action:", error);
    
    // Clear the pending action even if it failed to avoid infinite loops
    clearPendingAction();
    
    // Show error alert
    Alert.alert(
      "Error",
      error.message || "Failed to complete your action. Please try again.",
      [{ text: "OK" }]
    );
  }
}

/**
 * Execute post task action
 */
async function executePostTask(taskData: CreateTaskRequest, returnPath?: string) {
  console.log("📝 Executing post task action with data:", taskData);
  
  try {
    // Import the API function dynamically to avoid circular dependencies
    const { postTask } = await import('@/src/api/task-api');
    
    // Post the task
    const response = await postTask(taskData);
    console.log("✅ Task posted successfully via pending action:", response);
    
    // Reset task store after successful posting
    const { resetTask } = useCreateTaskStore.getState();
    resetTask();
    console.log("🔄 Task store reset after successful posting");
    
    // Show success message and navigate
    Alert.alert(
      "Success!", 
      "Your task has been posted successfully and will appear in My Tasks!",
      [
        {
          text: "View My Tasks",
          onPress: () => {
            // Navigate to the specified return path or default to My Tasks
            const targetPath = returnPath || '/(tabs)/my-tasks';
            router.replace(targetPath as any);
          }
        }
      ]
    );
    
  } catch (error: any) {
    console.error("❌ Failed to post task via pending action:", error);
    throw error; // Re-throw to be handled by executePendingAction
  }
}

/**
 * Check if there's a pending action and return its type
 */
export function checkPendingAction(): PendingActionType {
  const { pendingAction } = usePendingActionStore.getState();
  return pendingAction?.type || null;
}