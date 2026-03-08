import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { BrowseMediaSource } from "../domain/media.js";
import { isVideoItem } from "../domain/media.js";
import {
  browserCanPlayType,
  classifyPlayback,
} from "../domain/video.js";
import { mediaGridStyles } from "../styles/media-grid.css.js";

export class HaGalleryMediaGrid extends LitElement {
  @property({ attribute: false }) media: BrowseMediaSource[] = [];
  @property({ attribute: false }) images: BrowseMediaSource[] = [];
  @property({ attribute: false }) urls: Record<string, string> = {};
  @property({ attribute: false }) mimes: Record<string, string> = {};
  @property({ attribute: false }) errors: Record<string, string> = {};

  static styles = mediaGridStyles;

  protected render() {
    if (!this.media.length) return nothing;
    return html`
      <div class="images">
        ${this.media.map((item) => {
          const url = this.urls[item.media_content_id];
          const error = this.errors[item.media_content_id];
          if (!url) {
            return html`
              <div
                class="image-wrap"
                data-media-id=${error ? nothing : item.media_content_id}
              >
                ${error
                  ? html`<div class="media-error" title=${error}>
                      Unable to authorize ${item.title}
                    </div>`
                  : html`<div class="media-loading">
                      <ha-icon icon="mdi:loading"></ha-icon>
                    </div>`}
              </div>
            `;
          }
          const video = isVideoItem(item);
          const mime =
            this.mimes[item.media_content_id] ?? item.media_content_type ?? "";
          const preview =
            video &&
            classifyPlayback(mime, url, browserCanPlayType) === "native";
          return html`
            <div class="image-wrap">
              ${video
                ? html`
                    ${preview
                      ? html`
                          <video
                            src=${url}
                            aria-label=${item.title}
                            preload="metadata"
                            muted
                            playsinline
                            @click=${() =>
                              this._emit("open-video", {
                                url,
                                title: item.title,
                                mime,
                              })}
                          ></video>
                        `
                      : html`
                          <button
                            type="button"
                            class="video-placeholder"
                            aria-label=${item.title}
                            @click=${() =>
                              this._emit("open-video", {
                                url,
                                title: item.title,
                                mime,
                              })}
                          >
                            <ha-icon icon="mdi:filmstrip"></ha-icon>
                          </button>
                        `}
                    <div class="play-overlay">
                      <ha-icon icon="mdi:play-circle"></ha-icon>
                    </div>
                  `
                : html`
                    <img
                      src=${url}
                      alt=${item.title}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      @click=${() =>
                        this._emit("open-image", {
                          url,
                          title: item.title,
                          items: this.images,
                          index: this.images.indexOf(item),
                        })}
                    />
                  `}
              <div class="actions">
                <button
                  type="button"
                  aria-label="Download"
                  title="Download"
                  @click=${(event: Event) =>
                    this._emit("download", {
                      url,
                      title: item.title,
                      event,
                    })}
                >
                  <ha-icon icon="mdi:download"></ha-icon>
                </button>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _emit(type: string, detail: unknown): void {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("ha-gallery-media-grid")) {
  customElements.define("ha-gallery-media-grid", HaGalleryMediaGrid);
}
