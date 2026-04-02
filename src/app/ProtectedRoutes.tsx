import { Outlet, Navigate } from "react-router-dom";
import { useGetMySelf } from "@/hooks/use-get-my-self";

export const ProtectedRoutes = () => {
  const { token } = useGetMySelf();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
