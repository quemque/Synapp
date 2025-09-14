import { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  Task,
  Activity,
  AuthContextType,
  AuthProviderProps,
  ApiResponse,
  AuthResponse,
} from "../types";

const API_URL = import.meta.env.VITE_BACK_URL || "http://localhost:3001";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserTasks = async (userId: string): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const tasks = data.tasks || [];
          const tasksWithDates = tasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
          }));
          setUserTasks(tasksWithDates);
          return tasksWithDates;
        }
      }
      console.error("Failed to load tasks from server");
      return [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  };

  const loadUserActivities = async (userId: string): Promise<Activity[]> => {
    try {
      console.log("Loading activities for user:", userId);

      const response = await fetch(`${API_URL}/api/activities/${userId}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("Activities endpoint not found, returning empty array");
          return [];
        }
        console.error(
          "Failed to load activities:",
          response.status,
          response.statusText
        );
        return [];
      }

      const data = await response.json();

      if (data.success) {
        const activities = data.activities || [];
        const activitiesWithDates = activities.map((activity: any) => ({
          ...activity,
          dueDate: new Date(activity.dueDate),
        }));

        console.log(
          "Loaded",
          activitiesWithDates.length,
          "activities from server"
        );
        setUserActivities(activitiesWithDates);
        return activitiesWithDates;
      }

      console.error("Server returned unsuccessful response for activities");
      return [];
    } catch (error) {
      console.error("Error loading activities:", error);
      return [];
    }
  };

  const saveUserTasks = async (
    userId: string,
    tasks: Task[]
  ): Promise<boolean> => {
    try {
      // Преобразуем Date объекты в строки для сериализации
      const tasksForServer = tasks.map((task) => ({
        ...task,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        createdAt: task.createdAt ? task.createdAt.toISOString() : undefined,
        updatedAt: task.updatedAt ? task.updatedAt.toISOString() : undefined,
      }));

      const response = await fetch(`${API_URL}/api/tasks/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks: tasksForServer }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserTasks(tasks);
          return true;
        }
      }
      console.error("Failed to save tasks to server");
      return false;
    } catch (error) {
      console.error("Error saving tasks:", error);
      return false;
    }
  };

  const saveUserActivities = async (
    userId: string,
    activities: Activity[]
  ): Promise<boolean> => {
    try {
      console.log("Saving activities for user:", userId);

      const activitiesForServer = activities.map((activity) => ({
        ...activity,
        dueDate: activity.dueDate.toISOString(),
      }));

      const response = await fetch(`${API_URL}/api/activities/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activities: activitiesForServer }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(
            "Activities endpoint not found, saving to localStorage instead"
          );
          // Fallback to localStorage if endpoint doesn't exist
          localStorage.setItem(
            "scheduleActivities",
            JSON.stringify(activities)
          );
          return true;
        }
        console.error("Failed to save activities to server:", response.status);
        return false;
      }

      const data = await response.json();

      if (data.success) {
        console.log("Activities saved successfully to server");
        setUserActivities(activities);
        return true;
      }

      console.error(
        "Server returned unsuccessful response for activities save"
      );
      return false;
    } catch (error) {
      console.error("Error saving activities:", error);
      // Fallback to localStorage on error
      localStorage.setItem("scheduleActivities", JSON.stringify(activities));
      return true;
    }
  };

  // Исправленная функция миграции задач
  const migrateLocalTasks = async (userId: string): Promise<Task[]> => {
    try {
      const localTasksJson = localStorage.getItem("taskfield");
      if (!localTasksJson) return await loadUserTasks(userId);

      const localTasks: Task[] = JSON.parse(localTasksJson);
      if (localTasks.length === 0) return await loadUserTasks(userId);

      console.log("Migrating", localTasks.length, "local tasks to cloud");

      const cloudTasks = await loadUserTasks(userId);
      const mergedTasks = [...cloudTasks];

      // Добавляем только уникальные задачи
      localTasks.forEach((localTask) => {
        const exists = cloudTasks.some(
          (cloudTask) => cloudTask.id === localTask.id
        );
        if (!exists) {
          mergedTasks.push(localTask);
        }
      });

      const success = await saveUserTasks(userId, mergedTasks);
      if (success) {
        localStorage.removeItem("taskfield");
        console.log("Local tasks migrated to cloud successfully");
        return mergedTasks;
      } else {
        console.log("Failed to migrate tasks, keeping local copy");
        return cloudTasks; // Возвращаем cloud tasks если миграция не удалась
      }
    } catch (error) {
      console.error("Error migrating local tasks:", error);
      return await loadUserTasks(userId);
    }
  };

  // Исправленная функция миграции активностей
  const migrateLocalActivities = async (
    userId: string
  ): Promise<Activity[]> => {
    try {
      const localActivitiesJson = localStorage.getItem("scheduleActivities");
      if (!localActivitiesJson) return await loadUserActivities(userId);

      const localActivities: Activity[] = JSON.parse(localActivitiesJson);
      if (localActivities.length === 0) return await loadUserActivities(userId);

      console.log(
        "Migrating",
        localActivities.length,
        "local activities to cloud"
      );

      const cloudActivities = await loadUserActivities(userId);
      const mergedActivities = [...cloudActivities];

      // Добавляем только уникальные активности
      localActivities.forEach((localActivity) => {
        const exists = cloudActivities.some(
          (cloudActivity) => cloudActivity.id === localActivity.id
        );
        if (!exists) {
          mergedActivities.push(localActivity);
        }
      });

      const success = await saveUserActivities(userId, mergedActivities);
      if (success) {
        localStorage.removeItem("scheduleActivities");
        console.log("Local activities migrated to cloud successfully");
        return mergedActivities;
      } else {
        console.log("Failed to migrate activities, keeping local copy");
        return cloudActivities; // Возвращаем cloud activities если миграция не удалась
      }
    } catch (error) {
      console.error("Error migrating local activities:", error);
      return await loadUserActivities(userId);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const user: User = JSON.parse(userData);
          setUser(user);

          // Загружаем данные параллельно
          const [tasks, activities] = await Promise.all([
            loadUserTasks(user.id),
            loadUserActivities(user.id),
          ]);

          setUserTasks(tasks);
          setUserActivities(activities);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    loginIdentifier: string,
    password: string
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          loginIdentifier: loginIdentifier.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login error response:", errorText);
        return {
          success: false,
          message: errorText || "Login failed",
        };
      }

      const data: AuthResponse = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Мигрируем данные
        console.log("Starting data migration...");
        const [mergedTasks, mergedActivities] = await Promise.all([
          migrateLocalTasks(data.user.id),
          migrateLocalActivities(data.user.id),
        ]);

        setUserTasks(mergedTasks);
        setUserActivities(mergedActivities);

        return {
          success: true,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: (error as Error).message || "Network error",
      };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Register error response:", errorText);
        return {
          success: false,
          message: errorText || "Registration failed",
        };
      }

      const data: AuthResponse = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Мигрируем данные
        console.log("Starting data migration for new user...");
        const [mergedTasks, mergedActivities] = await Promise.all([
          migrateLocalTasks(data.user.id),
          migrateLocalActivities(data.user.id),
        ]);

        setUserTasks(mergedTasks);
        setUserActivities(mergedActivities);

        return {
          success: true,
          message: data.message,
        };
      } else {
        return {
          success: false,
          message: data.message,
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: (error as Error).message || "Network error",
      };
    }
  };

  const logout = (): void => {
    console.log("Logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserTasks([]);
    setUserActivities([]);
  };

  const value: AuthContextType = {
    user,
    userTasks,
    userActivities,
    loadUserTasks,
    saveUserTasks,
    loadUserActivities,
    saveUserActivities,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
