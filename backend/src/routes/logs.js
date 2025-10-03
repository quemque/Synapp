// import express from "express";
// import fs from "fs";
// import path from "path";

// const router = express.Router();

// // Ensure logs directory exists
// const logsDir = path.join(process.cwd(), "logs");
// if (!fs.existsSync(logsDir)) {
//   fs.mkdirSync(logsDir, { recursive: true });
// }

// router.post("/", async (req, res) => {
//   try {
//     const logEntry = {
//       ...req.body,
//       receivedAt: new Date().toISOString(),
//       source: "frontend",
//     };

//     // Write to daily log file
//     const today = new Date().toISOString().split("T")[0];
//     const logFile = path.join(logsDir, `frontend-${today}.log`);

//     fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");

//     // Also log to console in development
//     if (process.env.NODE_ENV === "development") {
//       const consoleMethod =
//         logEntry.level === "error"
//           ? console.error
//           : logEntry.level === "warn"
//           ? console.warn
//           : console.log;
//       consoleMethod(
//         `[FRONTEND:${logEntry.module}] ${logEntry.message}`,
//         logEntry.data
//       );
//     }

//     res.json({ success: true, message: "Log received" });
//   } catch (error) {
//     console.error("Error processing log:", error);
//     res.status(500).json({ success: false, message: "Failed to process log" });
//   }
// });

// // Get recent logs (for debugging)
// router.get("/", (req, res) => {
//   try {
//     const today = new Date().toISOString().split("T")[0];
//     const logFile = path.join(logsDir, `frontend-${today}.log`);

//     if (fs.existsSync(logFile)) {
//       const logs = fs
//         .readFileSync(logFile, "utf8")
//         .split("\n")
//         .filter((line) => line.trim())
//         .map((line) => JSON.parse(line))
//         .reverse()
//         .slice(0, 100); // Last 100 entries

//       res.json({ success: true, logs });
//     } else {
//       res.json({ success: true, logs: [] });
//     }
//   } catch (error) {
//     console.error("Error reading logs:", error);
//     res.status(500).json({ success: false, message: "Failed to read logs" });
//   }
// });

// export default router;
