"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeChange,
  EdgeChange,
  Background,
  useReactFlow,
  Position,
  ConnectionLineType,
  ConnectionMode,
  Edge,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";

import { Node as DiagramNode, Edge as DiagramEdge } from "@/types/diagram";

import { getShapeTool, type ShapeType, textTool, drawTool } from "./tools";
import { nodeTypes } from "./nodes";

// Custom Deletable Edge Component
interface DeletableEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  selected?: boolean;
}

const DeletableEdge: React.FC<DeletableEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  selected = false,
}) => {
  const { setEdges } = useReactFlow();
  // Calculate midpoint for delete button based on the actual path
  const getMidpoint = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // Calculate midpoint based on the grid path
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal-first path
      const midX = sourceX + dx * 0.5;
      return { x: midX, y: sourceY + dy * 0.5 };
    } else {
      // Vertical-first path
      const midY = sourceY + dy * 0.5;
      return { x: sourceX + dx * 0.5, y: midY };
    }
  };

  const { x: midX, y: midY } = getMidpoint();

  // Handle edge deletion
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
      ////console.log("🗑️ Deleted edge:", id);
    },
    [setEdges, id]
  );
  // Create a grid-following path (orthogonal/stepped)
  const createGridPath = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // Create an orthogonal path that follows grid patterns
    let path = `M ${sourceX} ${sourceY}`;

    // If the connection is mostly horizontal
    if (Math.abs(dx) > Math.abs(dy)) {
      // Go horizontal first, then vertical
      const midX = sourceX + dx * 0.5;
      path += ` L ${midX} ${sourceY}`;
      path += ` L ${midX} ${targetY}`;
      path += ` L ${targetX} ${targetY}`;
    } else {
      // Go vertical first, then horizontal
      const midY = sourceY + dy * 0.5;
      path += ` L ${sourceX} ${midY}`;
      path += ` L ${targetX} ${midY}`;
      path += ` L ${targetX} ${targetY}`;
    }

    return path;
  };
  // Calculate arrow direction based on the final segment
  const getArrowDirection = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // For grid paths, the arrow should point in the direction of the final segment
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal final segment
      return dx > 0 ? "right" : "left";
    } else {
      // Vertical final segment
      return dy > 0 ? "down" : "up";
    }
  };

  const arrowDirection = getArrowDirection();
  const arrowSize = 8;

  // Create custom arrow based on direction
  const createArrow = () => {
    let arrowPath = "";
    const arrowX = targetX;
    const arrowY = targetY;

    switch (arrowDirection) {
      case "right":
        arrowPath = `M ${arrowX - arrowSize} ${
          arrowY - arrowSize / 2
        } L ${arrowX} ${arrowY} L ${arrowX - arrowSize} ${
          arrowY + arrowSize / 2
        } Z`;
        break;
      case "left":
        arrowPath = `M ${arrowX + arrowSize} ${
          arrowY - arrowSize / 2
        } L ${arrowX} ${arrowY} L ${arrowX + arrowSize} ${
          arrowY + arrowSize / 2
        } Z`;
        break;
      case "down":
        arrowPath = `M ${arrowX - arrowSize / 2} ${
          arrowY - arrowSize
        } L ${arrowX} ${arrowY} L ${arrowX + arrowSize / 2} ${
          arrowY - arrowSize
        } Z`;
        break;
      case "up":
        arrowPath = `M ${arrowX - arrowSize / 2} ${
          arrowY + arrowSize
        } L ${arrowX} ${arrowY} L ${arrowX + arrowSize / 2} ${
          arrowY + arrowSize
        } Z`;
        break;
    }

    return arrowPath;
  };

  return (
    <g>
      {/* Main edge path */}
      <path
        d={createGridPath()}
        style={{
          stroke: selected ? "#3b82f6" : "#374151",
          strokeWidth: selected ? 3 : 2,
          fill: "none",
          ...style,
        }}
      />
      {/* Custom arrow head */}
      <path
        d={createArrow()}
        style={{
          fill: selected ? "#3b82f6" : "#374151",
          stroke: selected ? "#3b82f6" : "#374151",
          strokeWidth: 1,
        }}
      />
      {/* Invisible thicker path for easier selection */}
      <path
        d={createGridPath()}
        style={{
          stroke: "transparent",
          strokeWidth: 10,
          fill: "none",
          cursor: "pointer",
        }}
      />{" "}
      {/* Delete button - only show when selected */}
      {selected && (
        <g>
          {/* Button background circle */}
          <circle
            cx={midX}
            cy={midY}
            r="10"
            fill="white"
            stroke="#ef4444"
            strokeWidth="2"
            style={{ cursor: "pointer" }}
            onClick={handleDelete}
          />
          {/* X icon */}
          <g onClick={handleDelete} style={{ cursor: "pointer" }}>
            <line
              x1={midX - 5}
              y1={midY - 5}
              x2={midX + 5}
              y2={midY + 5}
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1={midX - 5}
              y1={midY + 5}
              x2={midX + 5}
              y2={midY - 5}
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>
      )}
    </g>
  );
};

// Edge types
const edgeTypes = {
  default: DeletableEdge,
  deletable: DeletableEdge,
  smoothstep: DeletableEdge,
  straight: DeletableEdge,
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
    selectedEdgeId,
    setSelectedNodeId,
    setSelectedEdgeId,
    shouldAddRectangle,
    resetAddRectangleFlag,
    shouldAddText,
    resetAddTextFlag,
    setActiveTool,
    activeTool,
    isConnecting,
    connectionStartNode,
    connectionSourceHandle,
    connectionPreview,
    updateConnectionPreview,
    endConnection,
    shouldAddDraw,
    resetAddDrawFlag,
    // Animation handoff
    pendingDiagramToAnimate,
    setPendingDiagramToAnimate,

    setDiagramTitle,
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
      ////console.log("🔄 Initial sync from Zustand to React Flow");

      const mappedNodes = nodes.map((node) => {
        const mappedNode: Node = {
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
          draggable: true,
          selectable: true,
        };

        // Only add width/height if they exist
        if (node.width) mappedNode.width = node.width;
        if (node.height) mappedNode.height = node.height;

        return mappedNode;
      });
      const mappedEdges = edges.map((edge) => {
        const mappedEdge: Edge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: edge.data,
        };

        // Only add handle properties if they exist
        if (edge.sourceHandle) mappedEdge.sourceHandle = edge.sourceHandle;
        if (edge.targetHandle) mappedEdge.targetHandle = edge.targetHandle;

        return mappedEdge;
      });

      setFlowNodes(mappedNodes);
      setFlowEdges(mappedEdges);
      ////console.log("✅ Initial React Flow setup complete");
    }
    // Only run once on mount, don't include state dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync from Zustand to React Flow when diagrams are loaded OR when edges change
  const prevNodesLength = useRef(nodes.length);
  const prevEdgesLength = useRef(edges.length);
  const lastDiagramId = useRef<string | null>(null);

  React.useEffect(() => {
    // Detect if this is a diagram load by checking:
    // 1. Diagram ID changed (new diagram loaded)
    // 2. Significant change in node/edge count
    // 3. Diagram reset (nodes cleared)
    // 4. New edge created (connection tool)

    const { diagramId } = useDiagramStore.getState();
    const diagramIdChanged = diagramId !== lastDiagramId.current;
    const edgeCountChanged = edges.length !== prevEdgesLength.current;
    const isSignificantChange =
      Math.abs(nodes.length - prevNodesLength.current) > 1 ||
      Math.abs(edges.length - prevEdgesLength.current) > 1 ||
      (nodes.length === 0 && prevNodesLength.current > 0); // Diagram reset

    const shouldSync =
      diagramIdChanged || isSignificantChange || edgeCountChanged;

    if (shouldSync) {
      ////console.log("🔄 Syncing from Zustand to React Flow");
      ////console.log("📊 Zustand nodes:", nodes.length, "edges:", edges.length);
      // //console.log(
      //   "🔗 Edge count changed:",
      //   edgeCountChanged,
      //   "from",
      //   prevEdgesLength.current,
      //   "to",
      //   edges.length
      // );

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
      // //console.log(
      //   "✅ Synced to React Flow - Nodes:",
      //   mappedNodes.length,
      //   "Edges:",
      //   mappedEdges.length
      // );

      // Fit the view to show all nodes after a short delay (only for diagram loads)
      if (diagramIdChanged && (nodes.length > 0 || edges.length > 0)) {
        setTimeout(() => {
          try {
            fitView({ duration: 200, padding: 0.1 });
            //console.log("🔍 Fitted view to show all nodes");
          } catch (error) {
            console.error("⚠️ fitView failed:", error);
          }
        }, 100);
      }

      // Update tracking refs
      lastDiagramId.current = diagramId;
      prevNodesLength.current = nodes.length;
      prevEdgesLength.current = edges.length;

      // Reset the flag after a longer delay to ensure sync is complete
      setTimeout(() => {
        isLoadingDiagram.current = false;
        //console.log("🔓 Loading flag reset - sync enabled");
      }, 200);
    }
  }, [nodes, edges, setFlowNodes, setFlowEdges, fitView]); // --- Real-time sync: Zustand → React Flow (for streaming AI updates) ---
  React.useEffect(() => {
    // Always update React Flow state when Zustand nodes/edges change
    const mappedNodes = nodes.map((node) => {
      const mappedNode: Node = {
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        draggable: true,
        selectable: true,
      };
      if (node.width) mappedNode.width = node.width;
      if (node.height) mappedNode.height = node.height;
      return mappedNode;
    });
    const mappedEdges = edges.map((edge) => {
      const mappedEdge: Edge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: edge.data,
      };
      if (edge.sourceHandle) mappedEdge.sourceHandle = edge.sourceHandle;
      if (edge.targetHandle) mappedEdge.targetHandle = edge.targetHandle;
      return mappedEdge;
    });
    setFlowNodes(mappedNodes);
    setFlowEdges(mappedEdges);
  }, [nodes, edges]);

  // Sync React Flow state back to Zustand with debouncing to prevent infinite loops
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    // Don't sync if we're in the middle of loading a diagram from Zustand
    if (isLoadingDiagram.current) {
      //console.log("🔒 Skipping sync - diagram is loading");
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
      //console.log(
      //   "🔄 Syncing React Flow to Zustand - Nodes:",
      //   flowNodes.length,
      //   "Edges:",
      //   flowEdges.length
      // );
      const convertedNodes = flowNodes.map((node) => {
        const convertedNode: DiagramNode = {
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: node.data,
        };

        // Only add width/height if they exist
        if (node.width) convertedNode.width = node.width;
        if (node.height) convertedNode.height = node.height;

        return convertedNode;
      });

      const convertedEdges = flowEdges.map((edge) => {
        const convertedEdge: DiagramEdge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || "default",
          data: edge.data || {},
        };

        // Only add handle properties if they exist
        if (edge.sourceHandle) convertedEdge.sourceHandle = edge.sourceHandle;
        if (edge.targetHandle) convertedEdge.targetHandle = edge.targetHandle;

        return convertedEdge;
      });

      setNodes(convertedNodes);
      setEdges(convertedEdges);

      ///console.log("✅ Zustand updated from React Flow state");
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

        ///console.log("🗑️ Deleted node via Delete key:", selectedNodeId);
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
  ]); // Handle mouse down on pane (start drawing or cancel connection)
  const onPaneMouseDown = useCallback(
    (event: React.MouseEvent) => {
      // Cancel connection if clicking on pane
      if (activeTool === "connection" && isConnecting) {
        endConnection();
        //console.log("🔗 Connection cancelled");
        return;
      }
      // Text tool drawing
      if (shouldAddText && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        textTool.startDrawing(flowPosition, screenPosition);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Draw tool drawing
      if (shouldAddDraw && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        drawTool.startDrawing(flowPosition, screenPosition);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Shape tool drawing
      if (shouldAddRectangle && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        const currentShapeTool = getShapeTool(activeTool as ShapeType);
        currentShapeTool.startDrawing(flowPosition, screenPosition);
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [
      shouldAddRectangle,
      shouldAddText,
      shouldAddDraw,
      project,
      activeTool,
      isConnecting,
      endConnection,
    ]
  ); // Handle mouse move (update drawing preview)
  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      // Handle connection preview
      if (
        activeTool === "connection" &&
        isConnecting &&
        reactFlowWrapper.current
      ) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        updateConnectionPreview(flowPosition);
      }

      // Text tool drawing
      if (shouldAddText && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        if (textTool.isActive()) {
          textTool.updateDrawing(flowPosition, screenPosition);
          forceRerender();
        }
      }
      // Draw tool drawing
      if (shouldAddDraw && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        if (drawTool.isActive()) {
          drawTool.updateDrawing(flowPosition, screenPosition);
          forceRerender();
        }
      }
      // Shape tool drawing
      if (shouldAddRectangle && reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        const screenPosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        const flowPosition = project(screenPosition);
        const currentShapeTool = getShapeTool(activeTool as ShapeType);
        if (currentShapeTool.isActive()) {
          currentShapeTool.updateDrawing(flowPosition, screenPosition);
          forceRerender();
        }
      }
    },
    [
      project,
      forceRerender,
      activeTool,
      isConnecting,
      updateConnectionPreview,
      shouldAddRectangle,
      shouldAddText,
      shouldAddDraw,
    ]
  ); // Handle mouse up (finish drawing or panning)
  const onPaneMouseUp = useCallback(() => {
    // Text tool drawing
    if (shouldAddText) {
      if (textTool.isActive()) {
        const newNode = textTool.finishDrawing();
        if (newNode) {
          setFlowNodes((nodes) => [...nodes, newNode]);
          setSelectedNodeId(newNode.id);
          ////console.log("✅ text node created successfully");
        }
        resetAddTextFlag();
        setActiveTool("select");
      }
      return;
    }
    // Draw tool drawing
    if (shouldAddDraw) {
      if (drawTool.isActive()) {
        const newNode = drawTool.finishDrawing();
        if (newNode) {
          setFlowNodes((nodes) => [...nodes, newNode]);
          setSelectedNodeId(newNode.id);
          ////console.log("✅ draw node created successfully");
        }
        resetAddDrawFlag();
        setActiveTool("select");
      }
      return;
    }
    // Shape tool drawing
    if (shouldAddRectangle) {
      const currentShapeTool = getShapeTool(activeTool as ShapeType);
      if (currentShapeTool.isActive()) {
        const newNode = currentShapeTool.finishDrawing();
        if (newNode) {
          setFlowNodes((nodes) => [...nodes, newNode]);
          setSelectedNodeId(newNode.id);
          ////console.log(`✅ ${activeTool} created successfully`);
        }
        resetAddRectangleFlag();
        setActiveTool("select");
      }
    }
  }, [
    shouldAddRectangle,
    shouldAddText,
    activeTool,
    setFlowNodes,
    setSelectedNodeId,
    resetAddRectangleFlag,
    resetAddTextFlag,
    resetAddDrawFlag,
    setActiveTool,
  ]);
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
      setSelectedEdgeId(null); // Deselect edges when selecting nodes
    },
    [setSelectedNodeId, setSelectedEdgeId]
  );

  // Handle edge selection
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setSelectedEdgeId(edge.id);
      setSelectedNodeId(null); // Deselect nodes when selecting edges
    },
    [setSelectedEdgeId, setSelectedNodeId]
  ); // Handle pane click (deselect when not drawing)
  const onPaneClick = useCallback(() => {
    if (!shouldAddRectangle) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null); // Also deselect edges
    }
  }, [shouldAddRectangle, setSelectedNodeId, setSelectedEdgeId]);
  // Animate diagram build-up when pendingDiagramToAnimate is set
  useEffect(() => {
    if (!pendingDiagramToAnimate) return;
    let cancelled = false;
    async function animate() {
      if (!pendingDiagramToAnimate) return;
      // Clear the canvas first
      setFlowNodes([]);
      setFlowEdges([]);
      // Animate nodes
      for (let i = 0; i < pendingDiagramToAnimate.nodes.length; i++) {
        if (cancelled) return;
        setFlowNodes(pendingDiagramToAnimate.nodes.slice(0, i + 1));
        setFlowEdges([]);
        await new Promise((res) => setTimeout(res, 180));
      }
      // Animate edges (after all nodes are in)
      for (let j = 0; j < pendingDiagramToAnimate.edges.length; j++) {
        if (cancelled) return;
        setFlowNodes(pendingDiagramToAnimate.nodes);
        setFlowEdges(pendingDiagramToAnimate.edges.slice(0, j + 1));
        await new Promise((res) => setTimeout(res, 120));
      }
      // After animation, set the full diagram as current
      setNodes(pendingDiagramToAnimate.nodes);
      setEdges(pendingDiagramToAnimate.edges);
      setDiagramTitle(pendingDiagramToAnimate.title);
      setPendingDiagramToAnimate(null);
    }
    animate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDiagramToAnimate]);

  // --- Loading overlay for AI diagram animation ---
  const isAnimatingDiagram = !!pendingDiagramToAnimate;

  return (
    <div
      className={`h-full w-full bg-gray-50 relative ${className}`}
      ref={reactFlowWrapper}
    >
      {/* Loading overlay for AI animation */}
      {isAnimatingDiagram && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-100/60 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="loader">
              <div className="react-star">
                <div className="nucleus"></div>
                <div className="electron electron1"></div>
                <div className="electron electron2"></div>
                <div className="electron electron3"></div>
              </div>
              <span className="text-black absolute bottom-0  translate-y-[4rem] translate-x-[0rem] scale-[140%]">
                {" "}
                Generating...
              </span>
            </div>
          </div>
        </div>
      )}
      <ReactFlow
        nodes={flowNodes.map((node) => ({
          ...node,
          selected: node.id === selectedNodeId,
          draggable: !shouldAddRectangle, // Disable dragging when in draw mode
          selectable: !shouldAddRectangle, // Disable selection when in draw mode
        }))}
        edges={flowEdges.map((edge) => ({
          ...edge,
          selected: edge.id === selectedEdgeId,
        }))}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={() => {}}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMouseDown={onPaneMouseDown}
        onMouseMove={onPaneMouseMove}
        onMouseUp={onPaneMouseUp}
        nodeTypes={nodeTypes as NodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={!shouldAddRectangle && activeTool !== "pan"}
        nodesConnectable={true}
        elementsSelectable={!shouldAddRectangle && activeTool !== "pan"}
        selectNodesOnDrag={false}
        panOnDrag={
          activeTool === "pan" ? [1] : shouldAddRectangle ? false : [1, 2]
        } // Enable panning with left click for pan tool, both buttons for normal mode
        selectionOnDrag={!shouldAddRectangle && activeTool !== "pan"}
        connectionMode={"loose" as ConnectionMode}
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          type: "default", // This will use our DeletableEdge component
          style: { strokeWidth: 2, stroke: "#374151" },
        }}
        connectionLineType={"smoothstep" as ConnectionLineType}
        connectionLineStyle={{ strokeWidth: 2, stroke: "#10b981" }}
        deleteKeyCode={null} // Disable default delete behavior
        multiSelectionKeyCode={null} // Disable multi-selection
        isValidConnection={(connection) => {
          // Allow connections between different nodes only
          return connection.source !== connection.target;
        }}
        style={{
          cursor: shouldAddRectangle
            ? "crosshair"
            : activeTool === "pan"
            ? "grab"
            : "default",
        }}
      >
        {" "}
        <Background />{" "}
        {/* <Controls />
        <MiniMap /> */}{" "}
        {/* Drawing Preview Overlay - positioned using screen coordinates */}
        {(() => {
          if (shouldAddRectangle) {
            // Get the appropriate shape tool based on active tool
            const currentShapeTool = getShapeTool(activeTool as ShapeType);
            const previewBounds = currentShapeTool.getPreviewScreenBounds();
            return previewBounds ? (
              <div
                className={`absolute pointer-events-none border-2 border-blue-500 bg-blue-100 bg-opacity-50 ${
                  activeTool === "circle"
                    ? "rounded-full"
                    : activeTool === "diamond"
                    ? "transform rotate-45"
                    : ""
                }`}
                style={{
                  left: previewBounds.x,
                  top: previewBounds.y,
                  width: previewBounds.width,
                  height: previewBounds.height,
                  zIndex: 1000,
                }}
              />
            ) : null;
          }
          if (shouldAddDraw) {
            const previewBounds = drawTool.getPreviewScreenBounds();
            return previewBounds ? (
              <div
                className="absolute pointer-events-none border-2 border-purple-500 bg-purple-100 bg-opacity-50"
                style={{
                  left: previewBounds.x,
                  top: previewBounds.y,
                  width: previewBounds.width,
                  height: previewBounds.height,
                  zIndex: 1000,
                }}
              />
            ) : null;
          }
          return null;
        })()}
        {/* Connection Preview Overlay */}
        {isConnecting &&
          connectionStartNode &&
          connectionPreview &&
          (() => {
            // Find the source node to get its position
            const sourceNode = flowNodes.find(
              (node) => node.id === connectionStartNode
            );
            if (!sourceNode) return null;

            // Get source node screen position
            const sourceWidth = sourceNode.data?.width || 120;
            const sourceHeight = sourceNode.data?.height || 80;
            const sourceCenter = {
              x: sourceNode.position.x + sourceWidth / 2,
              y: sourceNode.position.y + sourceHeight / 2,
            };

            // Calculate handle position based on source handle
            let handleOffset = { x: 0, y: 0 };
            switch (connectionSourceHandle) {
              case "top":
                handleOffset = { x: 0, y: -sourceHeight / 2 };
                break;
              case "right":
                handleOffset = { x: sourceWidth / 2, y: 0 };
                break;
              case "bottom":
                handleOffset = { x: 0, y: sourceHeight / 2 };
                break;
              case "left":
                handleOffset = { x: -sourceWidth / 2, y: 0 };
                break;
            }

            const startPoint = {
              x: sourceCenter.x + handleOffset.x,
              y: sourceCenter.y + handleOffset.y,
            };

            const endPoint = connectionPreview;

            // Create grid-following preview path
            const createPreviewPath = () => {
              const dx = endPoint.x - startPoint.x;
              const dy = endPoint.y - startPoint.y;

              let path = `M ${startPoint.x} ${startPoint.y}`;

              // If the connection is mostly horizontal
              if (Math.abs(dx) > Math.abs(dy)) {
                // Go horizontal first, then vertical
                const midX = startPoint.x + dx * 0.5;
                path += ` L ${midX} ${startPoint.y}`;
                path += ` L ${midX} ${endPoint.y}`;
                path += ` L ${endPoint.x} ${endPoint.y}`;
              } else {
                // Go vertical first, then horizontal
                const midY = startPoint.y + dy * 0.5;
                path += ` L ${startPoint.x} ${midY}`;
                path += ` L ${endPoint.x} ${midY}`;
                path += ` L ${endPoint.x} ${endPoint.y}`;
              }

              return path;
            };

            return (
              <svg
                className="absolute pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 1000,
                }}
              >
                <defs>
                  <marker
                    id="connection-preview-arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <polygon
                      points="0,0 0,6 9,3"
                      fill="#10b981"
                      stroke="#10b981"
                    />
                  </marker>
                </defs>{" "}
                <path
                  d={createPreviewPath()}
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  markerEnd="url(#connection-preview-arrow)"
                />
              </svg>
            );
          })()}
      </ReactFlow>
    </div>
  );
};

// Wrap with ReactFlowProvider
const DiagramCanvasProvider: React.FC<DiagramCanvasProps> = (props) => {
  return <DiagramCanvas {...props} />;
};

export default DiagramCanvasProvider;
