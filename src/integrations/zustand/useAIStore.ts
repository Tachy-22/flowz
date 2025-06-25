import { create } from 'zustand';
import { Node, Edge } from '@/types/diagram';

interface AIGenerationRequest {
  id: string;
  input: string;
  type: 'text' | 'document';
  timestamp: Date;
}

interface AIGenerationResult {
  requestId: string;
  nodes: Node[];
  edges: Edge[];
  metadata: {
    confidence: number;
    suggestedImprovements?: string[];
    processingTime: number;
  };
}

interface AIState {
  // Input state
  aiInput: string;
  inputType: 'text' | 'document';
  uploadedFile: File | null;
  
  // Generation state
  aiLoading: boolean;
  aiError: string | null;
  
  // Results
  aiOutputNodes: Node[];
  aiOutputEdges: Edge[];
  generationMetadata: AIGenerationResult['metadata'] | null;
  
  // Suggestions and refinement
  aiSuggestions: string[];
  refinementHistory: AIGenerationRequest[];
  
  // Current generation session
  currentRequestId: string | null;
  
  // Actions for input
  setAiInput: (input: string) => void;
  setInputType: (type: 'text' | 'document') => void;
  setUploadedFile: (file: File | null) => void;
  clearInput: () => void;
  
  // Actions for generation
  setAiLoading: (loading: boolean) => void;
  setAiError: (error: string | null) => void;
  
  // Actions for results
  setAiOutput: (nodes: Node[], edges: Edge[], metadata: AIGenerationResult['metadata']) => void;
  clearAiOutput: () => void;
  
  // Actions for suggestions
  setAiSuggestions: (suggestions: string[]) => void;
  addSuggestion: (suggestion: string) => void;
  clearSuggestions: () => void;
  
  // Actions for refinement
  addToRefinementHistory: (request: AIGenerationRequest) => void;
  clearRefinementHistory: () => void;
  
  // Session management
  setCurrentRequestId: (id: string | null) => void;
  
  // Apply AI results to diagram
  acceptAIGeneration: () => { nodes: Node[]; edges: Edge[] };
  
  // Reset all AI state
  resetAIState: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  // Initial state
  aiInput: '',
  inputType: 'text',
  uploadedFile: null,
  
  // Generation state
  aiLoading: false,
  aiError: null,
  
  // Results
  aiOutputNodes: [],
  aiOutputEdges: [],
  generationMetadata: null,
  
  // Suggestions
  aiSuggestions: [],
  refinementHistory: [],
  
  // Session
  currentRequestId: null,

  // Input actions
  setAiInput: (input) => set({ aiInput: input }),
  setInputType: (type) => set({ inputType: type }),
  setUploadedFile: (file) => set({ uploadedFile: file }),
  clearInput: () => set({ 
    aiInput: '', 
    uploadedFile: null, 
    aiError: null 
  }),

  // Generation actions
  setAiLoading: (loading) => set({ aiLoading: loading }),
  setAiError: (error) => set({ aiError: error }),

  // Results actions
  setAiOutput: (nodes, edges, metadata) => set({
    aiOutputNodes: nodes,
    aiOutputEdges: edges,
    generationMetadata: metadata,
    aiError: null
  }),

  clearAiOutput: () => set({
    aiOutputNodes: [],
    aiOutputEdges: [],
    generationMetadata: null
  }),

  // Suggestions actions
  setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
  
  addSuggestion: (suggestion) => set((state) => ({
    aiSuggestions: [...state.aiSuggestions, suggestion]
  })),
  
  clearSuggestions: () => set({ aiSuggestions: [] }),

  // Refinement actions
  addToRefinementHistory: (request) => set((state) => {
    const newHistory = [...state.refinementHistory, request];
    // Limit history to 10 entries
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    return { refinementHistory: newHistory };
  }),
  
  clearRefinementHistory: () => set({ refinementHistory: [] }),

  // Session management
  setCurrentRequestId: (id) => set({ currentRequestId: id }),

  // Apply results
  acceptAIGeneration: () => {
    const state = get();
    return {
      nodes: [...state.aiOutputNodes],
      edges: [...state.aiOutputEdges]
    };
  },

  // Reset all state
  resetAIState: () => set({
    aiInput: '',
    inputType: 'text',
    uploadedFile: null,
    aiLoading: false,
    aiError: null,
    aiOutputNodes: [],
    aiOutputEdges: [],
    generationMetadata: null,
    aiSuggestions: [],
    refinementHistory: [],
    currentRequestId: null
  })
}));
