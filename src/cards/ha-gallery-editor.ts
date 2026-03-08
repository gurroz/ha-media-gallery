import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import type { HaGalleryConfig } from "../domain/config.js";
import { slideshowIntervalSeconds } from "../domain/config.js";

export class HaGalleryEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: HaGalleryConfig;

  private _folderSelected = (ev: Event): void => {
    if (!this._config) return;
    const mediaContentId = (
      ev as CustomEvent<{ mediaContentId?: string }>
    ).detail?.mediaContentId;
    if (!mediaContentId || mediaContentId === this._config.media_content_id) {
      return;
    }
    this._config = {
      ...this._config,
      media_content_id: mediaContentId,
    };
    this._fireChanged();
  };

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(
      "ha-gallery-folder-selected",
      this._folderSelected
    );
  }

  public disconnectedCallback(): void {
    window.removeEventListener(
      "ha-gallery-folder-selected",
      this._folderSelected
    );
    super.disconnectedCallback();
  }

  public setConfig(config: HaGalleryConfig): void {
    this._config = config;
  }

  static styles = css`
    .card-config label {
      display: block;
      margin-bottom: 16px;
    }
    .card-config label span {
      display: block;
      margin-bottom: 6px;
      color: var(--primary-text-color);
      font-size: 0.875rem;
    }
    .card-config .helper {
      display: block;
      margin-top: 6px;
      color: var(--secondary-text-color);
      font-size: 0.75rem;
      line-height: 1.4;
    }
    .card-config input,
    .card-config select {
      width: 100%;
      box-sizing: border-box;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }
  `;

  private _titleChanged(ev: Event): void {
    if (!this._config) return;
    const title = (ev.target as HTMLInputElement).value;
    this._config = { ...this._config, title: title || undefined };
    this._fireChanged();
  }

  private _mediaIdChanged(ev: Event): void {
    if (!this._config) return;
    const raw = (ev.target as HTMLInputElement).value.trim();
    this._config = {
      ...this._config,
      media_content_id: raw || undefined,
    };
    this._fireChanged();
  }

  private _intervalChanged(ev: Event): void {
    if (!this._config) return;
    const value = Number((ev.target as HTMLInputElement).value);
    this._config = {
      ...this._config,
      slideshow_interval: slideshowIntervalSeconds(value),
    };
    this._fireChanged();
  }

  private _orderChanged(ev: Event): void {
    if (!this._config) return;
    const value = (ev.target as HTMLSelectElement).value;
    this._config = {
      ...this._config,
      slideshow_order: value === "random" ? "random" : "sequential",
    };
    this._fireChanged();
  }

  private _fireChanged(): void {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  protected render() {
    if (!this._config) return html``;

    return html`
      <div class="card-config">
        <label>
          <span>Title</span>
          <input
            type="text"
            .value=${this._config.title ?? ""}
            placeholder="Gallery"
            @input=${this._titleChanged}
          />
        </label>
        <label>
          <span>Start folder (Media Source ID)</span>
          <input
            type="text"
            .value=${this._config.media_content_id ?? ""}
            placeholder="media-source://media_source/local"
            @input=${this._mediaIdChanged}
          />
          <span class="helper"
            >Click a folder in the card preview to select it as the root, or
            leave empty to open the Media Browser root.</span
          >
        </label>
        <label>
          <span>Slideshow speed (seconds)</span>
          <input
            type="number"
            min="1"
            max="300"
            step="1"
            .value=${String(this._config.slideshow_interval ?? 5)}
            @change=${this._intervalChanged}
          />
        </label>
        <label>
          <span>Slideshow order</span>
          <select @change=${this._orderChanged}>
            <option
              value="sequential"
              ?selected=${(this._config.slideshow_order ?? "sequential") ===
              "sequential"}
            >
              Sequential
            </option>
            <option
              value="random"
              ?selected=${this._config.slideshow_order === "random"}
            >
              Random
            </option>
          </select>
        </label>
      </div>
    `;
  }
}

if (!customElements.get("ha-gallery-editor")) {
  customElements.define("ha-gallery-editor", HaGalleryEditor);
}
