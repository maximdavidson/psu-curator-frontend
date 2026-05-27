const collectValidationMessages = (errors: unknown): string[] => {
  if (!errors || typeof errors !== "object") {
    return [];
  }

  const messages: string[] = [];
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (typeof value === "string") {
      messages.push(value);
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim()) {
          messages.push(item);
        }
      }
    }
  }
  return messages;
};

export const readApiErrorMessage = (err: unknown): string | undefined => {
  if (typeof err !== "object" || err === null || !("data" in err)) {
    return undefined;
  }

  const data = (err as { data: unknown }).data;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const payload = data as {
    error?: unknown;
    message?: unknown;
    title?: unknown;
    errors?: unknown;
  };

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  const validationMessages = collectValidationMessages(payload.errors);
  if (validationMessages.length > 0) {
    return validationMessages.join(" ");
  }

  if (typeof payload.title === "string" && payload.title.trim()) {
    return payload.title.trim();
  }

  return undefined;
};
