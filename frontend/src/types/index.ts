import { ReactElement } from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt?: Date;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  title: string;
  day: string;
  time: string;
  dueDate: Date;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
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
  userActivities: Activity[];
  loadUserTasks: (userId: string) => Promise<Task[]>;
  saveUserTasks: (userId: string, tasks: Task[]) => Promise<boolean>;
  loadUserActivities: (userId: string) => Promise<Activity[]>;
  saveUserActivities: (
    userId: string,
    activities: Activity[]
  ) => Promise<boolean>;
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
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
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
