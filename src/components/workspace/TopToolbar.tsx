"use client";
import React from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { User as UserType } from "@/integrations/firebase/auth";

interface TopToolbarProps {
  user: UserType | null;
  onSignOut: () => void;
  onToggleTools: () => void;
  onToggleChat: () => void;
  isToolsSidebarOpen: boolean;
  isChatOpen: boolean;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  user,
  onSignOut,
  onToggleTools,
  onToggleChat,
  isToolsSidebarOpen,
  isChatOpen,
}) => {
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
        </div>

        {/* Tools Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTools}
          className={`h-8 px-2 ${isToolsSidebarOpen ? "bg-gray-100" : ""}`}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* File Actions */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Save className="h-4 w-4" />
          </Button>
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
