import { Node, Edge, EdgeData } from "@/types/diagram";
import {
  createChat,
  sendMessageStream,
  ChatHistory,
} from "@/integrations/gemini";

export interface DiagramCreationRequest {
  prompt: string;
  currentDiagram?: {
    nodes: Node[];
    edges: Edge[];
    title?: string;
  };
}

export interface DiagramCreationResponse {
  chatResponse: string;
  diagramData?: {
    nodes: Node[];
    edges: Edge[];
    title: string;
    description?: string;
  };
  success: boolean;
  error?: string;
}

interface ParsedDiagramData {
  action?: string;
  title?: string;
  description?: string;
  nodes?: unknown[];
  edges?: unknown[];
}

interface RawNode {
  id?: string;
  type?: string;
  position?: { x: number; y: number };
  data?: {
    label?: string;
    width?: number;
    height?: number;
    [key: string]: string | number | boolean | undefined;
  };
}

interface RawEdge {
  id?: string;
  source?: string;
  target?: string;
  type?: string;
  data?: EdgeData;
}

export class DiagramAgent {
  private chat: ReturnType<typeof createChat> | null = null;

  constructor() {
    this.initializeAgent();
  }

  private initializeAgent() {
    try {
      const systemPrompt = `You are a diagram creation assistant for Flowz, an AI-powered flow diagram builder. Your role is to:

1. **Chat normally** with users about diagram creation
2. **Generate diagram data** when asked to create or modify diagrams
3. **Work with existing diagrams** by adding, modifying, or replacing elements

## Current Capabilities:
- **Rectangle shapes only** (for now)
- Basic positioning and sizing
- Simple flow connections

## Response Format:
When creating or modifying diagrams, you must include a JSON block in your response with this exact format:

\`\`\`json
{
  "action": "create_diagram" | "modify_diagram" | "add_to_diagram",
  "title": "Diagram Title",
  "description": "Brief description of what was created/modified",
  "nodes": [
    {
      "id": "unique-id",
      "type": "rectangle",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Node Label",
        "width": 120,
        "height": 80
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "default"
    }
  ]
}
\`\`\`

## Guidelines:
- Always provide helpful chat responses
- When creating diagrams, explain what you're building
- For positioning: Use positive coordinates (x: 100-1000, y: 100-800) and spread nodes apart (at least 200px spacing)
- Use descriptive labels
- Keep it simple for now (rectangles only)
- If modifying existing diagrams, preserve existing nodes but ALWAYS use positive coordinates (minimum x: 100, y: 100)
- When adding to existing diagrams, position new elements relative to existing ones but ensure all coordinates are positive
- Always use positive coordinates for visibility

## Examples:
- "Create a simple process flow" → Generate 2-3 connected rectangles
- "Add a decision point" → Add a rectangle labeled "Decision"
- "Make a flowchart for user login" → Create login process rectangles

Remember: Always include both a helpful chat response AND diagram JSON when creating/modifying diagrams.`;
      const defaultHistory: ChatHistory[] = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hello! I'm your diagram creation assistant. I can help you create flow diagrams by chatting with you and generating diagram data. What kind of diagram would you like to create today?",
            },
          ],
        },
      ];

      this.chat = createChat(defaultHistory);
      console.log("✅ Diagram agent initialized");
    } catch (error) {
      console.error("❌ Failed to initialize diagram agent:", error);
    }
  }

  async processRequest(
    request: DiagramCreationRequest
  ): Promise<DiagramCreationResponse> {
    try {
      if (!this.chat) {
        throw new Error("Diagram agent not initialized");
      }

      // Build context about current diagram
      let contextPrompt = request.prompt;

      if (request.currentDiagram) {
        const { nodes, edges, title } = request.currentDiagram;
        const contextInfo = `

CURRENT DIAGRAM CONTEXT:
- Title: ${title || "Untitled"}
- Nodes: ${nodes.length} (${nodes
          .map((n) => `"${n.data.label || n.id}"`)
          .join(", ")})
- Edges: ${edges.length} connections
- Node details: ${JSON.stringify(nodes, null, 2)}
- Edge details: ${JSON.stringify(edges, null, 2)}

User request: ${request.prompt}`;

        contextPrompt = contextInfo;
      }

      console.log("🤖 Sending request to diagram agent:", contextPrompt);

      // Get AI response
      let fullResponse = "";
      for await (const chunk of sendMessageStream(this.chat, contextPrompt)) {
        fullResponse = chunk;
      }

      console.log(
        "📝 Agent response received:",
        fullResponse.substring(0, 200) + "..."
      );

      // Parse diagram data from response
      const diagramData = this.extractDiagramData(fullResponse);

      return {
        chatResponse: fullResponse,
        diagramData,
        success: true,
      };
    } catch (error) {
      console.error("❌ Diagram agent error:", error);
      return {
        chatResponse: `Sorry, I encountered an error: ${
          (error as Error)?.message || "Unknown error"
        }`,
        success: false,
        error: (error as Error)?.message,
      };
    }
  }

  private extractDiagramData(
    response: string
  ): DiagramCreationResponse["diagramData"] {
    try {
      // Look for JSON blocks in the response
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
      let match;
      const matches: string[] = [];

      while ((match = jsonRegex.exec(response)) !== null) {
        matches.push(match[1]);
      }
      if (matches.length === 0) {
        console.log("💭 No diagram JSON found in response");
        return undefined;
      }

      const jsonStr = matches[0];
      const parsed = JSON.parse(jsonStr) as ParsedDiagramData;

      console.log("📊 Extracted diagram data:", parsed);

      // Validate the structure
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error("Invalid diagram data: missing or invalid nodes");
      } // Ensure all nodes have required properties
      const validatedNodes: Node[] = (parsed.nodes || []).map(
        (node: unknown, index: number) => {
          const rawNode = node as RawNode;
          // Ensure positive coordinates for visibility
          const defaultPosition = { x: 100 + index * 200, y: 100 };
          const position = rawNode.position || defaultPosition;

          // Fix negative coordinates for ALL nodes (including existing ones)
          const safePosition = {
            x: Math.max(position.x, 50), // Ensure minimum x of 50
            y: Math.max(position.y, 50), // Ensure minimum y of 50
          };

          console.log(
            `🔧 Node ${rawNode.id}: Original position (${position.x}, ${position.y}) → Safe position (${safePosition.x}, ${safePosition.y})`
          );

          return {
            id: rawNode.id || `node-${Date.now()}-${index}`,
            type: rawNode.type || "rectangle",
            position: safePosition,
            data: {
              label: rawNode.data?.label || `Node ${index + 1}`,
              width: rawNode.data?.width || 120,
              height: rawNode.data?.height || 80,
              ...rawNode.data,
            },
          };
        }
      );

      // Ensure all edges have required properties
      const validatedEdges: Edge[] = (parsed.edges || []).map(
        (edge: unknown, index: number) => {
          const rawEdge = edge as RawEdge;
          return {
            id: rawEdge.id || `edge-${Date.now()}-${index}`,
            source: rawEdge.source || "",
            target: rawEdge.target || "",
            type: rawEdge.type || "default",
            data: rawEdge.data || {},
          };
        }
      );

      return {
        nodes: validatedNodes,
        edges: validatedEdges,
        title: parsed.title || "AI Generated Diagram",
        description: parsed.description,
      };
    } catch (error) {
      console.error("❌ Failed to extract diagram data:", error);
      return undefined;
    }
  }

  // Reset the agent's conversation
  resetAgent() {
    this.initializeAgent();
  }
}

// Export singleton instance
export const diagramAgent = new DiagramAgent();
