import { Node } from "reactflow";

export type ShapeType = "rectangle" | "circle" | "diamond" | "triangle";

export interface ShapeData {
  label?: string;
  width?: number;
  height?: number;
  radius?: number; // For circles
  color?: string;
  backgroundColor?: string;
}

export interface ShapeToolOptions {
  shapeType: ShapeType;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultRadius?: number;
  minWidth?: number;
  minHeight?: number;
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

export class ShapeTool {
  private isDrawing: boolean = false;
  private startPosition: Position | null = null;
  private currentPosition: Position | null = null;
  private startScreenPosition: Position | null = null;
  private currentScreenPosition: Position | null = null;
  private options: Required<ShapeToolOptions>;

  constructor(options: ShapeToolOptions) {
    this.options = {
      defaultWidth: options.defaultWidth ?? 120,
      defaultHeight: options.defaultHeight ?? 80,
      defaultRadius: options.defaultRadius ?? 40,
      minWidth: options.minWidth ?? 40,
      minHeight: options.minHeight ?? 30,
      snapToGrid: options.snapToGrid ?? true,
      gridSize: options.gridSize ?? 20,
      ...options,
    };
  }

  // Start drawing a shape
  startDrawing(flowPosition: Position, screenPosition: Position): void {
    this.isDrawing = true;
    this.startPosition = this.snapToGrid(flowPosition);
    this.currentPosition = this.startPosition;
    this.startScreenPosition = screenPosition;
    this.currentScreenPosition = screenPosition;

    console.log(
      `🎨 Started drawing ${this.options.shapeType} at:`,
      this.startPosition
    );
  }

  // Update drawing (for preview)
  updateDrawing(flowPosition: Position, screenPosition: Position): void {
    if (!this.isDrawing || !this.startPosition) return;

    this.currentPosition = this.snapToGrid(flowPosition);
    this.currentScreenPosition = screenPosition;
  }

  // Finish drawing and create the node
  finishDrawing(): Node | null {
    if (!this.isDrawing || !this.startPosition || !this.currentPosition) {
      this.reset();
      return null;
    }

    const bounds = this.calculateBounds();

    // Check minimum size requirements
    if (
      bounds.width < this.options.minWidth ||
      bounds.height < this.options.minHeight
    ) {
      console.log(`❌ ${this.options.shapeType} too small, using default size`);

      // Create default-sized shape at click position
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

  // Cancel drawing
  cancelDrawing(): void {
    console.log(`🚫 Cancelled ${this.options.shapeType} drawing`);
    this.reset();
  }

  // Check if currently drawing
  isActive(): boolean {
    return this.isDrawing;
  }

  // Get preview bounds for screen coordinates (for UI overlay)
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

  // Get preview bounds for flow coordinates
  getPreviewFlowBounds(): Bounds | null {
    if (!this.isDrawing || !this.startPosition || !this.currentPosition) {
      return null;
    }

    return this.calculateBounds();
  }

  // Update shape type
  setShapeType(shapeType: ShapeType): void {
    this.options.shapeType = shapeType;
  }

  // Get current shape type
  getShapeType(): ShapeType {
    return this.options.shapeType;
  }

  // Private methods

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
    const nodeId = `${this.options.shapeType}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create shape-specific data
    const shapeData: ShapeData = {
      label: this.getDefaultLabel(),
      ...this.getShapeSpecificData(bounds),
    };

    const node: Node = {
      id: nodeId,
      type: this.options.shapeType,
      position: { x: bounds.x, y: bounds.y },
      data: shapeData,
      draggable: true,
      selectable: true,
    };

    // Add width/height for layout
    if (this.options.shapeType !== "circle") {
      node.width = bounds.width;
      node.height = bounds.height;
    }

    console.log(`✅ Created ${this.options.shapeType} node:`, node);
    return node;
  }

  private getDefaultLabel(): string {
    switch (this.options.shapeType) {
      case "rectangle":
        return "Rectangle";
      case "circle":
        return "Circle";
      case "diamond":
        return "Diamond";
      case "triangle":
        return "Triangle";
      default:
        return "Shape";
    }
  }

  private getShapeSpecificData(bounds: Bounds): Partial<ShapeData> {
    switch (this.options.shapeType) {
      case "rectangle":
        return {
          width: bounds.width,
          height: bounds.height,
        };
      case "circle":
        // For circles, use the smaller dimension as diameter
        const diameter = Math.min(bounds.width, bounds.height);
        return {
          radius: diameter / 2,
          width: diameter,
          height: diameter,
        };
      case "diamond":
        return {
          width: bounds.width,
          height: bounds.height,
        };
      case "triangle":
        return {
          width: bounds.width,
          height: bounds.height,
        };
      default:
        return {
          width: bounds.width,
          height: bounds.height,
        };
    }
  }
}

// Create shape tool instances for different shapes
export const rectangleTool = new ShapeTool({
  shapeType: "rectangle",
  defaultWidth: 120,
  defaultHeight: 80,
  minWidth: 40,
  minHeight: 30,
});

export const circleTool = new ShapeTool({
  shapeType: "circle",
  defaultWidth: 80,
  defaultHeight: 80,
  defaultRadius: 40,
  minWidth: 30,
  minHeight: 30,
});

export const diamondTool = new ShapeTool({
  shapeType: "diamond",
  defaultWidth: 100,
  defaultHeight: 100,
  minWidth: 40,
  minHeight: 40,
});

export const triangleTool = new ShapeTool({
  shapeType: "triangle",
  defaultWidth: 100,
  defaultHeight: 80,
  minWidth: 40,
  minHeight: 30,
});

// Export a function to get the appropriate tool for a shape type
export function getShapeTool(shapeType: ShapeType): ShapeTool {
  switch (shapeType) {
    case "rectangle":
      return rectangleTool;
    case "circle":
      return circleTool;
    case "diamond":
      return diamondTool;
    case "triangle":
      return triangleTool;
    default:
      return rectangleTool;
  }
}
