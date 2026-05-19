export const readApiErrorMessage = (err: unknown): string | undefined => {
  if (typeof err !== "object" || err === null || !("data" in err)) {
    return;
  }
  const data = (err as { data: unknown }).data;
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return;
  }
  const message = (data as { message: unknown }).message;
  return typeof message === "string" ? message : undefined;
};
