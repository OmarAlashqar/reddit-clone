import { Box, Button, FormControl } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

export const CreatePost: React.FC<{}> = ({}) => {
  useIsAuth();
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          if (!error) router.push("/");
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField name="title" placeholder="title" label="Title" />

              <Box mt={4}>
                <InputField
                  name="text"
                  placeholder="text..."
                  label="Body"
                  textarea
                />
              </Box>

              <Button
                mt={4}
                isLoading={isSubmitting}
                type="submit"
                variantColor="teal"
              >
                Create Post
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
