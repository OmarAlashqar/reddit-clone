import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

export const __prod__ = process.env.NODE_ENV === "production";
export const __port__ = process.env.PORT;
export const __redis_secret__ = process.env.REDIS_SECRET as string;

export const dbCreds = {
  name: process.env.DB_NAME,
  password: process.env.DB_PASS,
};
