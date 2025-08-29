import { useState, useEffect, useRef, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useAuth } from "../context/AuthContext";

export function useTask() {
  const [tasks, setTasks] = useState([]);
  const nextIdRef = useRef(1);
  const { user, userTasks, saveUserTasks, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      setTasks(userTasks);
    } else {
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
    }
  }, [isAuthenticated, user, userTasks]);

  const saveTasks = useCallback(
    async (updatedTasks) => {
      if (isAuthenticated && user) {
        // Сохраняем в облако
        await saveUserTasks(user.id, updatedTasks);
      } else {
        localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      }
      setTasks(updatedTasks);
    },
    [isAuthenticated, user, saveUserTasks]
  );

  const addTask = async (text, category = "general") => {
    if (typeof nextIdRef.current !== "number" || isNaN(nextIdRef.current)) {
      nextIdRef.current = 1;
    }

    const newTask = {
      id: nextIdRef.current,
      text,
      category,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    nextIdRef.current += 1;
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(updatedTasks);
  };

  const toggleTask = async (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
  };

  const toggleClean = async () => {
    await saveTasks([]);
  };

  const toggleFilter = async () => {
    const updatedTasks = tasks.filter((task) => task.completed !== true);
    await saveTasks(updatedTasks);
  };

  const resetApp = async () => {
    await saveTasks([]);
    nextIdRef.current = 1;
    if (!isAuthenticated) {
      localStorage.removeItem("taskfield");
    }
  };

  const editTask = async (id, newText, newCategory = null) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            text: newText,
            ...(newCategory && { category: newCategory }),
          }
        : task
    );
    await saveTasks(updatedTasks);
  };

  const reorderTasks = async (oldIndex, newIndex) => {
    const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
    await saveTasks(updatedTasks);
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
    isAuthenticated,
  };
}
