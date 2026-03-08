import { describe, expect, it } from "vitest";
import {
  normalizeConfig,
  slideshowIntervalSeconds,
} from "../../src/domain/config.js";
import {
  emptyStateMessage,
  filterFolders,
  filterMedia,
  nextMediaFilter,
} from "../../src/domain/filters.js";
import {
  isFolderItem,
  isImageItem,
  isMediaItem,
  isVideoItem,
} from "../../src/domain/media.js";
import {
  browserCanPlayType,
  classifyPlayback,
  formatLabel,
  isHlsMedia,
  isHlsMime,
  isMovMedia,
  normalizeMime,
  urlExtension,
} from "../../src/domain/video.js";
import {
  normalizeSlideIndex,
  orderSlideshowItems,
  prefetchIndices,
  slideshowExpirySeconds,
} from "../../src/domain/slideshow.js";
import {
  clampPan,
  clampZoom,
  distance,
  midpoint,
  PinchTracker,
  pointDelta,
  type Point,
} from "../../src/domain/zoom.js";
import {
  LIGHTBOX_HISTORY_HASH,
  lightboxHistoryUrl,
  pushLightboxHistory,
  restoreLocation,
  snapshotLocation,
} from "../../src/domain/lightbox-history.js";
import { folder, image, root, video } from "../helpers/fixtures.js";

describe("configuration domain", () => {
  it("normalizes optional fields and slideshow bounds", () => {
    expect(slideshowIntervalSeconds(0)).toBe(1);
    expect(slideshowIntervalSeconds(301)).toBe(300);
    expect(slideshowIntervalSeconds("nope")).toBe(5);
    expect(
      normalizeConfig({
        type: "custom:ha-gallery",
        title: "  Photos ",
        media_content_id: " ",
        slideshow_order: undefined,
      })
    ).toEqual({
      type: "custom:ha-gallery",
      title: "Photos",
      media_content_id: undefined,
      slideshow_interval: 5,
      slideshow_order: "sequential",
    });
  });
});

describe("media and filter domain", () => {
  it("classifies media source items", () => {
    expect(isImageItem(image("a"))).toBe(true);
    expect(isVideoItem(video("b"))).toBe(true);
    expect(isFolderItem(folder("c", "Folder"))).toBe(true);
    expect(isMediaItem(folder("c", "Folder"))).toBe(false);
    expect(
      isVideoItem({
        ...video("clip.m3u8", "HLS"),
        media_class: "music",
        media_content_type: "application/x-mpegurl",
      })
    ).toBe(true);
    expect(
      isVideoItem({
        ...video("frigate", "Event"),
        media_class: "video",
        media_content_type: "application/x-mpegurl",
      })
    ).toBe(true);
    expect(isVideoItem({ ...video("nope"), can_play: false })).toBe(false);
    expect(
      isVideoItem({
        title: "orphan",
        media_class: undefined as unknown as string,
        media_content_id: "orphan",
        media_content_type: "video/mp4",
        can_play: true,
        can_expand: false,
      })
    ).toBe(true);
    expect(
      isVideoItem({
        title: "empty",
        media_class: "",
        media_content_id: "empty",
        media_content_type: undefined as unknown as string,
        can_play: true,
        can_expand: false,
      })
    ).toBe(false);
  });

  it("classifies playback strategy from MIME and URL", () => {
    const playable = (type: string) =>
      type === "video/mp4" || type === "video/quicktime" ? "maybe" : "";
    const chromeLike = (type: string) => (type === "video/mp4" ? "maybe" : "");

    expect(
      classifyPlayback("video/mp4", "clip.mp4", playable)
    ).toBe("native");
    expect(
      classifyPlayback("application/vnd.apple.mpegurl", "a.m3u8", playable)
    ).toBe("hls");
    expect(classifyPlayback("", "stream.m3u8?token=1", playable)).toBe("hls");
    expect(
      classifyPlayback("video/quicktime", "clip.mov", chromeLike)
    ).toBe("remap");
    expect(
      classifyPlayback("video/quicktime", "clip.mov", playable)
    ).toBe("native");
    expect(
      classifyPlayback("video/x-msvideo", "clip.avi", chromeLike)
    ).toBe("unsupported");
    expect(classifyPlayback("", "clip.mp4", chromeLike)).toBe("native");
    expect(browserCanPlayType("video/mp4")).toBe("maybe");
    expect(browserCanPlayType("video/x-msvideo")).toBe("");
  });

  it("labels formats for the unsupported overlay", () => {
    expect(formatLabel("application/x-mpegurl", "a")).toBe("HLS");
    expect(formatLabel("", "clip.m3u8")).toBe("HLS");
    expect(formatLabel("video/x-msvideo", "a")).toBe("AVI");
    expect(formatLabel("", "clip.avi")).toBe("AVI");
    expect(formatLabel("video/x-ms-wmv", "a")).toBe("WMV");
    expect(formatLabel("", "clip.wmv")).toBe("WMV");
    expect(formatLabel("video/mpeg", "a")).toBe("MPEG-2");
    expect(formatLabel("", "clip.mpeg")).toBe("MPEG-2");
    expect(formatLabel("", "clip.mpg")).toBe("MPEG-2");
    expect(formatLabel("video/x-matroska", "a")).toBe("MKV");
    expect(formatLabel("", "clip.mkv")).toBe("MKV");
    expect(formatLabel("video/quicktime", "a")).toBe("MOV");
    expect(formatLabel("", "clip.mov")).toBe("MOV");
    expect(formatLabel("video/webm", "a")).toBe("WEBM");
    expect(formatLabel("video/", "a")).toBe("this");
    expect(formatLabel("", "file")).toBe("this");
    expect(isHlsMime("application/vnd.apple.mpegurl; charset=utf-8")).toBe(
      true
    );
    expect(isHlsMedia("video/mp4", "clip.mp4")).toBe(false);
    expect(isMovMedia("video/mp4", "clip.mp4")).toBe(false);
    expect(normalizeMime(undefined)).toBe("");
    expect(urlExtension("https://ha.local/media/clip.MOV#t=1")).toBe(".mov");
    expect(urlExtension("no-extension")).toBe("");
  });

  it("cycles filters and filters items", () => {
    expect(nextMediaFilter("both", "images")).toBe("videos");
    expect(nextMediaFilter("videos", "images")).toBe("both");
    expect(nextMediaFilter("both", "videos")).toBe("images");
    expect(nextMediaFilter("images", "videos")).toBe("both");
    const children = root.children ?? [];
    expect(filterFolders(children, "trip").map((item) => item.title)).toEqual([
      "Trips",
    ]);
    expect(filterMedia(children, "", "images").map((item) => item.title)).toEqual([
      "Sunset",
    ]);
    expect(filterMedia(children, "mov", "both").map((item) => item.title)).toEqual([
      "Movie",
    ]);
  });

  it("chooses the appropriate empty message", () => {
    expect(emptyStateMessage("x", 0)).toContain("search");
    expect(emptyStateMessage("", 1)).toContain("media filter");
    expect(emptyStateMessage("", 0)).toContain("No folders");
  });
});

describe("slideshow and zoom domain", () => {
  it("orders and wraps slides deterministically", () => {
    const items = [image("a"), image("b"), image("c")];
    expect(orderSlideshowItems(items).map((item) => item.title)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(
      orderSlideshowItems(items, "random", () => 0).map((item) => item.title)
    ).toEqual(["b", "c", "a"]);
    expect(normalizeSlideIndex(-1, 3)).toBe(2);
    expect(normalizeSlideIndex(3, 3)).toBe(0);
    expect(normalizeSlideIndex(0, 0)).toBe(-1);
    expect(prefetchIndices(1, 5)).toEqual([2, 3, 4]);
    expect(prefetchIndices(-1, 5)).toEqual([]);
    expect(slideshowExpirySeconds(2, 5)).toBe(3_600);
    expect(slideshowExpirySeconds(10_000, 300)).toBe(86_400);
  });

  it("performs pure zoom geometry", () => {
    expect(clampZoom(0)).toBe(1);
    expect(clampZoom(10)).toBe(8);
    expect(pointDelta({ x: 4, y: 7 }, { x: 1, y: 2 })).toEqual({
      x: 3,
      y: 5,
    });
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(midpoint({ x: 0, y: 2 }, { x: 4, y: 6 })).toEqual({
      x: 2,
      y: 4,
    });
  });

  it("clamps pan so a scaled image stays in the viewport", () => {
    const bounds = {
      imageWidth: 200,
      imageHeight: 100,
      viewportWidth: 400,
      viewportHeight: 300,
    };
    expect(clampPan(50, 40, 2, bounds)).toEqual({ x: 0, y: 0 });
    expect(
      clampPan(500, -500, 4, {
        imageWidth: 200,
        imageHeight: 100,
        viewportWidth: 400,
        viewportHeight: 300,
      })
    ).toEqual({ x: 200, y: -50 });
    expect(
      clampPan(-10, 8, 1, {
        imageWidth: 400,
        imageHeight: 300,
        viewportWidth: 400,
        viewportHeight: 300,
      })
    ).toEqual({ x: 0, y: 0 });
    expect(
      clampPan(80, -90, 2, {
        imageWidth: 400,
        imageHeight: 300,
        viewportWidth: 400,
        viewportHeight: 300,
      })
    ).toEqual({ x: 80, y: -90 });
    expect(
      clampPan(1, 1, 2, {
        imageWidth: 0,
        imageHeight: 100,
        viewportWidth: 400,
        viewportHeight: 300,
      })
    ).toEqual({ x: 1, y: 1 });
  });

  it("tracks pan and pinch gestures without DOM", () => {
    const tracker = new PinchTracker();
    expect(tracker.pointerMove(99, { x: 1, y: 1 }, 1)).toBeNull();

    tracker.pointerDown(1, { x: 0, y: 0 });
    expect(tracker.pointerMove(1, { x: 10, y: 5 }, 1)).toEqual({});
    expect(tracker.pointerMove(1, { x: 20, y: 10 }, 2)).toEqual({
      panX: 10,
      panY: 5,
    });

    tracker.reset();
    tracker.pointerDown(1, { x: 0, y: 0 });
    tracker.pointerDown(2, { x: 10, y: 0 });
    const pinch = tracker.pointerMove(2, { x: 20, y: 0 }, 1);
    expect(pinch?.zoomFactor).toBe(2);
    expect(pinch?.panX).toBeUndefined();

    const pinchPan = tracker.pointerMove(1, { x: 2, y: 2 }, 3);
    expect(pinchPan?.zoomFactor).toBeDefined();
    expect(pinchPan?.panX).toBeDefined();
    expect(pinchPan?.panY).toBeDefined();

    tracker.pointerUp(2);
    tracker.pointerUp(1);

    tracker.pointerDown(1, { x: 0, y: 0 });
    (
      tracker as unknown as { lastPointer: Point | null }
    ).lastPointer = null;
    expect(tracker.pointerMove(1, { x: 3, y: 3 }, 1)).toBeNull();
  });
});

describe("lightbox history", () => {
  it("pushes a hash entry so mobile back can close the popup", () => {
    const before = snapshotLocation();
    expect(pushLightboxHistory()).toBe(true);
    expect(window.location.hash).toBe(`#${LIGHTBOX_HISTORY_HASH}`);
    expect(lightboxHistoryUrl()).toContain(`#${LIGHTBOX_HISTORY_HASH}`);
    restoreLocation(before);
    expect(snapshotLocation()).toBe(before);
    restoreLocation(before);
  });

  it("swallows history write failures", () => {
    const broken = {
      location: { pathname: "/", search: "", hash: "" },
      history: {
        state: {},
        replaceState(): void {
          throw new Error("quota");
        },
        pushState(): void {
          throw new Error("quota");
        },
      },
    } as unknown as Window;
    expect(pushLightboxHistory(broken)).toBe(false);
    expect(() => restoreLocation("/other", broken)).not.toThrow();
  });
});
