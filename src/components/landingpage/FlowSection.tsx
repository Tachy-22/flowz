import { Button } from "@/components/ui/button";

const FlowSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-xl">FZ</span>
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Diagramming, Reimagined with AI
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Draw, connect, and automate your workflows visually. Collaborate in
          real time, use AI to generate diagrams from text, and manage
          everything in the cloud. Flowz is the fastest way to turn ideas into
          action.
        </p>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg">
          Start Diagramming Free
        </Button>
      </div>
    </section>
  );
};

export default FlowSection;
