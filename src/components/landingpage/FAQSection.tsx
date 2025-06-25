import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqItems = [
    "What exactly is a corporate card in the SaaS world?",
    "Why upgrade to a modern corporate card solution?",
    "How do I get started with a corporate card?",
    "What makes this corporate card stand out?",
    "Are there any fees for using the corporate card?",
    "What type of card is this exactly?",
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
              Frequently Asked Questions
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
              Common Questions
              <br />
              Answered Simply.
            </h2>
            <p className="text-xl text-gray-600">
              Your go-to hub for questions on design, buying, updating, and
              getting help.
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
                    {item}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    This is placeholder content for the FAQ item. In a real
                    application, this would contain the actual answer.
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
