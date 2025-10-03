import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Получить задачи пользователя
router.get("/:userId", async (req, res) => {
  console.log("🔵 [TASKS API] GET tasks request:", {
    userId: req.params.userId,
    query: req.query,
  });

  try {
    const user = await User.findById(req.params.userId);
    console.log("🔵 [TASKS API] User found:", !!user);

    if (!user) {
      console.log("🔴 [TASKS API] User not found:", req.params.userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("🔵 [TASKS API] User tasks count:", user.tasks.length);
    console.log("🔵 [TASKS API] Sample tasks:", user.tasks.slice(0, 3));

    res.json({
      success: true,
      tasks: user.tasks,
    });
  } catch (error) {
    console.error("🔴 [TASKS API] Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Сохранить задачи пользователя
router.put("/:userId", async (req, res) => {
  console.log("🔵 [TASKS API] PUT tasks request:", {
    userId: req.params.userId,
    bodyKeys: Object.keys(req.body),
    tasksCount: req.body.tasks ? req.body.tasks.length : 0,
  });

  try {
    const { tasks } = req.body;

    console.log("🔵 [TASKS API] Received tasks data:", {
      tasksType: typeof tasks,
      isArray: Array.isArray(tasks),
      tasksSample: tasks ? tasks.slice(0, 2) : "No tasks",
    });

    // Детальная проверка структуры данных
    if (!tasks || !Array.isArray(tasks)) {
      console.error("🔴 [TASKS API] Invalid tasks data structure:", { tasks });
      return res.status(400).json({
        success: false,
        message: "Tasks array is required",
        received: typeof tasks,
      });
    }

    // Проверяем каждую задачу
    const validationErrors = [];
    tasks.forEach((task, index) => {
      console.log(`🔵 [TASKS API] Validating task ${index}:`, {
        id: task.id,
        title: task.title,
        text: task.text,
        hasTitle: !!task.title,
        hasText: !!task.text,
        titleType: typeof task.title,
        textType: typeof task.text,
      });

      if (!task.title || task.title.trim() === "") {
        validationErrors.push(
          `Task ${index} (id: ${task.id}) is missing title`
        );
      }
      if (!task.text || task.text.trim() === "") {
        validationErrors.push(`Task ${index} (id: ${task.id}) is missing text`);
      }
      if (!task.id) {
        validationErrors.push(`Task ${index} is missing id`);
      }
    });

    if (validationErrors.length > 0) {
      console.error("🔴 [TASKS API] Task validation errors:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Task validation failed",
        errors: validationErrors,
      });
    }

    console.log(
      "🔵 [TASKS API] All tasks validated successfully, updating user..."
    );

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { tasks: tasks },
      { new: true, runValidators: true }
    );

    console.log("🔵 [TASKS API] User update result:", !!user);

    if (!user) {
      console.error(
        "🔴 [TASKS API] User not found during update:",
        req.params.userId
      );
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      "🟢 [TASKS API] Tasks saved successfully, new tasks count:",
      user.tasks.length
    );

    res.json({
      success: true,
      message: "Tasks saved successfully",
      tasks: user.tasks,
    });
  } catch (error) {
    console.error("🔴 [TASKS API] Save tasks error:", error);

    // Детальная информация об ошибках Mongoose
    if (error.name === "ValidationError") {
      console.error("🔴 [TASKS API] Mongoose validation errors:", error.errors);
    }
    if (error.name === "CastError") {
      console.error("🔴 [TASKS API] Cast error:", error);
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      errorType: error.name,
    });
  }
});

export default router;
