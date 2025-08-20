import { useState, useEffect } from "react";

export function useTask() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("taskfield");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const toggleTask = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  return {
    tasks,
    addTask,
    deleteTask,
    toggleTask,
  };
}
