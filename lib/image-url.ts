export const normalizeImageUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("public/")) {
    return `/${trimmed.replace(/^public\//, "")}`;
  }

  if (!trimmed.startsWith("/") && !/^https?:\/\//i.test(trimmed) && trimmed.includes("/")) {
    return `/${trimmed}`;
  }

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("drive.google.com")) {
      const directId = url.searchParams.get("id");
      const fileId = directId || url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
      if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    if (url.hostname.includes("dropbox.com")) {
      url.searchParams.delete("dl");
      url.searchParams.set("raw", "1");
      return url.toString();
    }

    return trimmed;
  } catch {
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
      return `https://${trimmed}`;
    }

    return trimmed;
  }
};
