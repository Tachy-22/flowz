"use client";
import React, { useCallback, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Triangle Node Component
interface TriangleNodeProps {
  id: string;
  data: {
    label?: string;
    width?: number;
    height?: number;
  };
  selected?: boolean;
}

const TriangleNode: React.FC<TriangleNodeProps> = ({ id, data, selected }) => {
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

      console.log("🗑️ Deleted triangle node:", id);
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

  // Check if handles should be visible
  const hasConnections = (handleId: string) => {
    return edges.some(
      (edge) =>
        (edge.source === id && edge.sourceHandle === handleId) ||
        (edge.target === id && edge.targetHandle === handleId)
    );
  };

  const shouldShowHandles =
    activeTool === "connection" ||
    isHovered ||
    selected ||
    edges.some((edge) => edge.source === id || edge.target === id);

  const width = data.width || 120;
  const height = data.height || 80;

  return (
    <div
      className={`relative group cursor-move flex items-center justify-center ${
        activeTool === "connection" ? "hover:shadow-purple-200" : ""
      }`}
      style={{
        width: width,
        height: height,
        minWidth: 80,
        minHeight: 60,
      }}
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Triangle Shape using CSS clip-path */}
      <div
        className={`absolute inset-0 border-2 ${
          selected
            ? "border-purple-500 shadow-lg bg-purple-100"
            : "border-purple-300 bg-purple-100"
        }`}
        style={{
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          width: width * 0.8,
          height: height * 0.8,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />{" "}
      {/* Connection Handles */}
      {["top", "right", "bottom", "left"].map((handleId) => {
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

        const handleType =
          isConnecting && connectionStartNode && connectionStartNode !== id
            ? "target"
            : "source";

        const isConnected = hasConnections(handleId);
        const shouldShow = shouldShowHandles || isConnected;

        return (
          <Handle
            key={`${handleId}-${handleType}`}
            type={handleType}
            position={position}
            id={handleId}
            className={`!w-3 !h-3 !bg-purple-500 !border-2 !border-white !z-30 ${
              shouldShow ? "!opacity-100" : "!opacity-0"
            } ${
              activeTool === "connection"
                ? "hover:!bg-purple-600 hover:!w-4 hover:!h-4"
                : ""
            } ${
              isConnecting && connectionStartNode !== id ? "!bg-orange-500" : ""
            }`}
            style={style}
            onClick={(e) => handleConnectionClick(e, handleId)}
            isConnectable={true}
            isValidConnection={(connection) => {
              return connection.source !== connection.target;
            }}
          />
        );
      })}
      {/* Content */}
      <div className="text-center text-sm font-medium text-gray-700 relative z-20 pointer-events-none">
        {data.label || "Triangle"}
      </div>
      {/* Delete button - only show when selected */}
      {selected && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30"
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
            className="absolute bottom-0 right-0 w-4 h-4 bg-purple-500 cursor-se-resize border border-white z-30"
            style={{
              borderRadius: "0 0 4px 0",
              transform: "translate(50%, 50%)",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              // Resize logic will be implemented later
            }}
          />
        </>
      )}
    </div>
  );
};

export default TriangleNode;
