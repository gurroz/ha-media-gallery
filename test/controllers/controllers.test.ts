import { describe, expect, it, vi } from "vitest";
import type {
  ReactiveController,
  ReactiveControllerHost,
} from "lit";
import { GalleryController } from "../../src/controllers/gallery.controller.js";
import { LightboxController } from "../../src/controllers/lightbox.controller.js";
import { SlideshowController } from "../../src/controllers/slideshow.controller.js";
import { MediaSourceClient } from "../../src/services/media-source.client.js";
import { createFakeHass } from "../helpers/hass.js";
import { image, root, trips } from "../helpers/fixtures.js";

class TestHost implements ReactiveControllerHost {
  readonly controllers: ReactiveController[] = [];
  readonly updateComplete = Promise.resolve(true);
  addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }
  removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);
    if (index >= 0) this.controllers.splice(index, 1);
  }
  requestUpdate(): void {}
}

describe("GalleryController", () => {
  it("owns browsing, breadcrumbs, search, and filters", async () => {
    const host = new TestHost();
    const fake = createFakeHass({
      browse: { "": root, "media-source://local/trips": trips },
    });
    const controller = new GalleryController(
      host,
      new MediaSourceClient(() => fake.hass)
    );

    await controller.loadRoot();
    expect(controller.currentItem).toBe(root);
    controller.navigate(root.children![0]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(controller.breadcrumb).toHaveLength(1);
    expect(controller.currentItem).toBe(trips);
    controller.setSearchQuery("beach");
    controller.toggleMediaFilter("images");
    expect(controller.searchQuery).toBe("beach");
    expect(controller.mediaFilter).toBe("videos");
    controller.breadcrumbClick(-1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(controller.breadcrumb).toEqual([]);
  });

  it("stores browse failures", async () => {
    const controller = new GalleryController(
      new TestHost(),
      new MediaSourceClient(() => createFakeHass({ browse: {} }).hass)
    );
    await controller.browse("missing");
    expect(controller.error).toContain("Missing media source");
    expect(controller.currentItem).toBeNull();
  });

  it("clears recursive errors on every browse", async () => {
    const fake = createFakeHass({
      browse: { "": root, "media-source://local/trips": trips },
    });
    const controller = new GalleryController(
      new TestHost(),
      new MediaSourceClient(() => fake.hass)
    );
    await controller.loadRoot();
    controller.setRecursiveError("No images found in this folder or its subfolders.");
    expect(controller.recursiveError).not.toBeNull();
    controller.navigate(root.children![0]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(controller.recursiveError).toBeNull();
  });
});

describe("LightboxController", () => {
  it("owns media, presentation, zoom, and pan state", () => {
    const controller = new LightboxController(new TestHost());
    controller.open("url", "Title");
    controller.setZoom(3);
    controller.panBy(4, 5);
    controller.enterPresentation();
    expect(controller).toMatchObject({
      url: "url",
      zoomScale: 3,
      panX: 4,
      panY: 5,
      presentationMode: true,
    });
    expect(controller.exitPresentation()).toBe(true);
    expect(controller.exitPresentation()).toBe(false);
    controller.close();
    expect(controller.url).toBeNull();
  });

  it("clamps pan to the lightbox viewport", () => {
    const controller = new LightboxController(new TestHost());
    const bounds = {
      imageWidth: 400,
      imageHeight: 300,
      viewportWidth: 400,
      viewportHeight: 300,
    };
    controller.open("url", "Title");
    controller.setZoom(2, bounds);
    controller.panBy(1000, -1000, bounds);
    expect(controller).toMatchObject({ panX: 200, panY: -150 });
    controller.setZoom(1.2, bounds);
    expect(controller).toMatchObject({ panX: 40, panY: -30 });
    controller.setZoom(1, bounds);
    expect(controller).toMatchObject({ panX: 0, panY: 0 });
  });
});

describe("SlideshowController", () => {
  it("schedules, advances, toggles, and cancels slides", async () => {
    vi.useFakeTimers();
    const shown: string[] = [];
    const controller = new SlideshowController(new TestHost(), {
      intervalSeconds: () => 2,
      order: () => "sequential",
      resolve: async (item) => `url:${item.media_content_id}`,
      show: (item) => shown.push(item.media_content_id),
    });
    await expect(controller.start([image("a"), image("b")])).resolves.toBe(
      "started"
    );
    expect(shown).toEqual(["a"]);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(shown).toEqual(["a", "b"]);
    controller.toggle();
    expect(controller.playing).toBe(false);
    controller.stop();
    expect(controller.items).toEqual([]);
    vi.useRealTimers();
  });

  it("distinguishes empty and unauthorized starts", async () => {
    const empty = new SlideshowController(new TestHost(), {
      intervalSeconds: () => 5,
      order: () => "sequential",
      resolve: async () => "url",
      show: () => undefined,
    });
    await expect(empty.start([])).resolves.toBe("empty");

    const unauthorized = new SlideshowController(new TestHost(), {
      intervalSeconds: () => 5,
      order: () => "sequential",
      resolve: async () => undefined,
      show: () => undefined,
    });
    await expect(
      unauthorized.start([image("a"), image("b")])
    ).resolves.toBe("unauthorized");
  });

  it("ignores a stale slide resolution", async () => {
    let resolveFirst: ((url: string) => void) | undefined;
    let firstCalls = 0;
    const shown: string[] = [];
    const controller = new SlideshowController(new TestHost(), {
      intervalSeconds: () => 5,
      order: () => "sequential",
      resolve: (item) =>
        item.media_content_id === "a" && firstCalls++ === 0
          ? new Promise((resolve) => {
              resolveFirst = resolve;
            })
          : Promise.resolve(`url:${item.media_content_id}`),
      show: (item) => shown.push(item.media_content_id),
    });
    controller.setItems([image("a"), image("b")]);
    const first = controller.show(0);
    await controller.show(1);
    resolveFirst?.("url:a");
    await first;
    expect(shown).toEqual(["b"]);
  });
});
