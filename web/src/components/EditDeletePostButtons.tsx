import { IconButton, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
}) => {
  const [_, deletePost] = useDeletePostMutation();

  return (
    <>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          variant="outline"
          ml="auto"
          mr={4}
          icon="edit"
          aria-label="delete post"
        />
      </NextLink>
      <IconButton
        variant="outline"
        ml="auto"
        icon="delete"
        aria-label="delete post"
        onClick={() => {
          deletePost({ id });
        }}
      />
    </>
  );
};