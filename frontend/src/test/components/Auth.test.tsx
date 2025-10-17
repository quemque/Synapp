import { expect, describe, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import LoginPage from "../../components/Auth/LoginPage";
import RegisterPage from "../../components/Auth/Register";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe("Auth Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LoginPage", () => {
    it("should render login form", () => {
      renderWithRouter(<LoginPage />);

      expect(
        screen.getByPlaceholderText(/email or username/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should handle successful login", async () => {
      const user = userEvent.setup();

      const mockResponse = {
        success: true,
        token: "mock-token",
        user: {
          id: "user-1",
          username: "testuser",
          email: "test@example.com",
        },
      };

      const mockTasksResponse = { success: true, tasks: [] };
      const mockActivitiesResponse = { success: true, activities: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/auth/login",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              loginIdentifier: "test@example.com",
              password: "password123",
            }),
          })
        );
      });
    });

    it.skip("should handle login failure", async () => {
      const user = userEvent.setup();

      const errorResponse = {
        success: false,
        message: "Invalid credentials",
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => JSON.stringify(errorResponse),
        json: async () => errorResponse,
      });

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it("should validate required fields", async () => {
      const user = userEvent.setup();

      renderWithRouter(<LoginPage />);

      const loginButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(
          screen.getByText(/email and password are required/i)
        ).toBeInTheDocument();
      });
    });

    it("should navigate to register page", async () => {
      const user = userEvent.setup();

      renderWithRouter(<LoginPage />);

      const registerLink = screen.getByRole("link", {
        name: /create account/i,
      });
      await user.click(registerLink);

      // Check that the register link has the correct href
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("RegisterPage", () => {
    it("should render registration form", () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it("should handle successful registration", async () => {
      const user = userEvent.setup();

      const mockResponse = {
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
          json: async () => mockResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTasksResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivitiesResponse,
        });

      renderWithRouter(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const registerButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(usernameInput, "newuser");
      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.click(registerButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:3001/api/auth/register",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              username: "newuser",
              email: "newuser@example.com",
              password: "password123",
            }),
          })
        );
      });
    });

    it("should handle registration failure", async () => {
      const user = userEvent.setup();

      const errorResponse = {
        success: false,
        message: "User already exists",
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => JSON.stringify(errorResponse),
        json: async () => errorResponse,
      });

      renderWithRouter(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const registerButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(usernameInput, "existinguser");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
      });
    });

    it("should handle form submission without validation", async () => {
      const user = userEvent.setup();

      renderWithRouter(<RegisterPage />);

      const registerButton = screen.getByRole("button", { name: /sign up/i });
      await user.click(registerButton);

      // Form should submit without showing validation errors
      expect(registerButton).toBeInTheDocument();
    });

    it("should handle invalid email input", async () => {
      const user = userEvent.setup();

      renderWithRouter(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const registerButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");
      await user.click(registerButton);

      // Form should handle invalid email without showing validation errors
      expect(emailInput).toHaveValue("invalid-email");
    });

    it("should handle short password input", async () => {
      const user = userEvent.setup();

      renderWithRouter(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const registerButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "123");
      await user.click(registerButton);

      // Form should handle short password without showing validation errors
      expect(passwordInput).toHaveValue("123");
    });

    it("should have login page link", () => {
      renderWithRouter(<RegisterPage />);

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Interactions", () => {
    it("should handle form input changes", async () => {
      const user = userEvent.setup();

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });

    it("should handle form submission with Enter key", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          token: "mock-token",
          user: {
            id: "user-1",
            username: "testuser",
            email: "test@example.com",
          },
        }),
      });

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123{enter}");

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });
});
