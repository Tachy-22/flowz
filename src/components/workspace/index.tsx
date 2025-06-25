"use client";
import React, { useState, useCallback } from "react";
import { useUserStore } from "@/integrations/zustand";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { useRouter } from "next/navigation";
import { authService } from "@/integrations/firebase/auth";
import { diagramService } from "@/integrations/firebase/diagrams";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import GeminiChat from "@/components/common/GeminiChat";
import TopToolbar from "./TopToolbar";
import ToolsSidebar from "./ToolsSidebar";
import DiagramCanvas from "./DiagramCanvas";

const WorkspaceIndex: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isToolsSidebarOpen, setIsToolsSidebarOpen] = useState(true);
  const { user, resetUserState } = useUserStore();
  const { nodes, edges, diagramId, setDiagramId, setLoading, diagramTitle } =
    useDiagramStore();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      resetUserState();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Save diagram to Firestore
  const handleSave = useCallback(async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      if (diagramId) {
        // Update existing diagram
        await diagramService.updateDiagramContent(diagramId, nodes, edges);
        console.log("✅ Diagram updated successfully!");
      } else {
        // Create new diagram
        const newDiagramId = await diagramService.createDiagram(user.uid, {
          title: diagramTitle || "My Diagram",
          nodes,
          edges,
        });
        setDiagramId(newDiagramId);
        console.log("✅ New diagram created successfully!");
      }
    } catch (error) {
      console.error("❌ Failed to save diagram:", error);
    } finally {
      setLoading(false);
    }
  }, [user, diagramId, nodes, edges, diagramTitle, setDiagramId, setLoading]);

  // Update diagram title and auto-save
  const handleUpdateTitle = useCallback(
    async (newTitle: string) => {
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      setLoading(true);
      try {
        if (diagramId) {
          // Update existing diagram title
          await diagramService.updateDiagram(diagramId, { title: newTitle });
          console.log("✅ Diagram title updated successfully!");
        } else {
          // Create new diagram with the title
          const newDiagramId = await diagramService.createDiagram(user.uid, {
            title: newTitle,
            nodes,
            edges,
          });
          setDiagramId(newDiagramId);
          console.log("✅ New diagram created with title!");
        }
      } catch (error) {
        console.error("❌ Failed to update diagram title:", error);
      } finally {
        setLoading(false);
      }
    },
    [user, diagramId, nodes, edges, setDiagramId, setLoading]
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {" "}
      {/* Top Toolbar */}
      <TopToolbar
        user={user}
        onSignOut={handleSignOut}
        onToggleTools={() => setIsToolsSidebarOpen(!isToolsSidebarOpen)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isToolsSidebarOpen={isToolsSidebarOpen}
        isChatOpen={isChatOpen}
        onSave={handleSave}
        onUpdateTitle={handleUpdateTitle}
      />{" "}
      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Tools (Fixed Width) */}
          {isToolsSidebarOpen && (
            <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
              <ToolsSidebar onClose={() => setIsToolsSidebarOpen(false)} />
            </div>
          )}

          {/* Main Content Area with Resizable Chat */}
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Main Canvas Area */}
              <ResizablePanel defaultSize={isChatOpen ? 70 : 100} minSize={50}>
                <DiagramCanvas />
              </ResizablePanel>

              {/* Right Sidebar - AI Chat (Resizable) */}
              {isChatOpen && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">
                          AI Assistant
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsChatOpen(false)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 overflow-hidden p-4">
                        <GeminiChat />
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceIndex;
