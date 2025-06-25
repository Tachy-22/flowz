import { useEffect, useState } from "react";
import { authService, User, UserProfile } from "./auth";
import {
  diagramService,
  DiagramFilters,
  CreateDiagramData,
  UpdateDiagramData,
} from "./diagrams";
import { Diagram, DiagramMeta } from "@/types/diagram";

// Auth hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔧 Setting up auth state listener");

    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log("🔄 Auth state changed in useAuth:", {
        user: user ? { uid: user.uid, email: user.email } : null,
        hasUser: !!user,
      });

      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log("🔌 Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  return { user, loading };
};

export const useUserProfile = (uid: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    authService
      .getUserProfile(uid)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [uid]);

  return { profile, loading, error };
};

// Diagram hooks
export const useDiagram = (diagramId: string | null) => {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagramId) {
      setDiagram(null);
      return;
    }

    setLoading(true);
    setError(null);

    diagramService
      .getDiagram(diagramId)
      .then(setDiagram)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [diagramId]);

  return { diagram, loading, error };
};

export const useDiagramRealtime = (diagramId: string | null) => {
  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagramId) {
      setDiagram(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = diagramService.subscribeToDiagram(
      diagramId,
      (diagram) => {
        setDiagram(diagram);
        setLoading(false);
        if (!diagram) {
          setError("Diagram not found or access denied");
        }
      }
    );

    return unsubscribe;
  }, [diagramId]);

  return { diagram, loading, error };
};

export const useUserDiagrams = (
  userUid: string | null,
  filters: DiagramFilters = {},
  realtime = false
) => {
  const [diagrams, setDiagrams] = useState<DiagramMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userUid) {
      setDiagrams([]);
      return;
    }

    setLoading(true);
    setError(null);

    if (realtime) {
      const unsubscribe = diagramService.subscribeToUserDiagrams(
        userUid,
        (diagrams) => {
          setDiagrams(diagrams);
          setLoading(false);
        },
        filters
      );

      return unsubscribe;
    } else {
      diagramService
        .getUserDiagrams(userUid, filters)
        .then(setDiagrams)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [userUid, filters, realtime]);

  return { diagrams, loading, error };
};

// Diagram access hook
export const useDiagramAccess = (
  diagramId: string | null,
  userUid: string | null
) => {
  const [access, setAccess] = useState<{
    hasAccess: boolean;
    permission: "owner" | "editor" | "viewer" | null;
  }>({ hasAccess: false, permission: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!diagramId || !userUid) {
      setAccess({ hasAccess: false, permission: null });
      return;
    }

    setLoading(true);
    setError(null);

    diagramService
      .checkDiagramAccess(diagramId, userUid)
      .then(setAccess)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [diagramId, userUid]);

  return { access, loading, error };
};

// Authentication actions hook
export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.registerWithEmailAndPassword(
        email,
        password,
        displayName
      );
      return user;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithEmailAndPassword(
        email,
        password
      );
      return user;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithGoogle();
      return user;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signOut();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    loading,
    error,
    clearError: () => setError(null),
  };
};

// Diagram actions hook
export const useDiagramActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDiagram = async (
    ownerUid: string,
    diagramData: CreateDiagramData
  ) => {
    setLoading(true);
    setError(null);
    try {
      const diagramId = await diagramService.createDiagram(
        ownerUid,
        diagramData
      );
      return diagramId;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDiagram = async (
    diagramId: string,
    updates: UpdateDiagramData
  ) => {
    setLoading(true);
    setError(null);
    try {
      await diagramService.updateDiagram(diagramId, updates);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDiagram = async (diagramId: string) => {
    setLoading(true);
    setError(null);
    try {
      await diagramService.deleteDiagram(diagramId);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const shareDiagram = async (diagramId: string, userEmails: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await diagramService.shareDiagram(diagramId, userEmails);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createDiagram,
    updateDiagram,
    deleteDiagram,
    shareDiagram,
    loading,
    error,
    clearError: () => setError(null),
  };
};
