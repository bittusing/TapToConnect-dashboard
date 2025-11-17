export const sanitiseHashtags = (hashtags: string[]): string[] =>
  Array.from(
    new Set(
      hashtags
        .map((tag) =>
          tag
            .trim()
            .replace(/^#/u, "")
            .replace(/\s+/gu, "")
            .toLowerCase()
        )
        .filter((tag) => tag.length > 0)
    )
  );

export const formatDuration = (durationInSeconds: number): string => {
  if (!Number.isFinite(durationInSeconds)) {
    return "--";
  }

  const totalSeconds = Math.max(0, Math.floor(durationInSeconds));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const SHORT_STATUS_OPTIONS = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
] as const;

