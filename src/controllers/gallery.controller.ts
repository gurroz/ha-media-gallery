import type {
  ReactiveController,
  ReactiveControllerHost,
} from "lit";
import type { MediaFilter } from "../domain/filters.js";
import { nextMediaFilter } from "../domain/filters.js";
import type { BrowseMediaSource } from "../domain/media.js";
import type { MediaSourceClient } from "../services/media-source.client.js";

export interface BreadcrumbItem {
  id: string;
  title: string;
}

export class GalleryController {
  currentItem: BrowseMediaSource | null = null;
  breadcrumb: BreadcrumbItem[] = [];
  loading = false;
  error: string | null = null;
  recursiveError: string | null = null;
  searchQuery = "";
  mediaFilter: MediaFilter = "both";

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly client: MediaSourceClient
  ) {
    // Cast required: ReactiveController's lifecycle hooks are all optional.
    host.addController(this as ReactiveController);
  }

  async loadRoot(mediaContentId = ""): Promise<void> {
    this.breadcrumb = [];
    await this.browse(mediaContentId);
  }

  async browse(mediaContentId: string): Promise<void> {
    this.loading = true;
    this.error = null;
    this.recursiveError = null;
    this.host.requestUpdate();
    try {
      this.currentItem = await this.client.browse(mediaContentId);
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.currentItem = null;
    } finally {
      this.loading = false;
      this.host.requestUpdate();
    }
  }

  navigate(item: BrowseMediaSource): void {
    if (!item.can_expand) return;
    this.breadcrumb = [
      ...this.breadcrumb,
      { id: item.media_content_id, title: item.title },
    ];
    void this.browse(item.media_content_id);
  }

  breadcrumbClick(index: number, rootId = ""): void {
    if (index < 0) {
      void this.loadRoot(rootId);
      return;
    }
    const target = this.breadcrumb[index];
    this.breadcrumb = this.breadcrumb.slice(0, index + 1);
    void this.browse(target.id);
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.host.requestUpdate();
  }

  toggleMediaFilter(filter: "images" | "videos"): void {
    this.mediaFilter = nextMediaFilter(this.mediaFilter, filter);
    this.host.requestUpdate();
  }

  setRecursiveError(message: string | null): void {
    this.recursiveError = message;
    this.host.requestUpdate();
  }
}
