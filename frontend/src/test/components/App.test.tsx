import { expect, describe, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../../App";
import { AuthProvider } from "../../context/AuthContext";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.mock("vite", () => ({
  import: {
    meta: {
      env: {
        VITE_BACK_URL: "http://localhost:3001",
      },
    },
  },
}));

// Mock notification service
vi.mock("../services/notificationService", () => ({
  notificationService: {
    requestPermission: vi.fn().mockResolvedValue(true),
    scheduleNotification: vi.fn(),
    cancelNotification: vi.fn(),
  },
}));

const renderApp = () => {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

describe.skip("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe("Routing", () => {
    it("should redirect to login when not authenticated", () => {
      renderApp();

      expect(window.location.pathname).toBe("/login");
    });

    it("should show home page when authenticated", async () => {
      // Mock authenticated state
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key) => {
            if (key === "token") return "mock-token";
            if (key === "user")
              return JSON.stringify({
                id: "user-1",
                username: "testuser",
                email: "test@example.com",
              });
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/todo app/i)).toBeDefined();
      });
    });

    it("should navigate to tags page", async () => {
      // Mock authenticated state
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key) => {
            if (key === "token") return "mock-token";
            if (key === "user")
              return JSON.stringify({
                id: "user-1",
                username: "testuser",
                email: "test@example.com",
              });
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/todo app/i)).toBeDefined();
      });

      // Navigate to tags page
      window.history.pushState({}, "", "/tags/work");
      window.dispatchEvent(new PopStateEvent("popstate"));

      await waitFor(() => {
        expect(window.location.pathname).toBe("/tags/work");
      });
    });

    it("should navigate to schedule page", async () => {
      // Mock authenticated state
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key) => {
            if (key === "token") return "mock-token";
            if (key === "user")
              return JSON.stringify({
                id: "user-1",
                username: "testuser",
                email: "test@example.com",
              });
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/todo app/i)).toBeDefined();
      });

      // Navigate to schedule page
      window.history.pushState({}, "", "/schedule");
      window.dispatchEvent(new PopStateEvent("popstate"));

      await waitFor(() => {
        expect(window.location.pathname).toBe("/schedule");
      });
    });
  });

  describe("Public Routes", () => {
    it("should show login page for unauthenticated users", () => {
      renderApp();

      expect(screen.getByPlaceholderText(/email or username/i)).toBeDefined();
    });

    it("should show register page when navigating to /register", () => {
      window.history.pushState({}, "", "/register");
      window.dispatchEvent(new PopStateEvent("popstate"));

      renderApp();

      expect(screen.getByPlaceholderText(/username/i)).toBeDefined();
    });

    it("should redirect authenticated users away from login page", async () => {
      // Mock authenticated state
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key) => {
            if (key === "token") return "mock-token";
            if (key === "user")
              return JSON.stringify({
                id: "user-1",
                username: "testuser",
                email: "test@example.com",
              });
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));

      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 routes", () => {
      window.history.pushState({}, "", "/non-existent-route");
      window.dispatchEvent(new PopStateEvent("popstate"));

      renderApp();

      expect(window.location.pathname).toBe("/");
    });

    it("should handle authentication errors gracefully", async () => {
      // Mock localStorage with invalid token
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn((key) => {
            if (key === "token") return "invalid-token";
            if (key === "user")
              return JSON.stringify({
                id: "user-1",
                username: "testuser",
                email: "test@example.com",
              });
            return null;
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderApp();

      await waitFor(() => {
        expect(window.location.pathname).toBe("/login");
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state while checking authentication", () => {
      // Mock loading state
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: vi.fn().mockReturnValue(null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      renderApp();

      // Should show loading initially
      expect(screen.getByText(/loading/i)).toBeDefined();
    });
  });
});
