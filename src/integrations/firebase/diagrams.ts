import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "./config";
import { Diagram, DiagramMeta, Node, Edge } from "@/types/diagram";

export interface CreateDiagramData {
  title: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
  isCollaborative?: boolean;
}

export interface UpdateDiagramData {
  title?: string;
  description?: string;
  nodes?: Node[];
  edges?: Edge[];
  isCollaborative?: boolean;
}

export interface DiagramFilters {
  owner?: string;
  isCollaborative?: boolean;
  limit?: number;
  orderBy?: "createdAt" | "updatedAt" | "title";
  orderDirection?: "asc" | "desc";
}

// Firestore collections
const DIAGRAMS_COLLECTION = "diagrams";
const USERS_COLLECTION = "users";

// Firestore document data interface
interface FirestoreDiagramData {
  owner: string;
  title: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  allowedUsers: string[];
  isCollaborative: boolean;
}

// Convert Firestore timestamp to Date
const convertTimestamp = (
  timestamp: Timestamp | Date | { seconds: number; nanoseconds: number }
): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
    return (timestamp as Timestamp).toDate();
  }
  if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
};

// Convert Diagram data from Firestore
const convertDiagramData = (
  id: string,
  data: FirestoreDiagramData
): Diagram => ({
  id,
  owner: data.owner,
  title: data.title || "Untitled Diagram",
  description: data.description || "",
  nodes: data.nodes || [],
  edges: data.edges || [],
  createdAt: convertTimestamp(data.createdAt),
  updatedAt: convertTimestamp(data.updatedAt),
  allowedUsers: data.allowedUsers || [],
  isCollaborative: data.isCollaborative || false,
});

export const diagramService = {
  // Create a new diagram
  createDiagram: async (
    ownerUid: string,
    diagramData: CreateDiagramData
  ): Promise<string> => {
    try {
      // Generate a new document reference to get the ID
      const diagramRef = doc(collection(firestore, DIAGRAMS_COLLECTION));

      const diagram: Omit<Diagram, "id" | "createdAt" | "updatedAt"> = {
        owner: ownerUid,
        title: diagramData.title,
        description: diagramData.description || "",
        nodes: diagramData.nodes || [],
        edges: diagramData.edges || [],
        allowedUsers: [ownerUid],
        isCollaborative: diagramData.isCollaborative || false,
      };

      await setDoc(diagramRef, {
        ...diagram,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return diagramRef.id;
    } catch (error) {
      throw new Error(`Failed to create diagram: ${(error as Error).message}`);
    }
  },

  // Get a diagram by ID
  getDiagram: async (diagramId: string): Promise<Diagram | null> => {
    try {
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);
      const diagramDoc = await getDoc(diagramRef);

      if (diagramDoc.exists()) {
        return convertDiagramData(diagramDoc.id, diagramDoc.data() as FirestoreDiagramData);
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to get diagram: ${(error as Error).message}`);
    }
  },

  // Update a diagram
  updateDiagram: async (
    diagramId: string,
    updates: UpdateDiagramData
  ): Promise<void> => {
    try {
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);

      await updateDoc(diagramRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to update diagram: ${(error as Error).message}`);
    }
  },

  // Update diagram nodes and edges (for auto-save)
  updateDiagramContent: async (
    diagramId: string,
    nodes: Node[],
    edges: Edge[]
  ): Promise<void> => {
    try {
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);

      await updateDoc(diagramRef, {
        nodes,
        edges,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(
        `Failed to update diagram content: ${(error as Error).message}`
      );
    }
  },

  // Delete a diagram
  deleteDiagram: async (diagramId: string): Promise<void> => {
    try {
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);
      await deleteDoc(diagramRef);
    } catch (error) {
      throw new Error(`Failed to delete diagram: ${(error as Error).message}`);
    }
  },

  // Get user's diagrams
  getUserDiagrams: async (
    userUid: string,
    filters: DiagramFilters = {}
  ): Promise<DiagramMeta[]> => {
    try {
      const diagramsRef = collection(firestore, DIAGRAMS_COLLECTION);

      let q = query(
        diagramsRef,
        where("allowedUsers", "array-contains", userUid)
      );

      // Apply filters
      if (filters.isCollaborative !== undefined) {
        q = query(q, where("isCollaborative", "==", filters.isCollaborative));
      }

      // Apply ordering
      const orderByField = filters.orderBy || "updatedAt";
      const orderDirection = filters.orderDirection || "desc";
      q = query(q, orderBy(orderByField, orderDirection));

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled Diagram",
          description: data.description || "",
          owner: data.owner,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to get user diagrams: ${(error as Error).message}`
      );
    }
  },

  // Share diagram with users
  shareDiagram: async (
    diagramId: string,
    userEmails: string[]
  ): Promise<void> => {
    try {
      // First, get user UIDs from emails
      const usersRef = collection(firestore, USERS_COLLECTION);
      const userQueries = userEmails.map((email) =>
        query(usersRef, where("email", "==", email), limit(1))
      );

      const userUids: string[] = [];
      for (const userQuery of userQueries) {
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          userUids.push(querySnapshot.docs[0].id);
        }
      }

      if (userUids.length === 0) {
        throw new Error(
          "No valid users found for the provided email addresses"
        );
      }

      // Update diagram with new allowed users
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);
      const diagramDoc = await getDoc(diagramRef);

      if (!diagramDoc.exists()) {
        throw new Error("Diagram not found");
      }

      const currentAllowedUsers = diagramDoc.data().allowedUsers || [];
      const updatedAllowedUsers = Array.from(
        new Set([...currentAllowedUsers, ...userUids])
      );

      await updateDoc(diagramRef, {
        allowedUsers: updatedAllowedUsers,
        isCollaborative: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to share diagram: ${(error as Error).message}`);
    }
  },

  // Remove user access from diagram
  removeDiagramAccess: async (
    diagramId: string,
    userUid: string
  ): Promise<void> => {
    try {
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);
      const diagramDoc = await getDoc(diagramRef);

      if (!diagramDoc.exists()) {
        throw new Error("Diagram not found");
      }

      const data = diagramDoc.data();

      // Don't remove the owner
      if (data.owner === userUid) {
        throw new Error("Cannot remove owner access");
      }

      const currentAllowedUsers = data.allowedUsers || [];
      const updatedAllowedUsers = currentAllowedUsers.filter(
        (uid: string) => uid !== userUid
      );

      await updateDoc(diagramRef, {
        allowedUsers: updatedAllowedUsers,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(
        `Failed to remove diagram access: ${(error as Error).message}`
      );
    }
  },

  // Check if user has access to diagram
  checkDiagramAccess: async (
    diagramId: string,
    userUid: string
  ): Promise<{
    hasAccess: boolean;
    permission: "owner" | "editor" | "viewer" | null;
  }> => {
    try {
      const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);
      const diagramDoc = await getDoc(diagramRef);

      if (!diagramDoc.exists()) {
        return { hasAccess: false, permission: null };
      }

      const data = diagramDoc.data();
      const allowedUsers = data.allowedUsers || [];

      if (!allowedUsers.includes(userUid)) {
        return { hasAccess: false, permission: null };
      }

      const permission = data.owner === userUid ? "owner" : "editor";
      return { hasAccess: true, permission };
    } catch (error) {
      throw new Error(
        `Failed to check diagram access: ${(error as Error).message}`
      );
    }
  },

  // Subscribe to diagram changes (for real-time collaboration)
  subscribeToDiagram: (
    diagramId: string,
    callback: (diagram: Diagram | null) => void
  ): Unsubscribe => {
    const diagramRef = doc(firestore, DIAGRAMS_COLLECTION, diagramId);

    return onSnapshot(
      diagramRef,
      (doc) => {
        if (doc.exists()) {
          const diagram = convertDiagramData(doc.id, doc.data() as FirestoreDiagramData);
          callback(diagram);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error listening to diagram changes:", error);
        callback(null);
      }
    );
  },

  // Subscribe to user's diagrams list
  subscribeToUserDiagrams: (
    userUid: string,
    callback: (diagrams: DiagramMeta[]) => void,
    filters: DiagramFilters = {}
  ): Unsubscribe => {
    const diagramsRef = collection(firestore, DIAGRAMS_COLLECTION);

    let q = query(
      diagramsRef,
      where("allowedUsers", "array-contains", userUid)
    );

    if (filters.isCollaborative !== undefined) {
      q = query(q, where("isCollaborative", "==", filters.isCollaborative));
    }

    const orderByField = filters.orderBy || "updatedAt";
    const orderDirection = filters.orderDirection || "desc";
    q = query(q, orderBy(orderByField, orderDirection));

    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const diagrams = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "Untitled Diagram",
            description: data.description || "",
            owner: data.owner,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
          };
        });
        callback(diagrams);
      },
      (error) => {
        console.error("Error listening to user diagrams:", error);
        callback([]);
      }
    );
  },

  // Get all public diagrams (allowedUsers: 'all')
  getPublicDiagrams: async (
    filters: {
      allowedUsers?: string;
      limit?: number;
      orderBy?: "createdAt" | "updatedAt" | "title";
      orderDirection?: "asc" | "desc";
    } = {}
  ): Promise<DiagramMeta[]> => {
    try {
      const diagramsRef = collection(firestore, DIAGRAMS_COLLECTION);
      let q = query(
        diagramsRef,
        where("allowedUsers", "array-contains", filters.allowedUsers || "all")
      );
      // Apply ordering
      const orderByField = filters.orderBy || "updatedAt";
      const orderDirection = filters.orderDirection || "desc";
      q = query(q, orderBy(orderByField, orderDirection));
      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled Diagram",
          description: data.description || "",
          owner: data.owner,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to get public diagrams: ${(error as Error).message}`
      );
    }
  },
};
