import { useGetUser, type TRoles } from "@/shared";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

interface IProtectedRoutesProps {
  roles: TRoles[];
}

export const ProtectedRoutes = ({ roles }: IProtectedRoutesProps) => {
  const { data, isError } = useGetUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      const role = data.role;
      if (!roles?.includes(role)) {
        navigate("/profile"); // TODO: change to a more suitable route
      }
    }
    if (isError) {
      navigate("/login");
    }
  }, [data, isError]);

  return (
    <>
      <Outlet />
    </>
  );
};
