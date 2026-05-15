import { useSelector } from "react-redux";
import { selectToken } from "@/stores/auth.store";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
import {
  formatFullName,
  getDisplayNameFromEmail
} from "@/shared/lib/format-user-name";
import { useGetUserByIdQuery } from "@/services/user.api";

export function useCurrentUserDisplayName(): {
  displayName: string;
  isLoading: boolean;
} {
  const token = useSelector(selectToken);
  const userId = getUserIdFromAccessToken(token);
  const email =
    typeof window !== "undefined" ? localStorage.getItem("email") : null;

  const {
    data: user,
    isLoading,
    isFetching
  } = useGetUserByIdQuery(userId ?? "", {
    skip: !userId
  });

  const fullName = user ? formatFullName(user) : "";
  const fallback = getDisplayNameFromEmail(email) || "пользователь";

  return {
    displayName: fullName || fallback,
    isLoading: Boolean(userId) && (isLoading || isFetching) && !fullName
  };
}
