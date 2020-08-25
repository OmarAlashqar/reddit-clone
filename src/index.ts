import path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
import "reflect-metadata";

import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
import express from "express";
import { __port__ } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // DB connection
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  // server
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(__port__, () => {
    console.info(`Server listening on localhost:${__port__}`);
  });
};

main().catch((err) => {
  console.error(err);
});
