import { selectToken } from "@/stores/auth.store";
import { useSelector } from "react-redux";
export const useGetMySelf = () => {
  const token = useSelector(selectToken);
  return { token };
};
