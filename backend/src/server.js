import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import tasksRoutes from "./routes/tasks.js";
import activitiesRoutes from "./routes/activities.js";
// import logRoutes from "./routes/logs.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Упрощенная CORS конфигурация для разработки
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем все origins в development
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // В production разрешаем только определенные origins
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://todo-react-navy-omega.vercel.app",
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
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

// Логирование CORS запросов
app.use((req, res, next) => {
  console.log(
    `🌐 [CORS] ${req.method} ${req.path} from origin: ${req.headers.origin}`
  );
  next();
});

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/activities", activitiesRoutes);
// app.use("/api/logs", logRoutes);

// Health check
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

// Test endpoint для проверки CORS
app.options("/api/test-cors", cors(corsOptions)); // Pre-flight
app.get("/api/test-cors", cors(corsOptions), (req, res) => {
  res.json({
    message: "CORS test successful",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Обработчик ошибок CORS
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    console.error("❌ CORS Error:", {
      origin: req.headers.origin,
      method: req.method,
      url: req.url,
    });

    res.status(403).json({
      success: false,
      message: "CORS policy blocked the request",
      origin: req.headers.origin,
      allowedOrigins:
        process.env.NODE_ENV === "development"
          ? "ALL (development)"
          : [
              "http://localhost:5173",
              "http://127.0.0.1:5173",
              "https://todo-react-navy-omega.vercel.app",
            ],
    });
  } else {
    next(err);
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongo:27017/myapp")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🌐 CORS enabled for: ${
      process.env.NODE_ENV === "development"
        ? "ALL origins"
        : "specific origins"
    }`
  );
});
