export interface CachedMediaUrl {
  url: string;
  mimeType: string;
  expiresAt: number;
}

export class MediaUrlCache {
  private readonly entries = new Map<string, CachedMediaUrl>();
  private readonly pending = new Map<
    string,
    Promise<{ url: string; mimeType: string }>
  >();

  constructor(
    private readonly now: () => number = Date.now,
    private readonly expiryMarginMs = 60_000
  ) {}

  get(id: string): CachedMediaUrl | undefined {
    const entry = this.entries.get(id);
    if (!entry || entry.expiresAt <= this.now() + this.expiryMarginMs) {
      return undefined;
    }
    return entry;
  }

  getUrl(id: string): string | undefined {
    return this.get(id)?.url;
  }

  getMimeType(id: string): string | undefined {
    return this.get(id)?.mimeType;
  }

  set(
    id: string,
    url: string,
    mimeType: string,
    expiresSeconds: number
  ): void {
    this.entries.set(id, {
      url,
      mimeType,
      expiresAt: this.now() + expiresSeconds * 1_000,
    });
  }

  resolve(
    id: string,
    expiresSeconds: number,
    resolver: () => Promise<{ url: string; mimeType: string }>
  ): Promise<{ url: string; mimeType: string }> {
    const cached = this.get(id);
    if (cached) {
      return Promise.resolve({ url: cached.url, mimeType: cached.mimeType });
    }
    const inFlight = this.pending.get(id);
    if (inFlight) return inFlight;

    const promise = resolver()
      .then((resolved) => {
        this.set(id, resolved.url, resolved.mimeType, expiresSeconds);
        return resolved;
      })
      .finally(() => this.pending.delete(id));
    this.pending.set(id, promise);
    return promise;
  }
}
