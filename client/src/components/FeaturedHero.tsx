import { Link } from "wouter";
import { Project } from "@shared/types";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface FeaturedHeroProps {
  project: Project;
}

export default function FeaturedHero({ project }: FeaturedHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <img 
          src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
          alt="" 
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <div className="inline-block mb-4 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              Featured Project
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3">
              {project.description}
            </p>
            <div className="flex items-center gap-4">
              <Link href={`/project/${project.id}`}>
                <Button className="bg-white text-gray-900 hover:bg-gray-100">
                  View Project
                </Button>
              </Link>
              <div className="flex items-center text-sm font-medium">
                <span className="mr-2">By {project.username}</span>
                <span className="px-2 py-1 bg-gray-800/50 rounded-full">
                  {project.category}
                </span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="aspect-w-16 aspect-h-9 md:aspect-auto rounded-lg overflow-hidden shadow-2xl transform md:rotate-2 transition-all group hover:rotate-0 hover:scale-105 border-4 border-white/10">
              <img 
                src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
                <Link href={`/project/${project.id}`}>
                  <Button size="sm" variant="ghost" className="text-white">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden md:block absolute -bottom-4 -left-4 bg-white/10 rounded-lg backdrop-blur-md p-3 shadow-xl transform -rotate-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{project.views}</span>
                <span className="text-sm text-gray-300">views</span>
              </div>
            </div>
            
            <div className="hidden md:block absolute -top-4 -right-4 bg-white/10 rounded-lg backdrop-blur-md p-3 shadow-xl transform rotate-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{project.likes}</span>
                <span className="text-sm text-gray-300">likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}