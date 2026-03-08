import type { BrowseMediaSource } from "./media.js";
import {
  isFolderItem,
  isImageItem,
  isMediaItem,
  isVideoItem,
} from "./media.js";

export type MediaFilter = "both" | "images" | "videos";

export function nextMediaFilter(
  current: MediaFilter,
  toggled: Exclude<MediaFilter, "both">
): MediaFilter {
  if (toggled === "images") {
    return current === "both"
      ? "videos"
      : current === "videos"
        ? "both"
        : "images";
  }
  return current === "both"
    ? "images"
    : current === "images"
      ? "both"
      : "videos";
}

export function filterFolders(
  items: BrowseMediaSource[],
  query: string
): BrowseMediaSource[] {
  const normalized = query.trim().toLowerCase();
  return items.filter(
    (item) =>
      isFolderItem(item) &&
      (!normalized || item.title.toLowerCase().includes(normalized))
  );
}

export function filterMedia(
  items: BrowseMediaSource[],
  query: string,
  filter: MediaFilter
): BrowseMediaSource[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (!isMediaItem(item)) return false;
    if (normalized && !item.title.toLowerCase().includes(normalized)) {
      return false;
    }
    if (filter === "images") return isImageItem(item);
    if (filter === "videos") return isVideoItem(item);
    return true;
  });
}

export function emptyStateMessage(
  query: string,
  unfilteredMediaCount: number
): string {
  if (query.trim()) return "No folders or files match this search.";
  if (unfilteredMediaCount) return "No files match this media filter.";
  return "No folders, images, or videos here.";
}
