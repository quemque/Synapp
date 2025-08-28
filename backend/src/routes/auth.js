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
        "Please set it in Vercel environment variables or local .env file"
    );
  }

  return secret;
};

router.post("/login", async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;

    console.log("✅ Login request received:", {
      loginIdentifier,
      hasPassword: !!password,
    });

    if (!loginIdentifier || !password) {
      console.log("❌ Validation failed: missing fields");
      return res.status(400).json({
        success: false,
        message: "Email/username and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase().trim() },
        { username: loginIdentifier.trim() },
      ],
    });

    console.log("🔍 Found user:", user ? user.email : "No user found");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials - user not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔐 Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials - wrong password",
      });
    }

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    console.log("✅ Login successful for user:", user.email);

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
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// Регистрация (оставляем без изменений)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

export default router;
