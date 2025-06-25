import { create } from 'zustand';
import { NodeStyle } from '@/types/diagram';

export type Tool = 'select' | 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'text';

export type Theme = 'light' | 'dark';

interface UIState {
  // Tool and panel state
  activeTool: Tool;
  showSidebar: boolean;
  showMiniMap: boolean;
  showGrid: boolean;
  
  // Theme and appearance
  theme: Theme;
  
  // Modal states
  exportModalOpen: boolean;
  saveModalOpen: boolean;
  loadModalOpen: boolean;
  settingsModalOpen: boolean;
  
  // Node styling
  nodeStyles: Record<string, NodeStyle>;
  defaultNodeStyle: NodeStyle;
  
  // Canvas settings
  snapToGrid: boolean;
  gridSize: number;
  
  // Actions
  setActiveTool: (tool: Tool) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMiniMap: () => void;
  setMiniMapOpen: (open: boolean) => void;
  toggleGrid: () => void;
  setGridVisible: (visible: boolean) => void;
  
  // Theme actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Modal actions
  setExportModalOpen: (open: boolean) => void;
  setSaveModalOpen: (open: boolean) => void;
  setLoadModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  closeAllModals: () => void;
  
  // Style actions
  setNodeStyle: (nodeType: string, style: NodeStyle) => void;
  getNodeStyle: (nodeType: string) => NodeStyle;
  resetNodeStyles: () => void;
  
  // Canvas settings
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
}

const defaultNodeStyle: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#d1d5db',
  textColor: '#374151',
  fontSize: 14,
  borderWidth: 1,
  borderRadius: 8
};

const defaultNodeStyles: Record<string, NodeStyle> = {
  rectangle: {
    ...defaultNodeStyle,
    backgroundColor: '#f3f4f6',
    borderColor: '#6366f1'
  },
  circle: {
    ...defaultNodeStyle,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderRadius: 50
  },
  diamond: {
    ...defaultNodeStyle,
    backgroundColor: '#fecaca',
    borderColor: '#ef4444'
  },
  text: {
    ...defaultNodeStyle,
    backgroundColor: 'transparent',
    borderColor: 'transparent'
  }
};

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  activeTool: 'select',
  showSidebar: true,
  showMiniMap: false,
  showGrid: true,
  theme: 'light',
  
  // Modal states
  exportModalOpen: false,
  saveModalOpen: false,
  loadModalOpen: false,
  settingsModalOpen: false,
  
  // Styling
  nodeStyles: defaultNodeStyles,
  defaultNodeStyle,
  
  // Canvas settings
  snapToGrid: true,
  gridSize: 20,

  // Tool actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Sidebar actions
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  setSidebarOpen: (open) => set({ showSidebar: open }),

  // Minimap actions
  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),
  setMiniMapOpen: (open) => set({ showMiniMap: open }),

  // Grid actions
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setGridVisible: (visible) => set({ showGrid: visible }),

  // Theme actions
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),

  // Modal actions
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
  setSaveModalOpen: (open) => set({ saveModalOpen: open }),
  setLoadModalOpen: (open) => set({ loadModalOpen: open }),
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
  
  closeAllModals: () => set({
    exportModalOpen: false,
    saveModalOpen: false,
    loadModalOpen: false,
    settingsModalOpen: false
  }),

  // Style actions
  setNodeStyle: (nodeType, style) => set((state) => ({
    nodeStyles: {
      ...state.nodeStyles,
      [nodeType]: { ...state.nodeStyles[nodeType], ...style }
    }
  })),

  getNodeStyle: (nodeType) => {
    const state = get();
    return state.nodeStyles[nodeType] || state.defaultNodeStyle;
  },

  resetNodeStyles: () => set({ nodeStyles: defaultNodeStyles }),

  // Canvas settings
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setGridSize: (size) => set({ gridSize: size })
}));
