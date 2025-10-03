// // backend/src/utils/logger.js
// import fs from "fs";
// import path from "path";

// class Logger {
//   constructor() {
//     this.logDir = path.join(process.cwd(), "logs");
//     this.ensureLogDir();
//   }

//   ensureLogDir() {
//     if (!fs.existsSync(this.logDir)) {
//       fs.mkdirSync(this.logDir, { recursive: true });
//     }
//   }

//   getLogFile() {
//     const today = new Date().toISOString().split("T")[0];
//     return path.join(this.logDir, `backend-${today}.log`);
//   }

//   writeToFile(level, module, message, data) {
//     try {
//       const logEntry = {
//         timestamp: new Date().toISOString(),
//         level,
//         module,
//         message,
//         data: data || {},
//         pid: process.pid,
//       };

//       const logLine = JSON.stringify(logEntry) + "\n";
//       fs.appendFileSync(this.getLogFile(), logLine);

//       // Также выводим в консоль для docker logs
//       const consoleMethod =
//         level === "error"
//           ? console.error
//           : level === "warn"
//           ? console.warn
//           : console.log;

//       const color =
//         level === "error"
//           ? "\x1b[31m"
//           : level === "warn"
//           ? "\x1b[33m"
//           : level === "info"
//           ? "\x1b[32m"
//           : "\x1b[36m";

//       consoleMethod(
//         `${color}[${level.toUpperCase()}] ${new Date().toISOString()} [${module}]\x1b[0m ${message}`,
//         data || ""
//       );
//     } catch (error) {
//       console.error("Failed to write log:", error);
//     }
//   }

//   info(module, message, data) {
//     this.writeToFile("info", module, message, data);
//   }

//   error(module, message, error) {
//     this.writeToFile("error", module, message, {
//       error: error?.message || error,
//       stack: error?.stack,
//     });
//   }

//   warn(module, message, data) {
//     this.writeToFile("warn", module, message, data);
//   }

//   debug(module, message, data) {
//     if (process.env.LOG_LEVEL === "debug") {
//       this.writeToFile("debug", module, message, data);
//     }
//   }
// }

// export const logger = new Logger();
