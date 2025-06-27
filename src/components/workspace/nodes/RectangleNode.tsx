"use client";
import React, { useCallback, useState, useRef } from "react";
import { useReactFlow, Handle, Position } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || "");
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      width: data.width || 120,
      height: data.height || 80,
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

  // Focus input when editing
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Save label
  const saveLabel = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: editValue } }
          : node
      )
    );
    setIsEditing(false);
  };

  // Handle double click or edit icon
  const handleEditStart = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setEditValue(data.label || "");
    setIsEditing(true);
  };

  // Handle input blur or Enter
  const handleInputBlur = () => saveLabel();
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveLabel();
    if (e.key === "Escape") setIsEditing(false);
  };

  // When entering edit mode, auto-size the textarea to fill the container
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.style.height = "0px";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [isEditing, editValue]);

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
      <div
        className="text-center text-sm font-medium text-gray-700 relative z-10"
        style={{ minHeight: 24 }}
        onDoubleClick={handleEditStart}
        onTouchStart={(e) => {
          if (e.detail === 2) handleEditStart(e); // double tap
        }}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            className="w-full bg-transparent rounded border border-blue-300 px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            rows={3}
          />
        ) : (
          <>
            {data.label || "Rectangle"}
            {selected && (
              <button
                type="button"
                className="ml-1 inline-flex items-center p-0.5 rounded hover:bg-blue-100 focus:bg-blue-200 group-hover:opacity-100 opacity-0"
                onClick={handleEditStart}
                tabIndex={-1}
                style={{ verticalAlign: "middle" }}
              >
                <Pencil className="h-3 w-3 text-blue-500" />
              </button>
            )}
          </>
        )}
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
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}
    </div>
  );
};

export default RectangleNode;
