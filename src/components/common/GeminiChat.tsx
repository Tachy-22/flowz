"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createChat, ChatHistory } from "@/integrations/gemini";
import { diagramAgent, DiagramCreationRequest } from "@/integrations/ai";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { useUserStore } from "@/integrations/zustand";
import { diagramService } from "@/integrations/firebase/diagrams";
import { Node, Edge } from "@/types/diagram";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  hasDiagramData?: boolean;
}

const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "model",
      content:
        "Hello! I'm your AI assistant for creating flow diagrams. I can help you design, modify, and generate diagrams based on your requirements. What would you like to create today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //  const [chat, setChat] = useState<Chat | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Get diagram state and functions
  const {
    nodes,
    edges,
    diagramTitle,
    diagramId,
    setDiagramId,
    setLoading: setDiagramLoading,
    loadDiagram,
    setPendingDiagramToAnimate, // <-- add this
  } = useDiagramStore();
  const { user } = useUserStore();
  // Initialize chat on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        //console.log("🔧 Initializing Gemini chat component");

        const defaultHistory: ChatHistory[] = [
          {
            role: "model",
            parts: [
              {
                text: "Hello! I'm your AI assistant for creating flow diagrams. I can help you design, modify, and generate diagrams based on your requirements. What would you like to create today?",
              },
            ],
          },
        ];

        //  console.log("📝 Creating chat with default history");
        createChat(defaultHistory);
        // console.error("✅ Chat instance created:", !!chatInstance);
        // console.log("Chat instance type:", typeof chatInstance);
        // console.log("Chat instance keys:", Object.keys(chatInstance || {}));

        //  setChat(chatInstance);
        // console.log("🎯 Chat state updated");
      } catch (error) {
        console.error("❌ Failed to initialize chat:");
        console.error("Error type:", typeof error);
        console.error("Error message:", (error as Error)?.message);
        console.error("Error stack:", (error as Error)?.stack);
        console.error("Full error object:", error);
      }
    };

    initializeChat();
  }, []);
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // console.log("🚀 Starting AI diagram creation process");
    // console.log("Input:", input.trim());
    // console.log("Current diagram context:", {
    //   nodes: nodes.length,
    //   edges: edges.length,
    //   title: diagramTitle,
    // });

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare diagram creation request with current context
      const request: DiagramCreationRequest = {
        prompt: userMessage.content,
        currentDiagram:
          nodes.length > 0 || edges.length > 0
            ? {
                nodes,
                edges,
                title: diagramTitle,
              }
            : undefined,
      };
      // console.log("📤 Sending request to diagram agent");

      // Use streaming version for real-time updates
      let finalDiagramData: {
        nodes: Node[];
        edges: Edge[];
        title: string;
        description?: string;
      } | null = null;
      for await (const chunk of diagramAgent.processRequestStream(request)) {
        // Update the message with streaming content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id
              ? {
                  ...msg,
                  content: chunk.chatResponse,
                  isStreaming: !chunk.isComplete,
                  hasDiagramData: !!chunk.diagramData,
                }
              : msg
          )
        );
        // Remove unused variable
        // fullChatResponse = chunk.chatResponse;
        // Only store the final diagram data for animation
        if (chunk.isComplete && chunk.diagramData) {
          finalDiagramData = chunk.diagramData;
        }
      }
      // --- Simulated streaming animation now handled in DiagramCanvas ---
      if (finalDiagramData && user) {
        setPendingDiagramToAnimate(finalDiagramData);
        await createDiagramFromAI(finalDiagramData);
      }
    } catch (error) {
      console.error("❌ Error in AI diagram creation:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${
                  (error as Error)?.message || "Unknown error"
                }. Please try again.`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      //console.log("🏁 AI diagram creation process completed");
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  // Create or update diagram with AI-generated data
  const createDiagramFromAI = async (diagramData: {
    nodes: Node[];
    edges: Edge[];
    title: string;
    description?: string;
    action?: string;
  }) => {
    if (!user || !diagramData) return;
    try {
      setDiagramLoading(true);

      //console.log(
      //   "🎨 Loading AI-generated diagram with coordinates:",
      //   diagramData.nodes.map((n) => ({ id: n.id, position: n.position }))
      // );

      // Update the diagram state with AI-generated data using loadDiagram
      loadDiagram(
        diagramData.nodes,
        diagramData.edges,
        diagramData.title,
        diagramId || undefined
      );

      // Save to Firebase
      if (diagramId && diagramData.action === "modify_diagram") {
        //console.log({ action: diagramData.action });
        // Update existing diagram
        //console.log("💾 Updating existing diagram with AI data");
        await diagramService.updateDiagramContent(
          diagramId,
          diagramData.nodes,
          diagramData.edges
        );
        await diagramService.updateDiagram(diagramId, {
          title: diagramData.title,
          description: diagramData.description,
        });
      } else {
        // Create new diagram
        //console.log("🆕 Creating new diagram with AI data");
        const newDiagramId = await diagramService.createDiagram(user.uid, {
          title: diagramData.title,
          description: diagramData.description,
          nodes: diagramData.nodes,
          edges: diagramData.edges,
        });
        setDiagramId(newDiagramId);
      }

      //console.log("✅ Diagram successfully created/updated with AI data");
    } catch (error) {
      console.error("❌ Failed to save AI-generated diagram:", error);
    } finally {
      setDiagramLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "model",
        content:
          "Hello! I'm your AI assistant for creating flow diagrams. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    // Reinitialize chat
    // const defaultHistory: ChatHistory[] = [
    //   {
    //     role: "model",
    //     parts: [
    //       {
    //         text: "Hello! I'm your AI assistant for creating flow diagrams. How can I help you today?",
    //       },
    //     ],
    //   },
    // ];
    // const chatInstance = createChat(defaultHistory);
    // console.log(chatInstance);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-end p-3 border-b border-gray-200 bg-gray-50">
        {/* <span className="text-sm font-medium text-gray-700">Chat History</span> */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          disabled={isLoading}
          className="h-7 px-2 text-xs"
        >
          Clear
        </Button>
      </div>{" "}
      {/* Messages Area */}
      <div className="w-full flex-1 flex flex-col min-h-0 ">
        {/* Messages ScrollArea */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 items-start  ${
                  message.role === "user"
                    ? "flex-row-reverse  w-full "
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>

                <div
                  className={` ${
                    message.role === "user" ? "flex flex-col items-end " : ""
                  }`}
                >
                  {" "}
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] w-fit border relative ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white items-end justify-end"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {/* Diagram indicator for AI messages with diagram data */}
                    {message.role === "model" && message.hasDiagramData && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}

                    {message.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Customize list styling
                            ul: ({ children }) => (
                              <ul className="list-disc ml-4 space-y-1 my-2">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-4 space-y-1 my-2">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-gray-900 leading-relaxed">
                                {children}
                              </li>
                            ),
                            // Customize emphasis
                            strong: ({ children }) => (
                              <strong className="font-semibold text-gray-900">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-gray-800">
                                {children}
                              </em>
                            ),
                            // Customize paragraphs
                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0 text-gray-900 leading-relaxed">
                                {children}
                              </p>
                            ),
                            // Customize code
                            code: ({ children }) => (
                              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-900 font-mono text-xs hidden">
                                {children}
                              </code>
                            ),
                            // Customize code blocks
                            pre: ({ children }) => (
                              <pre className="bg-gray-200 p-3 rounded-lg overflow-x-auto my-2 hidden">
                                {children}
                              </pre>
                            ),
                            // Customize headings
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold text-gray-900 mb-2 mt-3 first:mt-0">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-semibold text-gray-900 mb-2 mt-3 first:mt-0">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 mt-2 first:mt-0">
                                {children}
                              </h3>
                            ),
                            // Customize blockquotes
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.isStreaming && (
                      <div className="mt-1 flex items-center space-x-1">
                        <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>{" "}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex items-center space-x-2 p-4 border-t bg-white">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to create or modify your diagram... (e.g., 'Create a simple rectangle', 'Add a process box')"
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>{" "}
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
