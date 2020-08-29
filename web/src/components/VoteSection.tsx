import { Flex, IconButton } from "@chakra-ui/core";
import React, { useState } from "react";
import { BasePostFragment, useVoteMutation } from "../generated/graphql";

interface VoteSectionProps {
  post: BasePostFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [_, vote] = useVoteMutation();
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >();

  return (
    <Flex flexDir="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return;
          setLoadingState("upvote-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
        icon="chevron-up"
        isLoading={loadingState === "upvote-loading"}
        variantColor={post.voteStatus == 1 ? "green" : undefined}
        aria-label="upvote"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return;
          setLoadingState("downvote-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
        icon="chevron-down"
        isLoading={loadingState === "downvote-loading"}
        variantColor={post.voteStatus == -1 ? "red" : undefined}
        aria-label="downvote"
      />
    </Flex>
  );
};
