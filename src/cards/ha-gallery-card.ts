import { LitElement, html, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";

import type { HaGalleryConfig } from "../domain/config.js";
import {
  normalizeConfig,
  slideshowIntervalSeconds,
} from "../domain/config.js";
import {
  emptyStateMessage,
  filterFolders,
  filterMedia,
} from "../domain/filters.js";
import type { BrowseMediaSource } from "../domain/media.js";
import {
  isFolderItem,
  isImageItem,
  isMediaItem,
} from "../domain/media.js";
import {
  pushLightboxHistory,
  restoreLocation,
  snapshotLocation,
} from "../domain/lightbox-history.js";
import { slideshowExpirySeconds } from "../domain/slideshow.js";
import { MediaSourceClient } from "../services/media-source.client.js";
import { MediaUrlCache } from "../services/media-url-cache.js";
import { GalleryController } from "../controllers/gallery.controller.js";
import { LightboxController } from "../controllers/lightbox.controller.js";
import { SlideshowController } from "../controllers/slideshow.controller.js";
import type { PanBounds } from "../domain/zoom.js";
import { baseStyles } from "../styles/base.css.js";
import type { HaGalleryLightbox } from "../views/gallery-lightbox.js";
import "../views/gallery-breadcrumb.js";
import "../views/gallery-folder-grid.js";
import "../views/gallery-toolbar.js";
import "../views/gallery-media-grid.js";
import "../views/gallery-lightbox.js";

export class HaGallery extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public preview = false;

  @state() private _config?: HaGalleryConfig;
  @state() private _mediaErrors: Record<string, string> = {};
  @state() private _resolveTick = 0;
  @state() private _recursiveSlideshowLoading = false;

  private readonly _mediaClient = new MediaSourceClient(() => this.hass);
  private readonly _gallery = new GalleryController(this, this._mediaClient);
  private readonly _urlCache = new MediaUrlCache();
  private readonly _lightbox = new LightboxController(this);
  private readonly _slideshow = new SlideshowController(this, {
    intervalSeconds: () => this._slideshowIntervalSeconds(),
    order: () => this._config?.slideshow_order ?? "sequential",
    resolve: (item, expires) => this._resolveMedia(item, expires),
    show: (item, url) => {
      this._lightbox.setSlide(url, item.title);
      this._resetZoom();
      this._captureLightboxHistory();
    },
  });
  private _pendingMediaUpdates = new Map<
    string,
    { url?: string; error?: string }
  >();
  private _mediaUpdateFrame: number | null = null;
  private _imageObserver: IntersectionObserver | null = null;
  private _lightboxHistory = false;
  private _ignoreLightboxPop = false;
  private _lightboxReturnUrl = "";

  private readonly _onPopState = (event: PopStateEvent): void => {
    if (this._ignoreLightboxPop) {
      this._ignoreLightboxPop = false;
      event.stopImmediatePropagation();
      return;
    }
    if (!this._lightbox.url) return;

    event.stopImmediatePropagation();
    this._lightboxHistory = false;
    restoreLocation(this._lightboxReturnUrl);
    this._dismissLightbox();
  };

  public setConfig(config: HaGalleryConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = normalizeConfig(config);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("popstate", this._onPopState, true);
  }

  public disconnectedCallback(): void {
    window.removeEventListener("popstate", this._onPopState, true);
    super.disconnectedCallback();
    this._imageObserver?.disconnect();
    this._imageObserver = null;
    if (this._mediaUpdateFrame !== null) {
      window.cancelAnimationFrame(this._mediaUpdateFrame);
      this._mediaUpdateFrame = null;
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (!this._config) return;
    if (changedProperties.has("hass")) {
      const prevHass = changedProperties.get("hass") as HomeAssistant | undefined;
      if (!prevHass?.connection && this.hass?.connection) {
        void this._loadRoot();
      }
    }
    if (changedProperties.has("_config") && this.hass?.connection) {
      const prevCfg = changedProperties.get("_config") as HaGalleryConfig | undefined;
      if (prevCfg?.media_content_id !== this._config?.media_content_id) {
        void this._loadRoot();
      }
    }
    // Child view shadows finish after the card's update cycle.
    void this.updateComplete.then(() => {
      window.requestAnimationFrame(() => this._observeImageTiles());
    });
  }

  private _initialBrowseId(): string {
    return (this._config?.media_content_id ?? "").trim();
  }

  private async _loadRoot(): Promise<void> {
    await this._gallery.loadRoot(this._initialBrowseId());
  }

  private _observeImageTiles(): void {
    const grid = this.renderRoot.querySelector("ha-gallery-media-grid");
    const root = grid?.shadowRoot ?? this.renderRoot;
    const tiles = root.querySelectorAll<HTMLElement>(
      ".image-wrap[data-media-id]"
    );
    if (!tiles.length) return;

    if (!("IntersectionObserver" in window)) {
      for (const tile of tiles) {
        const item = this._findMedia(tile.dataset.mediaId);
        if (item) void this._resolveMedia(item);
      }
      return;
    }

    if (!this._imageObserver) {
      this._imageObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            this._imageObserver?.unobserve(entry.target);
            const item = this._findMedia(
              (entry.target as HTMLElement).dataset.mediaId
            );
            if (item) void this._resolveMedia(item);
          }
        },
        { rootMargin: "400px 0px" }
      );
    }

    for (const tile of tiles) {
      this._imageObserver.observe(tile);
    }
  }

  private _findMedia(mediaContentId?: string): BrowseMediaSource | undefined {
    if (!mediaContentId) return undefined;
    return (
      this._gallery.currentItem?.children?.find(
        (item) => item.media_content_id === mediaContentId
      ) ??
      this._slideshow.items.find(
        (item) => item.media_content_id === mediaContentId
      )
    );
  }

  private _resolveMedia(
    item: BrowseMediaSource,
    expires = 3600
  ): Promise<string | undefined> {
    const cachedUrl = this._mediaUrl(item);
    if (cachedUrl) return Promise.resolve(cachedUrl);

    return this._urlCache
      .resolve(item.media_content_id, expires, async () => {
        const resolved = await this._mediaClient.resolve(
          item.media_content_id,
          expires
        );
        return {
          url: resolved.url,
          mimeType: resolved.mime_type ?? "",
        };
      })
      .then((resolved) => {
        this._queueMediaUpdate(item.media_content_id, { url: resolved.url });
        return resolved.url;
      })
      .catch((error: unknown) => {
        this._queueMediaUpdate(item.media_content_id, {
          error: error instanceof Error ? error.message : String(error),
        });
        return undefined;
      });
  }

  private _queueMediaUpdate(
    mediaContentId: string,
    update: { url?: string; error?: string }
  ): void {
    this._pendingMediaUpdates.set(mediaContentId, update);
    if (this._mediaUpdateFrame !== null) return;

    this._mediaUpdateFrame = window.requestAnimationFrame(() => {
      const errors = { ...this._mediaErrors };
      for (const [id, pending] of this._pendingMediaUpdates) {
        if (pending.url) {
          delete errors[id];
        } else if (pending.error) {
          errors[id] = pending.error;
        }
      }
      this._pendingMediaUpdates.clear();
      this._mediaUpdateFrame = null;
      this._mediaErrors = errors;
      this._resolveTick += 1;
    });
  }

  private _urlsFor(media: BrowseMediaSource[]): Record<string, string> {
    void this._resolveTick;
    const urls: Record<string, string> = {};
    for (const item of media) {
      const url = this._urlCache.getUrl(item.media_content_id);
      if (url) urls[item.media_content_id] = url;
    }
    return urls;
  }

  private _mimesFor(media: BrowseMediaSource[]): Record<string, string> {
    void this._resolveTick;
    const mimes: Record<string, string> = {};
    for (const item of media) {
      const mime = this._urlCache.getMimeType(item.media_content_id);
      if (mime) mimes[item.media_content_id] = mime;
    }
    return mimes;
  }

  private _navigateTo(item: BrowseMediaSource): void {
    if (!item.can_expand) return;
    if (this.preview) {
      window.dispatchEvent(
        new CustomEvent("ha-gallery-folder-selected", {
          detail: { mediaContentId: item.media_content_id },
        })
      );
    }
    this._gallery.navigate(item);
  }

  private _mediaUrl(item: BrowseMediaSource): string | undefined {
    return this._urlCache.getUrl(item.media_content_id);
  }

  private _captureLightboxHistory(): void {
    if (this._lightboxHistory || !this._lightbox.url) return;
    this._lightboxReturnUrl = snapshotLocation();
    this._lightboxHistory = pushLightboxHistory();
  }

  private _releaseLightboxHistory(): void {
    if (!this._lightboxHistory) return;
    this._lightboxHistory = false;
    this._ignoreLightboxPop = true;
    try {
      history.back();
    } catch {
      this._ignoreLightboxPop = false;
    }
    window.setTimeout(() => {
      this._ignoreLightboxPop = false;
    }, 100);
  }

  private _openLightbox(
    url: string,
    title: string,
    items: BrowseMediaSource[] = [],
    index = -1
  ): void {
    this._slideshow.setItems(items, index);
    this._lightbox.open(url, title);
    this._resetZoom();
    this._captureLightboxHistory();
    void this._focusLightbox();
  }

  private _openVideo(url: string, title: string, mime = ""): void {
    this._slideshow.stop();
    this._lightbox.open(url, title, "video", mime);
    this._resetZoom();
    this._captureLightboxHistory();
    void this._focusLightbox();
  }

  private _closeLightbox(): void {
    this._dismissLightbox();
    this._releaseLightboxHistory();
  }

  private _dismissLightbox(): void {
    this._slideshow.stop();
    this._lightbox.close();
    this._resetZoom();
  }

  private async _startSlideshow(
    items: BrowseMediaSource[],
    expires = 3600
  ): Promise<void> {
    const result = await this._slideshow.start(items, expires);
    if (result === "unauthorized") {
      this._gallery.setRecursiveError(
        "Unable to authorize slideshow images."
      );
    }
  }

  private async _startRecursiveSlideshow(): Promise<void> {
    if (!this._gallery.currentItem || this._recursiveSlideshowLoading) return;
    this._recursiveSlideshowLoading = true;
    this._gallery.setRecursiveError(null);

    try {
      const images = await this._mediaClient.collectImages(
        this._gallery.currentItem
      );
      if (!images.length) {
        this._gallery.setRecursiveError(
          "No images found in this folder or its subfolders."
        );
        return;
      }

      await this._startSlideshow(
        images,
        slideshowExpirySeconds(
          images.length,
          this._slideshowIntervalSeconds()
        )
      );
    } catch (e) {
      this._gallery.setRecursiveError(
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      this._recursiveSlideshowLoading = false;
    }
  }

  private _slideshowIntervalSeconds(): number {
    return slideshowIntervalSeconds(this._config?.slideshow_interval);
  }

  private _lightboxKeydown(ev: KeyboardEvent): void {
    if (ev.key === "Escape") {
      if (this._lightbox.exitPresentation()) return;
      this._closeLightbox();
      return;
    }
    if (this._lightbox.type === "video") return;

    if (ev.key === "ArrowLeft") {
      void this._slideshow.previous();
    } else if (ev.key === "ArrowRight") {
      void this._slideshow.next();
    } else if (ev.key === " ") {
      ev.preventDefault();
      this._slideshow.toggle();
    }
  }

  private async _focusLightbox(): Promise<void> {
    await this.updateComplete;
    const lightbox = this.renderRoot.querySelector(
      "ha-gallery-lightbox"
    ) as HaGalleryLightbox | null;
    lightbox?.focusDialog();
  }

  private _resetZoom(): void {
    this._lightbox.resetZoom();
    const lightbox = this.renderRoot.querySelector(
      "ha-gallery-lightbox"
    ) as HaGalleryLightbox | null;
    lightbox?.resetGestures();
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

  public getGridOptions() {
    return {
      columns: "full" as const,
    };
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

  static styles = baseStyles;

  protected render() {
    if (!this._config) return nothing;

    const title = this._config.title ?? "Gallery";
    const children = this._gallery.currentItem?.children ?? [];
    const allFolders = children.filter(isFolderItem);
    const allMedia = children.filter(isMediaItem);
    const query = this._gallery.searchQuery.trim().toLowerCase();
    const folders = filterFolders(children, query);
    const media = filterMedia(children, query, this._gallery.mediaFilter);
    const images = media.filter(isImageItem);
    const mediaUrls = this._urlsFor(media);
    const mediaMimes = this._mimesFor(media);

    return html`
      <ha-card class="card">
        <div class="header">${title}</div>

        <ha-gallery-breadcrumb
          .items=${this._gallery.breadcrumb}
          @navigate=${(event: CustomEvent<{ index: number }>) =>
            this._gallery.breadcrumbClick(
              event.detail.index,
              this._initialBrowseId()
            )}
        ></ha-gallery-breadcrumb>

        <div class="content">
          ${this._gallery.loading
            ? html`<div class="loading">Loading…</div>`
            : this._gallery.error
              ? html`<div class="error">${this._gallery.error}</div>`
              : html`
                  ${this._gallery.currentItem
                    ? html`
                        <ha-gallery-toolbar
                          .query=${this._gallery.searchQuery}
                          .filter=${this._gallery.mediaFilter}
                          .hasImages=${images.length > 0}
                          .hasFolders=${allFolders.length > 0}
                          .recursiveLoading=${this._recursiveSlideshowLoading}
                          @search=${(event: CustomEvent<{ query: string }>) =>
                            this._gallery.setSearchQuery(event.detail.query)}
                          @toggle-filter=${(
                            event: CustomEvent<{
                              filter: "images" | "videos";
                            }>
                          ) =>
                            this._gallery.toggleMediaFilter(
                              event.detail.filter
                            )}
                          @start-slideshow=${() =>
                            void this._startSlideshow(images)}
                          @start-recursive-slideshow=${() =>
                            void this._startRecursiveSlideshow()}
                        ></ha-gallery-toolbar>
                        ${this._gallery.recursiveError
                          ? html`
                              <div class="error">
                                ${this._gallery.recursiveError}
                              </div>
                            `
                          : ""}
                      `
                    : ""}
                  <ha-gallery-folder-grid
                    .folders=${folders}
                    @folder-open=${(
                      event: CustomEvent<{ item: BrowseMediaSource }>
                    ) => this._navigateTo(event.detail.item)}
                  ></ha-gallery-folder-grid>
                  <ha-gallery-media-grid
                    .media=${media}
                    .images=${images}
                    .urls=${mediaUrls}
                    .mimes=${mediaMimes}
                    .errors=${this._mediaErrors}
                    @open-image=${(
                      event: CustomEvent<{
                        url: string;
                        title: string;
                        items: BrowseMediaSource[];
                        index: number;
                      }>
                    ) =>
                      this._openLightbox(
                        event.detail.url,
                        event.detail.title,
                        event.detail.items,
                        event.detail.index
                      )}
                    @open-video=${(
                      event: CustomEvent<{
                        url: string;
                        title: string;
                        mime?: string;
                      }>
                    ) =>
                      this._openVideo(
                        event.detail.url,
                        event.detail.title,
                        event.detail.mime
                      )}
                    @download=${(
                      event: CustomEvent<{
                        url: string;
                        title: string;
                        event: Event;
                      }>
                    ) =>
                      this._downloadImage(
                        event.detail.url,
                        event.detail.title,
                        event.detail.event
                      )}
                  ></ha-gallery-media-grid>
                  ${!this._gallery.loading &&
                  !this._gallery.error &&
                  this._gallery.currentItem &&
                  !folders.length &&
                  !media.length
                    ? html`
                        <div class="loading">
                          ${emptyStateMessage(query, allMedia.length)}
                        </div>
                      `
                    : ""}
                `}
        </div>
      </ha-card>

      <ha-gallery-lightbox
        .url=${this._lightbox.url}
        .mediaTitle=${this._lightbox.title}
        .mime=${this._lightbox.mime}
        .type=${this._lightbox.type}
        .presentationMode=${this._lightbox.presentationMode}
        .zoomScale=${this._lightbox.zoomScale}
        .panX=${this._lightbox.panX}
        .panY=${this._lightbox.panY}
        .slideIndex=${this._slideshow.index}
        .slideCount=${this._slideshow.items.length}
        .playing=${this._slideshow.playing}
        .progressCycle=${this._slideshow.progressCycle}
        .intervalSeconds=${this._slideshowIntervalSeconds()}
        @close=${() => this._closeLightbox()}
        @previous=${() => void this._slideshow.previous()}
        @next=${() => void this._slideshow.next()}
        @toggle-slideshow=${() => this._slideshow.toggle()}
        @enter-presentation=${() => this._lightbox.enterPresentation()}
        @download=${(event: CustomEvent<{ event: Event }>) =>
          this._downloadImage(
            this._lightbox.url!,
            this._lightbox.title ?? "image",
            event.detail.event
          )}
        @keydown=${(event: CustomEvent<{ event: KeyboardEvent }>) =>
          this._lightboxKeydown(event.detail.event)}
        @zoom=${(event: CustomEvent<{ scale: number; bounds?: PanBounds }>) =>
          this._lightbox.setZoom(event.detail.scale, event.detail.bounds)}
        @pan=${(
          event: CustomEvent<{ x: number; y: number; bounds?: PanBounds }>
        ) =>
          this._lightbox.panBy(
            event.detail.x,
            event.detail.y,
            event.detail.bounds
          )}
      ></ha-gallery-lightbox>
    `;
  }
}

if (!customElements.get("ha-gallery")) {
  customElements.define("ha-gallery", HaGallery);
}
