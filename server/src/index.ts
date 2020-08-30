import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe/config";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { __cookie_name__, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Vote } from "./entities/Vote";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { VoteResolver } from "./resolvers/vote";
import { MyContext } from "./types";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoader } from "./utils/createVoteLoader";

const main = async () => {
  // DB connection
  await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: !__prod__,
    synchronize: !__prod__,
    entities: [Post, User, Vote],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  // server
  const app = express();

  // necessary for cookies to pass through
  app.set("trust proxy", 1);

  // cors middleware on all routes
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  // session middleware
  app.use(
    session({
      name: __cookie_name__,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true, // js cannot access cookie
        sameSite: "lax", // protects against csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? ".oalashqar.me" : undefined,
      },
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver, VoteResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      voteLoader: createVoteLoader(),
    }),
  });

  // apollo middleware
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.info(`Server listening on localhost:${process.env.PORT}`);
  });
};

main().catch((err) => {
  console.error(err);
});
