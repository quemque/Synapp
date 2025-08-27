import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Проверка наличия JWT_SECRET
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET is not defined! Using fallback");
    return "fallback-secret-key-change-in-production";
  }
  return secret;
};

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание пользователя
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // JWT токен
    const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Логин
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
