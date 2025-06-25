// React Flow compatible types
export interface NodeData {
  label?: string;
  content?: string;
  width?: number;
  height?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface Node {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: NodeData;
  selected?: boolean;
  dragging?: boolean;
  dragHandle?: string;
  width?: number;
  height?: number;
}

export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  [key: string]: string | number | undefined;
}

export interface EdgeData {
  label?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: EdgeStyle;
  data?: EdgeData;
}

export interface Diagram {
  id: string;
  owner: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: Date | { seconds: number; nanoseconds: number }; // Firebase Timestamp
  updatedAt: Date | { seconds: number; nanoseconds: number }; // Firebase Timestamp
  allowedUsers: string[]; // For future collaboration
  isCollaborative: boolean; // Toggle for collaboration mode
  title?: string;
  description?: string;
}

export interface DiagramMeta {
  id: string;
  title: string;
  description?: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt: Date | { seconds: number; nanoseconds: number };
  owner: string;
}

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  borderWidth?: number;
  borderRadius?: number;
}

export interface HistoryState {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}
