import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Heading,
  Text,
} from "@chakra-ui/core";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useMeQuery } from "../../generated/graphql";
import { useGetPostFromUrl } from "../../hooks/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";
import { useRouter } from "next/router";

export const Post: React.FC = ({}) => {
  const { data, loading } = useGetPostFromUrl();
  const { data: meData } = useMeQuery();
  const router = useRouter();

  if (loading) {
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
          <EditDeletePostButtons
            onDelete={() => {
              router.push("/");
            }}
            id={data.post.id}
          />
        </Box>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
