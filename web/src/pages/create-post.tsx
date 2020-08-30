import { Box, Button, FormControl } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../hooks/useIsAuth";
import { withApollo } from "../utils/withApollo";

export const CreatePost: React.FC<{}> = ({}) => {
  useIsAuth();
  const router = useRouter();
  const [createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { errors } = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: "posts" });
            },
          });
          if (!errors) router.push("/");
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

export default withApollo({ ssr: false })(CreatePost);
