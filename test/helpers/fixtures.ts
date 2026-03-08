import type { BrowseMediaSource } from "../../src/domain/media.js";

export const image = (
  id: string,
  title = id
): BrowseMediaSource => ({
  title,
  media_class: "image",
  media_content_id: id,
  media_content_type: "image/jpeg",
  can_play: true,
  can_expand: false,
});

export const video = (
  id: string,
  title = id
): BrowseMediaSource => ({
  title,
  media_class: "video",
  media_content_id: id,
  media_content_type: "video/mp4",
  can_play: true,
  can_expand: false,
});

export const folder = (
  id: string,
  title: string,
  children?: BrowseMediaSource[]
): BrowseMediaSource => ({
  title,
  media_class: "directory",
  media_content_id: id,
  media_content_type: "application/vnd.apple.mpegurl",
  can_play: false,
  can_expand: true,
  children,
});

export const root = folder("", "Media", [
  folder("media-source://local/trips", "Trips"),
  image("media-source://local/sunset.jpg", "Sunset"),
  video("media-source://local/movie.mp4", "Movie"),
]);

export const trips = folder("media-source://local/trips", "Trips", [
  image("media-source://local/trips/beach.jpg", "Beach"),
]);
