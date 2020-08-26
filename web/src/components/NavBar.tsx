import React from "react";
import { Box, Link, Flex, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body = null;

  if (fetching) {
    // loading
    // no-op for now
  } else if (data?.me) {
    // user logged in
    body = (
      <Flex>
        <Box mr={4}>{data.me.username}</Box>
        <Button
          variant="link"
          onClick={() => logout()}
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
          <Link mr={2}>login</Link>
        </NextLink>

        <NextLink href="/register">
          <Link mr={2}>register</Link>
        </NextLink>
      </>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Flex ml="auto">{body}</Flex>
    </Flex>
  );
};
