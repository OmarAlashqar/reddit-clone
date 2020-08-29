import React from "react";
import { Box, Link, Flex, Button, Heading } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  // query is useless if built with SSR since no cookie is set
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  const router = useRouter();

  let body = null;

  if (fetching) {
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
            router.reload();
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
