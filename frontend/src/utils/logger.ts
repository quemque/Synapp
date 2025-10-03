// class Logger {
//   private isDevelopment = process.env.NODE_ENV === "development";
//   private isDebug = process.env.VITE_DEBUG_LOGS === "true";

//   log(module: string, message: string, data?: any) {
//     if (this.isDevelopment && this.isDebug) {
//       console.log(`🔵 [${module}] ${message}`, data || "");
//     }
//   }

//   error(module: string, message: string, error?: any) {
//     if (this.isDevelopment) {
//       console.error(`🔴 [${module}] ${message}`, error || "");
//     }
//   }

//   warn(module: string, message: string, data?: any) {
//     if (this.isDevelopment) {
//       console.warn(`🟡 [${module}] ${message}`, data || "");
//     }
//   }

//   info(module: string, message: string, data?: any) {
//     if (this.isDevelopment && this.isDebug) {
//       console.info(`🟢 [${module}] ${message}`, data || "");
//     }
//   }
// }

// export const logger = new Logger();
