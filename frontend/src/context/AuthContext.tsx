import { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  Task,
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
  const [loading, setLoading] = useState(true);

  const loadUserTasks = async (userId: string): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserTasks(data.tasks || []);
          return data.tasks || [];
        }
      }
      return [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  };

  const saveUserTasks = async (
    userId: string,
    tasks: Task[]
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserTasks(tasks);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error saving tasks:", error);
      return false;
    }
  };

  const migrateLocalTasks = async (userId: string): Promise<Task[]> => {
    const localTasks: Task[] = JSON.parse(
      localStorage.getItem("taskfield") || "[]"
    );
    if (localTasks.length > 0) {
      const cloudTasks = await loadUserTasks(userId);
      const mergedTasks = [...cloudTasks];

      localTasks.forEach((localTask) => {
        if (!cloudTasks.some((cloudTask) => cloudTask.id === localTask.id)) {
          mergedTasks.push(localTask);
        }
      });

      const success = await saveUserTasks(userId, mergedTasks);
      if (success) {
        localStorage.removeItem("taskfield");
        console.log("Local tasks migrated to cloud");
        return mergedTasks;
      }
    }
    return await loadUserTasks(userId);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const user: User = JSON.parse(userData);
          setUser(user);

          const tasks = await loadUserTasks(user.id);
          setUserTasks(tasks);
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
          loginIdentifier: loginIdentifier,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AuthResponse = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        const mergedTasks = await migrateLocalTasks(data.user.id);
        setUserTasks(mergedTasks);

        return {
          success: true,
          data: undefined,
          message: data.message,
        };
      } else {
        return {
          success: false,
          data: undefined,
          message: data.message,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        data: undefined,
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
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AuthResponse = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        const mergedTasks = await migrateLocalTasks(data.user.id);
        setUserTasks(mergedTasks);

        return {
          success: true,
          data: undefined,
          message: data.message,
        };
      } else {
        return {
          success: false,
          data: undefined,
          message: data.message,
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        data: undefined,
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
  };

  const value: AuthContextType = {
    user,
    userTasks,
    loadUserTasks,
    saveUserTasks,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
