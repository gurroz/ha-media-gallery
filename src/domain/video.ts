export type PlaybackStrategy = "native" | "hls" | "remap" | "unsupported";

export type CanPlayType = (type: string) => string;

const HLS_MIME = new Set([
  "application/vnd.apple.mpegurl",
  "application/x-mpegurl",
]);

export function normalizeMime(value: string | undefined | null): string {
  return (value ?? "").toLowerCase().split(";")[0].trim();
}

export function isHlsMime(mime: string | undefined | null): boolean {
  return HLS_MIME.has(normalizeMime(mime));
}

export function urlExtension(url: string): string {
  const path = url.split("?")[0].split("#")[0];
  const slash = path.lastIndexOf("/");
  const name = slash >= 0 ? path.slice(slash + 1) : path;
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function isHlsMedia(mime: string, url: string): boolean {
  return isHlsMime(mime) || urlExtension(url) === ".m3u8";
}

export function isMovMedia(mime: string, url: string): boolean {
  return (
    normalizeMime(mime) === "video/quicktime" || urlExtension(url) === ".mov"
  );
}

export function classifyPlayback(
  mime: string,
  url: string,
  canPlayType: CanPlayType
): PlaybackStrategy {
  if (isHlsMedia(mime, url)) return "hls";
  if (isMovMedia(mime, url) && canPlayType("video/quicktime") === "") {
    return "remap";
  }
  const type = normalizeMime(mime);
  if (type && canPlayType(type) === "") return "unsupported";
  return "native";
}

export function formatLabel(mime: string, url: string): string {
  const type = normalizeMime(mime);
  const extension = urlExtension(url);
  if (isHlsMedia(mime, url)) return "HLS";
  if (type === "video/x-msvideo" || extension === ".avi") return "AVI";
  if (type === "video/x-ms-wmv" || extension === ".wmv") return "WMV";
  if (type === "video/mpeg" || extension === ".mpeg" || extension === ".mpg") {
    return "MPEG-2";
  }
  if (type === "video/x-matroska" || extension === ".mkv") return "MKV";
  if (isMovMedia(mime, url)) return "MOV";
  if (type.startsWith("video/") && type.length > "video/".length) {
    return type.slice("video/".length).toUpperCase();
  }
  return "this";
}

export function browserCanPlayType(type: string): string {
  return document.createElement("video").canPlayType(type);
}
