import cors from "cors";
import { Express } from "express";
import session from "express-session";
import { __cookie_name__, __prod__ } from "../constants";
import { RedisConnection } from "./redis";

export const middleware = (
  app: Express,
  { RedisStore, redisClient }: RedisConnection
) => {
  // necessary for cookies to pass through
  app.set("trust proxy", 1);

  // cors middleware on all routes
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // session middleware
  app.use(
    session({
      name: __cookie_name__,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
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
};
