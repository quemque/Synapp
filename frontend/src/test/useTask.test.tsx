import { expect, describe, it, vi, beforeEach, afterEach, Task } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTask } from "../hooks/useTask";
import { ReactNode } from "react";
import { User } from "../types";

// Mock notification service
vi.mock("../services/notificationService", () => ({
  notificationService: {
    requestPermission: vi.fn().mockResolvedValue(true),
    scheduleNotification: vi.fn(),
    cancelNotification: vi.fn(),
  },
}));

// Mock AuthContext
const mockAuthContext = {
  user: null,
  userTasks: [],
  userActivities: [],
  loadUserTasks: vi.fn(),
  saveUserTasks: vi.fn(),
  loadUserActivities: vi.fn(),
  saveUserActivities: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  loading: false,
  isAuthenticated: false,
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useTask Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;
    mockAuthContext.userTasks = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with empty tasks when not authenticated", () => {
      const { result } = renderHook(() => useTask());

      expect(result.current.tasks).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should initialize with user tasks when authenticated", () => {
      const userTasks = [
        {
          id: "1",
          text: "User task",
          title: "User Task",
          completed: false,
          category: "general",
        },
      ];

      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      } as User;
      mockAuthContext.userTasks = userTasks as unknown as Task[];

      const { result } = renderHook(() => useTask());

      expect(result.current.tasks).toEqual(userTasks);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should load tasks from localStorage when not authenticated", () => {
      const localTasks = [
        {
          id: "1",
          text: "Local task",
          title: "Local Task",
          completed: false,
          category: "general",
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(localTasks));

      const { result } = renderHook(() => useTask());

      expect(result.current.tasks).toEqual(localTasks);
    });
  });

  describe("Adding Tasks", () => {
    it("should add a new task", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("New task");
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].text).toBe("New task");
      expect(result.current.tasks[0].title).toBe("New task");
      expect(result.current.tasks[0].completed).toBe(false);
    });

    it("should add a task with category", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("New task", "work");
      });

      expect(result.current.tasks[0].category).toBe("work");
    });

    it("should add a task with notification time", async () => {
      const notificationTime = new Date("2024-12-31T10:00:00Z");
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("New task", "general", notificationTime);
      });

      expect(result.current.tasks[0].notificationTime).toEqual(
        notificationTime
      );
    });

    it("should save tasks to backend when authenticated", async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };
      mockAuthContext.saveUserTasks.mockResolvedValue(true);

      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("New task");
      });

      expect(mockAuthContext.saveUserTasks).toHaveBeenCalledWith(
        "user-1",
        expect.arrayContaining([
          expect.objectContaining({
            text: "New task",
            title: "New task",
          }),
        ])
      );
    });

    it("should save tasks to localStorage when not authenticated", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("New task");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "taskfield",
        expect.stringContaining("New task")
      );
    });
  });

  describe("Deleting Tasks", () => {
    it("should delete a task", async () => {
      const { result } = renderHook(() => useTask());

      // Add a task first
      await act(async () => {
        await result.current.addTask("Task to delete");
      });

      const taskId = result.current.tasks[0].id;

      await act(async () => {
        await result.current.deleteTask(taskId);
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it("should handle deleting non-existent task", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.deleteTask("non-existent-id");
      });

      expect(result.current.tasks).toHaveLength(0);
    });
  });

  describe("Toggling Tasks", () => {
    it("should toggle task completion", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("Task to toggle");
      });

      const taskId = result.current.tasks[0].id;
      expect(result.current.tasks[0].completed).toBe(false);

      await act(async () => {
        await result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);
    });

    it("should toggle task completion back to false", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("Task to toggle");
      });

      const taskId = result.current.tasks[0].id;

      // Toggle to true
      await act(async () => {
        await result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);

      // Toggle back to false
      await act(async () => {
        await result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(false);
    });
  });

  describe("Clearing Tasks", () => {
    it("should clear all tasks", async () => {
      const { result } = renderHook(() => useTask());

      // Add some tasks
      await act(async () => {
        await result.current.addTask("Task 1");
      });

      await act(async () => {
        await result.current.addTask("Task 2");
      });

      expect(result.current.tasks).toHaveLength(2);

      await act(async () => {
        await result.current.toggleClean();
      });

      expect(result.current.tasks).toHaveLength(0);
    });
  });

  describe("Filtering Tasks", () => {
    it("should filter out completed tasks", async () => {
      const { result } = renderHook(() => useTask());

      // Add tasks
      await act(async () => {
        await result.current.addTask("Task 1");
      });

      await act(async () => {
        await result.current.addTask("Task 2");
      });

      const task1Id = result.current.tasks[0].id;

      // Complete first task
      await act(async () => {
        await result.current.toggleTask(task1Id);
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.tasks[1].completed).toBe(false);

      // Filter completed tasks
      await act(async () => {
        await result.current.toggleFilter();
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].text).toBe("Task 2");
    });
  });

  describe("Editing Tasks", () => {
    it("should edit a task", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("Original task");
      });

      const taskId = result.current.tasks[0].id;

      await act(async () => {
        await result.current.editTask(taskId, "Edited task");
      });

      expect(result.current.tasks[0].text).toBe("Edited task");
      expect(result.current.tasks[0].title).toBe("Edited task");
    });

    it("should edit a task with new category", async () => {
      const { result } = renderHook(() => useTask());

      await act(async () => {
        await result.current.addTask("Original task", "general");
      });

      const taskId = result.current.tasks[0].id;

      await act(async () => {
        await result.current.editTask(taskId, "Edited task", "work");
      });

      expect(result.current.tasks[0].text).toBe("Edited task");
      expect(result.current.tasks[0].category).toBe("work");
    });

    it("should edit a task with notification time", async () => {
      const { result } = renderHook(() => useTask());
      const notificationTime = new Date("2024-12-31T10:00:00Z");

      await act(async () => {
        await result.current.addTask("Original task");
      });

      const taskId = result.current.tasks[0].id;

      await act(async () => {
        await result.current.editTaskWithNotification(
          taskId,
          "Edited task",
          notificationTime
        );
      });

      expect(result.current.tasks[0].text).toBe("Edited task");
      expect(result.current.tasks[0].notificationTime).toEqual(
        notificationTime
      );
    });
  });

  describe("Reordering Tasks", () => {
    it("should reorder tasks", async () => {
      const { result } = renderHook(() => useTask());

      // Add tasks
      await act(async () => {
        await result.current.addTask("Task 1");
      });

      await act(async () => {
        await result.current.addTask("Task 2");
      });

      await act(async () => {
        await result.current.addTask("Task 3");
      });

      expect(result.current.tasks[0].text).toBe("Task 1");
      expect(result.current.tasks[1].text).toBe("Task 2");
      expect(result.current.tasks[2].text).toBe("Task 3");

      // Move first task to last position
      await act(async () => {
        await result.current.reorderTasks(0, 2);
      });

      expect(result.current.tasks[0].text).toBe("Task 2");
      expect(result.current.tasks[1].text).toBe("Task 3");
      expect(result.current.tasks[2].text).toBe("Task 1");
    });
  });

  describe("Error Handling", () => {
    it("should handle save errors gracefully", async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };
      mockAuthContext.saveUserTasks.mockRejectedValue(new Error("Save failed"));

      const { result } = renderHook(() => useTask());

      await act(async () => {
        try {
          await result.current.addTask("New task");
        } catch (error) {
          expect(error.message).toBe("Save failed");
        }
      });

      // Task should not be added to state when save fails
      expect(result.current.tasks).toHaveLength(0);
    });
  });
});
