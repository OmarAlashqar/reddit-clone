import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromUrl = () => {
  const router = useRouter();

  const idParsed =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  return usePostQuery({
    pause: idParsed === -1,
    variables: { id: idParsed },
  });
};
