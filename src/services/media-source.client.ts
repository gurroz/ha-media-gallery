import type { HomeAssistant } from "custom-card-helpers";
import type {
  BrowseMediaSource,
  ResolvedMedia,
} from "../domain/media.js";
import { isFolderItem, isImageItem } from "../domain/media.js";

export interface CollectionLimits {
  maxDepth?: number;
  maxItems?: number;
  concurrency?: number;
}

export class MediaSourceClient {
  constructor(private readonly getHass: () => HomeAssistant | undefined) {}

  async browse(mediaContentId = ""): Promise<BrowseMediaSource> {
    const hass = this.getHass();
    if (!hass?.connection) throw new Error("Home Assistant is not connected");
    return hass.callWS<BrowseMediaSource>({
      type: "media_source/browse_media",
      media_content_id: mediaContentId,
    });
  }

  async resolve(
    mediaContentId: string,
    expires = 3_600
  ): Promise<ResolvedMedia> {
    const hass = this.getHass();
    if (!hass?.connection) throw new Error("Home Assistant is not connected");
    return hass.callWS<ResolvedMedia>({
      type: "media_source/resolve_media",
      media_content_id: mediaContentId,
      expires,
    });
  }

  async collectImages(
    root: BrowseMediaSource,
    limits: CollectionLimits = {}
  ): Promise<BrowseMediaSource[]> {
    const maxDepth = limits.maxDepth ?? 25;
    const maxItems = limits.maxItems ?? 5_000;
    const concurrency = Math.max(1, limits.concurrency ?? 4);
    const images = new Map<string, BrowseMediaSource>();
    const visited = new Set<string>();
    let folders: Array<{ folder: BrowseMediaSource; depth: number }> = [
      { folder: root, depth: 0 },
    ];

    while (folders.length && images.size < maxItems) {
      const next: Array<{ folder: BrowseMediaSource; depth: number }> = [];
      for (let offset = 0; offset < folders.length; offset += concurrency) {
        const batch = folders
          .slice(offset, offset + concurrency)
          .filter(({ folder }) => {
            const id = folder.media_content_id || "__media_root__";
            if (visited.has(id)) return false;
            visited.add(id);
            return true;
          });
        const browsed = await Promise.all(
          batch.map(async ({ folder, depth }) => ({
            item:
              folder.children === undefined
                ? await this.browse(folder.media_content_id)
                : folder,
            depth,
          }))
        );

        for (const { item, depth } of browsed) {
          for (const child of item.children ?? []) {
            if (isImageItem(child)) {
              images.set(child.media_content_id, child);
              if (images.size >= maxItems) break;
            } else if (depth < maxDepth && isFolderItem(child)) {
              next.push({ folder: child, depth: depth + 1 });
            }
          }
          if (images.size >= maxItems) break;
        }
        if (images.size >= maxItems) break;
      }
      folders = next;
    }

    return [...images.values()];
  }
}
