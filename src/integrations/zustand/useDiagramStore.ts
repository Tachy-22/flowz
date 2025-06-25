import { create } from "zustand";
import { Node, Edge } from "@/types/diagram";

export type Tool =
  | "select"
  | "rectangle"
  | "circle"
  | "diamond"
  | "arrow"
  | "text";

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface DiagramState {
  // Core diagram data
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  viewport: Viewport;

  // Tool state
  activeTool: Tool;
  shouldAddRectangle: boolean; // Flag to trigger rectangle addition

  // History for undo/redo
  history: HistoryState[];
  currentHistoryIndex: number;

  // Connection state
  isConnecting: boolean;
  connectionStartNode: string | null;

  // Diagram metadata
  diagramId: string | null;
  diagramTitle: string;
  loading: boolean;

  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;

  // Tool actions
  setActiveTool: (tool: Tool) => void;
  triggerAddRectangle: () => void;
  resetAddRectangleFlag: () => void;

  // Connection actions
  startConnection: (nodeId: string) => void;
  endConnection: () => void;

  // History actions
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Diagram management
  setDiagramId: (id: string) => void;
  setDiagramTitle: (title: string) => void;
  setLoading: (loading: boolean) => void;
  resetDiagram: () => void;

  // Export data
  getDiagramData: () => { nodes: Node[]; edges: Edge[] };
}

const initialViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: initialViewport,
  activeTool: "select",
  shouldAddRectangle: false,
  history: [],
  currentHistoryIndex: -1,
  isConnecting: false,
  connectionStartNode: null,
  diagramId: null,
  diagramTitle: "Untitled Diagram",
  loading: false,

  // Basic setters
  setNodes: (nodes) => {
    set({ nodes });
    get().saveToHistory();
  },

  setEdges: (edges) => {
    set({ edges });
    get().saveToHistory();
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    get().saveToHistory();
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
    get().saveToHistory();
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
    get().saveToHistory();
  },

  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }));
    get().saveToHistory();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    get().saveToHistory();
  },
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setViewport: (viewport) => set({ viewport }),

  // Tool actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  triggerAddRectangle: () => set({ shouldAddRectangle: true }),
  resetAddRectangleFlag: () => set({ shouldAddRectangle: false }),

  // Connection actions
  startConnection: (nodeId) =>
    set({
      isConnecting: true,
      connectionStartNode: nodeId,
    }),

  endConnection: () =>
    set({
      isConnecting: false,
      connectionStartNode: null,
    }),

  // History management
  saveToHistory: () => {
    const state = get();
    const historyState: HistoryState = {
      nodes: [...state.nodes],
      edges: [...state.edges],
      timestamp: Date.now(),
    };

    // Remove any future history if we're not at the end
    const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
    newHistory.push(historyState);

    // Limit history size to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.currentHistoryIndex > 0) {
      const previousState = state.history[state.currentHistoryIndex - 1];
      set({
        nodes: [...previousState.nodes],
        edges: [...previousState.edges],
        currentHistoryIndex: state.currentHistoryIndex - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.currentHistoryIndex < state.history.length - 1) {
      const nextState = state.history[state.currentHistoryIndex + 1];
      set({
        nodes: [...nextState.nodes],
        edges: [...nextState.edges],
        currentHistoryIndex: state.currentHistoryIndex + 1,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.currentHistoryIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.currentHistoryIndex < state.history.length - 1;
  },

  // Diagram management
  setDiagramId: (id) => set({ diagramId: id }),
  setDiagramTitle: (title) => set({ diagramTitle: title }),
  setLoading: (loading) => set({ loading }),

  resetDiagram: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      viewport: initialViewport,
      history: [],
      currentHistoryIndex: -1,
      isConnecting: false,
      connectionStartNode: null,
      diagramTitle: "Untitled Diagram",
    }),

  getDiagramData: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
    };
  },
}));
