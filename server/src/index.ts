import "dotenv-safe/config";
import "reflect-metadata";
import express from "express";
import { db } from "./startup/db";
import { middleware } from "./startup/middleware";
import { redis } from "./startup/redis";
import { graphql } from "./startup/graphql";

const main = async () => {
  // connect to the db
  await db();

  const app = express();

  // connect to redis
  const redisConnection = redis();

  // apply middleware
  middleware(app, redisConnection);

  // setup graphql endpoint
  graphql(app, redisConnection);

  // start server
  app.listen(process.env.PORT, () => {
    console.info(`Server listening on localhost:${process.env.PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
