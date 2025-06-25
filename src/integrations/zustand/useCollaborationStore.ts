import { create } from 'zustand';

interface ActiveUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  cursor: {
    x: number;
    y: number;
  } | null;
  selection: string | null; // Selected node ID
  lastSeen: Date;
  color: string; // For cursor/selection highlighting
}

interface Presence {
  isOnline: boolean;
  lastSeen: Date;
  currentDiagram: string | null;
}

interface CollaborationState {
  // Multi-user state
  activeUsers: Record<string, ActiveUser>;
  isCollaborativeMode: boolean;
  
  // Permissions
  diagramOwner: string | null;
  allowedUsers: string[];
  userPermissions: Record<string, 'owner' | 'editor' | 'viewer'>;
  
  // Real-time sync
  isConnected: boolean;
  lastSyncTime: Date | null;
  pendingChanges: boolean;
  
  // User presence
  myPresence: Presence;
  
  // Conflict resolution
  conflictedNodes: string[]; // Node IDs with conflicts
  
  // Actions for collaboration mode
  setCollaborativeMode: (enabled: boolean) => void;
  
  // Actions for active users
  addActiveUser: (user: ActiveUser) => void;
  removeActiveUser: (uid: string) => void;
  updateUserCursor: (uid: string, cursor: { x: number; y: number } | null) => void;
  updateUserSelection: (uid: string, selection: string | null) => void;
  
  // Actions for permissions
  setDiagramOwner: (uid: string) => void;
  setAllowedUsers: (users: string[]) => void;
  setUserPermission: (uid: string, permission: 'owner' | 'editor' | 'viewer') => void;
  
  // Actions for sync state
  setConnected: (connected: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  setPendingChanges: (pending: boolean) => void;
  
  // Actions for presence
  updateMyPresence: (presence: Partial<Presence>) => void;
  
  // Actions for conflicts
  addConflictedNode: (nodeId: string) => void;
  removeConflictedNode: (nodeId: string) => void;
  clearConflicts: () => void;
  
  // Utility functions
  getUserPermission: (uid: string) => 'owner' | 'editor' | 'viewer' | null;
  canUserEdit: (uid: string) => boolean;
  getActiveUserCount: () => number;
  
  // Reset collaboration state
  resetCollaborationState: () => void;
}

const userColors = [
  '#ef4444', // red
  '#f97316', // orange  
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

let colorIndex = 0;
const getNextUserColor = (): string => {
  const color = userColors[colorIndex % userColors.length];
  colorIndex++;
  return color;
};

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  // Initial state
  activeUsers: {},
  isCollaborativeMode: false,
  
  // Permissions
  diagramOwner: null,
  allowedUsers: [],
  userPermissions: {},
  
  // Sync state
  isConnected: false,
  lastSyncTime: null,
  pendingChanges: false,
  
  // Presence
  myPresence: {
    isOnline: false,
    lastSeen: new Date(),
    currentDiagram: null
  },
  
  // Conflicts
  conflictedNodes: [],

  // Collaboration mode
  setCollaborativeMode: (enabled) => set({ isCollaborativeMode: enabled }),

  // Active users actions
  addActiveUser: (user) => set((state) => {
    const userWithColor = {
      ...user,
      color: user.color || getNextUserColor()
    };
    return {
      activeUsers: {
        ...state.activeUsers,
        [user.uid]: userWithColor
      }
    };
  }),

  removeActiveUser: (uid) => set((state) => {
    const newActiveUsers = { ...state.activeUsers };
    delete newActiveUsers[uid];
    return { activeUsers: newActiveUsers };
  }),

  updateUserCursor: (uid, cursor) => set((state) => {
    const user = state.activeUsers[uid];
    if (!user) return state;
    
    return {
      activeUsers: {
        ...state.activeUsers,
        [uid]: { ...user, cursor }
      }
    };
  }),

  updateUserSelection: (uid, selection) => set((state) => {
    const user = state.activeUsers[uid];
    if (!user) return state;
    
    return {
      activeUsers: {
        ...state.activeUsers,
        [uid]: { ...user, selection }
      }
    };
  }),

  // Permissions actions
  setDiagramOwner: (uid) => set({ diagramOwner: uid }),
  setAllowedUsers: (users) => set({ allowedUsers: users }),
  setUserPermission: (uid, permission) => set((state) => ({
    userPermissions: {
      ...state.userPermissions,
      [uid]: permission
    }
  })),

  // Sync actions
  setConnected: (connected) => set({ isConnected: connected }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setPendingChanges: (pending) => set({ pendingChanges: pending }),

  // Presence actions
  updateMyPresence: (presence) => set((state) => ({
    myPresence: { ...state.myPresence, ...presence }
  })),

  // Conflict actions
  addConflictedNode: (nodeId) => set((state) => {
    if (state.conflictedNodes.includes(nodeId)) return state;
    return {
      conflictedNodes: [...state.conflictedNodes, nodeId]
    };
  }),

  removeConflictedNode: (nodeId) => set((state) => ({
    conflictedNodes: state.conflictedNodes.filter(id => id !== nodeId)
  })),

  clearConflicts: () => set({ conflictedNodes: [] }),

  // Utility functions
  getUserPermission: (uid) => {
    const state = get();
    if (state.diagramOwner === uid) return 'owner';
    return state.userPermissions[uid] || null;
  },

  canUserEdit: (uid) => {
    const state = get();
    const permission = state.getUserPermission(uid);
    return permission === 'owner' || permission === 'editor';
  },

  getActiveUserCount: () => {
    const state = get();
    return Object.keys(state.activeUsers).length;
  },

  // Reset state
  resetCollaborationState: () => set({
    activeUsers: {},
    isCollaborativeMode: false,
    diagramOwner: null,
    allowedUsers: [],
    userPermissions: {},
    isConnected: false,
    lastSyncTime: null,
    pendingChanges: false,
    myPresence: {
      isOnline: false,
      lastSeen: new Date(),
      currentDiagram: null
    },
    conflictedNodes: []
  })
}));
