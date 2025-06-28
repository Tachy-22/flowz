"use client";

import Image from "next/image";

const WorkspacePreview = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="mb-10 text-center">
          <h3 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-sm">
            See the Flowz Workspace in Action
          </h3>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Experience a real-time, collaborative, AI-powered canvas. Every
            detail is designed for clarity, speed, and creativity.
          </p>
        </div>
        <div className="relative w-full flex justify-center">
          <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-100 bg-white">
            <Image
              src="/workspace-preview.png"
              alt="Flowz Workspace Preview"
              width={1600}
              height={900}
              className="w-full h-auto object-cover object-top min-h-[320px] max-h-[700px] transition-all duration-300"
              priority
            />
            {/* Optional floating badge */}
            <div className="absolute top-6 left-6 z-20 bg-indigo-500/90 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md backdrop-blur-md border border-indigo-200/60 select-none">
              AI LIVE
            </div>
          </div>
        </div>
        <div className="mt-10 text-center">
          <h4 className="text-2xl font-semibold text-gray-900 mb-2">
            The Ultimate Diagramming Experience
          </h4>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Drag, drop, chat, and collaborate—all in a workspace that feels as
            good as it looks.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WorkspacePreview;
