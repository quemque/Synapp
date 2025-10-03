// models/User.js
import mongoose from "mongoose";

console.log("🔵 [USER MODEL] Loading user schema...");

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, "Task ID is required"],
  },
  text: {
    type: String,
    required: [true, "Task text is required"],
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: "general",
  },
  notificationTime: {
    type: Date,
    required: false,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware для логирования операций с задачами
taskSchema.pre("save", function (next) {
  console.log("🔵 [TASK SCHEMA] Saving task:", {
    id: this.id,
    title: this.title,
    text: this.text,
    hasTitle: !!this.title,
    hasText: !!this.text,
  });
  next();
});

const activitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  tasks: [taskSchema],
  activities: [activitySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware для логирования операций с пользователем
userSchema.pre("save", function (next) {
  console.log("🔵 [USER SCHEMA] Saving user:", {
    id: this._id,
    username: this.username,
    tasksCount: this.tasks ? this.tasks.length : 0,
    activitiesCount: this.activities ? this.activities.length : 0,
  });
  next();
});

userSchema.post("save", function (error, doc, next) {
  if (error) {
    console.error("🔴 [USER SCHEMA] Save error:", error);
    if (error.name === "ValidationError") {
      console.error("🔴 [USER SCHEMA] Validation errors:", error.errors);
    }
  } else {
    console.log("🟢 [USER SCHEMA] User saved successfully");
  }
  next(error);
});

console.log("🟢 [USER MODEL] User schema loaded successfully");

export default mongoose.model("User", userSchema);
