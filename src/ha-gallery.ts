import "./cards/ha-gallery-card.js";
import "./cards/ha-gallery-editor.js";

export type { HaGalleryConfig } from "./domain/config.js";
export { HaGallery } from "./cards/ha-gallery-card.js";
export { HaGalleryEditor } from "./cards/ha-gallery-editor.js";

declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "ha-gallery")) {
  window.customCards.push({
    type: "ha-gallery",
    name: "HA Gallery",
    description: "Gallery frontend for Home Assistant",
  });
}
