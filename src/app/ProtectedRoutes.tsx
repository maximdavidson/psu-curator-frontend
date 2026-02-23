import type { TRoles } from "@/shared";
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
        navigate("/profile");
      }
    }
    if (isError) {
      navigate("/login");
    }
  }, [data, isError, navigate, roles]);

  return (
    <>
      <Outlet />
    </>
  );
};

function useGetUser(): {
  data: {
    role: TRoles;
  };
  isError: boolean;
} {
  return {
    data: {
      role: "admin"
    },
    isError: false
  };
}
