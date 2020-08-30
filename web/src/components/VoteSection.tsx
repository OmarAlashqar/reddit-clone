import { ApolloCache } from "@apollo/client";
import { Flex, IconButton } from "@chakra-ui/core";
import gql from "graphql-tag";
import React, { useState } from "react";
import {
  BasePostFragment,
  useVoteMutation,
  VoteMutation,
  useMeQuery,
} from "../generated/graphql";

interface VoteSectionProps {
  post: BasePostFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: `Post:${postId}`,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    // action already complete
    if (data.voteStatus === value) return;

    const newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;

    cache.writeFragment({
      id: `Post:${postId}`,
      fragment: gql`
        fragment _ on Post {
          points
          voteStatus
        }
      `,
      data: { id: postId, points: newPoints, voteStatus: value },
    });
  }
};

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [vote] = useVoteMutation();
  const { data } = useMeQuery();

  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >();

  return (
    <Flex flexDir="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return;
          setLoadingState("upvote-loading");
          await vote({
            variables: { postId: post.id, value: 1 },
            update: (cache) => updateAfterVote(1, post.id, cache),
          });
          setLoadingState("not-loading");
        }}
        icon="chevron-up"
        isLoading={loadingState === "upvote-loading"}
        variantColor={post.voteStatus == 1 ? "green" : undefined}
        aria-label="upvote"
        isDisabled={!data?.me}
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return;
          setLoadingState("downvote-loading");
          await vote({
            variables: { postId: post.id, value: -1 },
            update: (cache) => updateAfterVote(-1, post.id, cache),
          });
          setLoadingState("not-loading");
        }}
        icon="chevron-down"
        isLoading={loadingState === "downvote-loading"}
        variantColor={post.voteStatus == -1 ? "red" : undefined}
        aria-label="downvote"
        isDisabled={!data?.me}
      />
    </Flex>
  );
};
