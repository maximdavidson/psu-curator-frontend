import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useGetMySelf } from "@/hooks/use-get-my-self";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
import { useSelector } from "react-redux";
import { selectMustChangePassword } from "@/stores/auth.store";
interface ProtectedRoutesProps {
  allowedRoles?: string[];
}
export const ProtectedRoutes = ({ allowedRoles }: ProtectedRoutesProps) => {
  const { token } = useGetMySelf();
  const mustChangePassword = useSelector(selectMustChangePassword);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (mustChangePassword && location.pathname !== "/force-change-password") {
    return <Navigate to="/force-change-password" replace />;
  }
  if (allowedRoles?.length) {
    const role = getRoleStringFromAccessToken(token);
    if (!role) {
      return <Navigate to="/groups" replace />;
    }
    const roleLower = role.trim().toLowerCase();
    const allowed = allowedRoles.some(
      (a) => a.trim().toLowerCase() === roleLower
    );
    if (!allowed) {
      return <Navigate to="/groups" replace />;
    }
  }
  return <Outlet />;
};
