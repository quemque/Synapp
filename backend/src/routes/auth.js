import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined. " +
        "Please set it in Railway environment variables or local .env file"
    );
  }

  return secret;
};

// Логин по email ИЛИ username - УЛУЧШЕННАЯ ВЕРСИЯ
router.post("/login", async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    console.log("✅ Login request received:", {
      loginIdentifier,
      hasPassword: !!password,
      timestamp: new Date().toISOString(),
    });

    // Детальная валидация
    if (!loginIdentifier || !password) {
      const missingFields = [];
      if (!loginIdentifier) missingFields.push("email/username");
      if (!password) missingFields.push("password");

      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        errorType: "VALIDATION_ERROR",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        errorType: "VALIDATION_ERROR",
      });
    }

    // Ищем пользователя по email или username
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase().trim() },
        { username: loginIdentifier.trim() },
      ],
    });

    console.log(
      "🔍 User search result:",
      user ? `Found: ${user.email}` : "Not found"
    );

    if (!user) {
      return res.status(401).json({
        // 401 Unauthorized
        success: false,
        message: "Invalid email/username or password",
        errorType: "AUTH_ERROR",
        suggestion: "Please check your credentials or register a new account",
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔐 Password validation:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        // 401 Unauthorized
        success: false,
        message: "Invalid email/username or password",
        errorType: "AUTH_ERROR",
        suggestion: "Please check your password",
      });
    }

    // Генерируем токен
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      }
    );

    console.log("✅ Login successful for user:", user.email);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  } catch (error) {
    console.error("❌ Login error:", error);

    // Разные ошибки для разных ситуаций
    if (error.message.includes("JWT_SECRET")) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
        errorType: "SERVER_ERROR",
        suggestion: "Please contact support",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      errorType: "SERVER_ERROR",
      suggestion: "Please try again later",
    });
  }
});

// Регистрация с улучшенной обработкой ошибок
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("✅ Register request received:", {
      username,
      email,
      hasPassword: !!password,
      timestamp: new Date().toISOString(),
    });

    // Детальная валидация
    const missingFields = [];
    if (!username) missingFields.push("username");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        errorType: "VALIDATION_ERROR",
      });
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        errorType: "VALIDATION_ERROR",
      });
    }

    // Валидация пароля
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
        errorType: "VALIDATION_ERROR",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters long",
        errorType: "VALIDATION_ERROR",
      });
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "username";
      return res.status(409).json({
        // 409 Conflict
        success: false,
        message: `User with this ${field} already exists`,
        errorType: "DUPLICATE_ERROR",
        field: field,
      });
    }

    // Создание пользователя
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      getJwtSecret(),
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      }
    );

    console.log("✅ Registration successful for user:", user.email);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message:
          "Validation error: " +
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
        errorType: "VALIDATION_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      errorType: "SERVER_ERROR",
      suggestion: "Please try again later",
    });
  }
});

// endpoint для проверки токена
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

export default router;
