import { Outlet, Navigate } from "react-router-dom";
import { useGetMySelf } from "@/hooks/use-get-my-self";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
interface ProtectedRoutesProps {
  allowedRoles?: string[];
}
export const ProtectedRoutes = ({ allowedRoles }: ProtectedRoutesProps) => {
  const { token } = useGetMySelf();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles?.length) {
    const role = getRoleStringFromAccessToken(token);
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/groups" replace />;
    }
  }
  return <Outlet />;
};
