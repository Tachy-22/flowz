"use client";
import React, { useCallback, useState, useRef } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || "Triangle");
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
      width: width,
      height: height,
    };
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
  };

  // Mouse move while resizing
  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizeStart.current) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    const newWidth = Math.max(40, resizeStart.current.width + dx);
    const newHeight = Math.max(30, resizeStart.current.height + dy);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { ...node.data, width: newWidth, height: newHeight },
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
      className={`relative group cursor-move flex items-center justify-center ${
        selected ? "border-yellow-500 shadow-lg" : "border-yellow-300"
      } ${
        activeTool === "connection"
          ? "hover:border-yellow-500 hover:shadow-yellow-200"
          : ""
      }`}
      style={{
        width: data.width || 120,
        height: data.height || 80,
        minWidth: 80,
        minHeight: 60,
        background: "transparent",
        border: "none",
        boxShadow: "none",
        padding: 0,
      }}
      onClick={handleNodeClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG Triangle Outline */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute left-0 top-0 z-0 pointer-events-none"
        style={{ width: width, height: height }}
      >
        <polygon
          points={`${width / 2},0 ${width},${height} 0,${height}`}
          fill={selected ? "#f3e8ff" : "#faf5ff"}
          stroke="#a21caf"
          strokeWidth={selected ? 3 : 2}
        />
      </svg>
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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {isEditing ? (
          <textarea
            ref={inputRef}
            className="rounded px-1 py-0.5 border border-yellow-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-200 text-sm resize-none bg-transparent z-20"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                saveEdit();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(data.label || "Triangle");
              }
            }}
            rows={1}
            style={{ minWidth: 40, maxWidth: (data.width || 120) - 32 }}
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
              {data.label || "Triangle"}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 p-0 ml-1 text-yellow-600 hover:bg-yellow-100 focus:bg-yellow-200 focus:outline-none z-20"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              tabIndex={0}
              aria-label="Edit label"
            >
              <Pencil />
            </Button>
          </>
        )}
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
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  );
};

export default TriangleNode;
