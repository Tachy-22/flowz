import RectangleNode from "./RectangleNode";
import CircleNode from "./CircleNode";
import DiamondNode from "./DiamondNode";
import TriangleNode from "./TriangleNode";
import TextNode from "./TextNode";
import DrawNode from "./DrawNode";

// Export all node types for easy importing
export const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  diamond: DiamondNode,
  triangle: TriangleNode,
  text: TextNode,
  draw: DrawNode,
};

// Also export individual nodes
export { default as RectangleNode } from "./RectangleNode";
export { default as CircleNode } from "./CircleNode";
export { default as DiamondNode } from "./DiamondNode";
export { default as TriangleNode } from "./TriangleNode";
export { default as TextNode } from "./TextNode";
export { default as DrawNode } from "./DrawNode";
