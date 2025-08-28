import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongo:27017/myapp")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
