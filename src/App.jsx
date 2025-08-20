import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskField from "./components/TaskField";
import { useTask } from "./hooks/useTask.jsx";
import Buttons from "./components/Buttons.jsx";
//test
function App() {
  const { tasks, addTask, deleteTask, toggleTask, toggleClean, toggleFilter } =
    useTask();

  return (
    <div>
      <h1 className="text-capital">Todo app</h1>
      <TaskForm onAddTask={addTask} />
      {tasks.length > 0 && (
        <Buttons cleaning={toggleClean} filterb={toggleFilter} />
      )}
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
