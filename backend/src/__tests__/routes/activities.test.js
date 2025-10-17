const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User.js");
const activitiesRoutes = require("../../routes/activities.js");

const app = express();
app.use(express.json());
app.use("/api/activities", activitiesRoutes);

describe("Activities Routes", () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    testUser = new User({
      username: "testuser",
      email: "test@example.com",
      password: hashedPassword,
      activities: [
        {
          id: "1",
          title: "Morning Workout",
          day: "Monday",
          time: "07:00",
          dueDate: new Date("2024-01-15T07:00:00Z"),
        },
        {
          id: "2",
          title: "Team Meeting",
          day: "Tuesday",
          time: "14:00",
          dueDate: new Date("2024-01-16T14:00:00Z"),
        },
      ],
    });
    await testUser.save();
  });

  describe("GET /api/activities/:userId", () => {
    it("should get activities for existing user", async () => {
      const response = await request(app).get(
        `/api/activities/${testUser._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.activities).toHaveLength(2);
      expect(response.body.activities[0].id).toBe("1");
      expect(response.body.activities[0].title).toBe("Morning Workout");
      expect(response.body.activities[1].id).toBe("2");
      expect(response.body.activities[1].title).toBe("Team Meeting");
    });

    it("should return empty array for user with no activities", async () => {
      const newUser = new User({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });
      await newUser.save();

      const response = await request(app).get(`/api/activities/${newUser._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.activities).toEqual([]);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new User()._id;

      const response = await request(app).get(`/api/activities/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("User not found");
    });

    it("should handle server errors gracefully", async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).get(
        `/api/activities/${testUser._id}`
      );

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Server error");

      // Restore original method
      User.findById = originalFindById;
    });
  });

  describe("PUT /api/activities/:userId", () => {
    it("should update activities for existing user", async () => {
      const newActivities = [
        {
          id: "3",
          title: "New Activity 1",
          day: "Wednesday",
          time: "09:00",
          dueDate: new Date("2024-01-17T09:00:00Z"),
        },
        {
          id: "4",
          title: "New Activity 2",
          day: "Thursday",
          time: "16:00",
          dueDate: new Date("2024-01-18T16:00:00Z"),
        },
      ];

      const response = await request(app)
        .put(`/api/activities/${testUser._id}`)
        .send({ activities: newActivities });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("saved successfully");
      expect(response.body.activities).toHaveLength(2);
      expect(response.body.activities[0].id).toBe("3");
      expect(response.body.activities[1].id).toBe("4");
    });

    it("should handle empty activities array", async () => {
      const response = await request(app)
        .put(`/api/activities/${testUser._id}`)
        .send({ activities: [] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.activities).toEqual([]);
    });

    it("should handle missing activities field", async () => {
      const response = await request(app)
        .put(`/api/activities/${testUser._id}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.activities).toEqual([]);
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = new User()._id;
      const newActivities = [
        {
          id: "1",
          title: "Test Activity",
          day: "Monday",
          time: "10:00",
          dueDate: new Date(),
        },
      ];

      const response = await request(app)
        .put(`/api/activities/${fakeId}`)
        .send({ activities: newActivities });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("User not found");
    });

    it("should handle server errors gracefully", async () => {
      const newActivities = [
        {
          id: "1",
          title: "Test Activity",
          day: "Monday",
          time: "10:00",
          dueDate: new Date(),
        },
      ];

      // Mock User.findByIdAndUpdate to throw an error
      const originalFindByIdAndUpdate = User.findByIdAndUpdate;
      User.findByIdAndUpdate = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put(`/api/activities/${testUser._id}`)
        .send({ activities: newActivities });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Server error");

      // Restore original method
      User.findByIdAndUpdate = originalFindByIdAndUpdate;
    });

    it("should validate activity structure", async () => {
      const invalidActivities = [
        {
          id: "1",
          title: "Test Activity",
          // Missing required day field
          time: "10:00",
          dueDate: new Date(),
        },
      ];

      const response = await request(app)
        .put(`/api/activities/${testUser._id}`)
        .send({ activities: invalidActivities });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
