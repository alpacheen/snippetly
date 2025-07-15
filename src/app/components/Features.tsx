import {Code, Stars, Search, MessageSquare} from 'lucide-react';

export default function Features() {
    const features = [
        {
            title: "Save Your Snippets",
            description: "Bookmark reusable code snippets to build your personal dev toolkit.",
            icon: Code,
        },
        {
            title: "Smart Search & Filters",
            description: "Find exactly what you need with powerful search and filtering options.",
            icon: Search,
        },
        {
            title: "Share & Collaborate",
            description: "Share your snippets with the community and collaborate with other developers.",
            icon: Stars,
        },
        {
            title: "Community Q&A",
            description: "Ask questions and get answers from fellow developers on code snippets.",
            icon: MessageSquare,
        },
    ];

    return (
        <section className="bg-brand-secondary text-text py-16 px-4 w-max-3xl overflow-hidden">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            <h2 className="text-3xl md:text-4xl font-bold">How Snippetly Works</h2>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-primary text-text rounded-lg p-6 shadow hover:shadow-lg transition"
                >
                  <feature.icon className="w-8 h-8 text-lightGreen mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-textSecondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    
