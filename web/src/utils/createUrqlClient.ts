import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import gql from "graphql-tag";
import { isServer } from "./isServer";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error) {
        if (error?.message.includes("authenticate")) {
          Router.replace("/login");
        }
      }
    })
  );
};

const cursorPagination = (cursorKey = "data"): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // grabs all queries in the cache
    const allFields = cache.inspectFields(entityKey);

    // select appropriate ones
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

    // cache miss
    const size = fieldInfos.length;
    if (size === 0) return undefined;

    // check if the cache has data for this request
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isAlreadyInCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );

    // makes URQL fetch more data if there wasn't a cached result
    info.partial = !isAlreadyInCache;

    let hasMore = true;
    const results = fieldInfos.flatMap((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;

      // side-effect, rip functional methodology :P
      // hasMore is false if any are false
      const _hasMore = cache.resolve(key, "hasMore") as boolean;
      hasMore = hasMore && _hasMore;

      return cache.resolve(key, cursorKey) as string[];
    });

    return { __typename: "PaginatedPosts", hasMore, [cursorKey]: results };
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  const cacheEx = cacheExchange({
    keys: {
      PaginatedPosts: () => null,
    },
    resolvers: {
      Query: {
        posts: cursorPagination("posts"),
      },
    },
    updates: {
      Mutation: {
        deletePost: (_result, args, cache, info) => {
          cache.invalidate({
            __typename: "Post",
            id: (args as DeletePostMutationVariables).id,
          });
        },
        vote: (_result, args, cache, info) => {
          const { postId, value } = args as VoteMutationVariables;
          const data = cache.readFragment(
            gql`
              fragment _ on Post {
                id
                points
              }
            `,
            { id: postId } as any
          );

          if (data) {
            // action already complete
            if (data.voteStatus === args.value) return;

            const newPoints =
              (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
            cache.writeFragment(
              gql`
                fragment _ on Post {
                  points
                  voteStatus
                }
              `,
              { id: postId, points: newPoints, voteStatus: value } as any
            );
          }
        },
        createPost: (_result, args, cache, info) => {
          // grabs all queries in the cache
          const allFields = cache.inspectFields("Query");

          // select appropriate ones
          const fieldInfos = allFields.filter(
            (info) => info.fieldName === "posts"
          );

          fieldInfos.forEach((fi) => {
            // invalidate cache to refetch data
            cache.invalidate("Query", "posts", fi.arguments || {});
          });
        },
        login: (_result, args, cache, info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.login.errors) return query;
              else return { me: result.login.user };
            }
          );
        },

        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.register.errors) return query;
              else return { me: result.register.user };
            }
          );
        },

        // globally nullifies the Me query
        logout: (_result, args, cache, info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            () => ({ me: null })
          );
        },
      },
    },
  });

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const, // sends cookies
      // forward session cookie, SSR can access it now
      headers: isServer() ? { cookie: ctx?.req?.headers?.cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheEx,
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
