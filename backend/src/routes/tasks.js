import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Получить задачи пользователя
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      tasks: user.tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Сохранить задачи пользователя
router.put("/:userId", async (req, res) => {
  try {
    const { tasks } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { tasks: tasks },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Tasks saved successfully",
      tasks: user.tasks,
    });
  } catch (error) {
    console.error("Save tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
