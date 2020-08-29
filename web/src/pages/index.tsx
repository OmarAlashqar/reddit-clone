import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { VoteSection } from "../components/VoteSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  const [{ data: meData }] = useMeQuery();

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
        {data!.posts.posts.map((p) =>
          !p ? null : (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <VoteSection post={p} />
              <Box flex={1}>
                <NextLink href="post/[id]" as={`post/${p.id}`}>
                  <Link>
                    <Heading fontSize="xl">{p.title}</Heading>
                  </Link>
                </NextLink>
                <Text>posted by {p.creator.username}</Text>
                <Flex align="center">
                  <Text flex={1} mt={4}>
                    {p.textSnippet}
                  </Text>
                  {meData?.me?.id !== p.creator.id ? null : (
                    <Box ml="auto">
                      <EditDeletePostButtons id={p.id} />
                    </Box>
                  )}
                </Flex>
              </Box>
            </Flex>
          )
        )}
      </Stack>
    );
  }

  return (
    <Layout>
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
