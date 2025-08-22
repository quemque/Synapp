import "./App.css";
import TaskForm from "./components/TaskForm";
import EditableTaskField from "./components/EditableTaskField";
import { useTask } from "./hooks/useTask.jsx";
import Buttons from "./components/Buttons.jsx";

function App() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTask,
    toggleClean,
    toggleFilter,
    editTask,
  } = useTask();

  return (
    <div>
      <h1 className="text-capital">Todo app</h1>
      <TaskForm onAddTask={addTask} />
      {tasks.length > 0 && (
        <Buttons cleaning={toggleClean} filterb={toggleFilter} />
      )}
      {tasks.map((task) => (
        <EditableTaskField
          key={task.id}
          task={task}
          onToggleComplete={toggleTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      ))}
    </div>
  );
}

export default App;
