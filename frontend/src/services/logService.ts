// class LogService {
//   private backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
//   private isProduction = process.env.NODE_ENV === "production";

//   async sendLog(
//     level: "info" | "warn" | "error",
//     module: string,
//     message: string,
//     data?: any
//   ) {
//     // В продакшене отправляем только ошибки
//     if (this.isProduction && level !== "error") {
//       return;
//     }

//     try {
//       const logEntry = {
//         level,
//         module,
//         message,
//         data,
//         timestamp: new Date().toISOString(),
//         userAgent: navigator.userAgent,
//         url: window.location.href,
//       };

//       await fetch(`${this.backendUrl}/api/logs`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(logEntry),
//       });
//     } catch (error) {
//       // Не логируем ошибки логирования, чтобы избежать бесконечного цикла
//       console.error("Failed to send log:", error);
//     }
//   }

//   // Методы для удобства
//   info(module: string, message: string, data?: any) {
//     this.sendLog("info", module, message, data);
//     if (process.env.NODE_ENV === "development") {
//       console.log(`🔵 [${module}] ${message}`, data || "");
//     }
//   }

//   error(module: string, message: string, error?: any) {
//     this.sendLog("error", module, message, error);
//     console.error(`🔴 [${module}] ${message}`, error || "");
//   }

//   warn(module: string, message: string, data?: any) {
//     this.sendLog("warn", module, message, data);
//     if (process.env.NODE_ENV === "development") {
//       console.warn(`🟡 [${module}] ${message}`, data || "");
//     }
//   }
// }

// export const logService = new LogService();
