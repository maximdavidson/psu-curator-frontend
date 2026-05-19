export const resolveAvatarUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl) {
    return null;
  }
  if (/^https?:\/\//i.test(avatarUrl)) {
    return avatarUrl;
  }
  const apiRoot = ((import.meta.env.VITE_API_URL as string | undefined) ?? "")
    .replace(/\/$/, "")
    .replace(/\/api$/i, "");
  if (!apiRoot) {
    return avatarUrl;
  }
  return `${apiRoot}${avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`}`;
};
