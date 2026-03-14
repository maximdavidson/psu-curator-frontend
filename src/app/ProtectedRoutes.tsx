import { useGetMySelf } from "@/hooks/use-get-my-self";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

// interface IProtectedRoutesProps {
//   roles: TRoles[];
// }

export const ProtectedRoutes = () => {
  const { token } = useGetMySelf();

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
    // if (data) {
    //   const role = data.role;
    //   if (!roles?.includes(role)) {
    //     navigate("/profile");
    //   }
    // }
    // if (isError) {
    //   navigate("/login");
    // }
  }, [navigate, token]);

  return (
    <>
      <Outlet />
    </>
  );
};
