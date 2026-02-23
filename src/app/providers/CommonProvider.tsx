import { Outlet } from "react-router-dom";
import { APIProvider } from "./StoreProvider";

export const CommonProvider = () => {
  return (
    <APIProvider>
      <Outlet />
    </APIProvider>
  );
};
