"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Square,
  Circle,
  Triangle,
  Diamond,
  ArrowRight,
  Type,
  Image,
  Pen,
  Move,
  MousePointer,
  Hand,
  X,
  LucideIcon,
} from "lucide-react";
import { useDiagramStore } from "@/integrations/zustand/useDiagramStore";

interface ToolsSidebarProps {
  onClose: () => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ onClose }) => {
  const { activeTool, setActiveTool, triggerAddRectangle } = useDiagramStore();

  const handleToolClick = (toolLabel: string) => {
    switch (toolLabel) {
      case "Select":
        setActiveTool("select");
        break;
      case "Rectangle":
        setActiveTool("rectangle");
        triggerAddRectangle();
        break;
      case "Circle":
        setActiveTool("circle");
        break;
      case "Diamond":
        setActiveTool("diamond");
        break;
      case "Arrow":
        setActiveTool("arrow");
        break;
      case "Text":
        setActiveTool("text");
        break;
      default:
        setActiveTool("select");
    }
  };
  const tools = [
    { icon: MousePointer, label: "Select", category: "basic" },
    { icon: Hand, label: "Pan", category: "basic" },
    { icon: Move, label: "Move", category: "basic" },
  ];

  const shapes = [
    { icon: Square, label: "Rectangle", category: "shapes" },
    { icon: Circle, label: "Circle", category: "shapes" },
    { icon: Triangle, label: "Triangle", category: "shapes" },
    { icon: Diamond, label: "Diamond", category: "shapes" },
  ];

  const flowElements = [
    { icon: Square, label: "Process", category: "flow" },
    { icon: Diamond, label: "Decision", category: "flow" },
    { icon: Circle, label: "Start/End", category: "flow" },
    { icon: ArrowRight, label: "Arrow", category: "flow" },
  ];

  const otherTools = [
    { icon: Type, label: "Text", category: "other" },
    { icon: Pen, label: "Draw", category: "other" },
    { icon: Image, label: "Image", category: "other" },
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
            className={`h-12 flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${
              activeTool === item.label.toLowerCase()
                ? "bg-blue-100 text-blue-700"
                : ""
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

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-900">Tools</h2>
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
        <ToolSection title="Flow Elements" items={flowElements} />
        <ToolSection title="Other" items={otherTools} />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" className="w-full text-sm">
          Browse Templates
        </Button>
      </div>
    </div>
  );
};

export default ToolsSidebar;
