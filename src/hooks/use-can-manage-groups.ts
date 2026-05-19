import { useSelector } from "react-redux";
import { selectToken } from "@/stores/auth.store";
import {
  getRoleStringFromAccessToken,
  roleCanManageStudentGroups
} from "@/shared/lib/jwt-claims";
export function useCanManageGroups(): boolean {
  const token = useSelector(selectToken);
  return roleCanManageStudentGroups(getRoleStringFromAccessToken(token));
}
