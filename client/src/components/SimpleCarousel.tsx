import { useState, useEffect } from "react";
import { Project } from "@shared/types";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleCarouselProps {
  projects: Project[];
  className?: string;
}

export default function SimpleCarousel({ projects, className }: SimpleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter for featured or trending projects
  const filteredProjects = projects.filter(p => p.featured || p.trending);
  
  // If no featured projects, use the first few regular projects
  const displayProjects = filteredProjects.length >= 3 
    ? filteredProjects 
    : projects.slice(0, Math.min(5, projects.length));
  
  // Skip rendering if no projects to display
  useEffect(() => {
    if (displayProjects.length === 0) {
      return;
    }
    
    // Auto advance the carousel
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % displayProjects.length
      );
    }, 5000);
    
    return () => clearInterval(timer);
  }, [displayProjects.length]);
  
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + displayProjects.length) % displayProjects.length
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % displayProjects.length
    );
  };
  
  const project = displayProjects[currentIndex];
  
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Carousel Navigation */}
      <Button 
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg"
        onClick={handlePrevious}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button 
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg"
        onClick={handleNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {displayProjects.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-primary w-6"
                : "bg-primary/30 hover:bg-primary/50"
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      {/* Current project display */}
      <div className="relative h-[300px] md:h-[400px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/50 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col md:flex-row items-center p-6 md:p-10">
          <div className="md:w-2/3 text-white z-10 mb-6 md:mb-0">
            <div className="inline-flex items-center mb-2 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              {project.featured ? 'Editor\'s Choice' : 'Trending'} • {project.category}
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-2 tracking-tight">
              {project.title}
            </h2>
            
            <p className="mb-4 text-white/80 line-clamp-3">
              {project.description}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={cn(
                      "h-4 w-4", 
                      star <= Math.min(Math.round(project.likes / 3), 5) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-400"
                    )} 
                  />
                ))}
              </div>
              <span className="text-sm text-white/80">
                {project.views} installs
              </span>
            </div>
            
            <Link href={`/project/${project.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                View Details
              </Button>
            </Link>
          </div>
          
          <div className="md:w-1/3 z-10 flex justify-center md:justify-end">
            <div className="relative w-[180px] h-[180px] rounded-xl overflow-hidden bg-white shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
              <img 
                src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}