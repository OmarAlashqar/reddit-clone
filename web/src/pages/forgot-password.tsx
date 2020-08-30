import { Alert, AlertIcon, Button, FormControl } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

export const ForgotPassword: React.FC<{}> = ({}) => {
  const [forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          !complete ? (
            <Form>
              <FormControl>
                <InputField
                  name="email"
                  placeholder="email"
                  label="Email"
                  type="email"
                />

                <Button
                  mt={4}
                  isLoading={isSubmitting}
                  type="submit"
                  variantColor="teal"
                >
                  Forgot Password
                </Button>
              </FormControl>
            </Form>
          ) : (
            <Alert status="info" mt={4}>
              <AlertIcon />
              If an account exists with that email, we sent you an email with a
              link to reset your password
            </Alert>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
