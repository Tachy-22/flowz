import { Node } from "reactflow";
import { Node as DiagramNode } from "@/types/diagram";

export interface DrawingState {
  isDrawing: boolean;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  // Store screen coordinates for preview
  startScreenPosition: { x: number; y: number } | null;
  currentScreenPosition: { x: number; y: number } | null;
}

export interface RectangleToolOptions {
  minWidth?: number;
  minHeight?: number;
  defaultLabel?: string;
}

export class RectangleTool {
  private drawingState: DrawingState;
  private options: Required<RectangleToolOptions>;
  constructor(options: RectangleToolOptions = {}) {
    this.drawingState = {
      isDrawing: false,
      startPosition: null,
      currentPosition: null,
      startScreenPosition: null,
      currentScreenPosition: null,
    };

    this.options = {
      minWidth: options.minWidth ?? 60,
      minHeight: options.minHeight ?? 40,
      defaultLabel: options.defaultLabel ?? "Rectangle",
    };
  }
  // Start drawing a rectangle
  startDrawing(
    flowPosition: { x: number; y: number },
    screenPosition: { x: number; y: number }
  ): void {
    this.drawingState = {
      isDrawing: true,
      startPosition: flowPosition,
      currentPosition: flowPosition,
      startScreenPosition: screenPosition,
      currentScreenPosition: screenPosition,
    };
    console.log("🟦 Rectangle tool: Started drawing at", flowPosition);
  } // Update the current drawing position (during drag)
  updateDrawing(
    flowPosition: { x: number; y: number },
    screenPosition: { x: number; y: number }
  ): void {
    if (!this.drawingState.isDrawing || !this.drawingState.startPosition)
      return;

    this.drawingState.currentPosition = flowPosition;
    this.drawingState.currentScreenPosition = screenPosition;
    console.log("🟦 Rectangle tool: Updating drawing to", flowPosition);
  }

  // Finish drawing and create the rectangle
  finishDrawing(): Node | null {
    if (
      !this.drawingState.isDrawing ||
      !this.drawingState.startPosition ||
      !this.drawingState.currentPosition
    ) {
      console.warn("🟦 Rectangle tool: Cannot finish drawing - invalid state");
      return null;
    }

    const { startPosition, currentPosition } = this.drawingState;

    // Calculate rectangle bounds
    const x = Math.min(startPosition.x, currentPosition.x);
    const y = Math.min(startPosition.y, currentPosition.y);
    const width = Math.abs(currentPosition.x - startPosition.x);
    const height = Math.abs(currentPosition.y - startPosition.y);

    // Apply minimum size constraints
    const finalWidth = Math.max(width, this.options.minWidth);
    const finalHeight = Math.max(height, this.options.minHeight);

    // Create the new rectangle node
    const newNode: Node = {
      id: `rectangle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "rectangle",
      position: { x, y },
      data: {
        label: this.options.defaultLabel,
        width: finalWidth,
        height: finalHeight,
      },
      draggable: true,
      selectable: true,
    };

    // Reset drawing state
    this.reset();

    console.log("🟦 Rectangle tool: Created rectangle", newNode);
    return newNode;
  }

  // Cancel current drawing
  cancelDrawing(): void {
    console.log("🟦 Rectangle tool: Cancelled drawing");
    this.reset();
  }
  // Reset the tool state
  reset(): void {
    this.drawingState = {
      isDrawing: false,
      startPosition: null,
      currentPosition: null,
      startScreenPosition: null,
      currentScreenPosition: null,
    };
  }

  // Get current drawing state (for preview rendering)
  getDrawingState(): DrawingState {
    return { ...this.drawingState };
  }

  // Check if currently drawing
  isActive(): boolean {
    return this.drawingState.isDrawing;
  }
  // Get preview rectangle dimensions for rendering (using screen coordinates)
  getPreviewScreenBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    if (
      !this.drawingState.isDrawing ||
      !this.drawingState.startScreenPosition ||
      !this.drawingState.currentScreenPosition
    ) {
      return null;
    }

    const { startScreenPosition, currentScreenPosition } = this.drawingState;

    return {
      x: Math.min(startScreenPosition.x, currentScreenPosition.x),
      y: Math.min(startScreenPosition.y, currentScreenPosition.y),
      width: Math.abs(currentScreenPosition.x - startScreenPosition.x),
      height: Math.abs(currentScreenPosition.y - startScreenPosition.y),
    };
  }

  // Get preview rectangle dimensions for rendering (using flow coordinates)
  getPreviewBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null {
    if (
      !this.drawingState.isDrawing ||
      !this.drawingState.startPosition ||
      !this.drawingState.currentPosition
    ) {
      return null;
    }

    const { startPosition, currentPosition } = this.drawingState;

    return {
      x: Math.min(startPosition.x, currentPosition.x),
      y: Math.min(startPosition.y, currentPosition.y),
      width: Math.abs(currentPosition.x - startPosition.x),
      height: Math.abs(currentPosition.y - startPosition.y),
    };
  }
  // Convert React Flow node to Zustand DiagramNode format
  static convertToZustandNode(reactFlowNode: Node): DiagramNode {
    return {
      id: reactFlowNode.id,
      type: reactFlowNode.type || "default",
      position: reactFlowNode.position,
      data: reactFlowNode.data,
      width: reactFlowNode.width || undefined,
      height: reactFlowNode.height || undefined,
    };
  }
}

// Export a singleton instance for easy use
export const rectangleTool = new RectangleTool();
