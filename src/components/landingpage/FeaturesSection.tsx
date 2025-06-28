"use client";
import {
  Sparkles,
  Users,
  Shapes,
  Download,
  FolderOpen,
  Settings2,
} from "lucide-react";

const features = [
  {
    title: "Gemini AI Chat & Generation",
    desc: "Describe your flow in plain English and let Gemini AI build it for you. Get instant suggestions, auto-layout, and smart edits—all in real time.",
    icon: <Sparkles className="w-8 h-8 text-indigo-600 mb-4" />,
  },
  {
    title: "Real-Time Collaboration",
    desc: "Invite teammates to edit diagrams together. See changes live, chat, and never lose track of updates.",
    icon: <Users className="w-8 h-8 text-blue-600 mb-4" />,
  },
  {
    title: "Template Library",
    desc: "Browse, preview, and use public templates. Save your own diagrams as templates for quick reuse.",
    icon: <FolderOpen className="w-8 h-8 text-emerald-600 mb-4" />,
  },
  {
    title: "Flexible Export & Import",
    desc: "Export diagrams as PNG, HTML, or .fz files. Import and edit any saved diagram instantly.",
    icon: <Download className="w-8 h-8 text-yellow-500 mb-4" />,
  },
  {
    title: "Advanced Diagramming",
    desc: "Draw rectangles, circles, diamonds, triangles, text, and freehand shapes. Connect nodes with smart arrows and edit everything inline.",
    icon: <Shapes className="w-8 h-8 text-purple-500 mb-4" />,
  },
  {
    title: "Diagram Management",
    desc: "Search, autosave, undo/redo, and manage all your diagrams in one place. Share with a link and control access.",
    icon: <Settings2 className="w-8 h-8 text-pink-500 mb-4" />,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Features
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
            Everything You Need to Build, Share, and Automate Diagrams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flowz brings together AI, collaboration, and a powerful canvas to
            help you create diagrams faster and smarter.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx: number) => (
            <div
              key={idx}
              className="relative bg-gradient-to-br from-indigo-50 via-white to-indigo-100 rounded-3xl shadow-xl border border-indigo-100 px-8 py-10 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 shadow-inner border-2 border-indigo-200">
                {feature.icon}
              </div>
              <h3 className="font-bold text-2xl text-gray-900 mb-3 tracking-tight drop-shadow-sm">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
                {feature.desc}
              </p>
              {/* Decorative gradient blur */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-200 opacity-30 rounded-full blur-2xl z-0" />
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-100 opacity-20 rounded-full blur-xl z-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
