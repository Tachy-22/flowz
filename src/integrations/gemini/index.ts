import { GoogleGenAI } from "@google/genai";

// Debug logging for environment setup
console.log("🔧 Gemini Setup Debug:");
console.log(
  "API Key exists:",
  !!process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY
);
console.log(
  "API Key length:",
  process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY?.length || 0
);
console.log(
  "API Key prefix:",
  process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) + "..."
);

// Initialize the GoogleGenAI instance
const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || "",
});

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  text?: string;
  content?: {
    text: string;
  };
}

export interface GeminiChat {
  sendMessage: (params: { message: string }) => Promise<GeminiResponse>;
  history?: ChatHistory[];
}

// Helper function to log errors with context
const logError = (context: string, error: unknown) => {
  console.error(`❌ ${context}:`);
  console.error("Error message:", (error instanceof Error ? error.message : String(error)) || "Unknown error");
  console.error("Error type:", typeof error);
  console.error("Error details:", error);
  if (error instanceof Error && error.stack) {
    console.error("Stack trace:", error.stack);
  }
};

// Default chat history
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

// Create a new chat instance
export const createChat = (
  history: ChatHistory[] = defaultHistory
): GeminiChat => {
  try {
    console.log(
      "🔄 Creating Gemini chat with history:",
      history.length,
      "messages"
    );

    const chat = genAI.chats.create({
      model: "gemini-1.5-flash",
      history: history,
    }) as unknown as GeminiChat;

    console.log("✅ Chat created successfully");
    return chat;
  } catch (error) {
    logError("Creating Gemini chat", error);
    throw error;
  }
};

// Send a regular message
export const sendMessage = async (
  chat: GeminiChat,
  message: string
): Promise<string> => {
  try {
    console.log(
      "📤 Sending message to Gemini:",
      message.substring(0, 50) + "..."
    );
    console.log("Chat object type:", typeof chat);
    console.log("Chat object keys:", Object.keys(chat || {}));

    const response = await chat.sendMessage({
      message: message,
    });

    console.log("📥 Received response type:", typeof response);
    console.log("Response keys:", Object.keys(response || {}));
    console.log("Response text exists:", !!response?.text);
    console.log("Response text type:", typeof response?.text);

    const text =
      response?.text || response?.content?.text || "No response text found";
    console.log("✅ Final response text:", text.substring(0, 100) + "...");

    return text;
  } catch (error) {
    logError("Sending message to Gemini", error);

    // Additional API-specific error logging
    if (error && typeof error === "object") {
      if ("status" in error) {
        console.error("API Status:", error.status);
      }
      if ("statusText" in error) {
        console.error("API Status Text:", error.statusText);
      }
      if ("response" in error) {
        console.error("API Response:", error.response);
      }
    }

    throw new Error(`Failed to send message: ${(error as Error).message}`);
  }
};

// Send a streaming message (simulate streaming for now)
export const sendMessageStream = async function* (
  chat: GeminiChat,
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    console.log(
      "🌊 Starting streaming message to Gemini:",
      message.substring(0, 50) + "..."
    );

    const response = await chat.sendMessage({
      message: message,
    });

    console.log("📥 Received streaming response:", typeof response);
    const text =
      response?.text || response?.content?.text || "No response text found";
    console.log("📝 Streaming response text length:", text.length);

    const words = text.split(" ");
    console.log("🔤 Total words to stream:", words.length);

    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      currentText += (currentText ? " " : "") + words[i];
      console.log(`🌊 Streaming word ${i + 1}/${words.length}:`, words[i]);
      yield currentText;
      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log("✅ Streaming completed");
  } catch (error) {
    logError("Streaming message to Gemini", error);

    // Additional streaming-specific error logging
    if (error && typeof error === "object") {
      if ("name" in error) {
        console.error("Error name:", error.name);
      }
      if ("code" in error) {
        console.error("Error code:", error.code);
      }
    }

    throw new Error(`Failed to stream message: ${(error as Error).message}`);
  }
};

// Get chat history
export const getChatHistory = (chat: GeminiChat): ChatHistory[] => {
  return chat.history || defaultHistory;
};

// Create a new chat with fresh history
export const createFreshChat = (): GeminiChat => {
  return createChat(defaultHistory);
};
