import { LitElement, html, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import Hls from "hls.js/light";
import {
  browserCanPlayType,
  classifyPlayback,
  formatLabel,
  type PlaybackStrategy,
} from "../domain/video.js";
import { galleryVideoStyles } from "../styles/gallery-video.css.js";

const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;

export class HaGalleryVideo extends LitElement {
  @property() url = "";
  @property() mime = "";
  @property() mediaTitle = "";

  @state() private _playUrl = "";
  @state() private _unsupported = false;
  @state() private _loading = false;

  private _hls: Hls | null = null;
  private _objectUrl: string | null = null;
  private _triedRemap = false;
  private _strategy: PlaybackStrategy = "native";
  private _sourceKey = "";
  private _generation = 0;

  static styles = galleryVideoStyles;

  disconnectedCallback(): void {
    this._teardown();
    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues): void {
    if (!changed.has("url") && !changed.has("mime")) return;
    const key = `${this.url}|${this.mime}`;
    if (key === this._sourceKey) return;
    this._sourceKey = key;
    void this._start();
  }

  protected render() {
    if (this._unsupported) {
      const format = formatLabel(this.mime, this.url);
      return html`
        <div class="unsupported" role="status">
          <h2>This browser cannot play this format</h2>
          <p>
            ${format} files cannot be decoded by this browser. Convert to H.264
            MP4 to watch them in the dashboard.
          </p>
          <button
            type="button"
            @click=${(event: Event) => this._emit("download", { event })}
          >
            Download
          </button>
        </div>
      `;
    }
    if (this._loading) {
      return html`<div class="video-loading">Loading…</div>`;
    }
    if (!this._playUrl) return nothing;
    return html`
      <video
        class="lightbox-content video"
        src=${this._strategy === "hls" ? nothing : this._playUrl}
        controls
        autoplay
        playsinline
        aria-label=${this.mediaTitle || "Video"}
        @error=${this._onNativeError}
      ></video>
    `;
  }

  private async _start(): Promise<void> {
    const generation = ++this._generation;
    this._teardown();
    this._unsupported = false;
    this._loading = false;
    this._triedRemap = false;
    this._playUrl = "";
    if (!this.url) return;

    this._strategy = classifyPlayback(this.mime, this.url, browserCanPlayType);
    if (this._strategy === "unsupported") {
      this._unsupported = true;
      return;
    }
    if (this._strategy === "remap") {
      await this._remap(generation);
      return;
    }

    this._playUrl = this.url;
    await this.updateComplete;
    if (generation !== this._generation) return;
    if (this._strategy === "hls") this._attachHls();
  }

  private _attachHls(): void {
    const video = this.renderRoot.querySelector("video");
    if (!video) {
      this._unsupported = true;
      return;
    }
    if (browserCanPlayType("application/vnd.apple.mpegurl")) {
      video.src = this.url;
      return;
    }
    if (!Hls.isSupported()) {
      this._unsupported = true;
      return;
    }
    this._hls = new Hls();
    this._hls.loadSource(this.url);
    this._hls.attachMedia(video);
    this._hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) this._unsupported = true;
    });
  }

  private async _remap(generation = this._generation): Promise<void> {
    if (this._triedRemap) {
      this._unsupported = true;
      return;
    }
    this._triedRemap = true;
    this._loading = true;
    try {
      const response = await fetch(this.url);
      if (!response.ok) throw new Error("Unable to load video");
      const blob = await response.blob();
      if (generation !== this._generation) return;
      this._revokeObjectUrl();
      this._objectUrl = URL.createObjectURL(
        new Blob([blob], { type: "video/mp4" })
      );
      this._playUrl = this._objectUrl;
      this._strategy = "native";
    } catch {
      if (generation !== this._generation) return;
      this._unsupported = true;
    } finally {
      if (generation === this._generation) this._loading = false;
    }
  }

  private _onNativeError(): void {
    const video = this.renderRoot.querySelector("video");
    if (video?.error?.code !== MEDIA_ERR_SRC_NOT_SUPPORTED) return;
    if (this._strategy === "hls" || this._triedRemap) {
      this._unsupported = true;
      return;
    }
    void this._remap();
  }

  private _teardown(): void {
    this._hls?.destroy();
    this._hls = null;
    this._revokeObjectUrl();
  }

  private _revokeObjectUrl(): void {
    if (!this._objectUrl) return;
    URL.revokeObjectURL(this._objectUrl);
    this._objectUrl = null;
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
}

if (!customElements.get("ha-gallery-video")) {
  customElements.define("ha-gallery-video", HaGalleryVideo);
}
