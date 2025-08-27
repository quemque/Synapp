import dotenv from "dotenv";
console.log("dotenv imported successfully");
dotenv.config();
console.log("NODE_ENV after dotenv:", process.env.NODE_ENV);
