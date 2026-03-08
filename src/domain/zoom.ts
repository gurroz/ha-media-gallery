export interface Point {
  x: number;
  y: number;
}

export function clampZoom(scale: number): number {
  return Math.min(8, Math.max(1, scale));
}

export interface PanBounds {
  imageWidth: number;
  imageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

/** Keep a translated, scaled image covering the viewport when possible. */
export function clampPan(
  panX: number,
  panY: number,
  scale: number,
  bounds: PanBounds
): Point {
  if (
    bounds.imageWidth <= 0 ||
    bounds.imageHeight <= 0 ||
    bounds.viewportWidth <= 0 ||
    bounds.viewportHeight <= 0
  ) {
    return { x: panX, y: panY };
  }

  const maxX = Math.max(
    0,
    (bounds.imageWidth * scale - bounds.viewportWidth) / 2
  );
  const maxY = Math.max(
    0,
    (bounds.imageHeight * scale - bounds.viewportHeight) / 2
  );
  return {
    x: Math.min(maxX, Math.max(-maxX, panX)) || 0,
    y: Math.min(maxY, Math.max(-maxY, panY)) || 0,
  };
}

export function pointDelta(current: Point, previous: Point): Point {
  return {
    x: current.x - previous.x,
    y: current.y - previous.y,
  };
}

export function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function midpoint(first: Point, second: Point): Point {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export interface PinchMoveResult {
  zoomFactor?: number;
  panX?: number;
  panY?: number;
}

/** Pure pointer bookkeeping for pinch-zoom and pan. No DOM dependency. */
export class PinchTracker {
  private pointers = new Map<number, Point>();
  private lastPointer: Point | null = null;
  private lastPinchDistance: number | null = null;
  private lastPinchCenter: Point | null = null;

  reset(): void {
    this.pointers.clear();
    this.lastPointer = null;
    this.lastPinchDistance = null;
    this.lastPinchCenter = null;
  }

  pointerDown(id: number, point: Point): void {
    this.pointers.set(id, point);
    this.updateReference();
  }

  pointerMove(
    id: number,
    point: Point,
    zoomScale: number
  ): PinchMoveResult | null {
    if (!this.pointers.has(id)) return null;
    this.pointers.set(id, point);
    const points = [...this.pointers.values()];

    if (points.length === 1 && this.lastPointer) {
      const result: PinchMoveResult = {};
      if (zoomScale > 1) {
        const delta = pointDelta(points[0], this.lastPointer);
        result.panX = delta.x;
        result.panY = delta.y;
      }
      this.lastPointer = points[0];
      return result;
    }

    if (
      points.length >= 2 &&
      this.lastPinchDistance !== null &&
      this.lastPinchCenter
    ) {
      const currentDistance = distance(points[0], points[1]);
      const center = midpoint(points[0], points[1]);
      const result: PinchMoveResult = {};
      if (this.lastPinchDistance > 0) {
        result.zoomFactor = currentDistance / this.lastPinchDistance;
      }
      if (zoomScale > 1) {
        const delta = pointDelta(center, this.lastPinchCenter);
        result.panX = delta.x;
        result.panY = delta.y;
      }
      this.lastPinchDistance = currentDistance;
      this.lastPinchCenter = center;
      return result;
    }

    return null;
  }

  pointerUp(id: number): void {
    this.pointers.delete(id);
    this.updateReference();
  }

  private updateReference(): void {
    const points = [...this.pointers.values()];
    this.lastPointer = points.length === 1 ? points[0] : null;
    if (points.length >= 2) {
      this.lastPinchDistance = distance(points[0], points[1]);
      this.lastPinchCenter = midpoint(points[0], points[1]);
    } else {
      this.lastPinchDistance = null;
      this.lastPinchCenter = null;
    }
  }
}
