"use client";
import React, { useCallback, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

// Circle Node Component
interface CircleNodeProps {
  id: string;
  data: {
    label?: string;
    width?: number;
    height?: number;
    radius?: number;
  };
  selected?: boolean;
}

const CircleNode: React.FC<CircleNodeProps> = ({ id, data, selected }) => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || "Circle");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

      console.log("🗑️ Deleted circle node:", id);
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

  const diameter = Math.min(data.width || 120, data.height || 120);

  // Resizing state and logic
  const resizeStart = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Mouse down on resize handle
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: data.width || diameter,
      height: data.height || diameter,
    };
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
  };

  // Mouse move while resizing
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizeStart.current) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    // Keep the node a circle (equal width/height)
    const newDiameter = Math.max(
      40,
      Math.max(resizeStart.current.width + dx, resizeStart.current.height + dy)
    );
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { ...node.data, width: newDiameter, height: newDiameter },
            }
          : node
      )
    );
  };

  // Mouse up to finish resizing
  const handleResizeMouseUp = () => {
    resizeStart.current = null;
    window.removeEventListener("mousemove", handleResizeMouseMove);
    window.removeEventListener("mouseup", handleResizeMouseUp);
  };

  // Focus textarea when editing
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Save label edit
  const saveEdit = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: editValue } }
          : node
      )
    );
    setIsEditing(false);
  }, [editValue, id, setNodes]);

  return (
    <div
      className={`bg-green-100 border-2 rounded-full p-4 relative group cursor-move flex items-center justify-center ${
        selected ? "border-green-500 shadow-lg" : "border-green-300"
      } ${
        activeTool === "connection"
          ? "hover:border-green-500 hover:shadow-green-200"
          : ""
      }`}
      style={{
        width: diameter,
        height: diameter,
        minWidth: 80,
        minHeight: 80,
      }}
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
            className={`!w-3 !h-3 !bg-green-500 !border-2 !border-white ${
              shouldShow ? "!opacity-100" : "!opacity-0"
            } ${
              activeTool === "connection"
                ? "hover:!bg-green-600 hover:!w-4 hover:!h-4"
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
      <div className="text-center text-sm font-medium text-gray-700 relative z-10 flex items-center justify-center gap-1">
        {isEditing ? (
          <textarea
            ref={inputRef}
            className="rounded px-1 py-0.5 border border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-200 text-sm resize-none bg-transparent z-20"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                saveEdit();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(data.label || "Circle");
              }
            }}
            rows={1}
            style={{ minWidth: 40, maxWidth: diameter - 32 }}
          />
        ) : (
          <>
            <span
              className="pointer-events-auto cursor-text"
              onDoubleClick={() => setIsEditing(true)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setIsEditing(true);
              }}
              aria-label="Edit label"
            >
              {data.label || "Circle"}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 p-0 ml-1 text-green-600 hover:bg-green-100 focus:bg-green-200 focus:outline-none z-20 group-hover:opacity-100 opacity-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              tabIndex={0}
              aria-label="Edit label"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
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
            className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 cursor-se-resize border border-white z-20"
            style={{
              borderRadius: "0 0 4px 0",
              transform: "translate(50%, 50%)",
            }}
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  );
};

export default CircleNode;
