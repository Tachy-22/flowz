"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  createChat,
  sendMessageStream,
  ChatHistory,
  GeminiChat as Chat,
} from "@/integrations/gemini";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
  const [chat, setChat] = useState<Chat | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Initialize chat on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log("🔧 Initializing Gemini chat component");

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

        console.log("📝 Creating chat with default history");
        const chatInstance = createChat(defaultHistory);
        console.log("✅ Chat instance created:", !!chatInstance);
        console.log("Chat instance type:", typeof chatInstance);
        console.log("Chat instance keys:", Object.keys(chatInstance || {}));

        setChat(chatInstance);
        console.log("🎯 Chat state updated");
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
    if (!input.trim() || isLoading || !chat) return;

    console.log("🚀 Starting message send process");
    console.log("Input:", input.trim());
    console.log("Chat instance exists:", !!chat);
    console.log("Is loading:", isLoading);

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
      const messageText = userMessage.content;
      let fullResponse = "";
      let chunkCount = 0;

      console.log("📤 Starting to stream message:", messageText);

      // Stream the response
      for await (const chunk of sendMessageStream(chat, messageText)) {
        chunkCount++;
        fullResponse = chunk;
        console.log(
          `📥 Received chunk ${chunkCount}:`,
          chunk.substring(0, 50) + "..."
        );

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessage.id
              ? { ...msg, content: chunk, isStreaming: true }
              : msg
          )
        );

        // Small delay to make streaming visible
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      console.log("✅ Streaming completed. Total chunks:", chunkCount);
      console.log("Final response length:", fullResponse.length);

      // Mark as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id
            ? { ...msg, content: fullResponse, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("❌ Error in handleSendMessage:");
      console.error("Error type:", typeof error);
      console.error("Error message:", (error as Error)?.message);
      console.error("Error stack:", (error as Error)?.stack);
      console.error("Full error object:", error);

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
      console.log("🏁 Message send process completed");
      // Focus back to input
      setTimeout(() => inputRef.current?.focus(), 100);
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
    const defaultHistory: ChatHistory[] = [
      {
        role: "model",
        parts: [
          {
            text: "Hello! I'm your AI assistant for creating flow diagrams. How can I help you today?",
          },
        ],
      },
    ];
    const chatInstance = createChat(defaultHistory);
    setChat(chatInstance);
  };
  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Chat History</span>
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages ScrollArea */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
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
                  className={`flex-1 ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  {" "}
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
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
                              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-900 font-mono text-xs">
                                {children}
                              </code>
                            ),
                            // Customize code blocks
                            pre: ({ children }) => (
                              <pre className="bg-gray-200 p-3 rounded-lg overflow-x-auto my-2">
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
            placeholder="Ask me to help you create a flow diagram..."
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
