import { describe, expect, it, vi } from "vitest";
import { MediaSourceClient } from "../../src/services/media-source.client.js";
import { MediaUrlCache } from "../../src/services/media-url-cache.js";
import { createFakeHass } from "../helpers/hass.js";
import { folder, image } from "../helpers/fixtures.js";

describe("MediaUrlCache", () => {
  it("caches, expires, and deduplicates in-flight resolution", async () => {
    let now = 1_000;
    const cache = new MediaUrlCache(() => now);
    const resolver = vi.fn(async () => ({
      url: "signed-url",
      mimeType: "video/mp4",
    }));
    const first = cache.resolve("id", 120, resolver);
    const second = cache.resolve("id", 120, resolver);
    expect(first).toBe(second);
    expect(await first).toEqual({ url: "signed-url", mimeType: "video/mp4" });
    expect(resolver).toHaveBeenCalledOnce();
    expect(cache.get("id")).toMatchObject({
      url: "signed-url",
      mimeType: "video/mp4",
    });
    expect(cache.getUrl("id")).toBe("signed-url");
    expect(cache.getMimeType("id")).toBe("video/mp4");
    await expect(cache.resolve("id", 120, resolver)).resolves.toEqual({
      url: "signed-url",
      mimeType: "video/mp4",
    });
    expect(resolver).toHaveBeenCalledOnce();

    now += 61_000;
    expect(cache.get("id")).toBeUndefined();
  });

  it("rejects failed resolutions without caching them", async () => {
    const cache = new MediaUrlCache();
    await expect(
      cache.resolve("id", 120, async () => {
        throw new Error("failed");
      })
    ).rejects.toThrow("failed");
    expect(cache.get("id")).toBeUndefined();
  });
});

describe("MediaSourceClient", () => {
  it("wraps Home Assistant browse and resolve calls", async () => {
    const root = folder("", "Root", []);
    const fake = createFakeHass({ browse: { "": root } });
    const client = new MediaSourceClient(() => fake.hass);
    await expect(client.browse()).resolves.toBe(root);
    await expect(client.resolve("photo.jpg", 100)).resolves.toMatchObject({
      mime_type: "image/jpeg",
    });
    expect(fake.calls.map((call) => call.type)).toEqual([
      "media_source/browse_media",
      "media_source/resolve_media",
    ]);
  });

  it("collects nested images with cycle and item limits", async () => {
    const leaf = folder("leaf", "Leaf", [image("one"), image("two")]);
    const root = folder("", "Root", [
      folder("lazy", "Lazy"),
      leaf,
      image("root-image"),
    ]);
    const lazy = folder("lazy", "Lazy", [
      image("lazy-image"),
      folder("lazy", "Cycle"),
    ]);
    const fake = createFakeHass({ browse: { "": root, lazy } });
    const client = new MediaSourceClient(() => fake.hass);

    await expect(client.collectImages(root, { maxItems: 2 })).resolves.toEqual([
      image("root-image"),
      image("lazy-image"),
    ]);
    await expect(
      client.collectImages(root, { maxDepth: 0, maxItems: 10 })
    ).resolves.toEqual([image("root-image")]);
  });
});
