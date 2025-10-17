import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

// Mock environment variable
vi.mock("vite", () => ({
  import: {
    meta: {
      env: {
        VITE_BACK_URL: "http://localhost:3001",
      },
    },
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation(() => null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("useAuth Hook", () => {
    it("should throw error when used outside AuthProvider", () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");
    });

    it("should provide initial state", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.userTasks).toEqual([]);
      expect(result.current.userActivities).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);

      // Wait for useEffect to complete and set loading to false
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("Login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockAuthResponse = {
        success: true,
        token: "mock-token",
        user: {
          id: "user-1",
          username: "testuser",
          email: "test@example.com",
        },
      };

      const mockTasksResponse = {
        success: true,
        tasks: [
          {
            id: "1",
            text: "Test task",
            title: "Test Task",
            completed: false,
            category: "general",
          },
        ],
      };

      const mockActivitiesResponse = {
        success: true,
        activities: [
          {
            id: "1",
            title: "Test Activity",
            day: "Monday",
            time: "10:00",
            dueDate: new Date("2024-01-15T10:00:00Z"),
          },
        ],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login(
          "test@example.com",
          "password123"
        );
        expect(response.success).toBe(true);
      });

      expect(result.current.user).toEqual(mockAuthResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "mock-token"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockAuthResponse.user)
      );
    });

    it("should handle login failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Invalid credentials",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login(
          "test@example.com",
          "wrongpassword"
        );
        expect(response.success).toBe(false);
        expect(response.message).toBe("Invalid credentials");
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should handle network errors during login", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login(
          "test@example.com",
          "password123"
        );
        expect(response.success).toBe(false);
        expect(response.message).toBe("Network error");
      });
    });
  });

  describe("Register", () => {
    it("should register successfully with valid data", async () => {
      const mockAuthResponse = {
        success: true,
        token: "mock-token",
        user: {
          id: "user-1",
          username: "newuser",
          email: "newuser@example.com",
        },
      };

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.register(
          "newuser",
          "newuser@example.com",
          "password123"
        );
        expect(response.success).toBe(true);
      });

      expect(result.current.user).toEqual(mockAuthResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle registration failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "User already exists",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.register(
          "existinguser",
          "existing@example.com",
          "password123"
        );
        expect(response.success).toBe(false);
        expect(response.message).toBe("User already exists");
      });
    });
  });

  describe("Logout", () => {
    it("should clear user data and localStorage", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.userTasks).toEqual([]);
      expect(result.current.userActivities).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });
  });

  describe("Data Migration", () => {
    it("should migrate local tasks to cloud", async () => {
      const localTasks = [
        {
          id: "1",
          text: "Local task",
          title: "Local Task",
          completed: false,
          category: "general",
        },
      ];

      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "taskfield") return JSON.stringify(localTasks);
        return null;
      });

      const mockAuthResponse = {
        success: true,
        token: "mock-token",
        user: { id: "user-1", username: "testuser", email: "test@example.com" },
      };

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAuthResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, tasks: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, tasks: localTasks }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, tasks: localTasks }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("taskfield");
    });
  });

  describe("Task Management", () => {
    it("should save user tasks", async () => {
      const tasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
          category: "general",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, tasks }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.saveUserTasks("user-1", tasks);
        expect(success).toBe(true);
      });

      expect(result.current.userTasks).toEqual(tasks);
    });

    it.skip("should handle task save failure", async () => {
      const tasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
          category: "general",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.saveUserTasks("user-1", tasks);
        expect(success).toBe(false);
      });
    });
  });

  describe("Activity Management", () => {
    it("should save user activities", async () => {
      const activities = [
        {
          id: "1",
          title: "Test Activity",
          day: "Monday",
          time: "10:00",
          dueDate: new Date("2024-01-15T10:00:00Z"),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, activities }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.saveUserActivities(
          "user-1",
          activities
        );
        expect(success).toBe(true);
      });

      expect(result.current.userActivities).toEqual(activities);
    });

    it.skip("should handle activity save failure and fallback to localStorage", async () => {
      const activities = [
        {
          id: "1",
          title: "Test Activity",
          day: "Monday",
          time: "10:00",
          dueDate: new Date("2024-01-15T10:00:00Z"),
        },
      ];

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const success = await result.current.saveUserActivities(
          "user-1",
          activities
        );
        expect(success).toBe(true);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "scheduleActivities",
        JSON.stringify(activities)
      );
    });
  });
});
