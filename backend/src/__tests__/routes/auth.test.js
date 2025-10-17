const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User.js");
const authRoutes = require("../../routes/auth.js");

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRE = "7d";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
    });
    await testUser.save();
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid email and password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.user.username).toBe("testuser");
    });

    it("should login with valid username and password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it("should not login with invalid email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "wrong@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should not login with invalid password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should not login with missing credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("required");
    });

    it("should handle server errors gracefully", async () => {
      // Mock User.findOne to throw an error
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Server error");

      // Restore original method
      User.findOne = originalFindOne;
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe("newuser");
      expect(response.body.user.email).toBe("newuser@example.com");
    });

    it("should not register with duplicate email", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "test@example.com", // Already exists
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should not register with duplicate username", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser", // Already exists
        email: "newuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should not register with missing fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "newuser@example.com",
        // Missing password
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("required");
    });

    it("should handle server errors gracefully", async () => {
      // Mock User constructor to throw an error
      const originalUser = User;
      User = jest.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Server error");

      // Restore original User
      User = originalUser;
    });
  });

  describe("JWT Token Validation", () => {
    it("should create a valid JWT token", async () => {
      const response = await request(app).post("/api/auth/login").send({
        loginIdentifier: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.userId).toBe(testUser._id.toString());
    });
  });
});
