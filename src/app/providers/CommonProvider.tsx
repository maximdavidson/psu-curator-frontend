import { Outlet } from "react-router-dom";
import { APIProvider } from "./APIProvider";

export const CommonProvider = () => {
  return (
    <APIProvider>
      <Outlet />
    </APIProvider>
  );
};
