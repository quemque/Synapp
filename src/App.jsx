import { useState, useEffect } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskField from "./components/TaskField";

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("taskfield");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const handleAddTask = (newTaskText) => {
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const handleDeleteById = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const handleToggleComplete = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
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
