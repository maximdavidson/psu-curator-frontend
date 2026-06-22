export function getApiOrigin(): string {
  return ((import.meta.env.VITE_API_URL as string | undefined) ?? "")
    .replace(/\/$/, "")
    .replace(/\/api$/i, "");
}

function joinApiOrigin(origin: string, path: string): string {
  if (!origin) {
    return path;
  }

  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const apiOrigin = getApiOrigin();

  if (trimmed.startsWith("/")) {
    return joinApiOrigin(apiOrigin, trimmed);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (
        parsed.pathname.startsWith("/avatars/") ||
        parsed.pathname.startsWith("/api/files/download/")
      ) {
        return joinApiOrigin(apiOrigin, `${parsed.pathname}${parsed.search}`);
      }
    } catch {
      return trimmed;
    }

    return trimmed;
  }

  return joinApiOrigin(apiOrigin, trimmed);
}

export const resolveAvatarUrl = (avatarUrl?: string | null): string | null =>
  resolveMediaUrl(avatarUrl);
