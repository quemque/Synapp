import { expect, describe, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("Simple Auth Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LoginPage", () => {
    it("should render login form elements", () => {
      renderWithRouter(<LoginPage />);

      expect(
        screen.getByPlaceholderText(/email or username/i)
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should allow user to type in form fields", async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByPlaceholderText(/email or username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });

    it("should have navigation link to register", () => {
      renderWithRouter(<LoginPage />);

      const registerLink = screen.getByRole("link", {
        name: /create account/i,
      });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("RegisterPage", () => {
    it("should render registration form elements", () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it("should allow user to type in form fields", async () => {
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

    it("should have navigation link to login", () => {
      renderWithRouter(<RegisterPage />);

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Interactions", () => {
    it("should handle form submission", async () => {
      const user = userEvent.setup();

      // Mock successful response
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
      const loginButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(loginButton);

      expect(emailInput).toHaveValue("test@example.com");
      expect(passwordInput).toHaveValue("password123");
    });
  });
});
