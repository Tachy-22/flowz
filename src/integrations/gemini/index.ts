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
const ai = new GoogleGenAI({
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

export interface GeminiChat {
  sendMessageStream: (params: {
    message: string;
  }) => Promise<AsyncGenerator<{ text: string }, void, unknown>>;
  history?: ChatHistory[];
}

// Helper function to log errors with context
const logError = (context: string, error: unknown) => {
  console.error(`❌ ${context}:`);
  console.error(
    "Error message:",
    (error instanceof Error ? error.message : String(error)) || "Unknown error"
  );
  console.error("Error type:", typeof error);
  console.error("Error details:", error);
  if (error instanceof Error && error.stack) {
    console.error("Stack trace:", error.stack);
  }
};
//   console.error("Error details:", error);
//   if (error instanceof Error && error.stack) {
//     console.error("Stack trace:", error.stack);
//   }
// };

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

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
    });

    console.log("✅ Chat created successfully");
    return chat as unknown as GeminiChat;
  } catch (error) {
    logError("Creating Gemini chat", error);
    throw error;
  }
};

// Send a streaming message with proper streaming support
export const sendMessageStream = async function* (
  chat: GeminiChat,
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    console.log(
      "🌊 Starting streaming message to Gemini:",
      message.substring(0, 50) + "..."
    );

    const stream = await chat.sendMessageStream({
      message: message,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        console.log("📥 Received chunk:", chunk.text);
        yield chunk.text; // Yield individual chunks for real-time streaming
      }
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

// Send a regular message (non-streaming)
export const sendMessage = async (
  chat: GeminiChat,
  message: string
): Promise<string> => {
  try {
    console.log(
      "📤 Sending message to Gemini:",
      message.substring(0, 50) + "..."
    );

    // Get the full response from streaming
    let fullResponse = "";
    for await (const chunk of sendMessageStream(chat, message)) {
      fullResponse = chunk; // Keep updating to get the final response
    }

    console.log(
      "✅ Final response text:",
      fullResponse.substring(0, 100) + "..."
    );
    return fullResponse;
  } catch (error) {
    logError("Sending message to Gemini", error);
    throw new Error(`Failed to send message: ${(error as Error).message}`);
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
