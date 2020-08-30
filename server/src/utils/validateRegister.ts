import { UsernamePasswordInput } from "../resolvers/types/UsernamePasswordInput";

// very basic for now, should be changed
export const validateRegister = ({
  email,
  username,
  password,
}: UsernamePasswordInput) => {
  if (!email.includes("@")) {
    return [
      {
        field: "email",
        message: "make sure this is a valid email",
      },
    ];
  }

  if (username.includes("@")) {
    return [
      {
        field: "username",
        message: "your username can't have the @ symbol",
      },
    ];
  }

  if (username.length < 3) {
    return [
      {
        field: "username",
        message: "your username must be at least 3 characters long",
      },
    ];
  }

  if (password.length < 3) {
    return [
      {
        field: "password",
        message: "your password must be at least 3 characters long",
      },
    ];
  }

  return null;
};
