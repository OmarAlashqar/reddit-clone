import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  FormControl,
} from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { useGetPostFromUrl } from "../../../hooks/useGetPostFromUrl";
import { withApollo } from "../../../utils/withApollo";

export const EditPost: React.FC = ({}) => {
  const router = useRouter();
  const { data, loading } = useGetPostFromUrl();
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  } else if (!data?.post) {
    // no post with that id
    return (
      <Layout>
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertTitle mr={2}>There's no post to be found here!</AlertTitle>
          <AlertDescription>The URL seems to be wrong</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({
            variables: {
              id: data.post!.id,
              ...values,
            },
          });
          router.back();
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
                Update Post
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);
