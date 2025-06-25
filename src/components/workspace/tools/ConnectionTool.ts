import { Node, Edge } from "reactflow";
import { Edge as DiagramEdge } from "@/types/diagram";

export interface ConnectionState {
  isConnecting: boolean;
  sourceNode: string | null;
  sourceHandle: string | null;
  tempConnection: {
    x: number;
    y: number;
  } | null;
}

export interface ConnectionToolOptions {
  connectionType?: "straight" | "smoothstep" | "step" | "deletable";
  snapToGrid?: boolean;
  gridSize?: number;
}

export class ConnectionTool {
  private connectionState: ConnectionState;
  private options: Required<ConnectionToolOptions>;

  constructor(options: ConnectionToolOptions = {}) {
    this.connectionState = {
      isConnecting: false,
      sourceNode: null,
      sourceHandle: null,
      tempConnection: null,
    };
    this.options = {
      connectionType: options.connectionType ?? "deletable",
      snapToGrid: options.snapToGrid ?? true,
      gridSize: options.gridSize ?? 20,
    };
  }

  // Start connection from a node
  startConnection(nodeId: string, handle?: string): void {
    this.connectionState = {
      isConnecting: true,
      sourceNode: nodeId,
      sourceHandle: handle || "right", // Default to right handle
      tempConnection: null,
    };
    console.log("🔗 Connection tool: Started connection from", nodeId);
  }

  // Update temp connection position (for preview)
  updateConnection(position: { x: number; y: number }): void {
    if (!this.connectionState.isConnecting) return;

    const snappedPosition = this.options.snapToGrid
      ? this.snapToGrid(position)
      : position;

    this.connectionState.tempConnection = snappedPosition;
  }

  // Finish connection to a target node
  finishConnection(targetNodeId: string, targetHandle?: string): Edge | null {
    if (
      !this.connectionState.isConnecting ||
      !this.connectionState.sourceNode ||
      this.connectionState.sourceNode === targetNodeId
    ) {
      console.warn(
        "🔗 Connection tool: Cannot finish connection - invalid state"
      );
      this.reset();
      return null;
    }

    const newEdge: Edge = {
      id: `edge-${
        this.connectionState.sourceNode
      }-${targetNodeId}-${Date.now()}`,
      source: this.connectionState.sourceNode,
      target: targetNodeId,
      sourceHandle: this.connectionState.sourceHandle || undefined,
      targetHandle: targetHandle || "left", // Default to left handle
      type: this.options.connectionType,
      animated: false,
      style: {
        stroke: "#374151",
        strokeWidth: 2,
      },
    };

    // Reset state
    this.reset();

    console.log("🔗 Connection tool: Created connection", newEdge);
    return newEdge;
  }

  // Cancel current connection
  cancelConnection(): void {
    console.log("🔗 Connection tool: Cancelled connection");
    this.reset();
  }

  // Reset the tool state
  reset(): void {
    this.connectionState = {
      isConnecting: false,
      sourceNode: null,
      sourceHandle: null,
      tempConnection: null,
    };
  }

  // Check if currently connecting
  isActive(): boolean {
    return this.connectionState.isConnecting;
  }

  // Get current connection state (for preview rendering)
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // Snap position to grid
  private snapToGrid(position: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const { gridSize } = this.options;
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }

  // Get connection handles for a rectangle node
  static getNodeHandles(
    node: Node
  ): { id: string; position: { x: number; y: number } }[] {
    const nodeWidth = node.data?.width || 120;
    const nodeHeight = node.data?.height || 80;
    const { x, y } = node.position;

    return [
      {
        id: "top",
        position: { x: x + nodeWidth / 2, y },
      },
      {
        id: "right",
        position: { x: x + nodeWidth, y: y + nodeHeight / 2 },
      },
      {
        id: "bottom",
        position: { x: x + nodeWidth / 2, y: y + nodeHeight },
      },
      {
        id: "left",
        position: { x, y: y + nodeHeight / 2 },
      },
    ];
  }

  // Convert React Flow edge to Zustand format
  static convertToZustandEdge(reactFlowEdge: Edge): DiagramEdge {
    return {
      id: reactFlowEdge.id,
      source: reactFlowEdge.source,
      target: reactFlowEdge.target,
      sourceHandle: reactFlowEdge.sourceHandle as string | undefined,
      targetHandle: reactFlowEdge.targetHandle as string | undefined,
      type: reactFlowEdge.type || "default",
      data: reactFlowEdge.data || {},
    };
  }

  // Create edge with smart handle detection
  static createSmartConnection(
    sourceNode: Node,
    targetNode: Node,
    connectionType:
      | "straight"
      | "smoothstep"
      | "step"
      | "deletable" = "deletable"
  ): Edge {
    // Calculate optimal connection points based on node positions
    const sourcePos = sourceNode.position;
    const targetPos = targetNode.position;
    const sourceWidth = sourceNode.data?.width || 120;
    const sourceHeight = sourceNode.data?.height || 80;
    const targetWidth = targetNode.data?.width || 120;
    const targetHeight = targetNode.data?.height || 80;

    // Calculate centers
    const sourceCenter = {
      x: sourcePos.x + sourceWidth / 2,
      y: sourcePos.y + sourceHeight / 2,
    };
    const targetCenter = {
      x: targetPos.x + targetWidth / 2,
      y: targetPos.y + targetHeight / 2,
    };

    // Determine best connection points
    let sourceHandle = "right";
    let targetHandle = "left";

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    // Choose handles based on relative positions
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection is dominant
      if (dx > 0) {
        sourceHandle = "right";
        targetHandle = "left";
      } else {
        sourceHandle = "left";
        targetHandle = "right";
      }
    } else {
      // Vertical connection is dominant
      if (dy > 0) {
        sourceHandle = "bottom";
        targetHandle = "top";
      } else {
        sourceHandle = "top";
        targetHandle = "bottom";
      }
    }

    return {
      id: `edge-${sourceNode.id}-${targetNode.id}-${Date.now()}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle,
      targetHandle,
      type: connectionType,
      animated: false,
      style: {
        stroke: "#374151",
        strokeWidth: 2,
      },
    };
  }
}

// Export singleton instance for easy use
export const connectionTool = new ConnectionTool();
