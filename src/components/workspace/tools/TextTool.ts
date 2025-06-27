import { Node } from "reactflow";

export interface TextToolOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  snapToGrid?: boolean;
  gridSize?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class TextTool {
  private isDrawing: boolean = false;
  private startPosition: Position | null = null;
  private currentPosition: Position | null = null;
  private startScreenPosition: Position | null = null;
  private currentScreenPosition: Position | null = null;
  private options: Required<TextToolOptions>;

  constructor(options: TextToolOptions) {
    this.options = {
      defaultWidth: options.defaultWidth ?? 200,
      defaultHeight: options.defaultHeight ?? 100,
      minWidth: options.minWidth ?? 100,
      minHeight: options.minHeight ?? 40,
      fontSize: options.fontSize ?? 14,
      fontWeight: options.fontWeight ?? "normal",
      textAlign: options.textAlign ?? "left",
      snapToGrid: options.snapToGrid ?? true,
      gridSize: options.gridSize ?? 20,
    };
  }

  startDrawing(flowPosition: Position, screenPosition: Position): void {
    this.isDrawing = true;
    this.startPosition = this.snapToGrid(flowPosition);
    this.currentPosition = this.startPosition;
    this.startScreenPosition = screenPosition;
    this.currentScreenPosition = screenPosition;
  }

  updateDrawing(flowPosition: Position, screenPosition: Position): void {
    if (!this.isDrawing || !this.startPosition) return;
    this.currentPosition = this.snapToGrid(flowPosition);
    this.currentScreenPosition = screenPosition;
  }

  finishDrawing(): Node | null {
    if (!this.isDrawing || !this.startPosition || !this.currentPosition) {
      this.reset();
      return null;
    }
    const bounds = this.calculateBounds();
    if (
      bounds.width < this.options.minWidth ||
      bounds.height < this.options.minHeight
    ) {
      // Use default size
      const node = this.createNodeFromBounds({
        x: this.startPosition.x,
        y: this.startPosition.y,
        width: this.options.defaultWidth,
        height: this.options.defaultHeight,
      });
      this.reset();
      return node;
    }
    const node = this.createNodeFromBounds(bounds);
    this.reset();
    return node;
  }

  cancelDrawing(): void {
    this.reset();
  }

  isActive(): boolean {
    return this.isDrawing;
  }

  getPreviewScreenBounds(): Bounds | null {
    if (
      !this.isDrawing ||
      !this.startScreenPosition ||
      !this.currentScreenPosition
    ) {
      return null;
    }
    const x = Math.min(
      this.startScreenPosition.x,
      this.currentScreenPosition.x
    );
    const y = Math.min(
      this.startScreenPosition.y,
      this.currentScreenPosition.y
    );
    const width = Math.abs(
      this.currentScreenPosition.x - this.startScreenPosition.x
    );
    const height = Math.abs(
      this.currentScreenPosition.y - this.startScreenPosition.y
    );
    return { x, y, width, height };
  }

  getPreviewFlowBounds(): Bounds | null {
    if (!this.isDrawing || !this.startPosition || !this.currentPosition) {
      return null;
    }
    return this.calculateBounds();
  }

  private reset(): void {
    this.isDrawing = false;
    this.startPosition = null;
    this.currentPosition = null;
    this.startScreenPosition = null;
    this.currentScreenPosition = null;
  }

  private snapToGrid(position: Position): Position {
    if (!this.options.snapToGrid) return position;
    const { gridSize } = this.options;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }

  private calculateBounds(): Bounds {
    if (!this.startPosition || !this.currentPosition) {
      throw new Error(
        "Cannot calculate bounds without start and current positions"
      );
    }
    const x = Math.min(this.startPosition.x, this.currentPosition.x);
    const y = Math.min(this.startPosition.y, this.currentPosition.y);
    const width = Math.abs(this.currentPosition.x - this.startPosition.x);
    const height = Math.abs(this.currentPosition.y - this.startPosition.y);
    return { x, y, width, height };
  }

  private createNodeFromBounds(bounds: Bounds): Node {
    const nodeId = `text-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return {
      id: nodeId,
      type: "text",
      position: { x: bounds.x, y: bounds.y },
      data: {
        text: "Enter text...",
        label: "Enter text...",
        width: bounds.width,
        height: bounds.height,
        fontSize: this.options.fontSize,
        fontWeight: this.options.fontWeight,
        textAlign: this.options.textAlign,
      },
      draggable: true,
      selectable: true,
      width: bounds.width,
      height: bounds.height,
    };
  }
}

export const textTool = new TextTool({});
