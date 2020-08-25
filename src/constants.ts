export const __prod__ = process.env.NODE_ENV === "production";

export const dbCreds = {
  name: process.env.DB_NAME,
  password: process.env.DB_PASS,
};
