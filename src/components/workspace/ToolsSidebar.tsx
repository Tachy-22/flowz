"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Square,
  Circle,
  Triangle,
  Diamond,
  Type,
  //Image,
  Pen,
  Move,
  MousePointer,
  Hand,
  X,
  LucideIcon,
  File,
  FileText,
  FolderOpen,
  Link,
} from "lucide-react";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";
import { useUserStore } from "@/integrations/zustand";
import { diagramService } from "@/integrations/firebase/diagrams";
import { DiagramMeta } from "@/types/diagram";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ToolsSidebarProps {
  onClose: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ onClose }) => {
  const {
    activeTool,
    setActiveTool,
    triggerAddRectangle,
    triggerAddText, // <-- add this
    triggerAddDraw, // <-- add this
    setDiagramId,
    setDiagramTitle,
    setNodes,
    setEdges,
    resetDiagram,
  } = useDiagramStore();
  const { user } = useUserStore();
  const [recentDiagrams, setRecentDiagrams] = useState<DiagramMeta[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  // Fetch public templates (diagrams with allowedUsers: 'all')
  const [publicTemplates, setPublicTemplates] = useState<DiagramMeta[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Load recent diagrams
  const loadRecentDiagrams = async () => {
    if (!user) return;

    setIsLoadingRecent(true);
    try {
      console.log("🔍 Loading recent diagrams for user:", user.uid);
      const diagrams = await diagramService.getUserDiagrams(user.uid, {
        orderBy: "updatedAt",
        orderDirection: "desc",
        limit: 10,
      });
      console.log("📊 Found diagrams:", diagrams);
      setRecentDiagrams(diagrams);
    } catch (error) {
      console.error("❌ Failed to load recent diagrams:", error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Create new diagram
  const createNewDiagram = () => {
    resetDiagram();
    setDiagramId("");

    console.log("📝 Created new diagram");
  }; // Load a specific diagram
  const loadDiagram = async (diagramMeta: DiagramMeta) => {
    try {
      console.log("📂 Loading diagram:", diagramMeta.title, diagramMeta.id);

      // Clear existing state first to ensure clean load
      setNodes([]);
      setEdges([]);
      setDiagramId("");

      // Small delay to ensure state is cleared
      await new Promise((resolve) => setTimeout(resolve, 50));

      const diagram = await diagramService.getDiagram(diagramMeta.id);
      if (diagram) {
        // Set diagram metadata first
        setDiagramId(diagram.id);
        setDiagramTitle(diagram.title || "Untitled Diagram");

        // Then set the content
        setNodes(diagram.nodes || []);
        setEdges(diagram.edges || []);

        console.log("✅ Loaded diagram successfully:", diagram.title);
        console.log("📊 Nodes:", diagram.nodes?.length || 0);
        console.log("🔗 Edges:", diagram.edges?.length || 0);
      } else {
        console.error("❌ Diagram not found:", diagramMeta.id);
      }
    } catch (error) {
      console.error("❌ Failed to load diagram:", error);
    }
  };
  const handleToolClick = (toolLabel: string) => {
    console.log("🔧 Tool clicked:", toolLabel);
    switch (toolLabel) {
      case "Select":
        setActiveTool("select");
        break;
      case "Rectangle":
        setActiveTool("rectangle");
        triggerAddRectangle();
        break;
      case "Connection":
        setActiveTool("connection");
        break;
      case "Pan":
        setActiveTool("pan");
        break;
      case "Circle":
        setActiveTool("circle");
        triggerAddRectangle();
        break;
      case "Diamond":
        setActiveTool("diamond");
        triggerAddRectangle();
        break;
      case "Triangle":
        setActiveTool("triangle");
        triggerAddRectangle();
        break;
      case "Arrow":
        setActiveTool("arrow");
        break;
      case "Text":
        setActiveTool("text");

        triggerAddText();
        break;
      case "Draw":
        setActiveTool("draw");
        triggerAddDraw();
        break;
      default:
        setActiveTool("select");
    }
  };
  const tools = [
    { icon: MousePointer, label: "Select", category: "basic" },
    { icon: Hand, label: "Pan", category: "basic" },
    { icon: Move, label: "Move", category: "basic" },
    { icon: Link, label: "Connection", category: "basic" },
  ];

  const shapes = [
    { icon: Square, label: "Rectangle", category: "shapes" },
    { icon: Circle, label: "Circle", category: "shapes" },
    { icon: Triangle, label: "Triangle", category: "shapes" },
    { icon: Diamond, label: "Diamond", category: "shapes" },
  ];

  // const flowElements = [
  //   { icon: ArrowRight, label: "Arrow", category: "flow" },
  //   { icon: ArrowLeft, label: "Arrow", category: "flow" },
  // ];

  const otherTools = [
    { icon: Type, label: "Text", category: "other" },
    { icon: Pen, label: "Draw", category: "other" },
  ];

  const ToolSection = ({
    title,
    items,
  }: {
    title: string;
    items: Array<{ icon: LucideIcon; label: string; category: string }>;
  }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-1">
        {items.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`h-fit p-4 flex flex-col items-center justify-center text-gray-600 hover:text-gray-900  ${
              activeTool === item.label.toLowerCase()
                ? "bg-blue-100 text-blue-700"
                : " hover:bg-gray-100"
            }`}
            onClick={() => handleToolClick(item.label)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Fetch public templates (diagrams with allowedUsers: 'all')
  const fetchPublicTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplatesError(null);
    try {
      // You may need to implement this method in your diagramService if not present
      const templates = await diagramService.getPublicDiagrams({
        allowedUsers: "all",
        orderBy: "updatedAt",
        orderDirection: "desc",
        limit: 50,
      });
      setPublicTemplates(templates);
    } catch {
      setTemplatesError("Failed to load templates.");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2 w-full">
          <h2 className="font-medium text-gray-900">Tools</h2>
          {/* File Dropdown Menu */}{" "}
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) {
                loadRecentDiagrams();
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className=" ">
                File <File className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={createNewDiagram}>
                <FileText className="mr-2 h-4 w-4" />
                New Diagram
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    loadRecentDiagrams();
                  }}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open Recent
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {isLoadingRecent ? (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      Loading recent diagrams...
                    </div>
                  ) : recentDiagrams.length > 0 ? (
                    recentDiagrams.map((diagram) => (
                      <DropdownMenuItem
                        key={diagram.id}
                        onClick={() => loadDiagram(diagram)}
                        className="cursor-pointer"
                      >
                        <span className="truncate">
                          {diagram.title || "Untitled"}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      No recent diagrams found
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tools Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ToolSection title="Tools" items={tools} />
        <ToolSection title="Basic Shapes" items={shapes} />
        <ToolSection title="Other" items={otherTools} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => {
            setShowTemplatesDialog(true);
            fetchPublicTemplates();
          }}
        >
          Browse Templates
        </Button>
        <Dialog
          open={showTemplatesDialog}
          onOpenChange={setShowTemplatesDialog}
        >
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle>Browse Templates</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              {isLoadingTemplates ? (
                <div className="text-center text-gray-500 py-4">
                  Loading templates...
                </div>
              ) : templatesError ? (
                <div className="text-center text-red-500 py-4">
                  {templatesError}
                </div>
              ) : publicTemplates.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No public templates found.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[32rem] overflow-y-auto">
                  {publicTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex flex-col items-center p-2 border rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition group"
                      onClick={() => loadDiagram(template)}
                    >
                      <div className="w-full aspect-video bg-gray-100 rounded mb-2 overflow-hidden flex items-center justify-center">
                        {template.description ? (
                          <img
                            src={template.description}
                            alt={template.title || "Template"}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                            style={{ maxHeight: 140, minHeight: 80 }}
                          />
                        ) : (
                          <div className="text-xs text-gray-400">No image</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-center truncate w-full">
                        {template.title || "Untitled"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ToolsSidebar;
