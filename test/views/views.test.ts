import { describe, expect, it, vi } from "vitest";
import type { ReactiveElement } from "lit";
import "../../src/views/gallery-breadcrumb.js";
import "../../src/views/gallery-folder-grid.js";
import "../../src/views/gallery-toolbar.js";
import "../../src/views/gallery-media-grid.js";
import "../../src/views/gallery-lightbox.js";
import type { HaGalleryBreadcrumb } from "../../src/views/gallery-breadcrumb.js";
import type { HaGalleryFolderGrid } from "../../src/views/gallery-folder-grid.js";
import type { HaGalleryToolbar } from "../../src/views/gallery-toolbar.js";
import type { HaGalleryMediaGrid } from "../../src/views/gallery-media-grid.js";
import type { HaGalleryLightbox } from "../../src/views/gallery-lightbox.js";
import { folder, image, video } from "../helpers/fixtures.js";
import { settle } from "../helpers/dom.js";

describe("view elements", () => {
  it("breadcrumb emits navigate events", async () => {
    const el = document.createElement(
      "ha-gallery-breadcrumb"
    ) as HaGalleryBreadcrumb;
    el.items = [{ id: "a", title: "Album" }];
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);
    const navigate = vi.fn();
    el.addEventListener("navigate", navigate);
    (el.shadowRoot?.querySelector("button") as HTMLElement).click();
    expect(navigate.mock.calls[0][0].detail.index).toBe(-1);
  });

  it("folder grid emits folder-open", async () => {
    const el = document.createElement(
      "ha-gallery-folder-grid"
    ) as HaGalleryFolderGrid;
    el.folders = [folder("id", "Photos")];
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);
    const open = vi.fn();
    el.addEventListener("folder-open", open);
    (el.shadowRoot?.querySelector(".folder-card") as HTMLElement).click();
    expect(open.mock.calls[0][0].detail.item.title).toBe("Photos");
  });

  it("toolbar emits search and filter events", async () => {
    const el = document.createElement("ha-gallery-toolbar") as HaGalleryToolbar;
    el.hasImages = true;
    el.hasFolders = true;
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);
    const search = vi.fn();
    const filter = vi.fn();
    const slideshow = vi.fn();
    el.addEventListener("search", search);
    el.addEventListener("toggle-filter", filter);
    el.addEventListener("start-slideshow", slideshow);

    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "cat";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(search.mock.calls[0][0].detail.query).toBe("cat");

    (
      el.shadowRoot?.querySelector(
        '[aria-label="Show images"]'
      ) as HTMLElement
    ).click();
    expect(filter.mock.calls[0][0].detail.filter).toBe("images");

    (
      el.shadowRoot?.querySelector(
        '[aria-label="Start slideshow from this folder"]'
      ) as HTMLElement
    ).click();
    expect(slideshow).toHaveBeenCalledOnce();
  });

  it("toolbar shows one slideshow button for mixed folders and images", async () => {
    const el = document.createElement("ha-gallery-toolbar") as HaGalleryToolbar;
    el.hasImages = true;
    el.hasFolders = true;
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);

    expect(el.shadowRoot?.querySelectorAll(".slideshow-start")).toHaveLength(1);
    expect(
      el.shadowRoot?.querySelector(
        '[aria-label="Start slideshow from this folder"]'
      )
    ).not.toBeNull();
    expect(
      el.shadowRoot?.querySelector(
        '[aria-label="Play slideshow from this folder and subfolders"]'
      )
    ).toBeNull();
  });

  it("toolbar shows recursive slideshow when only folders are present", async () => {
    const el = document.createElement("ha-gallery-toolbar") as HaGalleryToolbar;
    el.hasFolders = true;
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);
    const recursive = vi.fn();
    el.addEventListener("start-recursive-slideshow", recursive);

    expect(el.shadowRoot?.querySelectorAll(".slideshow-start")).toHaveLength(1);
    (
      el.shadowRoot?.querySelector(
        '[aria-label="Play slideshow from this folder and subfolders"]'
      ) as HTMLElement
    ).click();
    expect(recursive).toHaveBeenCalledOnce();
  });

  it("media grid emits open and download events", async () => {
    const el = document.createElement(
      "ha-gallery-media-grid"
    ) as HaGalleryMediaGrid;
    const photo = image("photo.jpg", "Photo");
    const clip = video("clip.mp4", "Clip");
    el.media = [photo, clip];
    el.images = [photo];
    el.urls = {
      "photo.jpg": "https://example.test/photo.jpg",
      "clip.mp4": "https://example.test/clip.mp4",
    };
    el.mimes = {
      "photo.jpg": "image/jpeg",
      "clip.mp4": "video/mp4",
    };
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);

    const openImage = vi.fn();
    const openVideo = vi.fn();
    const download = vi.fn();
    el.addEventListener("open-image", openImage);
    el.addEventListener("open-video", openVideo);
    el.addEventListener("download", download);

    (el.shadowRoot?.querySelector("img") as HTMLElement).click();
    expect(openImage.mock.calls[0][0].detail.title).toBe("Photo");
    (el.shadowRoot?.querySelector("video") as HTMLElement).click();
    expect(openVideo.mock.calls[0][0].detail).toMatchObject({
      title: "Clip",
      mime: "video/mp4",
    });
    (
      el.shadowRoot?.querySelector(
        '[aria-label="Download"]'
      ) as HTMLElement
    ).click();
    expect(download).toHaveBeenCalled();
  });

  it("lightbox emits close, navigation, zoom, and pan events", async () => {
    const el = document.createElement(
      "ha-gallery-lightbox"
    ) as HaGalleryLightbox;
    el.url = "https://example.test/a.jpg";
    el.mediaTitle = "A";
    el.slideCount = 2;
    el.slideIndex = 0;
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);

    const close = vi.fn();
    const next = vi.fn();
    const zoom = vi.fn();
    el.addEventListener("close", close);
    el.addEventListener("next", next);
    el.addEventListener("zoom", zoom);

    (el.shadowRoot?.querySelector(".lightbox-close") as HTMLElement).click();
    expect(close).toHaveBeenCalledOnce();
    (
      el.shadowRoot?.querySelector(
        '[aria-label="Next image"]'
      ) as HTMLElement
    ).click();
    expect(next).toHaveBeenCalledOnce();

    const image = el.shadowRoot?.querySelector(
      ".lightbox-content"
    ) as HTMLElement;
    image.dispatchEvent(
      new WheelEvent("wheel", { deltaY: -10, bubbles: true })
    );
    expect(zoom.mock.calls[0][0].detail.scale).toBeGreaterThan(1);
  });

  it("lightbox shows an unsupported overlay for AVI", async () => {
    const el = document.createElement(
      "ha-gallery-lightbox"
    ) as HaGalleryLightbox;
    el.url = "https://example.test/clip.avi";
    el.mime = "video/x-msvideo";
    el.type = "video";
    el.mediaTitle = "Clip";
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);
    const player = el.shadowRoot?.querySelector(
      "ha-gallery-video"
    ) as HaGalleryLightbox;
    await settle(player as unknown as ReactiveElement);

    expect(player.shadowRoot?.textContent).toContain(
      "This browser cannot play this format"
    );
    expect(player.shadowRoot?.textContent).toContain("AVI");

    const download = vi.fn();
    el.addEventListener("download", download);
    (
      player.shadowRoot?.querySelector("button") as HTMLElement
    ).click();
    expect(download).toHaveBeenCalledOnce();
  });

  it("media grid uses a placeholder for non-native video", async () => {
    const el = document.createElement(
      "ha-gallery-media-grid"
    ) as HaGalleryMediaGrid;
    const clip = {
      ...video("clip.avi", "Avi"),
      media_content_type: "video/x-msvideo",
    };
    el.media = [clip];
    el.urls = { "clip.avi": "https://example.test/clip.avi" };
    el.mimes = { "clip.avi": "video/x-msvideo" };
    document.body.append(el);
    await settle(el as unknown as ReactiveElement);

    expect(el.shadowRoot?.querySelector("video")).toBeNull();
    const placeholder = el.shadowRoot?.querySelector(
      ".video-placeholder"
    ) as HTMLElement;
    expect(placeholder).not.toBeNull();

    const openVideo = vi.fn();
    el.addEventListener("open-video", openVideo);
    placeholder.click();
    expect(openVideo.mock.calls[0][0].detail.mime).toBe("video/x-msvideo");
  });
});
