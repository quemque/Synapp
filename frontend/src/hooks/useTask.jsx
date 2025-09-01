import { useState, useEffect, useRef, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useAuth } from "../context/AuthContext";

export function useTask() {
  const [tasks, setTasks] = useState([]);
  const nextIdRef = useRef(1);
  const { user, userTasks, saveUserTasks, isAuthenticated } = useAuth();

  const loadLocalTasks = useCallback(() => {
    if (!isAuthenticated) {
      const savedTasks = localStorage.getItem("taskfield");
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          const validTasks = parsedTasks.filter(
            (task) => task && typeof task.id === "number" && !isNaN(task.id)
          );

          if (validTasks.length > 0) {
            const maxId = Math.max(...validTasks.map((task) => task.id));
            nextIdRef.current = maxId + 1;
          } else {
            nextIdRef.current = 1;
          }

          return validTasks;
        } catch (error) {
          console.error("Error parsing tasks from localStorage:", error);
          nextIdRef.current = 1;
          return [];
        }
      }
    }
    nextIdRef.current = 1;
    return [];
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setTasks(userTasks || []);

      if (userTasks && userTasks.length > 0) {
        const maxId = Math.max(...userTasks.map((task) => task.id));
        nextIdRef.current = maxId + 1;
      } else {
        nextIdRef.current = 1;
      }
    } else {
      const localTasks = loadLocalTasks();
      setTasks(localTasks);
    }
  }, [isAuthenticated, userTasks, loadLocalTasks]);

  const saveTasks = useCallback(
    async (updatedTasks) => {
      if (isAuthenticated && user) {
        await saveUserTasks(user.id, updatedTasks);
      } else {
        localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      }
      setTasks(updatedTasks);
    },
    [isAuthenticated, user, saveUserTasks]
  );

  const addTask = async (text, category = "general") => {
    const newTask = {
      id: Date.now(),
      text,
      category,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
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
    const updatedTasks = tasks.filter((task) => !task.completed);
    await saveTasks(updatedTasks);
  };

  const resetApp = async () => {
    await saveTasks([]);
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
    tasks: tasks || [],
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
