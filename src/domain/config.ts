export interface HaGalleryConfig {
  type: "custom:ha-gallery";
  title?: string;
  media_content_id?: string;
  slideshow_interval?: number;
  slideshow_order?: "sequential" | "random";
}

export function slideshowIntervalSeconds(
  value: unknown,
  fallback = 5
): number {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(300, Math.max(1, number))
    : fallback;
}

export function normalizeConfig(config: HaGalleryConfig): HaGalleryConfig {
  return {
    ...config,
    title: config.title?.trim() || undefined,
    media_content_id: config.media_content_id?.trim() || undefined,
    slideshow_interval: slideshowIntervalSeconds(config.slideshow_interval),
    slideshow_order:
      config.slideshow_order === "random" ? "random" : "sequential",
  };
}
