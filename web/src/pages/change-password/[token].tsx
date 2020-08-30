import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  Link,
} from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

export const ChangePassword: NextPage = () => {
  const [, changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");

  const { token } = router.query;

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const res = await changePassword({
            newPassword: values.newPassword,
            token: typeof token === "string" ? token : "",
          });

          if (res.data?.changePassword.errors) {
            const errorMap = toErrorMap(res.data.changePassword.errors);
            if ("token" in errorMap) setTokenError(errorMap.token);
            setErrors(errorMap);
          } else if (res.data?.changePassword.user) {
            // change password + login successful
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="newPassword"
                placeholder="new password"
                label="New Password"
                type="password"
              />

              {tokenError ? (
                <Alert status="error" mt={4}>
                  <AlertIcon />
                  <AlertTitle mr={2}>{tokenError}</AlertTitle>
                  <AlertDescription>
                    <NextLink href="/forgot-password">
                      <Link>click here to restart</Link>
                    </NextLink>
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                mt={4}
                isLoading={isSubmitting}
                type="submit"
                variantColor="teal"
              >
                Change Password
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
