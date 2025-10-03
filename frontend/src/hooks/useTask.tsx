//import { logService } from "../services/logService";
import { useState, useEffect, useRef, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useAuth } from "../context/AuthContext";
import { Task } from "../types";
import { notificationService } from "../services/notificationService";

export function useTask() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const nextIdRef = useRef<number>(1);
  const { user, userTasks, saveUserTasks, isAuthenticated } = useAuth();

  console.log("🔵 [useTask] Hook initialized:", {
    isAuthenticated,
    user: user?.id,
    initialTasksCount: tasks.length,
    userTasksCount: userTasks?.length,
  });

  useEffect(() => {
    console.log("🔵 [useTask] Requesting notification permissions");
    notificationService.requestPermission().then((granted) => {
      console.log(
        `🔵 [useTask] Notification permission ${granted ? "granted" : "denied"}`
      );
    });
  }, []);

  useEffect(() => {
    console.log(
      "🔵 [useTask] Setting up task notifications, task count:",
      tasks.length
    );
    if (tasks.length > 0) {
      tasks.forEach((task) => {
        if (task.notificationTime && !task.completed) {
          const notificationDate = new Date(task.notificationTime);
          if (notificationDate > new Date()) {
            console.log(
              "🔵 [useTask] Scheduling notification for task:",
              task.id
            );
            notificationService.scheduleNotification(
              task.text || task.title || "",
              notificationDate,
              task.id
            );
          } else {
            console.log(
              "🔵 [useTask] Notification time in past for task:",
              task.id
            );
          }
        }
      });
    }
  }, [tasks]);

  const loadLocalTasks = useCallback((): Task[] => {
    console.log(
      "🔵 [useTask] Loading local tasks, isAuthenticated:",
      isAuthenticated
    );

    if (!isAuthenticated) {
      const savedTasks = localStorage.getItem("taskfield");
      console.log("🔵 [useTask] Local storage tasks found:", !!savedTasks);

      if (savedTasks) {
        try {
          const parsedTasks: any[] = JSON.parse(savedTasks);
          console.log(
            "🔵 [useTask] Parsed tasks from localStorage:",
            parsedTasks
          );

          const validTasks = parsedTasks.filter(
            (task) =>
              task && typeof task.id === "string" && task.id.trim() !== ""
          );

          console.log(
            "🔵 [useTask] Valid tasks after filtering:",
            validTasks.length
          );

          // ГАРАНТИРУЕМ наличие title у всех задач
          const tasksWithTitles = validTasks.map((task: any) => ({
            ...task,
            title: task.title || task.text || "", // заполняем title если отсутствует
            text: task.text || task.title || "", // заполняем text если отсутствует
            notificationTime: task.notificationTime
              ? new Date(task.notificationTime)
              : undefined,
          })) as Task[];

          if (tasksWithTitles.length > 0) {
            const maxId = Math.max(
              ...tasksWithTitles.map((task) => parseInt(task.id) || 0)
            );
            nextIdRef.current = maxId + 1;
            console.log("🔵 [useTask] Next ID ref set to:", nextIdRef.current);
          } else {
            nextIdRef.current = 1;
          }

          console.log(
            "🟢 [useTask] Local tasks loaded successfully:",
            tasksWithTitles.length
          );
          return tasksWithTitles;
        } catch (error) {
          console.error(
            "🔴 [useTask] Error parsing tasks from localStorage:",
            error
          );
          nextIdRef.current = 1;
          return [];
        }
      }
    }
    nextIdRef.current = 1;
    return [];
  }, [isAuthenticated]);

  useEffect(() => {
    console.log(
      "🔵 [useTask] Effect: isAuthenticated changed:",
      isAuthenticated
    );

    if (isAuthenticated) {
      console.log(
        "🔵 [useTask] Setting tasks from userTasks:",
        userTasks?.length
      );
      setTasks(userTasks || []);

      if (userTasks && userTasks.length > 0) {
        const maxId = Math.max(
          ...userTasks.map((task) => parseInt(task.id) || 0)
        );
        nextIdRef.current = maxId + 1;
        console.log("🔵 [useTask] Next ID from userTasks:", nextIdRef.current);
      } else {
        nextIdRef.current = 1;
      }
    } else {
      const localTasks = loadLocalTasks();
      console.log("🔵 [useTask] Setting local tasks:", localTasks.length);
      setTasks(localTasks);
    }
  }, [isAuthenticated, userTasks, loadLocalTasks]);

  const saveTasks = useCallback(
    async (updatedTasks: Task[]): Promise<void> => {
      console.log("🔵 [useTask] saveTasks called:", {
        isAuthenticated,
        userId: user?.id,
        tasksCount: updatedTasks.length,
      });

      try {
        // ОБЕСПЕЧИВАЕМ, что у всех задач есть title и text
        const tasksWithTitle = updatedTasks.map((task) => ({
          ...task,
          title: task.title || task.text || "Untitled Task",
          text: task.text || task.title || "Untitled Task",
          completed: task.completed !== undefined ? task.completed : false,
          category: task.category || "general",
          createdAt: task.createdAt || new Date(),
        }));

        console.log(
          "🔵 [useTask] Tasks after validation:",
          tasksWithTitle.map((t) => ({
            id: t.id,
            title: t.title,
            text: t.text,
            hasTitle: !!t.title,
            hasText: !!t.text,
          }))
        );

        if (isAuthenticated && user) {
          console.log("🔵 [useTask] Saving to backend via saveUserTasks");
          await saveUserTasks(user.id, tasksWithTitle);
          console.log("🟢 [useTask] Backend save successful");
        } else {
          console.log("🔵 [useTask] Saving to localStorage");
          localStorage.setItem("taskfield", JSON.stringify(tasksWithTitle));
        }

        // ОБНОВЛЯЕМ СОСТОЯНИЕ ТОЛЬКО ПОСЛЕ УСПЕШНОГО СОХРАНЕНИЯ
        console.log("🟢 [useTask] Tasks saved successfully, updating state");
        setTasks(tasksWithTitle);
      } catch (error) {
        console.error("🔴 [useTask] Error saving tasks:", error);
        // НЕ обновляем состояние при ошибке
        throw error;
      }
    },
    [isAuthenticated, user, saveUserTasks]
  );

  const addTask = async (
    text: string,
    category: string = "general",
    notificationTime?: Date | null
  ): Promise<void> => {
    // logService.info(" useTask", "addTask called:", {
    //   text,
    //   category,
    //   notificationTime,
    // });

    const newTask: Task = {
      id: Date.now().toString(),
      title: text,
      text: text,
      category,
      completed: false,
      notificationTime,
      createdAt: new Date(),
    };

    //logService.info("useTask", "New task created:", newTask);

    const updatedTasks = [...tasks, newTask];
    console.log(
      "🔵 [useTask] Updated tasks array length:",
      updatedTasks.length
    );

    try {
      // ЖДЕМ успешного сохранения перед обновлением состояния
      await saveTasks(updatedTasks);
      console.log("🟢 [useTask] Task added and saved successfully");

      if (notificationTime) {
        console.log("🔵 [useTask] Scheduling notification for new task");
        await notificationService.requestPermission();
        notificationService.scheduleNotification(
          text,
          notificationTime,
          newTask.id
        );
      }
    } catch (error) {
      console.error("🔴 [useTask] Error in addTask:", error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    console.log("🔵 [useTask] deleteTask called:", id);
    notificationService.cancelNotification(id);

    const updatedTasks = tasks.filter((task) => task.id !== id);
    console.log("🔵 [useTask] Tasks after deletion:", updatedTasks.length);
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
              updatedTask.text || updatedTask.title || "",
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
