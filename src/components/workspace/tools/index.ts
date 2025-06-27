export {
  ConnectionTool,
  connectionTool,
  type ConnectionState,
  type ConnectionToolOptions,
} from "./ConnectionTool";

export { TextTool, textTool, type TextToolOptions } from "./TextTool";

export {
  ShapeTool,
  rectangleTool, // as shapeRectangleTool,
  circleTool,
  diamondTool,
  triangleTool,
  getShapeTool,
  type ShapeType,
  type ShapeData,
  type ShapeToolOptions,
} from "./ShapeTool";

export { DrawTool, drawTool, type DrawToolOptions } from "./DrawTool";

// Future tools can be exported here
// export { CircleTool, circleTool } from './CircleTool';
// export { LineTool, lineTool } from './LineTool';
