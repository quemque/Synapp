import { ReactElement, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt?: Date;
}

export interface Task {
  id: string;
  title: string;
  text?: string;
  completed: boolean;
  category?: string;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  priority?: "low" | "medium" | "high";
}
export interface TagsPageProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  reorderTasks: (oldIndex: number, newIndex: number) => void;
  addTask: (text: string, category?: string) => Promise<void>;
}
export interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}
export interface Tag {
  id: string;
  name: string;
  color?: string;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: ReactElement;
  color: string;
}

export type FilterStatus = "all" | "active" | "completed";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
  success?: boolean;
}

export interface LoginCredentials {
  loginIdentifier: string;
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

export interface AuthContextType {
  user: User | null;
  userTasks: Task[];
  loading: boolean;
  isAuthenticated: boolean;
  loadUserTasks: (userId: string) => Promise<Task[]>;
  saveUserTasks: (userId: string, tasks: Task[]) => Promise<boolean>;
  login: (
    loginIdentifier: string,
    password: string
  ) => Promise<ApiResponse<void>>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<ApiResponse<void>>;
  logout: () => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}
export interface HomePageProps {
  tasks?: Task[];
  addTask: (text: string, category?: string) => Promise<void>;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleClean: () => void;
  toggleFilter: () => void;
  editTask: (id: string, newText: string) => void;
  reorderTasks: (oldIndex: number, newIndex: number) => void;
}
