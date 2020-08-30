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
import NextLink from "next/link";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { VoteSection } from "../components/VoteSection";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  const { data: meData } = useMeQuery();

  let body = null;
  if (!loading && !data) {
    body = (
      <Alert status="error" mt={4}>
        <AlertIcon />
        <AlertTitle mr={2}>Something went wrong</AlertTitle>
        <AlertDescription>Please try again later!</AlertDescription>
      </Alert>
    );
  } else if (loading && !data) {
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
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }}
            isLoading={loading}
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

export default withApollo({ ssr: true })(Index);
