"use client";
import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import { rectangleTool } from "./tools";

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

  return (
    <div
      className={`bg-blue-100 border-2 rounded-lg p-4 relative group cursor-move ${
        selected ? "border-blue-500 shadow-lg" : "border-blue-300"
      }`}
      style={{
        width: data.width || 120,
        height: data.height || 80,
        minWidth: 80,
        minHeight: 60,
      }}
    >
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

// Node types
const nodeTypes = {
  rectangle: RectangleNode,
};

interface DiagramCanvasProps {
  className?: string;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ className = "" }) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    shouldAddRectangle,
    resetAddRectangleFlag,
    setActiveTool,
  } = useDiagramStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, fitView } = useReactFlow();
  // Force re-render for rectangle tool preview updates
  const [, forceUpdate] = useState({});
  const forceRerender = useCallback(() => forceUpdate({}), []);
  // Flag to prevent circular sync loops
  const isLoadingDiagram = useRef(false);
  // Use React Flow state as primary source of truth
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]); // Initialize React Flow with Zustand data only once on mount
  React.useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      console.log("🔄 Initial sync from Zustand to React Flow");

      const mappedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        width: node.width,
        height: node.height,
        draggable: true,
        selectable: true,
      }));

      const mappedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        data: edge.data,
      }));

      setFlowNodes(mappedNodes);
      setFlowEdges(mappedEdges);
      console.log("✅ Initial React Flow setup complete");
    }
    // Only run once on mount, don't include state dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //  // Sync from Zustand to React Flow when diagrams are loaded
  const prevNodesLength = useRef(nodes.length);
  const prevEdgesLength = useRef(edges.length);
  const lastDiagramId = useRef<string | null>(null);

  React.useEffect(() => {
    // Detect if this is a diagram load by checking:
    // 1. Diagram ID changed (new diagram loaded)
    // 2. Significant change in node/edge count
    // 3. Diagram reset (nodes cleared)

    const { diagramId } = useDiagramStore.getState();
    const diagramIdChanged = diagramId !== lastDiagramId.current;
    const isSignificantChange =
      Math.abs(nodes.length - prevNodesLength.current) > 1 ||
      Math.abs(edges.length - prevEdgesLength.current) > 1 ||
      (nodes.length === 0 && prevNodesLength.current > 0); // Diagram reset

    const shouldSync = diagramIdChanged || isSignificantChange;
    if (shouldSync) {
      console.log("🔄 Syncing loaded diagram from Zustand to React Flow");
      console.log("📊 Zustand nodes:", nodes.length, "edges:", edges.length);
      console.log(
        "📍 Node positions:",
        nodes.map((n) => ({
          id: n.id,
          position: n.position,
          label: n.data.label,
        }))
      );
      console.log(
        "📋 Diagram ID changed:",
        diagramIdChanged,
        "from",
        lastDiagramId.current,
        "to",
        diagramId
      );

      isLoadingDiagram.current = true; // Set flag to prevent sync back

      const mappedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        width: node.width,
        height: node.height,
        draggable: true,
        selectable: true,
      }));

      const mappedEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        data: edge.data,
      }));
      setFlowNodes(mappedNodes);
      setFlowEdges(mappedEdges);
      console.log("✅ Diagram loaded into React Flow");

      // Fit the view to show all nodes after a short delay
      setTimeout(() => {
        try {
          fitView({ duration: 200, padding: 0.1 });
          console.log("🔍 Fitted view to show all nodes");
        } catch (error) {
          console.log("⚠️ fitView failed:", error);
        }
      }, 100);

      // Update tracking refs
      lastDiagramId.current = diagramId;
      prevNodesLength.current = nodes.length;
      prevEdgesLength.current = edges.length;

      // Reset the flag after a longer delay to ensure sync is complete
      setTimeout(() => {
        isLoadingDiagram.current = false;
        console.log("🔓 Loading flag reset - sync enabled");
      }, 200);
    }
  }, [nodes, edges, setFlowNodes, setFlowEdges]); // Sync React Flow state back to Zustand with debouncing to prevent infinite loops
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    // Don't sync if we're in the middle of loading a diagram from Zustand
    if (isLoadingDiagram.current) {
      console.log("🔒 Skipping sync - diagram is loading");
      return;
    }

    // Don't sync empty state
    if (flowNodes.length === 0 && flowEdges.length === 0) return;

    // Clear previous timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync to prevent infinite loops
    syncTimeoutRef.current = setTimeout(() => {
      console.log(
        "🔄 Syncing React Flow to Zustand - Nodes:",
        flowNodes.length,
        "Edges:",
        flowEdges.length
      );

      const convertedNodes = flowNodes.map((node) => ({
        id: node.id,
        type: node.type || "default",
        position: node.position,
        data: node.data,
        width: node.width || undefined,
        height: node.height || undefined,
      }));

      const convertedEdges = flowEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type || "default",
        data: edge.data,
      }));

      setNodes(convertedNodes);
      setEdges(convertedEdges);

      console.log("✅ Zustand updated from React Flow state");
    }, 150); // Increased debounce time for more stability

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [flowNodes, flowEdges, setNodes, setEdges]); // Keyboard shortcuts (Delete key for selected nodes)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedNodeId && !shouldAddRectangle) {
        // Delete from React Flow (primary source of truth)
        setFlowNodes((nodes) =>
          nodes.filter((node) => node.id !== selectedNodeId)
        );
        setFlowEdges((edges) =>
          edges.filter(
            (edge) =>
              edge.source !== selectedNodeId && edge.target !== selectedNodeId
          )
        );
        setSelectedNodeId(null);

        console.log("🗑️ Deleted node via Delete key:", selectedNodeId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNodeId,
    shouldAddRectangle,
    setFlowNodes,
    setFlowEdges,
    setSelectedNodeId,
  ]);
  // Handle mouse down on pane (start drawing)
  const onPaneMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (shouldAddRectangle && reactFlowWrapper.current) {
        // Get coordinates relative to the ReactFlow container
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        // Use React Flow's project method to convert to flow coordinates
        const flowPosition = project(screenPosition);

        rectangleTool.startDrawing(flowPosition, screenPosition);
        console.log(
          "🟦 Started drawing rectangle at flow coordinates:",
          flowPosition
        );

        // Prevent panning while drawing
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [shouldAddRectangle, project]
  ); // Handle mouse move (update drawing preview)
  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (rectangleTool.isActive() && reactFlowWrapper.current) {
        // Get coordinates relative to the ReactFlow container
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        // Use React Flow's project method to convert to flow coordinates
        const flowPosition = project(screenPosition);

        rectangleTool.updateDrawing(flowPosition, screenPosition);
        forceRerender(); // Trigger re-render for preview update
      }
    },
    [project, forceRerender]
  ); // Handle mouse up (finish drawing)
  const onPaneMouseUp = useCallback(() => {
    if (rectangleTool.isActive()) {
      const newNode = rectangleTool.finishDrawing();

      if (newNode) {
        // Add to React Flow (primary source of truth)
        setFlowNodes((nodes) => [...nodes, newNode]);

        // Select the new node
        setSelectedNodeId(newNode.id);

        console.log("✅ Rectangle created successfully");
      }

      // Switch back to move tool in both flags and UI
      resetAddRectangleFlag();
      setActiveTool("select");
    }
  }, [setFlowNodes, setSelectedNodeId, resetAddRectangleFlag, setActiveTool]);
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // React Flow state is primary, Zustand will sync automatically via useEffect
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      // React Flow state is primary, Zustand will sync automatically via useEffect
    },
    [onEdgesChange]
  );
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, flowEdges);
      setFlowEdges(newEdges);
      // Zustand will sync automatically via useEffect
    },
    [flowEdges, setFlowEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  ); // Handle pane click (deselect when not drawing)
  const onPaneClick = useCallback(() => {
    if (!shouldAddRectangle) {
      setSelectedNodeId(null);
    }
  }, [shouldAddRectangle, setSelectedNodeId]);
  return (
    <div
      className={`h-full w-full bg-gray-50 relative ${className}`}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={flowNodes.map((node) => ({
          ...node,
          selected: node.id === selectedNodeId,
          draggable: !shouldAddRectangle, // Disable dragging when in draw mode
          selectable: !shouldAddRectangle, // Disable selection when in draw mode
        }))}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={() => {}}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMouseDown={onPaneMouseDown}
        onMouseMove={onPaneMouseMove}
        onMouseUp={onPaneMouseUp}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={!shouldAddRectangle}
        nodesConnectable={!shouldAddRectangle}
        elementsSelectable={!shouldAddRectangle}
        selectNodesOnDrag={false}
        panOnDrag={shouldAddRectangle ? false : [1, 2]} // Disable panning when drawing
        selectionOnDrag={!shouldAddRectangle}
        style={{ cursor: shouldAddRectangle ? "crosshair" : "default" }}
      >
        {" "}
        <Background />
        <Controls />
        <MiniMap />{" "}
        {/* Drawing Preview Overlay - positioned using screen coordinates */}
        {(() => {
          const previewBounds = rectangleTool.getPreviewScreenBounds();
          return previewBounds ? (
            <div
              className="absolute pointer-events-none border-2 border-blue-500 bg-blue-100 bg-opacity-50"
              style={{
                left: previewBounds.x,
                top: previewBounds.y,
                width: previewBounds.width,
                height: previewBounds.height,
                zIndex: 1000,
              }}
            />
          ) : null;
        })()}
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider
const DiagramCanvasProvider: React.FC<DiagramCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DiagramCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default DiagramCanvasProvider;
