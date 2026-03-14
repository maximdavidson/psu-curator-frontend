import { Outlet } from "react-router-dom";
import { StoreProvider } from "./StoreProvider";

export const CommonProvider = () => {
  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  );
};
