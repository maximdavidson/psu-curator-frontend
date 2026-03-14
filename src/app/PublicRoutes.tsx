import { useGetMySelf } from "@/hooks/use-get-my-self";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const PublicRoutes = () => {
  const { token } = useGetMySelf();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/groups");
    }
  }, [navigate, token]);

  return (
    <>
      <Outlet />
    </>
  );
};
