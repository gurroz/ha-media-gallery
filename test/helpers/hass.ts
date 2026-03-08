import type { HomeAssistant } from "custom-card-helpers";
import type {
  BrowseMediaSource,
  ResolvedMedia,
} from "../../src/domain/media.js";

export interface FakeHassOptions {
  browse: Record<string, BrowseMediaSource>;
  resolveFailures?: Set<string>;
}

export interface FakeHass {
  hass: HomeAssistant;
  calls: Array<Record<string, unknown>>;
}

export function createFakeHass(options: FakeHassOptions): FakeHass {
  const calls: Array<Record<string, unknown>> = [];
  const callWS = async <T>(message: Record<string, unknown>): Promise<T> => {
    calls.push(message);
    const type = message.type;
    const id = String(message.media_content_id ?? "");

    if (type === "media_source/browse_media") {
      const result = options.browse[id];
      if (!result) throw new Error(`Missing media source: ${id}`);
      return result as T;
    }
    if (type === "media_source/resolve_media") {
      if (options.resolveFailures?.has(id)) {
        throw new Error(`Unable to resolve: ${id}`);
      }
      return {
        url: `https://example.test/${encodeURIComponent(id)}`,
        mime_type: id.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
      } satisfies ResolvedMedia as T;
    }
    throw new Error(`Unexpected websocket call: ${String(type)}`);
  };

  return {
    calls,
    hass: {
      connection: {},
      callWS,
    } as unknown as HomeAssistant,
  };
}
