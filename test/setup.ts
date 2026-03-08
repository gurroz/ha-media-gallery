import { afterEach } from "vitest";

class ImmediateIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: performance.now(),
        },
      ],
      this
    );
  }

  disconnect(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  configurable: true,
  writable: true,
  value: ImmediateIntersectionObserver,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  configurable: true,
  writable: true,
  value: ImmediateIntersectionObserver,
});

HTMLMediaElement.prototype.canPlayType = function (type: string): string {
  const normalized = type.toLowerCase().split(";")[0].trim();
  if (
    normalized === "video/mp4" ||
    normalized === "video/webm" ||
    normalized === "video/ogg"
  ) {
    return "maybe";
  }
  return "";
};

window.requestAnimationFrame = (callback) =>
  window.setTimeout(() => callback(performance.now()), 0);
window.cancelAnimationFrame = (handle) => window.clearTimeout(handle);

afterEach(() => {
  document.body.replaceChildren();
});
