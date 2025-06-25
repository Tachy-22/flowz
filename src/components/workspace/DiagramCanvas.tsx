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
  Panel,
  Background,
  Controls,
  MiniMap,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { Button } from "@/components/ui/button";
import { Trash2, Save } from "lucide-react";
import { diagramService } from "@/integrations/firebase/diagrams";
import { useUserStore } from "@/integrations/zustand";

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
  const deleteNode = useDiagramStore((state) => state.deleteNode);

  return (
    <div
      className={`bg-blue-100 border-2 rounded-lg p-4 min-w-[120px] min-h-[80px] relative group ${
        selected ? "border-blue-500" : "border-blue-300"
      }`}
      style={{
        width: data.width || 120,
        height: data.height || 80,
      }}
    >
      <div className="text-center text-sm font-medium text-gray-700">
        {data.label || "Rectangle"}
      </div>

      {/* Delete button - only show when selected */}
      {selected && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      {/* Resize handles */}
      {selected && (
        <>
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Handle resize logic here
            }}
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
    addNode,
    diagramId,
    setDiagramId,
    setLoading,
    selectedNodeId,
    setSelectedNodeId,
    shouldAddRectangle,
    resetAddRectangleFlag,
  } = useDiagramStore();

  const { user } = useUserStore();
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);
  // Sync React Flow state with Zustand store
  React.useEffect(() => {
    setFlowNodes(nodes);
  }, [nodes, setFlowNodes]);

  React.useEffect(() => {
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);
  // Add rectangle
  const addRectangle = useCallback(() => {
    console.log("🔧 addRectangle called");
    console.log("📐 reactFlowInstance:", reactFlowInstance);
    console.log("📐 reactFlowWrapper.current:", reactFlowWrapper.current);
    
    if (!reactFlowInstance) {
      console.log("❌ No reactFlowInstance");
      return;
    }

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) {
      console.log("❌ No reactFlowBounds");
      return;
    }

    // Position new rectangle in the center of the visible area
    const centerX = reactFlowBounds.width / 2;
    const centerY = reactFlowBounds.height / 2;

    const position = reactFlowInstance.project({
      x: centerX - 60, // Half of rectangle width
      y: centerY - 40, // Half of rectangle height
    });

    console.log("📍 Position:", position);

    const newNode = {
      id: `rectangle-${Date.now()}`,
      type: "rectangle",
      position,
      data: {
        label: "Rectangle",
        width: 120,
        height: 80,
      },
    };

    console.log("🆕 New node:", newNode);
    addNode(newNode);
    console.log("✅ Node added to store");
  }, [reactFlowInstance, addNode]);
  // Watch for rectangle addition trigger
  React.useEffect(() => {
    console.log("🔍 shouldAddRectangle changed:", shouldAddRectangle);
    if (shouldAddRectangle) {
      console.log("📦 Adding rectangle...");
      addRectangle();
      resetAddRectangleFlag();
      console.log("✅ Rectangle added and flag reset");
    }
  }, [shouldAddRectangle, resetAddRectangleFlag, addRectangle]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, flowEdges);
      setFlowEdges(newEdge);
      // Convert React Flow edges to our custom Edge type
      const convertedEdges = newEdge.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type || "default",
        data: edge.data,
      }));
      setEdges(convertedEdges);
    },
    [flowEdges, setFlowEdges, setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // Convert React Flow nodes to our custom Node type
      const convertedNodes = flowNodes.map((node) => ({
        id: node.id,
        type: node.type || "default",
        position: node.position,
        data: node.data,
        width: node.width || undefined,
        height: node.height || undefined,
      }));
      setNodes(convertedNodes);
    },
    [onNodesChange, flowNodes, setNodes]
  );
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      // Convert React Flow edges to our custom Edge type
      const convertedEdges = flowEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type || "default",
        data: edge.data,
      }));
      setEdges(convertedEdges);
    },
    [onEdgesChange, flowEdges, setEdges]
  );

  // Save diagram to Firebase
  const saveDiagram = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Convert React Flow nodes and edges to our custom types
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

      if (diagramId) {
        // Update existing diagram
        await diagramService.updateDiagramContent(
          diagramId,
          convertedNodes,
          convertedEdges
        );
      } else {
        // Create new diagram
        const newDiagramId = await diagramService.createDiagram(user.uid, {
          title: "My Diagram",
          nodes: convertedNodes,
          edges: convertedEdges,
        });
        setDiagramId(newDiagramId);
      }
      console.log("Diagram saved successfully!");
    } catch (error) {
      console.error("Failed to save diagram:", error);
    } finally {
      setLoading(false);
    }
  }, [user, diagramId, flowNodes, flowEdges, setLoading, setDiagramId]);

  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div
      className={`h-full w-full bg-gray-50 ${className}`}
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={flowNodes.map((node) => ({
          ...node,
          selected: node.id === selectedNodeId,
        }))}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
        {/* Toolbar Panel */}
        <Panel position="top-left" className="space-x-2">
          <Button
            onClick={saveDiagram}
            variant="outline"
            size="sm"
            disabled={!user}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </Panel>
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
