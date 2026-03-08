import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import type { HaGalleryConfig } from "./ha-gallery.js";

@customElement("ha-gallery-editor")
export class HaGalleryEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: HaGalleryConfig;

  public setConfig(config: HaGalleryConfig): void {
    this._config = config;
  }

  static styles = css`
    .card-config ha-textfield {
      display: block;
      margin-bottom: 16px;
    }
  `;

  private _titleChanged(ev: CustomEvent): void {
    if (!this._config) return;
    const title = (ev.target as HTMLInputElement).value;
    this._config = { ...this._config, title: title || undefined };
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
        <ha-textfield
          .label=${"Title"}
          .value=${this._config.title ?? ""}
          .placeholder=${"Gallery"}
          @input=${this._titleChanged}
        ></ha-textfield>
      </div>
    `;
  }
}
