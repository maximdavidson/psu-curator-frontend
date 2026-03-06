import { selectToken } from "@/stores/auth.store";
import { useSelector } from "react-redux";

export const useGetMySelf = () => {
  // TODO: implement request to backend for user creds

  const token = useSelector(selectToken);

  return { token };
};
