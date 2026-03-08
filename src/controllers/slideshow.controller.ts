import type {
  ReactiveController,
  ReactiveControllerHost,
} from "lit";
import type { BrowseMediaSource } from "../domain/media.js";
import { isImageItem } from "../domain/media.js";
import {
  normalizeSlideIndex,
  orderSlideshowItems,
  prefetchIndices,
} from "../domain/slideshow.js";

export type SlideshowStart = "started" | "empty" | "unauthorized";

export interface SlideshowOptions {
  intervalSeconds: () => number;
  order: () => "sequential" | "random";
  resolve: (
    item: BrowseMediaSource,
    expires: number
  ) => Promise<string | undefined>;
  show: (item: BrowseMediaSource, url: string) => void;
  setTimeout?: typeof window.setTimeout;
  clearTimeout?: typeof window.clearTimeout;
}

export class SlideshowController {
  items: BrowseMediaSource[] = [];
  index = -1;
  playing = false;
  progressCycle = 0;
  expires = 3_600;

  private timer: number | null = null;
  private request = 0;
  private readonly setTimer: typeof window.setTimeout;
  private readonly clearTimer: typeof window.clearTimeout;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: SlideshowOptions
  ) {
    host.addController(this as ReactiveController);
    this.setTimer = options.setTimeout ?? window.setTimeout.bind(window);
    this.clearTimer = options.clearTimeout ?? window.clearTimeout.bind(window);
  }

  hostDisconnected(): void {
    this.stop();
  }

  setItems(items: BrowseMediaSource[], index = -1): void {
    this.clearSchedule();
    this.items = items.filter(isImageItem);
    this.index =
      index >= 0
        ? this.items.findIndex(
            (item) => items[index]?.media_content_id === item.media_content_id
          )
        : -1;
    this.playing = false;
    this.expires = 3_600;
    this.prefetch();
    this.host.requestUpdate();
  }

  async start(
    items: BrowseMediaSource[],
    expires = 3_600
  ): Promise<SlideshowStart> {
    const playable = orderSlideshowItems(
      items.filter(isImageItem),
      this.options.order()
    );
    if (!playable.length) return "empty";
    this.items = playable;
    this.index = 0;
    this.expires = expires;
    this.playing = playable.length > 1;
    const shown = await this.show(0);
    if (!shown) {
      this.playing = false;
      this.host.requestUpdate();
      return "unauthorized";
    }
    this.schedule();
    this.host.requestUpdate();
    return "started";
  }

  async show(index: number): Promise<boolean> {
    if (!this.items.length) return false;
    const normalized = normalizeSlideIndex(index, this.items.length);
    const item = this.items[normalized];
    const request = ++this.request;
    const url = await this.options.resolve(item, this.expires);
    if (!url || request !== this.request) return false;
    this.index = normalized;
    this.progressCycle += 1;
    this.options.show(item, url);
    this.prefetch();
    this.host.requestUpdate();
    return true;
  }

  async previous(): Promise<void> {
    this.clearSchedule();
    await this.show(this.index - 1);
    this.schedule();
  }

  async next(): Promise<void> {
    this.clearSchedule();
    await this.show(this.index + 1);
    this.schedule();
  }

  toggle(): void {
    if (this.items.length < 2) return;
    this.playing = !this.playing;
    if (this.playing) this.progressCycle += 1;
    this.schedule();
    this.host.requestUpdate();
  }

  stop(): void {
    this.clearSchedule();
    this.request += 1;
    this.items = [];
    this.index = -1;
    this.playing = false;
    this.host.requestUpdate();
  }

  private prefetch(): void {
    for (const index of prefetchIndices(this.index, this.items.length)) {
      void this.options.resolve(this.items[index], this.expires);
    }
  }

  private schedule(): void {
    this.clearSchedule();
    if (!this.playing || this.items.length < 2) return;
    this.timer = this.setTimer(() => {
      void this.next();
    }, this.options.intervalSeconds() * 1_000);
  }

  private clearSchedule(): void {
    if (this.timer === null) return;
    this.clearTimer(this.timer);
    this.timer = null;
  }
}
