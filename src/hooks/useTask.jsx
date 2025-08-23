import { useState, useEffect, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export function useTask() {
  const [tasks, setTasks] = useState([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    const savedTasks = localStorage.getItem("taskfield");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        const validTasks = parsedTasks.filter(
          (task) => task && typeof task.id === "number" && !isNaN(task.id)
        );
        setTasks(validTasks);

        if (validTasks.length > 0) {
          const maxId = Math.max(...validTasks.map((task) => task.id));
          nextIdRef.current = maxId + 1;
        } else {
          nextIdRef.current = 1;
        }
      } catch (error) {
        console.error("Error parsing tasks from localStorage:", error);
        setTasks([]);
        nextIdRef.current = 1;
      }
    }
  }, []);

  const addTask = (text, category = "general") => {
    setTasks((prevTasks) => {
      if (typeof nextIdRef.current !== "number" || isNaN(nextIdRef.current)) {
        nextIdRef.current = 1;
      }

      const newTask = {
        id: nextIdRef.current,
        text,
        category,
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

  const resetApp = () => {
    setTasks([]);
    nextIdRef.current = 1;
    localStorage.removeItem("taskfield");
  };

  const editTask = (id, newText, newCategory = null) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              text: newText,
              ...(newCategory && { category: newCategory }),
            }
          : task
      );
      localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  const reorderTasks = (oldIndex, newIndex) => {
    setTasks((items) => {
      const updatedTasks = arrayMove(items, oldIndex, newIndex);
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
    resetApp,
    editTask,
    reorderTasks,
  };
}
