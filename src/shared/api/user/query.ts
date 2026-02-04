import { useQuery } from "@tanstack/react-query";
import { findMe } from "./service";

export const useGetUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: findMe
  });
};
