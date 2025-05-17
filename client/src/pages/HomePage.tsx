import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProjectList, Project } from "@shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Sparkles, Gift } from "lucide-react";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import CategoryScroller from "@/components/CategoryScroller";
import RecommendedProjects from "@/components/RecommendedProjects";
import TopCharts from "@/components/TopCharts";
import EditorsPick from "@/components/EditorsPick";
import UploadCTA from "@/components/UploadCTA";

export default function HomePage() {
  // State for category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Fetch all projects
  const { data: projectsData } = useQuery<ProjectList>({
    queryKey: ['/api/projects?sort=popular&page=1'],
  });
  
  // Fetch category-filtered projects if a category is selected
  const { data: filteredProjectsData } = useQuery<ProjectList>({
    queryKey: [`/api/projects?categories=${selectedCategory}&page=1`],
    enabled: !!selectedCategory,
  });
  
  // Use filtered projects when a category is selected, otherwise use all projects
  const displayProjects = selectedCategory && filteredProjectsData 
    ? filteredProjectsData.projects 
    : projectsData?.projects || [];
  
  // Extract category names from the category counts
  const categories = projectsData?.categoryCounts 
    ? Object.keys(projectsData.categoryCounts) 
    : [];
  
  return (
    <>
      <Helmet>
        <title>DevShowcase - Discover Amazing Projects</title>
        <meta name="description" content="Explore a curated collection of web projects. Find top-rated applications, games, and tools from talented developers." />
      </Helmet>
      
      <main className="w-full bg-background pb-16">
        {/* Featured Carousel */}
        <div className="mb-6 md:mb-8">
          <FeaturedCarousel 
            projects={projectsData?.projects || []} 
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Scroller */}
          <div className="mb-8">
            <CategoryScroller 
              categories={categories} 
              activeCategoryFilter={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Recommended Projects Carousel */}
              <RecommendedProjects 
                title={selectedCategory ? `Top ${selectedCategory} Projects` : "Recommended for you"} 
                projects={displayProjects.slice(0, 8)} 
              />
              
              {/* New & Updated Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold tracking-tight">New & Updated</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {displayProjects.slice(0, 6).map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <div className="group relative rounded-lg overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                          <img 
                            src={project.thumbnailUrl || "https://images.unsplash.com/photo-1579403124614-197f69d8187b"} 
                            alt={project.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium line-clamp-1">{project.title}</h3>
                          <p className="text-xs text-muted-foreground">{project.username}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Editor's Choice Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold tracking-tight">Editor's Choice</h2>
                </div>
                
                <EditorsPick projects={displayProjects.filter(p => p.featured).length > 0 
                  ? displayProjects.filter(p => p.featured) 
                  : displayProjects.slice(0, 2)} 
                />
              </div>
            </div>
            
            {/* Right Column (1/3 width) */}
            <div className="space-y-8">
              {/* Top Charts */}
              <TopCharts 
                projects={projectsData?.projects || []} 
              />
              
              {/* Category Navigation */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-medium mb-3">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <Button 
                      key={category}
                      variant="outline"
                      className="justify-start h-auto py-2"
                      onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
                    >
                      <span className="truncate">{category}</span>
                    </Button>
                  ))}
                  
                  <Link href="/projects">
                    <Button variant="ghost" className="w-full justify-center">
                      See all
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Upload CTA */}
              <UploadCTA />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
