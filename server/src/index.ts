import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import {
  dbCreds,
  __cookie_name__,
  __port__,
  __prod__,
  __session_secret__,
} from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const main = async () => {
  // DB connection
  const conn = await createConnection({
    type: "postgres",
    database: dbCreds.name,
    username: dbCreds.username,
    password: dbCreds.password,
    logging: !__prod__,
    synchronize: !__prod__,
    entities: [Post, User],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  conn.runMigrations();

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
  const redis = new Redis();

  // session middleware
  app.use(
    session({
      name: __cookie_name__,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // js cannot access cookie
        sameSite: "lax", // protects against csrf
        secure: __prod__, // cookie only works in https
      },
      secret: __session_secret__,
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
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
