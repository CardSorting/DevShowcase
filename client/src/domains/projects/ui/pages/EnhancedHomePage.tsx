import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gift, Crown, Zap, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

// Import domain-specific hooks
import { useProjectQueries } from "../hooks/useProjectQueries";
import { useProjectCommands } from "../hooks/useProjectCommands";

// Import domain-specific components
import { ProjectCard } from "../components/ProjectCard";
import { CategoryNavigation } from "../components/CategoryNavigation";
import { FeaturedProjects } from "../components/FeaturedProjects";
import { TopCharts } from "../components/TopCharts";
import { ProjectsGrid } from "../components/ProjectsGrid";

// Additional UI components
import UploadCTA from "@/components/UploadCTA"; // we still use this existing component

/**
 * EnhancedHomePage Component
 * Leverages our domain architecture following Clean Architecture principles
 */
export function EnhancedHomePage() {
  // Track active tab
  const [activeTab, setActiveTab] = useState<string>("forYou");
  
  // Use our domain-specific hooks
  const {
    projectsData,
    featuredProjects,
    trendingProjects,
    newProjects,
    recommendedProjects,
    topProjects,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error
  } = useProjectQueries();

  // Use commands for user interactions
  const { toggleLike, isToggleLikeLoading } = useProjectCommands();
  
  // Event handler for a like button click
  const handleLike = (projectId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isToggleLikeLoading) {
      toggleLike(projectId);
    }
  };
  
  // Filtered projects based on the selected category
  const filteredProjects = selectedCategory
    ? projectsData?.projects.filter(p => p.category === selectedCategory) || []
    : projectsData?.projects || [];

  return (
    <>
      <Helmet>
        <title>DevShowcase - Discover Amazing Projects</title>
        <meta 
          name="description" 
          content="Explore a curated collection of web projects. Find top-rated applications, games, and tools from talented developers." 
        />
      </Helmet>
      
      <main className="w-full bg-background pb-16">
        {/* Featured Projects Hero Carousel */}
        {featuredProjects.length > 0 && (
          <div className="mb-6 md:mb-8">
            <FeaturedProjects projects={featuredProjects} />
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Navigation */}
          <div className="mb-6">
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
              {/* Tabs for different content sections */}
              <Tabs defaultValue="forYou" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="forYou" className="relative">
                      For You
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="trending">
                      <Zap className="h-4 w-4 mr-1" />
                      Trending
                    </TabsTrigger>
                    <TabsTrigger value="new">
                      <Clock className="h-4 w-4 mr-1" />
                      New
                    </TabsTrigger>
                  </TabsList>
                  
                  <Link href="/projects">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      See All <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
                
                {/* For You Tab - Personalized Recommendations */}
                <TabsContent value="forYou" className="pt-2">
                  {isLoading ? (
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <div className="animate-pulse text-primary">Loading recommendations...</div>
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
                      Error loading projects. Please try again.
                    </div>
                  ) : recommendedProjects.length > 0 ? (
                    <ProjectsGrid 
                      projects={recommendedProjects} 
                      viewType="card" 
                      columns={3} 
                    />
                  ) : (
                    <ProjectsGrid 
                      projects={filteredProjects.slice(0, 6)} 
                      viewType="card" 
                      columns={3} 
                    />
                  )}
                </TabsContent>
                
                {/* Trending Tab */}
                <TabsContent value="trending" className="pt-2">
                  {isLoading ? (
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <div className="animate-pulse text-primary">Loading trending projects...</div>
                    </div>
                  ) : trendingProjects.length > 0 ? (
                    <ProjectsGrid 
                      projects={trendingProjects} 
                      viewType="card" 
                      columns={3} 
                    />
                  ) : (
                    <div className="text-center py-10 bg-muted/30 rounded-lg">
                      <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No trending projects</h3>
                      <p className="text-muted-foreground">Check back soon for trending content</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* New Tab */}
                <TabsContent value="new" className="pt-2">
                  {isLoading ? (
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <div className="animate-pulse text-primary">Loading new projects...</div>
                    </div>
                  ) : newProjects.length > 0 ? (
                    <ProjectsGrid 
                      projects={newProjects} 
                      viewType="card" 
                      columns={3} 
                    />
                  ) : (
                    <div className="text-center py-10 bg-muted/30 rounded-lg">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No new projects</h3>
                      <p className="text-muted-foreground">Check back soon for new content</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Featured Collection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-semibold tracking-tight">Featured Collection</h2>
                </div>
                
                <ScrollArea className="w-full pb-4">
                  <div className="flex space-x-4">
                    {featuredProjects.map(project => (
                      <div key={project.id} className="w-[260px] flex-shrink-0">
                        <ProjectCard project={project} viewType="card" />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
              
              {/* Top Apps by Category (Shows when a category is selected) */}
              {selectedCategory && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-green-500" />
                    <h2 className="text-xl font-semibold tracking-tight">
                      Top {selectedCategory} Projects
                    </h2>
                  </div>
                  
                  <ProjectsGrid 
                    projects={filteredProjects.slice(0, 6)} 
                    viewType="grid"
                    columns={3}
                  />
                </div>
              )}
              
              {/* Editor's Choice */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold tracking-tight">Editor's Choice</h2>
                </div>
                
                <ProjectsGrid 
                  projects={featuredProjects.length > 0 ? featuredProjects.slice(0, 2) : filteredProjects.slice(0, 2)} 
                  viewType="list"
                  columns={1}
                />
              </div>
            </div>
            
            {/* Right Column (1/3 width) */}
            <div className="space-y-8">
              {/* Top Charts */}
              <TopCharts projects={topProjects.length > 0 ? topProjects : filteredProjects.slice(0, 5)} />
              
              {/* Category Navigation */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-medium mb-3">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <Button 
                      key={category}
                      variant="outline"
                      className={cn(
                        "justify-start h-auto py-2",
                        category === selectedCategory && "bg-primary/10 border-primary/20 text-primary"
                      )}
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