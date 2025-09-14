import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Получить активность пользователя
router.get("/:userId", async (req, res) => {
  try {
    console.log("Fetching activities for user:", req.params.userId);

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Found user activities:", user.activities?.length || 0);

    res.json({
      success: true,
      activities: user.activities || [],
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching activities",
    });
  }
});

// Сохранить активности пользователя
router.put("/:userId", async (req, res) => {
  try {
    console.log("Saving activities for user:", req.params.userId);
    console.log("Activities data:", req.body.activities?.length || 0);

    const { activities } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { activities: activities || [] },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Activities saved successfully");

    res.json({
      success: true,
      message: "Activities saved successfully",
      activities: user.activities || [],
    });
  } catch (error) {
    console.error("Save activities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving activities",
    });
  }
});

export default router;
