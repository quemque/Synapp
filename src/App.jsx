import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskField from "./components/TaskField";
import { useTask } from "./hooks/useTask.jsx";

function App() {
  const { tasks, addTask, deleteTask, toggleTask } = useTask();

  return (
    <div>
      <h1 className="text-capital">Todo app</h1>
      <TaskForm onAddTask={addTask} />
      {tasks.map((task) => (
        <TaskField
          key={task.id}
          task={task}
          onToggleComplete={toggleTask}
          onDelete={deleteTask}
        />
      ))}
    </div>
  );
}

export default App;
