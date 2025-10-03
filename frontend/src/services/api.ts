import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ApiError,
  Task,
} from "../types/index";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Хелпер для обработки ошибок
const handleResponse = async <T>(response: Response): Promise<T> => {
  console.log("🔵 [API] Response status:", response.status);
  console.log(
    "🔵 [API] Response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    let errorData: ApiError;
    try {
      const errorText = await response.text();
      console.error("🔴 [API] Error response text:", errorText);
      errorData = JSON.parse(errorText);
    } catch (parseError) {
      console.error("🔴 [API] Error parsing error response:", parseError);
      errorData = { message: `HTTP error! status: ${response.status}` };
    }

    console.error("🔴 [API] Error details:", errorData);
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  try {
    const data = await response.json();
    console.log("🟢 [API] Success response:", data);
    return data;
  } catch (parseError) {
    console.error("🔴 [API] Error parsing success response:", parseError);
    throw new Error("Failed to parse response");
  }
};

// Функция для сохранения задач с подробным логированием
export const saveTasksAPI = async (
  userId: string,
  tasks: Task[]
): Promise<any> => {
  console.log("🔵 [saveTasksAPI] Starting save tasks:", {
    userId,
    tasksCount: tasks.length,
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      text: t.text,
      completed: t.completed,
      category: t.category,
      notificationTime: t.notificationTime,
      hasTitle: !!t.title,
      hasText: !!t.text,
    })),
  });

  try {
    const response = await fetch(`${API_URL}/api/tasks/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    });

    console.log("🔵 [saveTasksAPI] Request completed, processing response...");
    return await handleResponse(response);
  } catch (error) {
    console.error("🔴 [saveTasksAPI] Fetch error:", error);
    throw error;
  }
};

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log("🔵 [authAPI] Login attempt:", {
      loginIdentifier: credentials.loginIdentifier,
    });
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    console.log("🔵 [authAPI] Register attempt:", {
      email: credentials.email,
      username: credentials.username,
    });
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  getProfile: async (token: string): Promise<User> => {
    console.log("🔵 [authAPI] Getting profile");
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<User>(response);
  },

  logout: async (token: string): Promise<{ message: string }> => {
    console.log("🔵 [authAPI] Logout");
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse<{ message: string }>(response);
  },
};
