import { create } from "zustand";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface UserState {
  // User data (derived from Firebase Auth)
  user: User | null;
  isAuthenticated: boolean;
  loadingUser: boolean;

  // User preferences
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number; // in milliseconds
    showTutorial: boolean;
    defaultTheme: "light" | "dark" | "system";
    language: string;
  };

  // Recent diagrams for quick access
  recentDiagrams: Array<{
    id: string;
    title: string;
    lastOpened: Date;
    thumbnail?: string;
  }>;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoadingUser: (loading: boolean) => void;

  // Preferences actions
  updatePreferences: (preferences: Partial<UserState["preferences"]>) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;

  // Recent diagrams actions
  addRecentDiagram: (diagram: {
    id: string;
    title: string;
    thumbnail?: string;
  }) => void;
  removeRecentDiagram: (id: string) => void;
  clearRecentDiagrams: () => void;

  // Reset user state (on logout)
  resetUserState: () => void;
}

const defaultPreferences: UserState["preferences"] = {
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  showTutorial: true,
  defaultTheme: "system",
  language: "en",
};

export const useUserStore = create<UserState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  loadingUser: true,
  preferences: defaultPreferences,
  recentDiagrams: [],
  // User actions
  setUser: (user) => {
    console.log("🏪 Zustand setUser called:", {
      user: user ? { uid: user.uid, email: user.email } : null,
      isAuthenticated: !!user,
    });

    set({
      user,
      isAuthenticated: !!user,
      loadingUser: false,
    });
  },

  setAuthenticated: (authenticated) => {
    console.log("🏪 Zustand setAuthenticated called:", authenticated);
    set({ isAuthenticated: authenticated });
  },

  setLoadingUser: (loading) => {
    console.log("🏪 Zustand setLoadingUser called:", loading);
    set({ loadingUser: loading });
  },

  // Preferences actions
  updatePreferences: (newPreferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    })),

  setAutoSave: (enabled) =>
    set((state) => ({
      preferences: { ...state.preferences, autoSave: enabled },
    })),

  setAutoSaveInterval: (interval) =>
    set((state) => ({
      preferences: { ...state.preferences, autoSaveInterval: interval },
    })),

  // Recent diagrams actions
  addRecentDiagram: (diagram) =>
    set((state) => {
      const existingIndex = state.recentDiagrams.findIndex(
        (d) => d.id === diagram.id
      );
      const newDiagram = {
        ...diagram,
        lastOpened: new Date(),
      };

      let newRecentDiagrams;
      if (existingIndex >= 0) {
        // Update existing entry and move to front
        newRecentDiagrams = [
          newDiagram,
          ...state.recentDiagrams.filter((d) => d.id !== diagram.id),
        ];
      } else {
        // Add new entry to front
        newRecentDiagrams = [newDiagram, ...state.recentDiagrams];
      }

      // Limit to 10 recent diagrams
      if (newRecentDiagrams.length > 10) {
        newRecentDiagrams = newRecentDiagrams.slice(0, 10);
      }

      return { recentDiagrams: newRecentDiagrams };
    }),

  removeRecentDiagram: (id) =>
    set((state) => ({
      recentDiagrams: state.recentDiagrams.filter((d) => d.id !== id),
    })),

  clearRecentDiagrams: () => set({ recentDiagrams: [] }),

  // Reset all user state
  resetUserState: () =>
    set({
      user: null,
      isAuthenticated: false,
      loadingUser: false,
      preferences: defaultPreferences,
      recentDiagrams: [],
    }),
}));
