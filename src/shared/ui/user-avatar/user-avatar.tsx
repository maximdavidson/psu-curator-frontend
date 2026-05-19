import { resolveAvatarUrl } from "@/shared/lib/resolve-avatar-url";
import styles from "./user-avatar.module.scss";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}

export const UserAvatar = ({
  name,
  avatarUrl,
  className,
  fallback
}: UserAvatarProps) => {
  const src = resolveAvatarUrl(avatarUrl);
  const classNames = [styles.avatar, className].filter(Boolean).join(" ");

  if (src) {
    return (
      <span className={classNames}>
        <img src={src} alt="" />
      </span>
    );
  }

  return (
    <span className={classNames}>
      {(fallback ?? name.trim().slice(0, 1).toUpperCase()) || "?"}
    </span>
  );
};
