import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectList, Project } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeaturedHero from "@/components/FeaturedHero";
import ProjectShowcase from "@/components/ProjectShowcase";
import TrendingCollection from "@/components/TrendingCollection";
import TopCategorySection from "@/components/TopCategorySection";
import EditorsPick from "@/components/EditorsPick";
import UploadCTA from "@/components/UploadCTA";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  // Fetch featured and trending projects
  const { data: projectsData } = useQuery<ProjectList>({
    queryKey: ['/api/projects?sort=popular&page=1'],
  });
  
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  
  useEffect(() => {
    if (projectsData?.projects) {
      // Find a featured project for the hero
      const featured = projectsData.projects.find(p => p.featured);
      if (featured) {
        setFeaturedProject(featured);
      } else if (projectsData.projects.length > 0) {
        // Use first project if no featured flag
        setFeaturedProject(projectsData.projects[0]);
      }
    }
  }, [projectsData]);

  return (
    <>
      <Helmet>
        <title>DevShowcase - Showcase Your Web Projects</title>
        <meta name="description" content="Upload your projects, get feedback, and gain recognition from the developer community. Simple hosting with powerful insights." />
      </Helmet>
      
      <main className="w-full bg-background pb-16">
        {/* Featured Hero Banner */}
        {featuredProject && (
          <FeaturedHero project={featuredProject} />
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Today's Picks Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Today's Picks</h2>
              <Link href="/projects">
                <Button variant="ghost" className="flex items-center gap-1">
                  See All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            
            <ProjectShowcase 
              projects={projectsData?.projects?.slice(0, 6) || []} 
              viewType="card" 
            />
          </div>
          
          {/* Categories and Trending Tabs */}
          <Tabs defaultValue="categories" className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="categories">Top Categories</TabsTrigger>
                <TabsTrigger value="trending">Trending Now</TabsTrigger>
              </TabsList>
              
              <Link href="/projects">
                <Button variant="ghost" className="flex items-center gap-1">
                  Browse All <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            
            <TabsContent value="categories">
              <TopCategorySection categoryCounts={projectsData?.categoryCounts || {}} />
            </TabsContent>
            
            <TabsContent value="trending">
              <TrendingCollection projects={projectsData?.projects?.filter(p => p.trending) || []} />
            </TabsContent>
          </Tabs>
          
          {/* Upload CTA Banner */}
          <UploadCTA className="mb-12" />
          
          {/* Editor's Picks */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold tracking-tight">Editor's Picks</h2>
            </div>
            
            <EditorsPick projects={projectsData?.projects?.slice(0, 4) || []} />
          </div>
        </div>
      </main>
    </>
  );
}
