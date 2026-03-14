import { removeToken } from "@/stores/auth.store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(removeToken());
    navigate("/login");
  };

  return handleLogout;
};
