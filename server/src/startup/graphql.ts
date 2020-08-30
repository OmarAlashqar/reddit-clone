import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "../resolvers/post";
import { UserResolver } from "../resolvers/user";
import { VoteResolver } from "../resolvers/vote";
import { MyContext } from "../types";
import { createUserLoader } from "../dataloader/createUserLoader";
import { createVoteLoader } from "../dataloader/createVoteLoader";
import { RedisConnection } from "./redis";

export const graphql = async (
  app: Express,
  { redisClient }: RedisConnection
) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver, VoteResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis: redisClient,
      userLoader: createUserLoader(),
      voteLoader: createVoteLoader(),
    }),
  });

  // apollo middleware
  apolloServer.applyMiddleware({ app, cors: false });
};
