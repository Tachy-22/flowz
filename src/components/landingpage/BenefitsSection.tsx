import { Zap, RotateCcw, Sparkles, ChevronRight, FileText } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Flow in motion",
      description:
        "Automate tasks, streamline processes, and boost productivity.",
      bgColor: "bg-emerald-500",
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Swift and seamless",
      description: "Create powerful workflows effortlessly, reducing errors.",
      bgColor: "bg-blue-500",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: "Automate with ease",
      description: "Streamline processes, save time, and enhance efficiency.",
      bgColor: "bg-orange-500",
    },
    {
      icon: <ChevronRight className="w-6 h-6 text-white" />,
      title: "Quick Start",
      description:
        "Choose from a library of pre-built workflow templates designed to save time.",
      bgColor: "bg-indigo-600",
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-white" />,
      title: "Smooth Sync",
      description:
        "Connect your team across departments in one seamless flow in real time.",
      bgColor: "bg-pink-500",
    },
    {
      icon: <FileText className="w-6 h-6 text-white" />,
      title: "Taskly",
      description:
        "Eliminate manual work with powerful automation tools that handle the busywork.",
      bgColor: "bg-yellow-500",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Benefits
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
            Rapidly create high-
            <br />
            performance workflows
          </h2>{" "}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AutoMesh&apos;s got you covered with simple tools to supercharge
            your workflows, no matter your team&apos;s size.
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
