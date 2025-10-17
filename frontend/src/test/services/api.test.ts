import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import { authAPI, saveTasksAPI } from "../../services/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper function to create mock response with headers
const createMockResponse = (
  data: any,
  ok: boolean = true,
  status: number = 200
) => {
  const headers = new Map();
  headers.set("content-type", "application/json");

  return {
    ok,
    status,
    headers: {
      entries: () => headers.entries(),
      get: (key: string) => headers.get(key),
    },
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
  };
};

vi.mock("vite", () => ({
  import: {
    meta: {
      env: {
        VITE_API_URL: "http://localhost:3001",
      },
    },
  },
}));

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("authAPI.login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockResponse = {
        success: true,
        token: "mock-token",
        user: {
          id: "user-1",
          username: "testuser",
          email: "test@example.com",
        },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const credentials = {
        loginIdentifier: "test@example.com",
        password: "password123",
      };

      const result = await authAPI.login(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle login failure", async () => {
      const errorResponse = {
        success: false,
        message: "Invalid credentials",
      };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(errorResponse), false, 401)
      );

      const credentials = {
        loginIdentifier: "test@example.com",
        password: "wrongpassword",
      };

      await expect(authAPI.login(credentials)).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const credentials = {
        loginIdentifier: "test@example.com",
        password: "password123",
      };

      await expect(authAPI.login(credentials)).rejects.toThrow("Network error");
    });
  });

  describe("authAPI.register", () => {
    it("should register successfully with valid data", async () => {
      const mockResponse = {
        success: true,
        token: "mock-token",
        user: {
          id: "user-1",
          username: "newuser",
          email: "newuser@example.com",
        },
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const credentials = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const result = await authAPI.register(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle registration failure", async () => {
      const errorResponse = {
        success: false,
        message: "User already exists",
      };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(errorResponse), false, 400)
      );

      const credentials = {
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
      };

      await expect(authAPI.register(credentials)).rejects.toThrow(
        "User already exists"
      );
    });
  });

  describe("authAPI.getProfile", () => {
    it("should get user profile successfully", async () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockUser));

      const result = await authAPI.getProfile("mock-token");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/auth/profile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
        }
      );

      expect(result).toEqual(mockUser);
    });

    it("should handle profile fetch failure", async () => {
      const errorResponse = {
        success: false,
        message: "Unauthorized",
      };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(errorResponse), false, 401)
      );

      await expect(authAPI.getProfile("invalid-token")).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("authAPI.logout", () => {
    it("should logout successfully", async () => {
      const mockResponse = {
        message: "Logged out successfully",
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await authAPI.logout("mock-token");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/auth/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          },
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle logout failure", async () => {
      const errorResponse = {
        success: false,
        message: "Logout failed",
      };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(errorResponse), false, 500)
      );

      await expect(authAPI.logout("invalid-token")).rejects.toThrow(
        "Logout failed"
      );
    });
  });

  describe("saveTasksAPI", () => {
    it("should save tasks successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Tasks saved successfully",
        tasks: [],
      };

      const tasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
          category: "general",
        },
      ];

      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await saveTasksAPI("user-1", tasks);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks/user-1",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tasks }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should handle save tasks failure", async () => {
      const errorResponse = {
        success: false,
        message: "Save failed",
      };
      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(errorResponse), false, 500)
      );

      const tasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
          category: "general",
        },
      ];

      await expect(saveTasksAPI("user-1", tasks)).rejects.toThrow(
        "Save failed"
      );
    });

    it("should handle network errors during save", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const tasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
          category: "general",
        },
      ];

      await expect(saveTasksAPI("user-1", tasks)).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed response", async () => {
      const malformedResponse = createMockResponse({}, true, 200);
      malformedResponse.json = async () => {
        throw new Error("Invalid JSON");
      };

      mockFetch.mockResolvedValueOnce(malformedResponse);

      const tasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
          category: "general",
        },
      ];

      await expect(saveTasksAPI("user-1", tasks)).rejects.toThrow(
        "Failed to parse response"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle HTTP errors with JSON response", async () => {
      const mockError = {
        success: false,
        message: "Validation error",
        errors: ["Field is required"],
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(JSON.stringify(mockError), false, 400)
      );

      const credentials = {
        loginIdentifier: "test@example.com",
        password: "password123",
      };

      await expect(authAPI.login(credentials)).rejects.toThrow(
        "Validation error"
      );
    });

    it("should handle HTTP errors with text response", async () => {
      // Create a response that will fail JSON parsing and fall back to generic error
      const textErrorResponse = createMockResponse("Server error", false, 500);
      textErrorResponse.text = async () => "Server error";
      textErrorResponse.json = async () => {
        throw new Error("Not JSON");
      };

      mockFetch.mockResolvedValueOnce(textErrorResponse);

      const credentials = {
        loginIdentifier: "test@example.com",
        password: "password123",
      };

      await expect(authAPI.login(credentials)).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    it("should handle malformed error responses", async () => {
      const malformedErrorResponse = createMockResponse("", false, 400);
      malformedErrorResponse.text = async () => {
        throw new Error("Parse error");
      };

      mockFetch.mockResolvedValueOnce(malformedErrorResponse);

      const credentials = {
        loginIdentifier: "test@example.com",
        password: "password123",
      };

      await expect(authAPI.login(credentials)).rejects.toThrow(
        "HTTP error! status: 400"
      );
    });
  });
});
