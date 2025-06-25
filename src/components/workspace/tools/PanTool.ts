export interface PanState {
  isPanning: boolean;
  startPosition: { x: number; y: number } | null;
  lastPosition: { x: number; y: number } | null;
}

export interface PanToolOptions {
  enableZoom?: boolean;
  zoomSensitivity?: number;
  minZoom?: number;
  maxZoom?: number;
  smoothPanning?: boolean;
}

export class PanTool {
  private panState: PanState;
  private options: Required<PanToolOptions>;
  private onViewportChange?: (viewport: {
    x: number;
    y: number;
    zoom: number;
  }) => void;

  constructor(options: PanToolOptions = {}) {
    this.panState = {
      isPanning: false,
      startPosition: null,
      lastPosition: null,
    };

    this.options = {
      enableZoom: options.enableZoom ?? true,
      zoomSensitivity: options.zoomSensitivity ?? 0.001,
      minZoom: options.minZoom ?? 0.1,
      maxZoom: options.maxZoom ?? 4,
      smoothPanning: options.smoothPanning ?? true,
    };
  }

  // Set viewport change callback
  setViewportChangeHandler(
    handler: (viewport: { x: number; y: number; zoom: number }) => void
  ): void {
    this.onViewportChange = handler;
  }

  // Start panning
  startPanning(position: { x: number; y: number }): void {
    this.panState = {
      isPanning: true,
      startPosition: position,
      lastPosition: position,
    };
    console.log("🤚 Pan tool: Started panning from", position);
  }

  // Update panning position
  updatePanning(
    position: { x: number; y: number },
    currentViewport: { x: number; y: number; zoom: number }
  ): { x: number; y: number; zoom: number } | null {
    if (!this.panState.isPanning || !this.panState.lastPosition) {
      return null;
    }

    // Calculate the difference in mouse position
    const deltaX = position.x - this.panState.lastPosition.x;
    const deltaY = position.y - this.panState.lastPosition.y;

    // Update the viewport based on the delta
    const newViewport = {
      x: currentViewport.x + deltaX,
      y: currentViewport.y + deltaY,
      zoom: currentViewport.zoom,
    };

    // Update last position
    this.panState.lastPosition = position;

    // Call the viewport change handler if set
    if (this.onViewportChange) {
      this.onViewportChange(newViewport);
    }

    return newViewport;
  }

  // Handle zoom
  handleZoom(
    delta: number,
    position: { x: number; y: number },
    currentViewport: { x: number; y: number; zoom: number }
  ): { x: number; y: number; zoom: number } | null {
    if (!this.options.enableZoom) {
      return null;
    }

    // Calculate new zoom level
    const zoomChange = delta * this.options.zoomSensitivity;
    const newZoom = Math.max(
      this.options.minZoom,
      Math.min(this.options.maxZoom, currentViewport.zoom + zoomChange)
    );

    // Calculate the zoom point (zoom towards mouse position)
    const zoomFactor = newZoom / currentViewport.zoom;
    const newX = position.x - (position.x - currentViewport.x) * zoomFactor;
    const newY = position.y - (position.y - currentViewport.y) * zoomFactor;

    const newViewport = {
      x: newX,
      y: newY,
      zoom: newZoom,
    };

    // Call the viewport change handler if set
    if (this.onViewportChange) {
      this.onViewportChange(newViewport);
    }

    console.log("🔍 Pan tool: Zoom changed to", newZoom.toFixed(2));
    return newViewport;
  }

  // Stop panning
  stopPanning(): boolean {
    const wasPanning = this.panState.isPanning;

    this.panState = {
      isPanning: false,
      startPosition: null,
      lastPosition: null,
    };

    if (wasPanning) {
      console.log("🤚 Pan tool: Stopped panning");
      return false;
    }

    return wasPanning;
  }

  // Check if currently panning
  isActive(): boolean {
    return this.panState.isPanning;
  }

  // Get current pan state
  getPanState(): PanState {
    return { ...this.panState };
  }

  // Reset the tool
  reset(): void {
    this.stopPanning();
  }

  // Check if a pan gesture should start (minimum distance moved)
  shouldStartPanning(currentPosition: { x: number; y: number }): boolean {
    if (!this.panState.startPosition) {
      return false;
    }

    const deltaX = currentPosition.x - this.panState.startPosition.x;
    const deltaY = currentPosition.y - this.panState.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Start panning if moved more than 5 pixels
    return distance > 5;
  }

  // Handle wheel events for zooming
  handleWheel(
    event: WheelEvent,
    position: { x: number; y: number },
    currentViewport: { x: number; y: number; zoom: number }
  ): { x: number; y: number; zoom: number } | null {
    if (!this.options.enableZoom) {
      return null;
    }

    // Prevent default scrolling
    event.preventDefault();

    // Handle zoom
    const delta = -event.deltaY;
    return this.handleZoom(delta, position, currentViewport);
  }
}

// Export singleton instance for easy use
export const panTool = new PanTool();
