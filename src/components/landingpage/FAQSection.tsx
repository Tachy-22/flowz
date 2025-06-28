import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is Flowz?",
    answer:
      "Flowz is an AI-powered, collaborative flow diagram builder. It lets you create, edit, and generate diagrams with the help of AI, and collaborate with others in real time.",
  },
  {
    question: "How does the AI assistant work?",
    answer:
      "Just describe your process or workflow in plain English. Gemini AI will generate a diagram for you, which you can edit and expand further.",
  },
  {
    question: "Can I collaborate with my team?",
    answer:
      "Yes! Flowz supports real-time collaboration. Invite others to your diagram and work together live.",
  },
  {
    question: "What export/import options are available?",
    answer:
      "You can export diagrams as PNG images, HTML, or .fz files. You can also import .fz files to continue editing.",
  },
  {
    question: "Is there a template library?",
    answer:
      "Yes, Flowz includes a public template browser. Start from a template or save your own for future use.",
  },
  {
    question: "Is Flowz free?",
    answer:
      "Flowz offers a free tier with core features. Advanced features and team plans are coming soon.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
              Frequently Asked Questions
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
              Everything You Need to Know
            </h2>
            <p className="text-xl text-gray-600">
              Answers to common questions about Flowz, AI diagramming, and
              collaboration.
            </p>
          </div>

          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-lg border-0 shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
