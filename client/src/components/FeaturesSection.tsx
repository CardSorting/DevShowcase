import { Rocket, BarChart, Users } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="my-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-3">Why Showcase Your Projects With Us?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get more visibility for your web projects and connect with other developers in the community.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <Rocket className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Instant Deployment</h3>
          <p className="text-gray-600">
            Upload your project ZIP file and get it hosted instantly. No complicated deployment processes.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 text-secondary mb-4">
            <BarChart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Project Analytics</h3>
          <p className="text-gray-600">
            Get detailed insights about who's viewing your projects and how they're performing.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Developer Community</h3>
          <p className="text-gray-600">
            Connect with other developers, get feedback, and build your professional network.
          </p>
        </div>
      </div>
    </section>
  );
}
