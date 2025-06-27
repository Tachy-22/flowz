"use client";
import React, { useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import getStroke from "perfect-freehand";

interface Point {
  x: number;
  y: number;
}

interface DrawNodeProps {
  id: string;
  data: {
    paths?: Point[];
    width?: number;
    height?: number;
  };
  selected?: boolean;
}

function getSvgPathFromStroke(stroke: Point[]) {
  if (!stroke.length) return "";
  const d = stroke.map((point, i) => {
    const command = i === 0 ? "M" : "L";
    return `${command} ${point.x} ${point.y}`;
  });
  return d.join(" ");
}

const DrawNode: React.FC<DrawNodeProps> = ({ id, data, selected }) => {
  const setSelectedNodeId = useDiagramStore((state) => state.setSelectedNodeId);
  const { setNodes, setEdges } = useReactFlow();
  const [paths, setPaths] = useState<Point[][]>(
    Array.isArray(data.paths) && Array.isArray(data.paths[0])
      ? (data.paths as unknown as Point[][])
      : []
  );
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Delete node
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
    setSelectedNodeId(null);
  };

  // Add this helper inside your component
  const getRelativePoint = (e: React.PointerEvent<SVGSVGElement>) => {
    // Use offsetX/offsetY for mouse/pen (most precise)
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    }
    // For touch, use clientX/clientY minus bounding rect
    const rect = svgRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left || 0),
      y: e.clientY - (rect?.top || 0),
    };
  };

  // Mouse/touch events for drawing
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDrawing(true);
    setCurrentPoints([getRelativePoint(e)]);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    setCurrentPoints((pts) => [...pts, getRelativePoint(e)]);
  };

  const handlePointerUp = () => {
    if (currentPoints.length > 1) {
      setPaths((prev) => {
        const newPaths = [...prev, currentPoints];
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, paths: newPaths } }
              : node
          )
        );
        return newPaths;
      });
    }
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  // Resizing state and logic
  const resizeStart = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

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

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (!resizeStart.current) return;
    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    const newWidth = Math.max(100, resizeStart.current.width + dx);
    const newHeight = Math.max(80, resizeStart.current.height + dy);
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

  const handleResizeMouseUp = () => {
    resizeStart.current = null;
    window.removeEventListener("mousemove", handleResizeMouseMove);
    window.removeEventListener("mouseup", handleResizeMouseUp);
  };

  const width = data.width || 200;
  const height = data.height || 150;

  return (
    <div
      className={`relative group  border border-dashed rounded-lg ${
        selected ? "border-pink-500 " : "border-pink-300"
      }`}
      style={{ width, height, minWidth: 100, minHeight: 80 }}
      draggable={!isDrawing}
      onPointerDown={isDrawing ? (e) => e.stopPropagation() : undefined}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          cursor: isDrawing ? "crosshair" : "pointer",
          pointerEvents: "auto",
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault(); // <-- Add this line
          handlePointerDown(e);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          e.preventDefault(); // <-- Add this line
          handlePointerMove(e);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          e.preventDefault(); // <-- Add this line
          handlePointerUp();
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          e.preventDefault(); // <-- Add this line
          handlePointerUp();
        }}
      >
        {/* Render all finished paths */}
        {paths.map((pts, i) => (
          <path
            key={i}
            d={getSvgPathFromStroke(
              getStroke(pts, {
                size: 4,
                thinning: 0.6,
                smoothing: 0.5,
                streamline: 0.5,
              }).map(([x, y]) => ({ x, y }))
            )}
            fill="none"
            stroke="#ec4899"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {/* Render current drawing path */}
        {isDrawing && currentPoints.length > 1 && (
          <path
            d={getSvgPathFromStroke(
              getStroke(currentPoints, {
                size: 4,
                thinning: 0.6,
                smoothing: 0.5,
                streamline: 0.5,
              }).map(([x, y]) => ({ x, y }))
            )}
            fill="none"
            stroke="#f472b6"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </svg>
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
      {/* Resize handle - only show when selected and not drawing */}
      {selected && !isDrawing && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-pink-500 cursor-se-resize border border-white z-20"
          style={{
            borderRadius: "0 0 4px 0",
            transform: "translate(50%, 50%)",
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default DrawNode;
