Absolutely. Below is a complete `README.md` for your **Flowz** project — your AI-enhanced flow diagram builder. It includes a full breakdown of the three development stages, tools used (React Flow, Zustand, Firebase, Gemini AI), and guidance on running and contributing to the project.

---

```markdown
# 🚀 Flowz – AI-Powered Flow Diagram Builder

Flowz is a modern web-based diagramming tool built with **Next.js**, designed to help users create, edit, and generate flowcharts and diagrams — manually or using **AI**. Inspired by tools like draw.io, Flowz enhances diagram creation with a sleek UI, smart layout, and AI-powered suggestions via **Gemini AI**.

---

## 🔧 Tech Stack

| Tool           | Purpose                                                  |
| -------------- | -------------------------------------------------------- |
| **Next.js**    | Framework for server-side rendered React apps            |
| **React Flow** | Flow diagram and node-based canvas system                |
| **Zustand**    | Lightweight state management for UI and canvas state     |
| **Firebase**   | Authentication, Firestore (data), Storage (images/files) |
| **Gemini AI**  | Text/doc input to diagram node structure conversion      |

---

## 🛠️ Project Structure
```

/app
/editor → Main diagram builder
/auth → Login/Register pages
/ai → AI input interface (Stage 3)
/components → Shared UI elements
/lib
firebase.ts → Firebase config
gemini.ts → Gemini API helpers
flowUtils.ts → Diagram data utils
/store → Zustand state stores
/types → Types and interfaces

````

---

## 📈 Development Roadmap – 3 Stages

---

### ✅ Stage 1: MVP – Manual Diagram Builder

**Goal:** Build the foundation: canvas + basic user-drawn flows.

#### ✨ Features:
- [x] Add shapes: Rectangle, Circle, Diamond
- [x] Connect shapes with arrows
- [x] Drag, position, and delete nodes
- [x] Pan & zoom the canvas
- [x] Text inside nodes
- [x] Undo/redo actions
- [x] Export to PNG & JSON
- [x] Save/load diagrams locally
- [x] Basic theming and responsive UI

#### 🔩 Technologies:
- `React Flow` (canvas and nodes)
- `Zustand` (for storing nodes, edges, history)
- `Tailwind CSS` + `Framer Motion` (animations and styling)

---

### 🚀 Stage 2: Pro Tools & Enhancements

**Goal:** Make the tool more powerful and user-friendly with pro-grade features.

#### ✨ Features:
- [ ] Snap-to-grid and smart alignment
- [ ] Group/multi-select nodes
- [ ] Resize/rotate shapes
- [ ] Shape styling (color, font size, border)
- [ ] Minimap overview
- [ ] Keyboard shortcuts
- [ ] Export as SVG, PDF
- [ ] Diagram templates
- [ ] Backend save/load (Firestore)
- [ ] User authentication

#### 🔩 Technologies:
- `Firebase Auth` (email/password + Google)
- `Firebase Firestore` (store user diagrams)
- `Firebase Storage` (for template previews or exports)

---

### 🤖 Stage 3: AI Flow Diagram Generator

**Goal:** Add AI assistant to auto-generate flowcharts from text or document input.

#### ✨ Features:
- [ ] Text input → auto-generate diagram
- [ ] Upload document (PDF/DOCX) → extract flow logic
- [ ] Generate nodes and edges programmatically from AI output
- [ ] Edit and continue working on AI-generated diagrams
- [ ] AI suggestions panel with refinement options

#### 🔩 Technologies:
- `Gemini API (Google AI SDK)`
  - Use Gemini to analyze user text or uploaded content
  - Generate a structure like:
    ```json
    {
      "nodes": [{ "id": "1", "type": "start", "label": "Login" }],
      "edges": [{ "from": "1", "to": "2" }]
    }
    ```

- Feed generated data into `React Flow` via Zustand

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/Flowz.git
cd Flowz

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add Firebase and Gemini credentials here

# 4. Start the dev server
npm run dev
````

---

## 🔐 Firebase Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable:

   - Email/password authentication
   - Google Auth (optional)
   - Firestore Database
   - Firebase Storage (optional)

4. Get your Firebase config from `Project Settings` → `General`
5. Paste config into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
```

---

## 🧠 Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app)
2. Create a Gemini API Key
3. Paste into your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_key_here
```

4. Use it in `lib/gemini.ts` with fetch or Google SDK

---

## ✍️ Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Commit your changes
4. Push and open a pull request

---

## 📌 TODO Summary by Stage

| Feature                                | Stage | Status |
| -------------------------------------- | ----- | ------ |
| Basic shape creation                   | 1     | ✅     |
| Save/load to localStorage              | 1     | ✅     |
| Export PNG/JSON                        | 1     | ✅     |
| Firebase Auth                          | 2     | ⏳     |
| Snap to grid                           | 2     | ⏳     |
| PDF/SVG export                         | 2     | ⏳     |
| AI flow generation from text input     | 3     | ⏳     |
| AI flow generation from uploaded files | 3     | ⏳     |
| Editable AI diagrams                   | 3     | ⏳     |

---

## 🧪 License

MIT License — you’re free to use, modify, and distribute.

---

## 💡 Credits

Built by \[Your Name], with:

- [React Flow](https://reactflow.dev)
- [Zustand](https://github.com/pmndrs/zustand)
- [Firebase](https://firebase.google.com/)
- [Gemini AI](https://ai.google.dev)

---

## 📬 Feedback & Support

Feel free to open an issue or contact me at \[[your-email@example.com](mailto:your-email@example.com)] for feedback or questions.

```




## ✅ **Zustand Store Responsibilities**

### 🔁 1. **Diagram State** (Core of React Flow)

This is the most important and always needed.

| State            | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `nodes`          | Array of all current diagram nodes (shapes, text, etc.) |
| `edges`          | Array of connections/links between nodes                |
| `selectedNodeId` | ID of the currently selected node                       |
| `viewport`       | Current canvas zoom, pan, and position                  |
| `history`        | Stack for undo/redo tracking                            |
| `isConnecting`   | Boolean flag for draw-connection mode                   |
| `nodeStyles`     | Style presets (colors, font sizes, etc.)                |

---

### 🧩 2. **UI & Tool Panel State**

For controlling sidebar menus, modals, tool selections, etc.

| State             | Purpose                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `activeTool`      | Which shape/tool the user is currently using (`'select'`, `'rectangle'`, `'arrow'`, etc.) |
| `showSidebar`     | Toggle for the shape/menu panel                                                           |
| `showMiniMap`     | Boolean for minimap toggle                                                                |
| `darkMode`        | Light/dark UI mode (optional)                                                             |
| `exportModalOpen` | Export modal visibility                                                                   |

---

### 🔐 3. **User State** (Derived from Firebase Auth)

You **don’t store auth tokens in Zustand**, but you can mirror user info for UI use:

| State             | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `user`            | Basic user object (name, email, uid, image) for UI display |
| `isAuthenticated` | Boolean flag from Firebase Auth listener                   |
| `loadingUser`     | Auth loading flag (on login/init)                          |

> ✅ Note: The real auth state should be subscribed from `onAuthStateChanged()` in Firebase and only passed to Zustand for UI use — not stored persistently.

---

### 🤖 4. **AI Input & Generation State** (Stage 3)

For managing Gemini-related inputs and results.

| State           | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `aiInput`       | Text or extracted content the user wants AI to convert |
| `aiOutputNodes` | Nodes returned from Gemini                             |
| `aiOutputEdges` | Edges returned from Gemini                             |
| `aiLoading`     | Boolean flag for "generating…" spinner                 |
| `aiError`       | Store error messages if AI call fails                  |
| `aiSuggestions` | Optional: AI hint suggestions for improving input      |

---

## 🗂 Suggested Store Files

```

/store
diagramStore.ts ← nodes, edges, history, etc.
uiStore.ts ← sidebars, tools, modals
userStore.ts ← user profile (linked to Firebase auth)
aiStore.ts ← Gemini input/output states

````

---

Perfect — since you're using **Zustand for state** and **Firebase for persistence**, here's how to structure your app now so that you can **save/load diagrams cleanly** and **easily scale to real-time collaboration** later.

---

## ✅ Updated Zustand Store Responsibilities (No LocalStorage)

Your app should treat **Zustand** as the real-time state layer, and **Firebase** (Firestore for now) as the **source of truth** for persistence. Here’s how to organize your store:

---

### 🧠 `useDiagramStore.ts`

```ts
import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase'; // Your Firebase config
import { Node, Edge } from 'reactflow';
import { Diagram } from '@/types/diagram'; // Type you define

type DiagramStore = {
  nodes: Node[];
  edges: Edge[];
  diagramId: string | null;
  loading: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  loadDiagram: (id: string) => Promise<void>;
  saveDiagram: () => Promise<void>;
  setDiagramId: (id: string) => void;
};

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  nodes: [],
  edges: [],
  diagramId: null,
  loading: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setDiagramId: (id) => set({ diagramId: id }),

  loadDiagram: async (id: string) => {
    set({ loading: true, diagramId: id });

    const ref = doc(firestore, 'diagrams', id);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      const data = snapshot.data() as Diagram;
      set({
        nodes: data.nodes || [],
        edges: data.edges || [],
      });
    } else {
      // No diagram found – create blank
      await setDoc(ref, {
        nodes: [],
        edges: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      set({ nodes: [], edges: [] });
    }

    set({ loading: false });
  },

  saveDiagram: async () => {
    const { diagramId, nodes, edges } = get();
    if (!diagramId) return;

    const ref = doc(firestore, 'diagrams', diagramId);
    await updateDoc(ref, {
      nodes,
      edges,
      updatedAt: serverTimestamp(),
    });
  },
}));
````

---

## 📦 Firestore Data Model (Single-user for now, multi-user ready)

```json
diagrams/
  diagramId: {
    owner: "userId_abc123",
    nodes: [...],
    edges: [...],
    createdAt: timestamp,
    updatedAt: timestamp,
    allowedUsers: ["userId_abc123"],  // ready for collab
    isCollaborative: false            // toggleable in UI
  }
```

Later, you can:

- Add `.onSnapshot()` to enable **real-time updates**
- Update `allowedUsers` to manage **access control**
- Add `presence/` or `cursors/` for multi-user indicators

---

## 🧠 Store Separation (Optional, Clean)

You can separate diagram store logic into these files:

```
/store
  useDiagramStore.ts       ← nodes, edges, load/save
  useUserStore.ts          ← user from Firebase Auth
  useCollaborationStore.ts ← activeUsers, cursors (future)
```

---

## 🧠 Optional `useDiagramSync.ts` Hook

Create a reusable hook to sync Firebase on changes:

```ts
import { useEffect } from "react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useDebounce } from "@/hooks/useDebounce";

export function useDiagramAutoSave(delay = 1000) {
  const { nodes, edges, saveDiagram } = useDiagramStore();

  const debouncedNodes = useDebounce(nodes, delay);
  const debouncedEdges = useDebounce(edges, delay);

  useEffect(() => {
    saveDiagram();
  }, [debouncedNodes, debouncedEdges]);
}
```

This gives you **auto-save with debouncing** — critical when scaling to live sync to reduce write volume.

---

## ⚙️ Collaboration-Ready Strategy

| Feature               | Design Now                        | Add Later                                        |
| --------------------- | --------------------------------- | ------------------------------------------------ |
| Diagram loading       | `loadDiagram(id)` from Firestore  | Keep, wrap in `.onSnapshot()`                    |
| Diagram saving        | `saveDiagram()` via `updateDoc()` | Keep, throttle via debounce                      |
| Multi-user awareness  | Not needed now                    | Use Firestore/RTDB presence                      |
| Allowed editors       | Single-user via `owner`           | Use `allowedUsers` array                         |
| Cursor/selection sync | N/A                               | Store `activeCursors/selection` in RTDB          |
| Conflict-free edits   | Manual overwrite                  | Optional: CRDT (Y.js) or fine-grained sync later |

---

## ✅ Summary

**You're ready to scale.** Here's your state architecture:

- **Zustand:** Holds diagram data in the editor
- **Firebase Firestore:** Single-user persistence now
- **Diagram ID routing:** One diagram per route `/editor/:id`
- **Real-time upgrade path:** Swap `getDoc/updateDoc` with `onSnapshot` + presence logic
- **Store functions like `loadDiagram`, `saveDiagram` stay unchanged** — only internal logic changes when adding collaboration

---

Would you like:

- 🔧 A working `useDiagramStore.ts` file you can drop into your app?
- 🧪 A quick starter project scaffold with Firebase connected?
- 🧩 Help setting up Firestore rules for per-user diagram access?

Let me know how you'd like to proceed.
#   f l o w z  
 