import type { BrowseMediaSource } from "./media.js";

export function orderSlideshowItems(
  items: BrowseMediaSource[],
  order: "sequential" | "random" = "sequential",
  random: () => number = Math.random
): BrowseMediaSource[] {
  const ordered = [...items];
  if (order !== "random") return ordered;
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [ordered[index], ordered[randomIndex]] = [
      ordered[randomIndex],
      ordered[index],
    ];
  }
  return ordered;
}

export function normalizeSlideIndex(index: number, length: number): number {
  return length > 0 ? ((index % length) + length) % length : -1;
}

export function slideshowExpirySeconds(
  itemCount: number,
  intervalSeconds: number
): number {
  return Math.min(
    86_400,
    Math.max(3_600, Math.ceil(itemCount * intervalSeconds + 600))
  );
}

export function prefetchIndices(
  fromIndex: number,
  length: number,
  count = 3
): number[] {
  if (fromIndex < 0 || length < 2) return [];
  return Array.from(
    { length: Math.min(count, length - 1) },
    (_, offset) => (fromIndex + offset + 1) % length
  );
}
