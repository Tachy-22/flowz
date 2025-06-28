import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      company: "Acme Software",
      title: "AI diagramming is a game-changer!",
      quote:
        "Flowz lets our team brainstorm and build process flows in minutes. The Gemini AI suggestions are spot-on, and real-time editing is seamless.",
      author: "Jordan Lee",
      role: "Product Manager",
      bgColor: "bg-indigo-50",
    },
    {
      company: "StartupX",
      title: "Collaboration made easy",
      quote:
        "We use Flowz to map out user journeys and technical diagrams. Sharing and editing together saves us hours every week.",
      author: "Priya Patel",
      role: "Lead Designer",
      bgColor: "bg-blue-50",
    },
    {
      company: "Freelance Consultant",
      title: "From text to flowchart in seconds",
      quote:
        "I just describe my process and Flowz builds the diagram for me. Exporting to PNG and sharing with clients is effortless.",
      author: "Alex Kim",
      role: "Automation Specialist",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">
            Testimonials
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-4 mb-6">
            Teams Love Flowz
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Flowz is transforming the way people create, share, and
            automate diagrams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`${
                testimonial.bgColor || "bg-white"
              } p-6 rounded-2xl shadow-sm`}
            >
              <CardContent className="p-0">
                {testimonial.company && (
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-900">
                      {testimonial.company}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {testimonial.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
