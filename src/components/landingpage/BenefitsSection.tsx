import { Sparkles, Users, Brain, FileText, Share2, Zap } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: "AI-Powered Diagramming",
      description:
        "Generate, edit, and expand diagrams instantly with AI. Let AI handle the structure—focus on your ideas.",
      bgColor: "bg-indigo-600",
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "Real-Time Collaboration",
      description:
        "Work together with your team live. See changes instantly and co-create diagrams from anywhere.",
      bgColor: "bg-blue-500",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: "Template Library",
      description:
        "Start fast with ready-made templates or save your own for future use. Browse, preview, and remix public diagrams.",
      bgColor: "bg-emerald-500",
    },
    {
      icon: <FileText className="w-6 h-6 text-white" />,
      title: "Flexible Export & Import",
      description:
        "Export diagrams as PNG, HTML, or .fz files. Import and edit any saved diagram with a click.",
      bgColor: "bg-yellow-500",
    },
    {
      icon: <Share2 className="w-6 h-6 text-white" />,
      title: "Easy Sharing & Management",
      description:
        "Save diagrams to the cloud, manage access, and share with a link. Control who can view or edit.",
      bgColor: "bg-pink-500",
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Intuitive & Fast UI",
      description:
        "Drag, drop, connect, and edit with a Figma-like interface. Undo/redo, search, and autosave built in.",
      bgColor: "bg-purple-500",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Why Flowz?
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
            The Future of Diagramming is Here
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flowz combines AI, real-time collaboration, and a beautiful UI to
            help you create, share, and manage diagrams faster than ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm">
              <div
                className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-6`}
              >
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
