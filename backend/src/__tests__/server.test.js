const request = require("supertest");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Mock mongoose connection
jest.mock("mongoose", () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    collections: {},
  },
}));

// Import server after mocking mongoose
const app = express();

// CORS configuration for testing
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin,
      allowed: true,
    },
  });
});

// Test CORS endpoint
app.options("/api/test-cors", cors(corsOptions));
app.get("/api/test-cors", cors(corsOptions), (req, res) => {
  res.json({
    message: "CORS test successful",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      success: false,
      message: "CORS policy blocked the request",
      origin: req.headers.origin,
      allowedOrigins: "ALL (development)",
    });
  } else {
    next(err);
  }
});

describe("Server Configuration", () => {
  describe("Health Check", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("OK");
      expect(response.body.message).toBe("Server is running");
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.cors).toBeDefined();
    });
  });

  describe("CORS Configuration", () => {
    it("should allow requests from any origin in development", async () => {
      const response = await request(app)
        .get("/api/test-cors")
        .set("Origin", "http://localhost:3000");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("CORS test successful");
      expect(response.body.origin).toBe("http://localhost:3000");
    });

    it("should handle preflight OPTIONS requests", async () => {
      const response = await request(app)
        .options("/api/test-cors")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET");

      expect(response.status).toBe(200);
    });

    it("should include CORS headers in response", async () => {
      const response = await request(app)
        .get("/api/test-cors")
        .set("Origin", "http://localhost:3000");

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/test-json")
        .set("Content-Type", "application/json")
        .send("invalid json");

      expect(response.status).toBe(400);
    });
  });

  describe("Middleware", () => {
    it("should parse JSON bodies", async () => {
      const testData = { test: "data" };

      app.post("/test-json", (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app).post("/test-json").send(testData);

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(testData);
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/test-json")
        .set("Content-Type", "application/json")
        .send("invalid json");

      expect(response.status).toBe(400);
    });
  });
});
