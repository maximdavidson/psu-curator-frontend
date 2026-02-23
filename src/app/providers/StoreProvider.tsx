import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store";

interface IProps {
  children: ReactNode;
}
export const StoreProvider = ({ children }: IProps) => {
  return <Provider store={store}>{children}</Provider>;
};
