import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      company: "asana",
      title: "A True Game-Changer for Our Business!",
      quote:
        "Tasks that used to take hours are now completed in minutes. Highly recommend for any business looking to optimize efficiency! The intuitive interface, automation features, and seamless integration make workflow management effortless and significantly boost productivity.",
      author: "Eleanor Pena",
      role: "Scrum Master",
      bgColor: "bg-purple-100",
    },
    {
      title: "Seamless, Efficient, and Simply!",
      quote:
        "The automation tools alone have saved us so much time. We couldn't be happier!",
      author: "Marvin McKinney",
      role: "Marketing Coordinator",
    },
    {
      title: "Boosted Our Productivity.",
      quote:
        "The ability to automate repetitive tasks has allowed us to focus on growth, strategy, and innovation.",
      author: "Floyd Miles",
      role: "Project Manager",
    },
    {
      title: "Powerful Features and Simple!",
      quote:
        "Our entire team quickly adapted, and now we can't imagine working without it!",
      author: "Ronald Richards",
      role: "President of Sales",
    },
    {
      title: "Reliable, Scalable, and Perfect.",
      quote:
        "It's reliable, efficient, and constantly evolving to meet modern business demands!",
      author: "Bessie Cooper",
      role: "Team Leader",
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
            Enterprise grade solutions built
            <br />
            for efficiency and scale.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Optimized systems crafted to streamline, scale, and elevate business
            performance.
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
                    <div className="w-6 h-6 bg-red-500 rounded-full mr-2"></div>
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
