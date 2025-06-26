"use client";
import React, { useCallback, useState } from "react";
import { useReactFlow, Handle, Position } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Custom Rectangle Node Component
interface RectangleNodeProps {
  id: string;
  data: {
    label?: string;
    width?: number;
    height?: number;
  };
  selected?: boolean;
}

const RectangleNode = ({ id, data, selected }: RectangleNodeProps) => {
  const setSelectedNodeId = useDiagramStore((state) => state.setSelectedNodeId);
  const {
    activeTool,
    isConnecting,
    startConnection,
    finishConnection,
    connectionStartNode,
    edges,
  } = useDiagramStore();

  const [isHovered, setIsHovered] = useState(false);

  // Get React Flow functions from context
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // Delete from React Flow (primary source of truth)
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
      setEdges((edges) =>
        edges.filter((edge) => edge.source !== id && edge.target !== id)
      );
      setSelectedNodeId(null);

      console.log("🗑️ Deleted rectangle node:", id);
    },
    [setNodes, setEdges, setSelectedNodeId, id]
  );

  // Handle connection tool clicks on handles
  const handleConnectionClick = useCallback(
    (e: React.MouseEvent, handleId: string) => {
      e.stopPropagation();

      if (activeTool !== "connection") return;

      if (isConnecting) {
        // Finish connection
        finishConnection(id, handleId);
        console.log("🔗 Connection finished to node:", id, "handle:", handleId);
      } else {
        // Start connection
        startConnection(id, handleId);
        console.log(
          "🔗 Connection started from node:",
          id,
          "handle:",
          handleId
        );
      }
    },
    [activeTool, isConnecting, startConnection, finishConnection, id]
  );

  // Handle node click for connection tool
  const handleNodeClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === "connection") {
        e.stopPropagation();
        if (isConnecting) {
          finishConnection(id, "left"); // Default to left handle
        } else {
          startConnection(id, "right"); // Default to right handle
        }
      }
    },
    [activeTool, isConnecting, startConnection, finishConnection, id]
  );

  // Check if a handle has connections
  const hasConnections = useCallback(
    (handleId: string) => {
      return edges.some(
        (edge) =>
          (edge.source === id && edge.sourceHandle === handleId) ||
          (edge.target === id && edge.targetHandle === handleId)
      );
    },
    [edges, id]
  );

  // Determine if handles should be visible
  const shouldShowHandles =
    activeTool === "connection" ||
    isConnecting ||
    isHovered ||
    selected ||
    ["top", "right", "bottom", "left"].some((handleId) =>
      hasConnections(handleId)
    );

  return (
    <div
      className={`bg-blue-100 border-2 rounded-lg p-4 relative group cursor-move ${
        selected ? "border-blue-500 shadow-lg" : "border-blue-300"
      } ${
        activeTool === "connection"
          ? "hover:border-green-500 hover:shadow-green-200"
          : ""
      }`}
      style={{
        width: data.width || 120,
        height: data.height || 80,
        minWidth: 80,
        minHeight: 60,
      }}
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {" "}
      {/* Connection Handles - Only visible when needed */}
      {shouldShowHandles &&
        ["top", "right", "bottom", "left"].map((handleId) => {
          const position =
            handleId === "top"
              ? Position.Top
              : handleId === "right"
              ? Position.Right
              : handleId === "bottom"
              ? Position.Bottom
              : Position.Left;

          const style =
            handleId === "top"
              ? { top: -6 }
              : handleId === "right"
              ? { right: -6 }
              : handleId === "bottom"
              ? { bottom: -6 }
              : { left: -6 };

          // Determine handle type dynamically:
          // - If we're connecting and this is NOT the source node, it should be a target
          // - If we're not connecting or this IS the source node, it should be a source
          const handleType =
            isConnecting && connectionStartNode && connectionStartNode !== id
              ? "target"
              : "source";

          const isConnected = hasConnections(handleId);

          return (
            <Handle
              key={`${handleId}-${handleType}`}
              type={handleType}
              position={position}
              id={handleId}
              className={`!w-3 !h-3 !border-2 !border-white transition-all duration-200 ${
                isConnected
                  ? "!bg-green-500"
                  : activeTool === "connection"
                  ? "!bg-blue-500 hover:!bg-green-500 hover:!w-4 hover:!h-4"
                  : "!bg-blue-500"
              } ${
                isConnecting && connectionStartNode !== id
                  ? "!bg-orange-500"
                  : ""
              }`}
              style={style}
              onClick={(e) => handleConnectionClick(e, handleId)}
              isConnectable={true}
              isValidConnection={(connection) => {
                // Allow connections between different nodes
                return connection.source !== connection.target;
              }}
            />
          );
        })}
      {/* Drag handle - invisible but covers the whole node */}
      <div className="absolute inset-0 cursor-move" />
      <div className="text-center text-sm font-medium text-gray-700 relative z-10 pointer-events-none">
        {data.label || "Rectangle"}
      </div>{" "}
      {/* Delete button - only show when selected */}
      {selected && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
      {/* Resize handles - only show when selected */}
      {selected && (
        <>
          {/* Corner resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize border border-white z-20"
            style={{
              borderRadius: "0 0 4px 0",
              transform: "translate(50%, 50%)",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // Resize logic will be implemented later
            }}
          />

          {/* Right edge resize handle */}
          <div
            className="absolute top-1/2 right-0 w-2 h-8 bg-blue-400 cursor-e-resize transform -translate-y-1/2 translate-x-1/2 z-20"
            style={{ borderRadius: "0 4px 4px 0" }}
          />

          {/* Bottom edge resize handle */}
          <div
            className="absolute bottom-0 left-1/2 w-8 h-2 bg-blue-400 cursor-s-resize transform -translate-x-1/2 translate-y-1/2 z-20"
            style={{ borderRadius: "0 0 4px 4px" }}
          />
        </>
      )}
    </div>
  );
};

export default RectangleNode;
