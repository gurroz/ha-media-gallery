import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { BrowseMediaSource } from "../domain/media.js";
import { folderGridStyles } from "../styles/folder-grid.css.js";

export class HaGalleryFolderGrid extends LitElement {
  @property({ attribute: false }) folders: BrowseMediaSource[] = [];

  static styles = folderGridStyles;

  protected render() {
    if (!this.folders.length) return nothing;
    return html`
      <div class="folders">
        ${this.folders.map(
          (item) => html`
            <div
              class="folder-card"
              role="button"
              tabindex="0"
              @click=${() => this._navigate(item)}
              @keydown=${(event: KeyboardEvent) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  this._navigate(item);
                }
              }}
            >
              <ha-icon icon="mdi:folder"></ha-icon>
              <span>${item.title}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  private _navigate(item: BrowseMediaSource): void {
    this.dispatchEvent(
      new CustomEvent("folder-open", {
        detail: { item },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("ha-gallery-folder-grid")) {
  customElements.define("ha-gallery-folder-grid", HaGalleryFolderGrid);
}
