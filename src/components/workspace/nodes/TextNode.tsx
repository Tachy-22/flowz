"use client";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";

// Text Node Component
interface TextNodeProps {
  id: string;
  data: {
    label?: string;
    text?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: "left" | "center" | "right";
  };
  selected?: boolean;
}

const TextNode: React.FC<TextNodeProps> = ({ id, data, selected }) => {
  const setSelectedNodeId = useDiagramStore((state) => state.setSelectedNodeId);
  const {
    activeTool,
    isConnecting,
    startConnection,
    finishConnection,
    connectionStartNode,
    edges,
  } = useDiagramStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [text, setText] = useState(data.text || data.label || "Enter text...");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

      console.log("🗑️ Deleted text node:", id);
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

  // Handle node click for editing
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

  // Handle double click to start editing
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (activeTool === "select" || activeTool === "text") {
        setIsEditing(true);
      }
    },
    [activeTool]
  );

  // Handle edit button click
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Handle text change and save
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    []
  );

  // Handle save (when pressing Enter or losing focus)
  const handleSave = useCallback(() => {
    setIsEditing(false);

    // Update the node data in React Flow
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                text: text,
                label: text,
              },
            }
          : node
      )
    );

    console.log("💾 Saved text for node:", id, text);
  }, [id, text, setNodes]);

  // Handle key press in textarea
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setText(data.text || data.label || "Enter text...");
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        handleSave();
      }
    },
    [data.text, data.label, handleSave]
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

  const width = data.width || 200;
  const height = data.height || 100;
  const fontSize = data.fontSize || 14;
  const fontWeight = data.fontWeight || "normal";
  const textAlign = data.textAlign || "left";

  return (
    <div
      className={`relative group cursor-move flex items-center justify-center ${
        activeTool === "connection" ? "hover:shadow-purple-200" : ""
      }`}
      style={{
        width: width,
        height: height,
        minWidth: 100,
        minHeight: 40,
      }}
      onClick={handleNodeClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Text Container */}
      <div
        className={`w-full h-full p-3 border-2 border-dashed rounded-lg ${
          selected
            ? "border-purple-500 bg-purple-50"
            : isHovered
            ? "border-purple-300 bg-purple-25"
            : "border-gray-300 bg-transparent"
        } ${isEditing ? "border-purple-500 bg-white" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          textAlign: textAlign,
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            className="w-full h-full resize-none border-none outline-none bg-transparent p-0"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              textAlign: textAlign,
            }}
            placeholder="Enter your text..."
          />
        ) : (
          <div
            className="w-full h-full overflow-hidden whitespace-pre-wrap break-words text-gray-800"
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              textAlign: textAlign,
            }}
          >
            {text || "Enter text..."}
          </div>
        )}
      </div>

      {/* Connection Handles */}
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
              className={`!w-3 !h-3 !bg-purple-500 !border-2 !border-white !z-30 transition-all ${
                activeTool === "connection"
                  ? "!opacity-100 hover:!bg-purple-600 hover:!w-4 hover:!h-4"
                  : isConnected
                  ? "!opacity-100"
                  : "!opacity-0"
              } ${
                isConnecting && connectionStartNode !== id
                  ? "!bg-orange-500"
                  : ""
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

      {/* Edit button - show when selected and not editing */}
      {selected && !isEditing && (
        <Button
          variant="outline"
          size="sm"
          className="absolute -top-2 -left-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30"
          onClick={handleEdit}
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      )}

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
      {selected && !isEditing && (
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

export default TextNode;
