import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://todo-react-navy-omega.vercel.app",
  "https://*.vercel.app",
  "https://*.railway.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some((allowedOrigin) => {
          return (
            origin === allowedOrigin ||
            origin.includes(allowedOrigin.replace("*", ""))
          );
        })
      ) {
        callback(null, true);
      } else {
        console.log("CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Обработчик ошибок CORS
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      success: false,
      message: "CORS policy blocked the request",
    });
  } else {
    next(err);
  }
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongo:27017/myapp")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
