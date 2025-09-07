import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ApiError,
} from "../types/index";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Хелпер для обработки ошибок
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
};

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(response);
  },

  // Дополнительные методы с типами
  getProfile: async (token: string): Promise<User> => {
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
