const mongoose = require("mongoose");
const User = require("../../models/User.js");

describe("User Model", () => {
  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.tasks).toEqual([]);
      expect(savedUser.activities).toEqual([]);
      expect(savedUser.createdAt).toBeDefined();
    });

    it("should not create a user with invalid email", async () => {
      const userData = {
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should not create a user with duplicate email", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      await new User(userData).save();

      const duplicateUser = new User({
        username: "testuser2",
        email: "test@example.com",
        password: "password123",
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it("should not create a user with duplicate username", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      await new User(userData).save();

      const duplicateUser = new User({
        username: "testuser",
        email: "test2@example.com",
        password: "password123",
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it("should not create a user with password less than 6 characters", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "12345",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should not create a user with username less than 3 characters", async () => {
      const userData = {
        username: "ab",
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should not create a user with username more than 30 characters", async () => {
      const userData = {
        username: "a".repeat(31),
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("User Tasks", () => {
    it("should add tasks to user", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const task = {
        id: "1",
        text: "Test task",
        title: "Test Task",
        completed: false,
        category: "general",
      };

      user.tasks.push(task);
      const savedUser = await user.save();

      expect(savedUser.tasks).toHaveLength(1);
      expect(savedUser.tasks[0].id).toBe(task.id);
      expect(savedUser.tasks[0].text).toBe(task.text);
    });

    it("should validate task schema", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const invalidTask = {
        // Missing required fields
        completed: false,
      };

      user.tasks.push(invalidTask);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("User Activities", () => {
    it("should add activities to user", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const activity = {
        id: "1",
        title: "Test Activity",
        day: "Monday",
        time: "10:00",
        dueDate: new Date(),
      };

      user.activities.push(activity);
      const savedUser = await user.save();

      expect(savedUser.activities).toHaveLength(1);
      expect(savedUser.activities[0].id).toBe(activity.id);
      expect(savedUser.activities[0].title).toBe(activity.title);
    });

    it("should validate activity schema", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const invalidActivity = {
        // Missing required fields
        title: "Test Activity",
      };

      user.activities.push(invalidActivity);
      await expect(user.save()).rejects.toThrow();
    });
  });
});
