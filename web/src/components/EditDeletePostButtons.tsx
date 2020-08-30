import { IconButton, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  onDelete?: () => void;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  onDelete,
}) => {
  const [deletePost] = useDeletePostMutation();

  return (
    <>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          variant="outline"
          ml="auto"
          mr={4}
          icon="edit"
          aria-label="edit post"
        />
      </NextLink>
      <IconButton
        variant="outline"
        ml="auto"
        icon="delete"
        aria-label="delete post"
        onClick={() => {
          deletePost({
            variables: { id },
            update: (cache) => {
              cache.evict({ id: `Post:${id}` });
            },
          });

          if (onDelete) onDelete();
        }}
      />
    </>
  );
};
