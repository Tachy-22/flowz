// Export Firebase configuration
export { auth, firestore, storage } from "./config";

// Export authentication service and types
export { authService } from "./auth";
export type { User, UserProfile } from "./auth";

// Export diagram service and types
export { diagramService } from "./diagrams";
export type {
  CreateDiagramData,
  UpdateDiagramData,
  DiagramFilters,
} from "./diagrams";

// Export React hooks
export {
  useAuth,
  useUserProfile,
  useDiagram,
  useDiagramRealtime,
  useUserDiagrams,
  useDiagramAccess,
  useAuthActions,
  useDiagramActions,
} from "./hooks";

// Export context provider
export { FirebaseProvider, useFirebaseContext } from "./context";
