/**
 * Types for Home Assistant media_source/browse_media response.
 */
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

export const IMAGE_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/x-icon",
];

export function isImageItem(item: BrowseMediaSource): boolean {
  if (!item.can_play || !item.media_content_type) return false;
  const type = item.media_content_type.toLowerCase().split(";")[0].trim();
  return type.startsWith("image/");
}

export function isFolderItem(item: BrowseMediaSource): boolean {
  return item.can_expand && !!item.children;
}

/** Build relative URL for media content (works with HA auth/session). */
export function mediaContentUrl(mediaContentId: string, baseUrl?: string): string {
  const path = mediaContentId.startsWith("media-source://")
    ? mediaContentId.replace(/^media-source:\/\/[^/]+\//, "")
    : mediaContentId;
  const rel = `/media/${path}`;
  return baseUrl ? `${baseUrl}${rel}` : rel;
}
