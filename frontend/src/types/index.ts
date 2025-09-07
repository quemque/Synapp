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
