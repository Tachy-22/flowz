"use client";
import React, { useState } from "react";
import { useUserStore } from "@/integrations/zustand";
import { useRouter } from "next/navigation";
import { authService } from "@/integrations/firebase/auth";
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <TopToolbar
        user={user}
        onSignOut={handleSignOut}
        onToggleTools={() => setIsToolsSidebarOpen(!isToolsSidebarOpen)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isToolsSidebarOpen={isToolsSidebarOpen}
        isChatOpen={isChatOpen}
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
