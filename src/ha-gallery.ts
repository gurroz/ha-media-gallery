import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";

import "./ha-gallery-editor.js";
import type { BrowseMediaSource } from "./types.js";
import {
  isImageItem,
  isFolderItem,
  mediaContentUrl,
} from "./types.js";

declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}

export type HaGalleryConfig = {
  type: "custom:ha-gallery";
  title?: string;
};

window.customCards = window.customCards || [];
window.customCards.push({
  type: "custom:ha-gallery",
  name: "HA Gallery",
  description: "Gallery frontend for Home Assistant",
});

@customElement("ha-gallery")
export class HaGallery extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: HaGalleryConfig;
  @state() private _currentItem: BrowseMediaSource | null = null;
  @state() private _breadcrumb: Array<{ id: string; title: string }> = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _lightboxUrl: string | null = null;
  @state() private _lightboxTitle: string | null = null;

  public setConfig(config: HaGalleryConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._loadRoot();
  }

  private async _loadRoot(): Promise<void> {
    await this._browse("");
  }

  private async _browse(mediaContentId: string): Promise<void> {
    if (!this.hass?.connection) return;
    this._loading = true;
    this._error = null;
    try {
      const result = await this.hass.callWS<BrowseMediaSource>({
        type: "media_source/browse_media",
        media_content_id: mediaContentId || "",
      });
      this._currentItem = result;
      if (!mediaContentId) {
        this._breadcrumb = [];
      }
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
      this._currentItem = null;
    } finally {
      this._loading = false;
    }
  }

  private _navigateTo(item: BrowseMediaSource): void {
    if (item.can_expand && item.children) {
      this._currentItem = item;
      this._breadcrumb = [
        ...this._breadcrumb,
        { id: item.media_content_id, title: item.title },
      ];
      return;
    }
    if (item.can_expand && !item.children) {
      this._browse(item.media_content_id);
      this._breadcrumb = [
        ...this._breadcrumb,
        { id: item.media_content_id, title: item.title },
      ];
    }
  }

  private _breadcrumbClick(index: number): void {
    const target = index < 0 ? "" : this._breadcrumb[index].id;
    this._breadcrumb = this._breadcrumb.slice(0, index);
    if (target) {
      this._browse(target);
    } else {
      this._loadRoot();
    }
  }

  private _imageUrl(item: BrowseMediaSource): string {
    return mediaContentUrl(item.media_content_id);
  }

  private _openLightbox(url: string, title: string): void {
    this._lightboxUrl = url;
    this._lightboxTitle = title;
  }

  private _closeLightbox(): void {
    this._lightboxUrl = null;
    this._lightboxTitle = null;
  }

  private _downloadImage(url: string, filename: string, ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "image";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public getCardSize(): number {
    return 4;
  }

  static getStubConfig(): HaGalleryConfig {
    return {
      type: "custom:ha-gallery",
      title: "Gallery",
    };
  }

  static getConfigElement() {
    return document.createElement("ha-gallery-editor");
  }

  static styles = css`
    :host {
      display: block;
      padding: 0;
    }
    .card {
      background: var(--ha-card-background, var(--card-background-color, white));
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
      overflow: hidden;
    }
    .header {
      padding: 12px 16px;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: var(--secondary-background-color, #f5f5f5);
      font-size: 0.875rem;
      color: var(--secondary-text-color);
    }
    .breadcrumb button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--primary-color, #03a9f4);
    }
    .breadcrumb button:hover {
      background: var(--primary-color);
      color: var(--card-background-color, white);
    }
    .breadcrumb .sep {
      opacity: 0.6;
    }
    .content {
      padding: 16px;
      min-height: 120px;
    }
    .folders {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .folder-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.2s, border-color 0.2s;
    }
    .folder-card:hover {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color);
    }
    .folder-card ha-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      --mdc-icon-size: 48px;
    }
    .folder-card span {
      text-align: center;
      word-break: break-word;
      font-size: 0.875rem;
    }
    .images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }
    .image-wrap {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      background: var(--secondary-background-color, #eee);
      aspect-ratio: 1;
    }
    .image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }
    .image-wrap .actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      opacity: 0;
      transition: opacity 0.2s;
    }
    .image-wrap:hover .actions {
      opacity: 1;
    }
    .image-wrap .actions button {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .image-wrap .actions button:hover {
      background: #fff;
    }
    .loading,
    .error {
      text-align: center;
      padding: 24px;
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color, #b00020);
    }
    /* Lightbox */
    .lightbox {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .lightbox .lightbox-content {
      max-width: 95vw;
      max-height: 90vh;
      object-fit: contain;
      pointer-events: none;
    }
    .lightbox .lightbox-title {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 0.875rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }
    .lightbox .lightbox-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #fff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lightbox .lightbox-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;

  protected render() {
    if (!this._config) return nothing;

    const title = this._config.title ?? "Gallery";
    const folders = this._currentItem?.children?.filter(isFolderItem) ?? [];
    const images = this._currentItem?.children?.filter(isImageItem) ?? [];

    return html`
      <ha-card class="card">
        <div class="header">${title}</div>

        ${this._breadcrumb.length
          ? html`
              <div class="breadcrumb">
                <button type="button" @click=${() => this._breadcrumbClick(-1)}>
                  Home
                </button>
                ${this._breadcrumb.map(
                  (b, i) => html`
                    <span class="sep">/</span>
                    <button type="button" @click=${() => this._breadcrumbClick(i)}>
                      ${b.title}
                    </button>
                  `
                )}
              </div>
            `
          : ""}

        <div class="content">
          ${this._loading
            ? html`<div class="loading">Loading…</div>`
            : this._error
              ? html`<div class="error">${this._error}</div>`
              : html`
                  ${folders.length
                    ? html`
                        <div class="folders">
                          ${folders.map(
                            (item) => html`
                              <div
                                class="folder-card"
                                role="button"
                                tabindex="0"
                                @click=${() => this._navigateTo(item)}
                                @keydown=${(ev: KeyboardEvent) =>
                                  (ev.key === "Enter" || ev.key === " ") &&
                                  this._navigateTo(item)}
                              >
                                <ha-icon icon="mdi:folder"></ha-icon>
                                <span>${item.title}</span>
                              </div>
                            `
                          )}
                        </div>
                      `
                    : ""}
                  ${images.length
                    ? html`
                        <div class="images">
                          ${images.map(
                            (item) => html`
                              <div class="image-wrap">
                                <img
                                  src=${this._imageUrl(item)}
                                  alt=${item.title}
                                  loading="lazy"
                                  @click=${() =>
                                    this._openLightbox(
                                      this._imageUrl(item),
                                      item.title
                                    )}
                                />
                                <div class="actions">
                                  <button
                                    type="button"
                                    @click=${(ev: Event) =>
                                      this._openLightbox(
                                        this._imageUrl(item),
                                        item.title
                                      )}
                                  >
                                    <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
                                    Zoom
                                  </button>
                                  <button
                                    type="button"
                                    @click=${(ev: Event) =>
                                      this._downloadImage(
                                        this._imageUrl(item),
                                        item.title,
                                        ev
                                      )}
                                  >
                                    <ha-icon icon="mdi:download"></ha-icon>
                                    Download
                                  </button>
                                </div>
                              </div>
                            `
                          )}
                        </div>
                      `
                    : ""}
                  ${!this._loading &&
                  !this._error &&
                  this._currentItem &&
                  !folders.length &&
                  !images.length
                    ? html`<div class="loading">No images in this folder.</div>`
                    : ""}
                `}
        </div>
      </ha-card>

      ${this._lightboxUrl
        ? html`
            <div
              class="lightbox"
              role="button"
              tabindex="0"
              @click=${this._closeLightbox}
              @keydown=${(ev: KeyboardEvent) =>
                ev.key === "Escape" && this._closeLightbox()}
            >
              <button
                type="button"
                class="lightbox-close"
                aria-label="Close"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._closeLightbox();
                }}
              >
                ×
              </button>
              <img
                class="lightbox-content"
                src=${this._lightboxUrl}
                alt=${this._lightboxTitle ?? ""}
                loading="eager"
              />
              ${this._lightboxTitle
                ? html`<span class="lightbox-title">${this._lightboxTitle}</span>`
                : ""}
            </div>
          `
        : ""}
    `;
  }
}
