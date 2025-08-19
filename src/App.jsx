import { useState } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskField from "./components/TaskField";

function App() {
  const [tasks, setTasks] = useState([]);
  const handleAddTask = (newTaskText) => {
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };
  const handleDeleteById = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };
  const handleToggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  return (
    <div>
      <h1 className="text-capital">Todo app</h1>
      <TaskForm onAddTask={handleAddTask} />
      {tasks.map((task) => {
        return (
          <TaskField
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteById}
          />
        );
      })}
    </div>
  );
}

export default App;
