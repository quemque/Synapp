const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User.js");
const tasksRoutes = require("../../routes/tasks.js");

const app = express();
app.use(express.json());
app.use("/api/tasks", tasksRoutes);

describe("Tasks Routes", () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      tasks: [
        {
          id: "1",
          text: "Test task 1",
          title: "Test Task 1",
          completed: false,
          category: "general",
        },
        {
          id: "2",
          text: "Test task 2",
          title: "Test Task 2",
          completed: true,
          category: "work",
        },
      ],
    });
    await testUser.save();
  });

  describe("GET /api/tasks/:userId", () => {
    it("should get tasks for existing user", async () => {
      const response = await request(app).get(`/api/tasks/${testUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.tasks[0].id).toBe("1");
      expect(response.body.tasks[1].id).toBe("2");
    });

    it("should return empty array for user with no tasks", async () => {
      const newUser = new User({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });
      await newUser.save();

      const response = await request(app).get(`/api/tasks/${newUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tasks).toEqual([]);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new User()._id;

      const response = await request(app).get(`/api/tasks/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("User not found");
    });

    it("should handle server errors gracefully", async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(`/api/tasks/${testUser._id}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Server error");

      // Restore original method
      User.findById = originalFindById;
    });
  });

  describe("PUT /api/tasks/:userId", () => {
    it("should update tasks for existing user", async () => {
      const newTasks = [
        {
          id: "3",
          text: "New task 1",
          title: "New Task 1",
          completed: false,
          category: "personal",
        },
        {
          id: "4",
          text: "New task 2",
          title: "New Task 2",
          completed: true,
          category: "work",
        },
      ];

      const response = await request(app)
        .put(`/api/tasks/${testUser._id}`)
        .send({ tasks: newTasks });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("saved successfully");
      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.tasks[0].id).toBe("3");
      expect(response.body.tasks[1].id).toBe("4");
    });

    it("should validate task structure", async () => {
      const invalidTasks = [
        {
          id: "1",
          // Missing required text field
          title: "Invalid Task",
          completed: false,
        },
      ];

      const response = await request(app)
        .put(`/api/tasks/${testUser._id}`)
        .send({ tasks: invalidTasks });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("validation failed");
      expect(response.body.errors).toBeDefined();
    });

    it("should reject non-array tasks", async () => {
      const response = await request(app)
        .put(`/api/tasks/${testUser._id}`)
        .send({ tasks: "not an array" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Tasks array is required");
    });

    it("should reject missing tasks field", async () => {
      const response = await request(app)
        .put(`/api/tasks/${testUser._id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Tasks array is required");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new User()._id;
      const newTasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
        },
      ];

      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send({ tasks: newTasks });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("User not found");
    });

    it("should handle server errors gracefully", async () => {
      const newTasks = [
        {
          id: "1",
          text: "Test task",
          title: "Test Task",
          completed: false,
        },
      ];

      // Mock User.findByIdAndUpdate to throw an error
      const originalFindByIdAndUpdate = User.findByIdAndUpdate;
      User.findByIdAndUpdate = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put(`/api/tasks/${testUser._id}`)
        .send({ tasks: newTasks });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Server error");

      // Restore original method
      User.findByIdAndUpdate = originalFindByIdAndUpdate;
    });

    it("should handle validation errors", async () => {
      const invalidTasks = [
        {
          id: "", // Empty ID
          text: "Test task",
          title: "Test Task",
          completed: false,
        },
      ];

      const response = await request(app)
        .put(`/api/tasks/${testUser._id}`)
        .send({ tasks: invalidTasks });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("validation failed");
    });
  });
});
