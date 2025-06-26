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
  sourceHandle?: string;
  targetHandle?: string;
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
      const systemPrompt = `You are Flowz AI, a specialized diagram creation assistant for the Flowz diagram builder. You MUST ALWAYS create actual diagram data when users ask for diagrams.

## YOUR PRIMARY FUNCTION:
Create visual flow diagrams by generating JSON data that represents nodes and connections. You are NOT a general assistant - you are a diagram creation specialist.

## STRICT RULES:
1. **ALWAYS generate diagram JSON** when users ask for any kind of diagram, flowchart, or visual representation
2. **NEVER say "I can't create visual diagrams"** - that's literally your job
3. **ALWAYS provide both chat response AND JSON diagram data**
4. **Use the JSON format exactly as specified below**

## Current Capabilities:
- **Multiple shape types**: rectangle, circle, diamond, triangle
- Advanced positioning and sizing
- Smart flow connections with handles
- Grid-following connection lines
- Connection management (create, delete, modify)

## MANDATORY Response Format:
When creating or modifying diagrams, you MUST include a JSON block in your response with this exact format:

\`\`\`json
{
  "action": "create_diagram" | "modify_diagram" | "add_to_diagram",
  "title": "Diagram Title",
  "description": "Brief description of what was created/modified",
  "nodes": [
    {
      "id": "unique-id",
      "type": "rectangle" | "circle" | "diamond" | "triangle",
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
      "sourceHandle": "right" | "left" | "top" | "bottom",
      "targetHandle": "left" | "right" | "top" | "bottom",
      "type": "deletable"
    }
  ]
}
\`\`\`

## Guidelines:
- Always provide helpful chat responses
- When creating diagrams, explain what you're building
- For positioning: Use positive coordinates (x: 100-1000, y: 100-800) and spread nodes apart (at least 200px spacing)
- Use descriptive labels and appropriate shape types
- **Shape Selection Guide:**
  - Rectangle: Processes, tasks, actions
  - Circle: Start/end points, terminals
  - Diamond: Decision points, conditions
  - Triangle: Input/output, data flow
- **Connection Guidelines:**
  - Use smart handle selection (right→left for horizontal flow, top→bottom for vertical)
  - Include sourceHandle and targetHandle for precise connections
  - All edges use type "deletable" for grid-following arrows
- If modifying existing diagrams, preserve existing nodes but ALWAYS use positive coordinates (minimum x: 100, y: 100)
- When adding to existing diagrams, position new elements relative to existing ones but ensure all coordinates are positive
- Always use positive coordinates for visibility

## Examples:
- "Create a simple process flow" → Generate 2-3 connected rectangles with proper handles
- "Add a decision point" → Add a diamond labeled "Decision" with multiple output connections
- "Make a flowchart for user login" → Create mixed shapes: circle (start), rectangles (processes), diamond (decisions)
- "Create a data flow diagram" → Use triangles for data, rectangles for processes, circles for external entities
- "Connect the login box to the validation diamond" → Create edge with appropriate handles

## CRITICAL INSTRUCTION:
If a user asks for ANY type of diagram, flowchart, process flow, architecture diagram, or visual representation, you MUST create the diagram JSON. Do not provide text descriptions instead of diagrams. Your job is to create actual visual diagrams that render in the tool.

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
              text: "I'm FlowForge AI, your diagram creation specialist! I create visual flow diagrams by generating actual diagram data that renders immediately in your workspace. Tell me what kind of diagram you want to create - a process flow, system architecture, user journey, decision tree, or any other type of flowchart - and I'll build it for you with the appropriate shapes and connections!",
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

  // Streaming version of processRequest
  async *processRequestStream(
    request: DiagramCreationRequest
  ): AsyncGenerator<
    {
      chatResponse: string;
      diagramData?: DiagramCreationResponse["diagramData"];
      isComplete: boolean;
    },
    void,
    unknown
  > {
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
      console.log(
        "🤖 Starting streaming request to diagram agent:",
        contextPrompt
      );

      let fullResponse = "";
      let lastYieldTime = 0;
      const YIELD_INTERVAL = 150; // Yield every 150ms at most

      for await (const chunk of sendMessageStream(this.chat, contextPrompt)) {
        fullResponse += chunk; // Accumulate individual chunks
        console.log("📝 Streaming chunk received:", chunk);

        // Throttle yielding to prevent too frequent updates
        const now = Date.now();
        if (now - lastYieldTime >= YIELD_INTERVAL) {
          yield {
            chatResponse: fullResponse,
            isComplete: false,
          };
          lastYieldTime = now;
        }
      }

      // Parse diagram data from final response
      const diagramData = this.extractDiagramData(fullResponse);

      // Yield final response with diagram data
      yield {
        chatResponse: fullResponse,
        diagramData,
        isComplete: true,
      };

      console.log("✅ Streaming completed with diagram data:", !!diagramData);
    } catch (error) {
      console.error("❌ Diagram agent streaming error:", error);
      yield {
        chatResponse: `Sorry, I encountered an error: ${
          (error as Error)?.message || "Unknown error"
        }`,
        isComplete: true,
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
      ); // Ensure all edges have required properties
      const validatedEdges: Edge[] = (parsed.edges || []).map(
        (edge: unknown, index: number) => {
          const rawEdge = edge as RawEdge;
          const validatedEdge: Edge = {
            id: rawEdge.id || `edge-${Date.now()}-${index}`,
            source: rawEdge.source || "",
            target: rawEdge.target || "",
            type: rawEdge.type || "deletable", // Default to deletable for grid-following
            data: rawEdge.data || {},
          };

          // Only add handle properties if they exist (avoid undefined values)
          if (rawEdge.sourceHandle) {
            validatedEdge.sourceHandle = rawEdge.sourceHandle;
          }
          if (rawEdge.targetHandle) {
            validatedEdge.targetHandle = rawEdge.targetHandle;
          }

          return validatedEdge;
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
    console.log("🔄 Resetting diagram agent...");
    this.initializeAgent();
  }

  // Force diagram creation mode
  enterDiagramMode() {
    if (!this.chat) {
      this.initializeAgent();
      return;
    }

    // Add a strong reminder message to the chat
    const reminderMessage = `REMINDER: You are Flowz AI, a diagram creation specialist. When users ask for any type of diagram, flowchart, or visual representation, you MUST create the diagram JSON. Do not provide text descriptions - create actual visual diagrams.`;

    console.log("🔧 Activating diagram creation mode", reminderMessage);
    // This doesn't need to be awaited, just sets the context
  }
}

// Export singleton instance
export const diagramAgent = new DiagramAgent();
