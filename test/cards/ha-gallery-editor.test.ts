import { describe, expect, it, vi } from "vitest";
import type { ReactiveElement } from "lit";
import "../../src/ha-gallery.js";
import type { HaGalleryEditor } from "../../src/cards/ha-gallery-editor.js";
import { dispatchInput, settle } from "../helpers/dom.js";

describe("ha-gallery-editor", () => {
  it("emits normalized configuration changes", async () => {
    const editor = document.createElement(
      "ha-gallery-editor"
    ) as HaGalleryEditor;
    editor.setConfig({ type: "custom:ha-gallery" });
    document.body.append(editor);
    await settle(editor as unknown as ReactiveElement);
    const changed = vi.fn();
    editor.addEventListener("config-changed", changed);

    const fields = editor.shadowRoot?.querySelectorAll("input");
    dispatchInput(fields?.[0] as Element, "Family");
    expect(changed.mock.calls.at(-1)?.[0].detail.config.title).toBe("Family");

    dispatchInput(fields?.[1] as Element, "  media-source://local/photos  ");
    expect(changed.mock.calls.at(-1)?.[0].detail.config.media_content_id).toBe(
      "media-source://local/photos"
    );

    dispatchInput(fields?.[2] as Element, "999", "change");
    expect(changed.mock.calls.at(-1)?.[0].detail.config.slideshow_interval).toBe(
      300
    );

    const select = editor.shadowRoot?.querySelector("select") as HTMLSelectElement;
    select.value = "random";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(changed.mock.calls.at(-1)?.[0].detail.config.slideshow_order).toBe(
      "random"
    );
  });

  it("accepts folder selection from the preview", async () => {
    const editor = document.createElement(
      "ha-gallery-editor"
    ) as HaGalleryEditor;
    editor.setConfig({ type: "custom:ha-gallery" });
    document.body.append(editor);
    await settle(editor as unknown as ReactiveElement);
    const changed = vi.fn();
    editor.addEventListener("config-changed", changed);

    window.dispatchEvent(
      new CustomEvent("ha-gallery-folder-selected", {
        detail: { mediaContentId: "media-source://local/new-root" },
      })
    );

    expect(changed.mock.calls.at(-1)?.[0].detail.config.media_content_id).toBe(
      "media-source://local/new-root"
    );
  });
});
