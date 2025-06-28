"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Menu,
  // User,
  Settings,
  Save,
  Download,
  Upload,
  // Undo,
  // Redo,
  ZoomIn,
  ZoomOut,
  LogOut,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { User as UserType } from "@/integrations/firebase/auth";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { useReactFlow } from "reactflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as htmlToImage from "html-to-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface TopToolbarProps {
  user: UserType | null;
  onSignOut: () => void;
  onToggleTools: () => void;
  onToggleChat: () => void;
  isToolsSidebarOpen: boolean;
  isChatOpen: boolean;
  onSave: () => void;
  onUpdateTitle: (title: string) => void;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  user,
  onSignOut,
  onToggleTools,
  onToggleChat,
  isToolsSidebarOpen,
  isChatOpen,
  onSave,
  onUpdateTitle,
}) => {
  const { diagramTitle, loading, setDiagramTitle } = useDiagramStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(
    diagramTitle || "Untitled Diagram"
  );
  const reactFlowInstance = useReactFlow();
  const [zoom, setZoom] = useState(1);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Keep zoom state in sync with React Flow
  React.useEffect(() => {
    if (reactFlowInstance && typeof reactFlowInstance.getZoom === "function") {
      setZoom(Number(reactFlowInstance.getZoom().toFixed(2)));
    }
    // Listen for zoom changes if needed
    // Optionally, you can add a listener to update zoom state on zoom events
  }, [reactFlowInstance]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance && typeof reactFlowInstance.zoomIn === "function") {
      reactFlowInstance.zoomIn();
      setZoom((z) => Math.min(z + 0.1, 2));
    }
  }, [reactFlowInstance]);
  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance && typeof reactFlowInstance.zoomOut === "function") {
      reactFlowInstance.zoomOut();
      setZoom((z) => Math.max(z - 0.1, 0.2));
    }
  }, [reactFlowInstance]);

  // Keep editTitle in sync with diagramTitle when not editing
  React.useEffect(() => {
    if (!isEditingTitle) {
      setEditTitle(diagramTitle || "Untitled Diagram");
    }
  }, [diagramTitle, isEditingTitle]);

  // Handle title editing
  const startEditingTitle = useCallback(() => {
    setEditTitle(diagramTitle || "Untitled Diagram");
    setIsEditingTitle(true);
  }, [diagramTitle]);
  const saveTitle = useCallback(async () => {
    const trimmedTitle = editTitle.trim();
    const finalTitle = trimmedTitle || "Untitled Diagram";

    setDiagramTitle(finalTitle);
    setIsEditingTitle(false);

    // Auto-save the diagram with the new title
    await onUpdateTitle(finalTitle);
  }, [editTitle, setDiagramTitle, onUpdateTitle]);

  const cancelEditTitle = useCallback(() => {
    setEditTitle(diagramTitle || "Untitled Diagram");
    setIsEditingTitle(false);
  }, [diagramTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        saveTitle();
      } else if (e.key === "Escape") {
        cancelEditTitle();
      }
    },
    [saveTitle, cancelEditTitle]
  );

  // Export as image handler
  const handleExportAsImage = async () => {
    // Find the React Flow wrapper by class and cast to HTMLElement
    const wrapper = document.querySelector(".react-flow") as HTMLElement | null;
    if (!wrapper) {
      alert("Could not find diagram canvas.");
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(wrapper, {
        backgroundColor: "#f9fafb",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${diagramTitle || "diagram"}.png`;
      document.body.appendChild(link); // Ensure it's in the DOM for Firefox
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to export image.");
    }
  };

  // Export as .fz handler
  const handleExportAsFz = () => {
    const { nodes, edges } = useDiagramStore.getState();
    const data = JSON.stringify({
      title: diagramTitle,
      nodes,
      edges,
    });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagramTitle || "diagram"}.fz`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import .fz handler
  const handleImportFz = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { title, nodes, edges } = JSON.parse(
          event.target?.result as string
        );
        useDiagramStore.getState().setDiagramTitle(title || "Imported Diagram");
        useDiagramStore.getState().setNodes(nodes || []);
        useDiagramStore.getState().setEdges(edges || []);
        if (useDiagramStore.getState().setDiagramId) {
          useDiagramStore.getState().setDiagramId("");
        }
        alert("Diagram imported successfully!");
      } catch {
        alert("Invalid .fz file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <Link  href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-gray-900">Flowz</span>
        </Link>{" "}
        {/* Diagram Title */}
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-sm">|</span>
          {isEditingTitle ? (
            <div className="flex items-center space-x-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={saveTitle}
                className="h-6 text-sm font-medium border-none shadow-none p-1 min-w-0 w-32"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={saveTitle}
              >
                <Check className="h-3 w-3 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={cancelEditTitle}
              >
                <X className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center space-x-1 group cursor-pointer"
              onClick={startEditingTitle}
            >
              <span className="text-sm font-medium">
                {diagramTitle || "Untitled Diagram"}
              </span>
              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
          )}
        </div>
        {/* Tools Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTools}
          className={`h-8 px-2 ${isToolsSidebarOpen ? "bg-gray-100" : ""}`}
        >
          <Menu className="h-4 w-4" />
        </Button>{" "}
        {/* File Actions */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={onSave}
              disabled={loading || !user}
              title="Save Diagram"
            >
              <Save className="h-4 w-4" />
            </Button>
            {loading && (
              <span className="text-xs text-gray-500 animate-pulse">
                Saving...
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            title="Import Flowz File (.fz)"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  title="Export/Import"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportAsImage}>
                  Export as Image (.png)
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleExportAsFz}>
                  Export as Flowz File (.fz)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Hidden file input for .fz import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".fz"
              style={{ display: "none" }}
              onChange={handleImportFz}
            />
          </div>
        </div>
        {/* <div className="w-px h-6 bg-gray-300"></div>
        Edit Actions
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Redo className="h-4 w-4" />
          </Button>
        </div> */}
           {/* <div className="w-px h-6 bg-gray-300"></div>
        {/* Zoom Actions */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 px-2">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* AI Chat Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleChat}
          className={`h-8 px-3 ${
            isChatOpen ? "bg-indigo-100 text-indigo-700" : ""
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          AI Assistant
        </Button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* User Info */}
        <div className="flex items-center space-x-2">
          <Avatar className="w-7 h-7">
            <AvatarImage
              src={user?.photoURL || undefined}
              alt={user?.displayName || user?.email || "User"}
            />
            <AvatarFallback>
              {user?.displayName
                ? user.displayName[0]
                : user?.email
                ? user.email[0]
                : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700 max-w-32 truncate">
            {user?.displayName || user?.email}
          </span>
        </div>

        {/* Settings & Sign Out */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogoutDialog(true)}
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-gray-700">
            Are you sure you want to log out?
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutDialog(false);
                onSignOut();
              }}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopToolbar;
