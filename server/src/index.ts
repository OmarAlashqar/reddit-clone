import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
import "reflect-metadata";

import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import express from "express";
import { __port__, __redis_secret__, __prod__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

import cors from "cors";

const main = async () => {
  // DB connection
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  // server
  const app = express();

  // cors middleware on all routes
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // session middleware
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // js cannot access cookie
        sameSite: "lax", // protects against csrf
        secure: __prod__, // cookie only works in https
      },
      secret: __redis_secret__,
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });

  // apollo middleware
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(__port__, () => {
    console.info(`Server listening on localhost:${__port__}`);
  });
};

main().catch((err) => {
  console.error(err);
});
