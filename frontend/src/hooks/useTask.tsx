import { useState, useEffect, useRef, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useAuth } from "../context/AuthContext";
import { Task } from "../types";
import { notificationService } from "../services/notificationService";

export function useTask() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const nextIdRef = useRef<number>(1);
  const { user, userTasks, saveUserTasks, isAuthenticated } = useAuth();

  useEffect(() => {
    notificationService.requestPermission().then((granted) => {
      if (granted) {
        console.log("Notification permissions granted");
      }
    });
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      tasks.forEach((task) => {
        if (task.notificationTime && !task.completed) {
          const notificationDate = new Date(task.notificationTime);
          if (notificationDate > new Date()) {
            notificationService.scheduleNotification(
              task.text || "",
              notificationDate,
              task.id
            );
          }
        }
      });
    }
  }, [tasks]);

  const loadLocalTasks = useCallback((): Task[] => {
    if (!isAuthenticated) {
      const savedTasks = localStorage.getItem("taskfield");
      if (savedTasks) {
        try {
          const parsedTasks: any[] = JSON.parse(savedTasks);
          const validTasks = parsedTasks.filter(
            (task) =>
              task && typeof task.id === "string" && task.id.trim() !== ""
          );

          const tasksWithDates = validTasks.map((task: any) => ({
            ...task,
            notificationTime: task.notificationTime
              ? new Date(task.notificationTime)
              : undefined,
          })) as Task[];

          if (tasksWithDates.length > 0) {
            const maxId = Math.max(
              ...tasksWithDates.map((task) => parseInt(task.id) || 0)
            );
            nextIdRef.current = maxId + 1;
          } else {
            nextIdRef.current = 1;
          }

          return tasksWithDates;
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

  const addTask = async (
    text: string,
    category: string = "general",
    notificationTime?: Date | null
  ): Promise<void> => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: text,
      text: text,
      category,
      completed: false,
      notificationTime,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);

    if (notificationTime) {
      await notificationService.requestPermission();
      notificationService.scheduleNotification(
        text,
        notificationTime,
        newTask.id
      );
    }
  };

  const deleteTask = async (id: string) => {
    notificationService.cancelNotification(id);

    const updatedTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(updatedTasks);
  };

  const toggleTask = async (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };

        if (updatedTask.completed && task.notificationTime) {
          notificationService.cancelNotification(id);
        } else if (!updatedTask.completed && task.notificationTime) {
          const notificationDate = new Date(task.notificationTime);
          if (notificationDate > new Date()) {
            notificationService.scheduleNotification(
              updatedTask.text || "",
              notificationDate,
              id
            );
          }
        }

        return updatedTask;
      }
      return task;
    });

    await saveTasks(updatedTasks);
  };

  const toggleClean = async () => {
    tasks.forEach((task) => {
      if (task.notificationTime) {
        notificationService.cancelNotification(task.id);
      }
    });

    await saveTasks([]);
  };

  const toggleFilter = async () => {
    const tasksToRemove = tasks.filter((task) => task.completed);

    tasksToRemove.forEach((task) => {
      if (task.notificationTime) {
        notificationService.cancelNotification(task.id);
      }
    });

    const updatedTasks = tasks.filter((task) => !task.completed);
    await saveTasks(updatedTasks);
  };

  const resetApp = async () => {
    tasks.forEach((task) => {
      if (task.notificationTime) {
        notificationService.cancelNotification(task.id);
      }
    });

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
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const updatedTask = {
          ...task,
          title: newText,
          text: newText,
          ...(newCategory && { category: newCategory }),
        };

        if (task.notificationTime) {
          notificationService.cancelNotification(id);
          const notificationDate = new Date(task.notificationTime);
          if (notificationDate > new Date()) {
            notificationService.scheduleNotification(
              newText,
              notificationDate,
              id
            );
          }
        }

        return updatedTask;
      }
      return task;
    });

    await saveTasks(updatedTasks);
  };

  const editTaskWithNotification = async (
    id: string,
    newText: string,
    notificationTime?: Date | null
  ) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        const updatedTask = {
          ...task,
          title: newText,
          text: newText,
          notificationTime: notificationTime || task.notificationTime,
        };

        notificationService.cancelNotification(id);

        if (notificationTime && !task.completed) {
          const notificationDate = new Date(notificationTime);
          if (notificationDate > new Date()) {
            notificationService.scheduleNotification(
              newText,
              notificationDate,
              id
            );
          }
        }

        return updatedTask;
      }
      return task;
    });

    await saveTasks(updatedTasks);
  };

  const reorderTasks = async (oldIndex: number, newIndex: number) => {
    const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
    await saveTasks(updatedTasks);
  };

  const checkOverdueNotifications = useCallback(() => {
    const now = new Date();
    tasks.forEach((task) => {
      if (task.notificationTime && !task.completed) {
        const notificationDate = new Date(task.notificationTime);
        if (notificationDate <= now) {
          console.log(`Task "${task.text}" notification is overdue`);
        }
      }
    });
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkOverdueNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkOverdueNotifications]);

  return {
    tasks: tasks || [],
    addTask,
    deleteTask,
    toggleTask,
    toggleClean,
    toggleFilter,
    resetApp,
    editTask,
    editTaskWithNotification,
    reorderTasks,
    isAuthenticated,
  };
}
