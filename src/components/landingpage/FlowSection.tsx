import { Button } from "@/components/ui/button";

const FlowSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-xl">A</span>
        </div>
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Less chaos more flow
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Integrate apps, automate processes, and unlock team potential with one
          sleek platform.
        </p>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg">
          Subscribe
        </Button>
      </div>
    </section>
  );
};

export default FlowSection;
