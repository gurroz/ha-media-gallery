import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { LightboxMediaType } from "../controllers/lightbox.controller.js";
import { PinchTracker, type PanBounds } from "../domain/zoom.js";
import { lightboxStyles } from "../styles/lightbox.css.js";
import "./gallery-video.js";

export class HaGalleryLightbox extends LitElement {
  @property() url: string | null = null;
  @property() mediaTitle: string | null = null;
  @property() mime = "";
  @property() type: LightboxMediaType = "image";
  @property({ type: Boolean }) presentationMode = false;
  @property({ type: Number }) zoomScale = 1;
  @property({ type: Number }) panX = 0;
  @property({ type: Number }) panY = 0;
  @property({ type: Number }) slideIndex = -1;
  @property({ type: Number }) slideCount = 0;
  @property({ type: Boolean }) playing = false;
  @property({ type: Number }) progressCycle = 0;
  @property({ type: Number }) intervalSeconds = 5;

  private readonly _pinch = new PinchTracker();

  static styles = lightboxStyles;

  public focusDialog(): void {
    this.renderRoot.querySelector<HTMLElement>(".lightbox")?.focus();
  }

  public resetGestures(): void {
    this._pinch.reset();
  }

  protected render() {
    if (!this.url) return nothing;
    return html`
      <div
        class=${`lightbox${this.presentationMode ? " presentation" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label=${this.mediaTitle
          ? `Media viewer: ${this.mediaTitle}`
          : "Media viewer"}
        tabindex="0"
        @click=${(event: MouseEvent) =>
          event.target === event.currentTarget && this._emit("close")}
        @keydown=${this._onKeydown}
      >
        ${this.playing
          ? html`
              <div class="slideshow-progress" aria-hidden="true">
                <div
                  class=${`slideshow-progress-bar ${
                    this.progressCycle % 2 ? "cycle-a" : "cycle-b"
                  }`}
                  style=${`animation-duration: ${this.intervalSeconds}s`}
                ></div>
              </div>
            `
          : ""}
        ${this.type === "image"
          ? html`<span class="zoom-help">
              Pinch or scroll to zoom · Drag to pan
            </span>`
          : ""}
        <button
          type="button"
          class="lightbox-close"
          aria-label="Close"
          @click=${(event: Event) => {
            event.stopPropagation();
            this._emit("close");
          }}
        >
          ×
        </button>
        ${this.slideCount > 1
          ? html`
              <button
                type="button"
                class="slide-button previous"
                aria-label="Previous image"
                title="Previous image"
                @click=${() => this._emit("previous")}
              >
                <ha-icon icon="mdi:chevron-left"></ha-icon>
              </button>
              <button
                type="button"
                class="slide-button next"
                aria-label="Next image"
                title="Next image"
                @click=${() => this._emit("next")}
              >
                <ha-icon icon="mdi:chevron-right"></ha-icon>
              </button>
            `
          : ""}
        ${this.type === "image"
          ? html`
              <div class="slideshow-controls">
                <button
                  type="button"
                  class="slideshow-toggle"
                  aria-label="Download"
                  title="Download"
                  @click=${(event: Event) =>
                    this._emit("download", { event })}
                >
                  <ha-icon icon="mdi:download"></ha-icon>
                </button>
                ${this.slideCount > 1
                  ? html`
                      <button
                        type="button"
                        class="slideshow-toggle"
                        aria-label=${this.playing
                          ? "Pause slideshow"
                          : "Play slideshow"}
                        title=${this.playing
                          ? "Pause slideshow"
                          : "Play slideshow"}
                        @click=${() => this._emit("toggle-slideshow")}
                      >
                        <ha-icon
                          icon=${this.playing ? "mdi:pause" : "mdi:play"}
                        ></ha-icon>
                      </button>
                      <span>${this.slideIndex + 1} / ${this.slideCount}</span>
                    `
                  : ""}
                <button
                  type="button"
                  class="slideshow-toggle"
                  aria-label="Enter presentation mode"
                  title="Enter presentation mode"
                  @click=${() => this._emit("enter-presentation")}
                >
                  <ha-icon icon="mdi:fullscreen"></ha-icon>
                </button>
              </div>
            `
          : ""}
        ${this.type === "video"
          ? html`
              <ha-gallery-video
                class="lightbox-content video"
                .url=${this.url}
                .mime=${this.mime}
                .mediaTitle=${this.mediaTitle ?? ""}
              ></ha-gallery-video>
            `
          : html`
              <img
                class="lightbox-content"
                src=${this.url}
                alt=${this.mediaTitle ?? ""}
                loading="eager"
                draggable="false"
                style=${`transform: translate(${this.panX}px, ${this.panY}px) scale(${this.zoomScale})`}
                @wheel=${this._onWheel}
                @pointerdown=${this._onPointerDown}
                @pointermove=${this._onPointerMove}
                @pointerup=${this._onPointerUp}
                @pointercancel=${this._onPointerUp}
              />
            `}
        ${this.mediaTitle
          ? html`<span class="lightbox-title">${this.mediaTitle}</span>`
          : ""}
      </div>
    `;
  }

  private _emit(type: string, detail: unknown = {}): void {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onKeydown(event: KeyboardEvent): void {
    this._emit("keydown", { event });
  }

  private _onWheel(event: WheelEvent): void {
    event.preventDefault();
    this._emit("zoom", {
      scale: this.zoomScale * (event.deltaY < 0 ? 1.2 : 1 / 1.2),
      bounds: this._viewportBounds(),
    });
  }

  private _onPointerDown(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this._pinch.pointerDown(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  }

  private _onPointerMove(event: PointerEvent): void {
    const result = this._pinch.pointerMove(
      event.pointerId,
      { x: event.clientX, y: event.clientY },
      this.zoomScale
    );
    if (!result) return;
    const bounds = this._viewportBounds();
    if (result.zoomFactor !== undefined) {
      this._emit("zoom", {
        scale: this.zoomScale * result.zoomFactor,
        bounds,
      });
    }
    if (result.panX !== undefined && result.panY !== undefined) {
      this._emit("pan", { x: result.panX, y: result.panY, bounds });
    }
  }

  private _viewportBounds(): PanBounds | undefined {
    const image = this.renderRoot.querySelector<HTMLImageElement>(
      "img.lightbox-content"
    );
    const viewport = this.renderRoot.querySelector<HTMLElement>(".lightbox");
    if (!image || !viewport) return undefined;
    const imageWidth = image.offsetWidth;
    const imageHeight = image.offsetHeight;
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    if (
      imageWidth <= 0 ||
      imageHeight <= 0 ||
      viewportWidth <= 0 ||
      viewportHeight <= 0
    ) {
      return undefined;
    }
    return { imageWidth, imageHeight, viewportWidth, viewportHeight };
  }

  private _onPointerUp(event: PointerEvent): void {
    this._pinch.pointerUp(event.pointerId);
  }
}

if (!customElements.get("ha-gallery-lightbox")) {
  customElements.define("ha-gallery-lightbox", HaGalleryLightbox);
}
