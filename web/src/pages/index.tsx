import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { VoteSection } from "../components/VoteSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  let body = null;
  if (!fetching && !data) {
    body = (
      <Alert status="error" mt={4}>
        <AlertIcon />
        <AlertTitle mr={2}>Something went wrong</AlertTitle>
        <AlertDescription>Please try again later!</AlertDescription>
      </Alert>
    );
  } else if (fetching && !data) {
    body = <div>loading...</div>;
  } else {
    // we have some stuff to display
    // might also be loading more posts
    body = (
      <Stack spacing={8}>
        {data!.posts.posts.map((p) => (
          <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
            <VoteSection post={p} />
            <Box>
              <Heading fontSize="xl">{p.title}</Heading>
              <Text>posted by {p.creator.username}</Text>
              <br />
              <Text mt={4}>{p.textSnippet}</Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    );
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>Reddit-Clone</Heading>
        <NextLink href="/create-post">
          <Button ml="auto">Create Post</Button>
        </NextLink>
      </Flex>
      <br />
      {body}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
