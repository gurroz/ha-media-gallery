import type {
  ReactiveController,
  ReactiveControllerHost,
} from "lit";
import { clampPan, clampZoom, type PanBounds } from "../domain/zoom.js";

export type LightboxMediaType = "image" | "video";

export class LightboxController {
  url: string | null = null;
  title: string | null = null;
  mime = "";
  type: LightboxMediaType = "image";
  presentationMode = false;
  zoomScale = 1;
  panX = 0;
  panY = 0;

  constructor(private readonly host: ReactiveControllerHost) {
    // Cast required: ReactiveController's lifecycle hooks are all optional.
    host.addController(this as ReactiveController);
  }

  open(
    url: string,
    title: string,
    type: LightboxMediaType = "image",
    mime = ""
  ): void {
    this.url = url;
    this.title = title;
    this.type = type;
    this.mime = mime;
    this.presentationMode = false;
    this.resetZoom();
    this.host.requestUpdate();
  }

  setSlide(url: string, title: string): void {
    this.url = url;
    this.title = title;
    this.type = "image";
    this.mime = "";
    this.resetZoom();
    this.host.requestUpdate();
  }

  close(): void {
    this.url = null;
    this.title = null;
    this.type = "image";
    this.mime = "";
    this.presentationMode = false;
    this.resetZoom();
    this.host.requestUpdate();
  }

  enterPresentation(): void {
    this.presentationMode = true;
    this.host.requestUpdate();
  }

  exitPresentation(): boolean {
    if (!this.presentationMode) return false;
    this.presentationMode = false;
    this.host.requestUpdate();
    return true;
  }

  resetZoom(): void {
    this.zoomScale = 1;
    this.panX = 0;
    this.panY = 0;
    this.host.requestUpdate();
  }

  setZoom(scale: number, bounds?: PanBounds): void {
    this.zoomScale = clampZoom(scale);
    if (this.zoomScale === 1) {
      this.panX = 0;
      this.panY = 0;
    } else {
      this.applyPan(this.panX, this.panY, bounds);
    }
    this.host.requestUpdate();
  }

  panBy(x: number, y: number, bounds?: PanBounds): void {
    if (this.zoomScale <= 1) return;
    this.applyPan(this.panX + x, this.panY + y, bounds);
    this.host.requestUpdate();
  }

  private applyPan(x: number, y: number, bounds?: PanBounds): void {
    if (!bounds) {
      this.panX = x;
      this.panY = y;
      return;
    }
    const clamped = clampPan(x, y, this.zoomScale, bounds);
    this.panX = clamped.x;
    this.panY = clamped.y;
  }
}
