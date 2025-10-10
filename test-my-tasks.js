// Quick test to verify the My Tasks API fix
const { getMyTasks } = require('./api/task-api.ts');

async function testMyTasks() {
  try {
    console.log("Testing getMyTasks function...");
    const result = await getMyTasks();
    console.log("Result:", result);
    console.log("Number of tasks:", result.data ? result.data.length : 0);
  } catch (error) {
    console.error("Error:", error);
  }
}

testMyTasks();