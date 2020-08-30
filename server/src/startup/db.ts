import { createConnection } from "typeorm";
import path from "path";
import { __prod__ } from "../constants";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";

export const db = async () => {
  return createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: !__prod__,
    synchronize: !__prod__,
    entities: [Post, User, Vote],
    migrations: [path.join(__dirname, "./migrations/*")],
  });
};
