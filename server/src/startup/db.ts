import { createConnection } from "typeorm";
import { __prod__ } from "../constants";

import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";

import { Initial1598727826193 } from "../migrations/1598727826193-Initial";

export const db = async () => {
  return createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: !__prod__,
    synchronize: !__prod__,
    entities: [Post, User, Vote],
    migrations: [Initial1598727826193],
    migrationsRun: __prod__
  });
};
