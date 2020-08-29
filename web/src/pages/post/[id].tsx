import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import {
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/core";

export const Post: React.FC = ({}) => {
  const router = useRouter();

  const idParsed =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [{ data, fetching }] = usePostQuery({
    pause: idParsed === -1,
    variables: { id: idParsed },
  });

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
      <br />
      <Text mt={4}>{data.post.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
