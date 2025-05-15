import { Button } from "@/components/ui/button";
import { Upload, Info } from "lucide-react";

export default function CTASection() {
  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="my-16">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-2xl font-semibold mb-4">Ready to Showcase Your Projects?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of developers who are already showcasing their work and building their professional portfolio.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
              <Button onClick={scrollToUpload} className="inline-flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Project
              </Button>
              <Button variant="outline" className="inline-flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Developer working on code" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
