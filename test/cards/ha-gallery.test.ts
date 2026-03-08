import { describe, expect, it, vi } from "vitest";
import type { ReactiveElement } from "lit";
import "../../src/ha-gallery.js";
import {
  HaGallery,
  type HaGalleryConfig,
} from "../../src/ha-gallery.js";
import { createFakeHass } from "../helpers/hass.js";
import { folder, image, root, trips } from "../helpers/fixtures.js";
import { deepQuery, deepQueryAll, dispatchInput, settle } from "../helpers/dom.js";

async function createCard(
  browse = { "": root, "media-source://local/trips": trips },
  config: HaGalleryConfig = { type: "custom:ha-gallery", title: "Gallery" }
): Promise<HaGallery> {
  const card = document.createElement("ha-gallery") as HaGallery;
  card.setConfig(config);
  card.hass = createFakeHass({ browse }).hass;
  document.body.append(card);
  await settle(card as unknown as ReactiveElement);
  return card;
}

function q(card: HaGallery, selector: string): Element | null {
  return deepQuery(card.shadowRoot, selector);
}

function qa(card: HaGallery, selector: string): Element[] {
  return deepQueryAll(card.shadowRoot, selector);
}

describe("ha-gallery", () => {
  it("renders browsed folders, images, and videos", async () => {
    const card = await createCard();

    expect(q(card, ".folder-card")?.textContent).toContain("Trips");
    expect(qa(card, ".image-wrap")).toHaveLength(2);
    expect((q(card, "img") as HTMLImageElement | null)?.alt).toBe("Sunset");
    expect(q(card, "video")?.getAttribute("aria-label")).toBe("Movie");
    expect(qa(card, ".slideshow-start")).toHaveLength(1);
    expect(
      q(card, '[aria-label="Start slideshow from this folder"]')
    ).not.toBeNull();
  });

  it("navigates into a folder and back through breadcrumbs", async () => {
    const card = await createCard();
    (q(card, ".folder-card") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);

    expect((q(card, "img") as HTMLImageElement | null)?.alt).toBe("Beach");
    expect(q(card, ".breadcrumb")?.textContent).toContain("Trips");

    (q(card, ".breadcrumb button") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    expect(q(card, ".folder-card")?.textContent).toContain("Trips");
  });

  it("filters folders and media by search text", async () => {
    const card = await createCard();
    const search = q(card, 'input[type="search"]') as HTMLInputElement;
    dispatchInput(search, "sun");
    await settle(card as unknown as ReactiveElement);

    expect(qa(card, ".folder-card")).toHaveLength(0);
    expect(qa(card, ".image-wrap")).toHaveLength(1);
    expect((q(card, "img") as HTMLImageElement | null)?.alt).toBe("Sunset");
  });

  it("cycles image and video visibility independently", async () => {
    const card = await createCard();
    const imageFilter = q(card, '[aria-label="Show images"]') as HTMLElement;
    const videoFilter = q(card, '[aria-label="Show videos"]') as HTMLElement;

    imageFilter.click();
    await settle(card as unknown as ReactiveElement);
    expect(qa(card, ".image-wrap")).toHaveLength(1);
    expect(qa(card, "video")).toHaveLength(1);
    expect(qa(card, "img")).toHaveLength(0);

    imageFilter.click();
    await settle(card as unknown as ReactiveElement);
    videoFilter.click();
    await settle(card as unknown as ReactiveElement);
    expect(qa(card, ".image-wrap")).toHaveLength(1);
    expect(qa(card, "img")).toHaveLength(1);
    expect(qa(card, "video")).toHaveLength(0);
  });

  it("opens and closes the image lightbox", async () => {
    const card = await createCard();
    (q(card, ".image-wrap img") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);

    expect(q(card, ".lightbox")).not.toBeNull();
    (q(card, ".lightbox-close") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    expect(q(card, ".lightbox")).toBeNull();
  });

  it("closes the lightbox on browser back without leaving the gallery", async () => {
    const card = await createCard();
    (q(card, ".image-wrap img") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    expect(q(card, ".lightbox")).not.toBeNull();
    expect(window.location.hash).toBe("#ha-gallery-lightbox");

    const haRouter = vi.fn();
    window.addEventListener("popstate", haRouter);
    window.dispatchEvent(new PopStateEvent("popstate"));
    await settle(card as unknown as ReactiveElement);
    window.removeEventListener("popstate", haRouter);

    expect(haRouter).not.toHaveBeenCalled();
    expect(q(card, ".lightbox")).toBeNull();
    expect(q(card, ".folder-card")?.textContent).toContain("Trips");
  });

  it("focuses the lightbox only when opening", async () => {
    const card = await createCard({
      "": folder("", "Media", [
        image("a.jpg", "A"),
        image("b.jpg", "B"),
      ]),
    });
    (q(card, ".image-wrap img") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    const lightboxHost = card.shadowRoot?.querySelector(
      "ha-gallery-lightbox"
    ) as HTMLElement;
    const lightbox = lightboxHost.shadowRoot?.querySelector(
      ".lightbox"
    ) as HTMLElement;
    expect(lightboxHost.shadowRoot?.activeElement).toBe(lightbox);

    const focusSpy = vi.spyOn(lightbox, "focus");
    (q(card, '[aria-label="Next image"]') as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("exits presentation before closing on Escape", async () => {
    const card = await createCard();
    (q(card, ".image-wrap img") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    const lightbox = q(card, ".lightbox") as HTMLElement;

    (q(card, '[aria-label="Enter presentation mode"]') as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    lightbox.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );
    await settle(card as unknown as ReactiveElement);
    expect(q(card, ".lightbox")).not.toBeNull();

    lightbox.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );
    await settle(card as unknown as ReactiveElement);
    expect(q(card, ".lightbox")).toBeNull();
  });

  it("clears recursive slideshow errors when navigating", async () => {
    const emptyFolder = folder("media-source://local/empty", "Empty", []);
    const emptyRoot = folder("", "Media", [
      folder("media-source://local/empty", "Empty"),
    ]);
    const card = await createCard({
      "": emptyRoot,
      "media-source://local/empty": emptyFolder,
    });

    (
      q(
        card,
        '[aria-label="Play slideshow from this folder and subfolders"]'
      ) as HTMLElement
    ).click();
    await settle(card as unknown as ReactiveElement);
    expect(q(card, ".error")?.textContent).toContain("No images found");

    (q(card, ".folder-card") as HTMLElement).click();
    await settle(card as unknown as ReactiveElement);
    expect(card.shadowRoot?.textContent).not.toContain("No images found");
  });

  it("renders browse and media resolution errors", async () => {
    const failedBrowse = await createCard({});
    expect(q(failedBrowse, ".error")?.textContent).toContain(
      "Missing media source"
    );

    const onlyImage = {
      "": {
        ...root,
        children: [image("broken.jpg", "Broken")],
      },
    };
    const card = document.createElement("ha-gallery") as HaGallery;
    card.setConfig({ type: "custom:ha-gallery" });
    card.hass = createFakeHass({
      browse: onlyImage,
      resolveFailures: new Set(["broken.jpg"]),
    }).hass;
    document.body.append(card);
    await settle(card as unknown as ReactiveElement);
    const error = q(card, ".media-error");
    expect(error?.textContent).toContain("Unable to authorize Broken");
    expect(error?.getAttribute("title")).toContain(
      "Unable to resolve: broken.jpg"
    );
  });

  it("exposes the expected Home Assistant card hooks", () => {
    expect(HaGallery.getStubConfig()).toEqual({
      type: "custom:ha-gallery",
      title: "Gallery",
    });
    expect(HaGallery.getConfigElement().tagName).toBe("HA-GALLERY-EDITOR");
  });
});
