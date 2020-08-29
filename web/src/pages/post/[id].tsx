import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Heading,
  Text,
  Box,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { useMeQuery } from "../../generated/graphql";

export const Post: React.FC = ({}) => {
  const [{ data, fetching }] = useGetPostFromUrl();
  const [{ data: meData }] = useMeQuery();

  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  } else if (!data?.post) {
    // no post with that id
    return (
      <Layout>
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertTitle mr={2}>There's no post to be found here!</AlertTitle>
          <AlertDescription>The URL seems to be wrong</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading fontSize="xl">{data.post.title}</Heading>
      <Text>posted by {data.post.creator.username}</Text>
      <Box my={4}>
        <Text mt={4}>{data.post.text}</Text>
      </Box>

      {meData?.me?.id !== data.post.creator.id ? null : (
        <Box ml="auto">
          <EditDeletePostButtons id={data.post.id} />
        </Box>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
