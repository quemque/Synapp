import { useState, useEffect, useRef, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useAuth } from "../context/AuthContext";
import { Task } from "../types";

export function useTask() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const nextIdRef = useRef<number>(1);
  const { user, userTasks, saveUserTasks, isAuthenticated } = useAuth();

  const loadLocalTasks = useCallback((): Task[] => {
    if (!isAuthenticated) {
      const savedTasks = localStorage.getItem("taskfield");
      if (savedTasks) {
        try {
          const parsedTasks: Task[] = JSON.parse(savedTasks);
          const validTasks = parsedTasks.filter(
            (task) =>
              task && typeof task.id === "string" && task.id.trim() !== ""
          );

          if (validTasks.length > 0) {
            const maxId = Math.max(
              ...validTasks.map((task) => parseInt(task.id) || 0)
            );
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
        const maxId = Math.max(
          ...userTasks.map((task) => parseInt(task.id) || 0)
        );
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
    async (updatedTasks: Task[]) => {
      if (isAuthenticated && user) {
        await saveUserTasks(user.id, updatedTasks);
      } else {
        localStorage.setItem("taskfield", JSON.stringify(updatedTasks));
      }
      setTasks(updatedTasks);
    },
    [isAuthenticated, user, saveUserTasks]
  );

  const addTask = async (text: string, category: string = "general") => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: text,
      text: text,
      category,
      completed: false,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(updatedTasks);
  };

  const toggleTask = async (id: string) => {
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

  const editTask = async (
    id: string,
    newText: string,
    newCategory: string | null = null
  ) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            title: newText,
            text: newText,
            ...(newCategory && { category: newCategory }),
          }
        : task
    );
    await saveTasks(updatedTasks);
  };

  const reorderTasks = async (oldIndex: number, newIndex: number) => {
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
