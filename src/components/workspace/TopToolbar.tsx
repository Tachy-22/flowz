"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Menu,
  User,
  Settings,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  LogOut,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { User as UserType } from "@/integrations/firebase/auth";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";

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

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-gray-900">Flowz</span>
        </div>{" "}
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
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        {/* Edit Actions */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        {/* Zoom Actions */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 px-2">100%</span>
          <Button variant="ghost" size="sm" className="h-8 px-2">
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
          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
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
            onClick={onSignOut}
            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopToolbar;
