import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { BreadcrumbItem } from "../controllers/gallery.controller.js";
import { breadcrumbStyles } from "../styles/breadcrumb.css.js";

export class HaGalleryBreadcrumb extends LitElement {
  @property({ attribute: false }) items: BreadcrumbItem[] = [];

  static styles = breadcrumbStyles;

  protected render() {
    if (!this.items.length) return nothing;
    return html`
      <div class="breadcrumb">
        <button type="button" @click=${() => this._navigate(-1)}>Home</button>
        ${this.items.map(
          (item, index) => html`
            <span class="sep">/</span>
            <button type="button" @click=${() => this._navigate(index)}>
              ${item.title}
            </button>
          `
        )}
      </div>
    `;
  }

  private _navigate(index: number): void {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { index },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("ha-gallery-breadcrumb")) {
  customElements.define("ha-gallery-breadcrumb", HaGalleryBreadcrumb);
}
