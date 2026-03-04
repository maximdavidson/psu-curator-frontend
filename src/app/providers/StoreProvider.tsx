import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "../store/store";
import { PersistGate } from "redux-persist/integration/react";

interface IProps {
  children: ReactNode;
}
export const StoreProvider = ({ children }: IProps) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<p>Loading store...</p>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
