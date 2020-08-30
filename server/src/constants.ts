import "dotenv-safe/config";

export const __prod__ = process.env.NODE_ENV === "production";

export const __cookie_name__ = "qid";
export const __forgot_pass_prefix__ = "forgot-password:";
