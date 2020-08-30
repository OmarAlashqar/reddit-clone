import { useApolloClient } from "@apollo/client";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  // query is useless if built with SSR since no cookie is set
  const { data, loading } = useMeQuery({ skip: isServer() });
  const [logout, { loading: logoutFetching }] = useLogoutMutation();

  const apolloClient = useApolloClient();

  let body = null;

  if (loading) {
    // loading
    // no-op for now
  } else if (data?.me) {
    // user logged in
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Box mr={4}>{data.me.username}</Box>
        <Button
          variant="link"
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  } else {
    // not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>login</Link>
        </NextLink>

        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
  }

  return (
    <Flex bg="tan" p={4} position="sticky" top={0} zIndex={1}>
      <Flex margin="auto" align="center" maxW={800} flex={1}>
        <NextLink href="/">
          <Link>
            <Heading>Reddit-Clone</Heading>
          </Link>
        </NextLink>
        <Flex ml="auto">{body}</Flex>
      </Flex>
    </Flex>
  );
};
