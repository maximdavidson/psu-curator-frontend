export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFileIcon = (contentType: string): string => {
  if (contentType.startsWith("image/")) {
    return "🖼️";
  }
  if (contentType === "application/pdf") {
    return "📕";
  }
  if (contentType.includes("word") || contentType.includes("document")) {
    return "📝";
  }
  return "📄";
};
