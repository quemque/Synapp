import { ReactElement } from "react";

export type User = {
  id: string;
  email: string;
  username: string;
  createdAt?: Date;
};
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  priority?: "low" | "medium" | "high";
}

export type Tag = {
  id: string;
  name: string;
  color?: string;
  userId: string;
};
export type Category = {
  id: string;
  name: string;
  icon: React.ReactElement;
  color: string;
};
export type FilterStatus = "all" | "active" | "completed";

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};
export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}
export interface AuthResponse {
  token: string;
  user: User;
}

export interface FormData {
  username: string;
  email: string;
  password: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactElement;
  hasDropdown?: boolean;
  dropdownOpen?: boolean;
  onToggle?: () => void;
  upIcon?: React.ComponentType;
  downIcon?: React.ComponentType;
  tags?: string[];
  getColor?: (tag: string) => string;
  getIcon?: (tag: string) => ReactElement;
  action?: () => void;
  onAction?: () => void;
}

export interface MenuItemProps {
  item: MenuItem;
  onClose: () => void;
  onAction: (item: MenuItem) => void;
}
