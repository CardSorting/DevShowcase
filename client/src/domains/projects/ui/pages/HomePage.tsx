import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Sparkles, Gift } from "lucide-react";

// Domain-specific imports
import { useProjectQueries } from "../hooks/useProjectQueries";
import { FeaturedProjects } from "../components/FeaturedProjects";
import { CategoryNavigation } from "../components/CategoryNavigation";
import { ProjectsGrid } from "../components/ProjectsGrid";
import { TopCharts } from "../components/TopCharts";

// Import the UploadCTA component 
import UploadCTA from "@/components/UploadCTA";

/**
 * HomePage Component
 * Orchestrates the domain components following Clean Architecture principles
 */
export function HomePage() {
  const {
    projectsData,
    featuredProjects,
    trendingProjects,
    topProjects,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error
  } = useProjectQueries();

  // Display projects from the appropriate query
  const displayProjects = projectsData?.projects || [];
  
  return (
    <>
      <Helmet>
        <title>DevShowcase - Discover Amazing Projects</title>
        <meta name="description" content="Explore a curated collection of web projects. Find top-rated applications, games, and tools from talented developers." />
      </Helmet>
      
      <main className="w-full bg-background pb-16">
        {/* Featured Projects Carousel */}
        <div className="mb-6 md:mb-8">
          <FeaturedProjects projects={featuredProjects.length > 0 ? featuredProjects : displayProjects.slice(0, 3)} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Navigation */}
          <div className="mb-8">
            <CategoryNavigation 
              categories={categories} 
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {selectedCategory ? `${selectedCategory} Projects` : "Today's Picks"}
                  </h2>
                  <Link href="/projects">
                    <Button variant="ghost" className="flex items-center gap-1">
                      See All <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Loading projects...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <p className="text-lg text-red-500 dark:text-red-400">
                      Error loading projects. Please try again.
                    </p>
                  </div>
                ) : (
                  <ProjectsGrid 
                    projects={displayProjects.slice(0, 6)} 
                    viewType="card"
                    columns={3}
                  />
                )}
              </div>
              
              {/* Trending Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold tracking-tight">New & Updated</h2>
                </div>
                
                <ProjectsGrid 
                  projects={displayProjects.slice(0, 6)} 
                  viewType="grid"
                  columns={3}
                />
              </div>
              
              {/* Editor's Choice Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold tracking-tight">Editor's Choice</h2>
                </div>
                
                <ProjectsGrid 
                  projects={featuredProjects.length > 0 ? featuredProjects : displayProjects.slice(0, 2)}
                  viewType="list"
                  columns={1}
                />
              </div>
            </div>
            
            {/* Right Column (1/3 width) */}
            <div className="space-y-8">
              {/* Top Charts */}
              <TopCharts 
                projects={topProjects.length > 0 ? topProjects : displayProjects.slice(0, 5)} 
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