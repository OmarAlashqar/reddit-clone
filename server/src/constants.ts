import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

export const __prod__ = process.env.NODE_ENV === "production";
export const __port__ = process.env.PORT;
export const __session_secret__ = process.env.SESSION_SECRET as string;

export const __cookie_name__ = "qid";

export const dbCreds = {
  name: process.env.DB_NAME,
  password: process.env.DB_PASS,
};
