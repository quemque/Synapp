import React from "react";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface AuthContextType {
  user: User | null;
  userTasks: Task[];
  loadUserTasks: (userId: string) => Promise<Task[]>;
  saveUserTasks: (userId: string, tasks: Task[]) => Promise<boolean>;
  login: (
    loginIdentifier: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export declare const useAuth: () => AuthContextType;

export interface AuthProviderProps {
  children: React.ReactNode;
}

export declare const AuthProvider: React.FC<AuthProviderProps>;
