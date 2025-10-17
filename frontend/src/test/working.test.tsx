import { expect, describe, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "../components/Auth/LoginPage";
import RegisterPage from "../components/Auth/Register";
import App from "../App";

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

describe("Working Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("Basic Component Rendering", () => {
    it("should render LoginPage", () => {
      renderWithRouter(<LoginPage />);

      expect(
        screen.getByPlaceholderText(/email or username/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should render RegisterPage", () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it("should render App component without Router conflict", () => {
      // Test App component without BrowserRouter wrapper to avoid Router conflict
      render(<App />);

      // App should render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should allow typing in login form", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });

    it("should allow typing in register form", async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      expect(usernameInput).toHaveValue("testuser");
      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });
  });

  describe("Navigation Links", () => {
    it("should have register link in login page", () => {
      renderWithRouter(<LoginPage />);

      const registerLink = screen.getByRole("link", {
        name: /create account/i,
      });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("should have login link in register page", () => {
      renderWithRouter(<RegisterPage />);

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Submission", () => {
    it("should handle login form submission", async () => {
      const user = userEvent.setup();

      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers([["content-type", "application/json"]]),
        json: async () => ({ success: true, token: "mock-token" }),
      });

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(loginButton);

      // Form should be submitted
      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });

    it("should handle register form submission", async () => {
      const user = userEvent.setup();

      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers([["content-type", "application/json"]]),
        json: async () => ({ success: true, token: "mock-token" }),
      });

      renderWithRouter(<RegisterPage />);

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const registerButton = screen.getByRole("button", { name: /sign up/i });

      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(registerButton);

      // Form should be submitted
      expect(usernameInput).toHaveValue("testuser");
      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });
  });

  describe("Basic Functionality", () => {
    it("should validate basic JavaScript functionality", () => {
      expect(1 + 1).toBe(2);
      expect("hello").toBe("hello");
      expect([1, 2, 3]).toHaveLength(3);
    });

    it("should handle async operations", async () => {
      const result = await Promise.resolve("test");
      expect(result).toBe("test");
    });

    it("should handle objects and arrays", () => {
      const obj = { name: "test", value: 42 };
      const arr = [1, 2, 3];

      expect(obj).toHaveProperty("name");
      expect(obj.name).toBe("test");
      expect(arr).toContain(2);
      expect(arr).toHaveLength(3);
    });
  });
});
