import { useState, useEffect, useRef } from "react";

export function useTask() {
  const [tasks, setTasks] = useState([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    const savedTasks = localStorage.getItem("taskfield");
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
      if (parsedTasks.length > 0) {
        const maxId = Math.max(...parsedTasks.map((task) => task.id));
        nextIdRef.current = maxId + 1;
      }
    }
  }, []);

  const addTask = (text) => {
    setTasks((prevTasks) => {
      const newTask = {
        id: nextIdRef.current,
        text,
        completed: false,
      };
      const updatedTasks = [...prevTasks, newTask];
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      nextIdRef.current += 1;
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
  const toggleClean = () => {
    setTasks([]);
    localStorage.setItem("taskfield", JSON.stringify([]));
  };
  const toggleFilter = () => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.completed !== true);
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  return {
    tasks,
    addTask,
    deleteTask,
    toggleTask,
    toggleClean,
    toggleFilter,
  };
}
