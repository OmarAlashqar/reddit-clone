import { createWithApollo } from "../utils/createWithApollo";
import {
  InMemoryCacheConfig,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";
import { isServer } from "./isServer";

const cacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: [], // force all results to concat regardless of variables
          merge(
            existing: PaginatedPosts | undefined,
            incoming: PaginatedPosts
          ): PaginatedPosts {
            return {
              ...incoming,
              posts: [...(existing?.posts || []), ...incoming.posts],
            };
          },
        },
      },
    },
  },
};

const createClient = (ctx: NextPageContext) =>
  new ApolloClient({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    
    cache: new InMemoryCache(cacheConfig),
    credentials: "include", // sends cookies
    headers: {
      cookie: (isServer() ? ctx?.req?.headers.cookie : undefined) || "",
    },
  });

export const withApollo = createWithApollo(createClient);
