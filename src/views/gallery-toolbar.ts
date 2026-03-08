import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import type { MediaFilter } from "../domain/filters.js";
import { toolbarStyles } from "../styles/toolbar.css.js";

export class HaGalleryToolbar extends LitElement {
  @property() query = "";
  @property() filter: MediaFilter = "both";
  @property({ type: Boolean }) hasImages = false;
  @property({ type: Boolean }) hasFolders = false;
  @property({ type: Boolean }) recursiveLoading = false;

  static styles = toolbarStyles;

  protected render() {
    return html`
      <div class="gallery-toolbar">
        <div class="media-search">
          <input
            type="search"
            placeholder="Filter folders and files"
            aria-label="Filter folders and files by name"
            .value=${this.query}
            @input=${this._onSearch}
          />
          ${(
            [
              ["images", "mdi:image-outline", "Show images"],
              ["videos", "mdi:video-outline", "Show videos"],
            ] as const
          ).map(
            ([filter, icon, label]) => html`
              <button
                type="button"
                class=${`media-filter ${
                  this.filter === "both" || this.filter === filter
                    ? "active"
                    : ""
                }`}
                aria-label=${label}
                title=${label}
                aria-pressed=${this.filter === "both" || this.filter === filter}
                @click=${() => this._toggleFilter(filter)}
              >
                <ha-icon icon=${icon}></ha-icon>
              </button>
            `
          )}
        </div>
        ${this.hasImages
          ? html`
              <button
                type="button"
                class="slideshow-start icon-only"
                aria-label="Start slideshow from this folder"
                title="Start slideshow from this folder"
                @click=${() => this._emit("start-slideshow")}
              >
                <ha-icon icon="mdi:play"></ha-icon>
              </button>
            `
          : this.hasFolders
            ? html`
                <button
                  type="button"
                  class="slideshow-start icon-only"
                  aria-label=${this.recursiveLoading
                    ? "Finding images"
                    : "Play slideshow from this folder and subfolders"}
                  title=${this.recursiveLoading
                    ? "Finding images"
                    : "Play slideshow from this folder and subfolders"}
                  ?disabled=${this.recursiveLoading}
                  @click=${() => this._emit("start-recursive-slideshow")}
                >
                  <ha-icon
                    class=${this.recursiveLoading ? "loading-icon" : ""}
                    icon=${this.recursiveLoading ? "mdi:loading" : "mdi:play"}
                  ></ha-icon>
                </button>
              `
            : ""}
      </div>
    `;
  }

  private _onSearch(event: Event): void {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: { query: (event.target as HTMLInputElement).value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleFilter(filter: "images" | "videos"): void {
    this.dispatchEvent(
      new CustomEvent("toggle-filter", {
        detail: { filter },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _emit(type: string): void {
    this.dispatchEvent(
      new CustomEvent(type, { bubbles: true, composed: true })
    );
  }
}

if (!customElements.get("ha-gallery-toolbar")) {
  customElements.define("ha-gallery-toolbar", HaGalleryToolbar);
}
