import React from "react";
import { Wrapper, WrapperVariant } from "./Wrapper";
import { NavBar } from "./NavBar";
import Head from "next/head";
import { Footer } from "./Footer";
import { Flex } from "@chakra-ui/core";

interface LayoutProps {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <>
      <Head>
        <title>Reddit-Clone | Omar Alashqar</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Flex flexDir="column" height="100vh">
        <NavBar />
        <Flex flex={1}>
          <Wrapper variant={variant}>{children}</Wrapper>
        </Flex>
        <Footer />
      </Flex>
    </>
  );
};
