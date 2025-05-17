import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Compass } from "lucide-react";

export default function HeroSection() {
  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const scrollToExplore = () => {
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="bg-gradient-to-r from-primary to-secondary rounded-2xl overflow-hidden mb-12">
      <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 lg:py-20 flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:max-w-xl mb-8 lg:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Showcase Your Game Projects to the World
          </h1>
          <p className="text-indigo-100 mb-6 text-lg">
            Upload your projects, get feedback, and gain recognition from the gaming community. 
            Simple hosting with powerful insights.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={scrollToUpload}
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Project
            </Button>
            <Button 
              onClick={scrollToExplore}
              variant="outline" 
              className="inline-flex justify-center items-center px-6 py-3 border border-white text-base font-medium rounded-md shadow-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              <Compass className="mr-2 h-4 w-4" />
              Explore Gallery
            </Button>
          </div>
        </div>
        <div className="lg:max-w-md">
          <img 
            src="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=400" 
            alt="Gaming setup with controllers" 
            className="rounded-lg shadow-xl w-full"
          />
        </div>
      </div>
    </section>
  );
}
