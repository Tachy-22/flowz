"use client";

const HeroSection = () => {
  return (
    <section className="relative text-center py-28 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight drop-shadow-sm">
          Build, Collaborate, and Automate
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-500 animate-gradient">
            Flow Diagrams
          </span>{" "}
          with AI
        </h1>
        <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
          The next-generation diagram builder. Draw, edit, and generate
          flowcharts collaboratively in real time. Save, share, and manage
          diagrams with ease—no coding required.
        </p>
        <div className="inline-block px-6 py-2 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-base shadow-sm mb-8 animate-fade-in">
          Try AI-powered diagramming for free
        </div>
       
      </div>
      {/* Decorative blurred gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200 opacity-30 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl z-0" />
    </section>
  );
};

export default HeroSection;
