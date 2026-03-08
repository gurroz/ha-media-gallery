/** Home Assistant media_source/browse_media response. */
export interface BrowseMediaSource {
  title: string;
  media_class: string;
  media_content_id: string;
  media_content_type: string;
  can_play: boolean;
  can_expand: boolean;
  children_media_class?: string;
  children?: BrowseMediaSource[];
  thumbnail?: string | null;
  not_shown?: number;
}

export interface ResolvedMedia {
  url: string;
  mime_type: string;
}

import { isHlsMime } from "./video.js";

export function isImageItem(item: BrowseMediaSource): boolean {
  return mediaType(item).startsWith("image/") && item.can_play;
}

export function isVideoItem(item: BrowseMediaSource): boolean {
  if (!item.can_play) return false;
  if ((item.media_class ?? "").toLowerCase() === "video") return true;
  const type = mediaType(item);
  return type.startsWith("video/") || isHlsMime(type);
}

export function isMediaItem(item: BrowseMediaSource): boolean {
  return isImageItem(item) || isVideoItem(item);
}

export function isFolderItem(item: BrowseMediaSource): boolean {
  return item.can_expand && !isMediaItem(item);
}

function mediaType(item: BrowseMediaSource): string {
  return (item.media_content_type ?? "")
    .toLowerCase()
    .split(";")[0]
    .trim();
}
