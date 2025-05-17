import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gift, Crown, Zap, Clock, Eye, Heart, ArrowUpFromLine, Code, Gamepad } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Import domain-specific hooks
import { useProjectQueries } from "../hooks/useProjectQueries";
import { useProjectCommands } from "../hooks/useProjectCommands";

// Import domain-specific components
import { ProjectCard } from "../components/ProjectCard";
import { CategoryNavigation } from "../components/CategoryNavigation";
import { FeaturedProjects } from "../components/FeaturedProjects";
import { TopCharts } from "../components/TopCharts";
import { ProjectsGrid } from "../components/ProjectsGrid";
import { AppStoreCategories } from "../components/AppStoreCategories";

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
        {/* Hero Banner Section */}
        <div className="bg-gradient-to-r from-primary/90 to-primary/60 dark:from-primary/80 dark:to-primary/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Discover Amazing Developer Projects
                </h1>
                <p className="text-white/90 md:text-lg mb-6">
                  Explore a curated collection of innovative applications, games, and tools built by talented developers
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Explore Projects
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                    Upload Your Project
                  </Button>
                </div>
              </div>
              <div className="hidden md:block relative">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
                <div className="rounded-xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  {featuredProjects.length > 0 ? (
                    <img 
                      src={featuredProjects[0].getDisplayImage()} 
                      alt="Featured Project" 
                      className="w-64 h-64 object-cover"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-muted/50 flex items-center justify-center">
                      <span className="text-white/70">Featured projects coming soon</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Projects Hero Carousel */}
        {featuredProjects.length > 0 && (
          <div className="mb-6 md:mb-8 mt-8">
            <FeaturedProjects projects={featuredProjects} />
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Category Navigation */}
          <div className="my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Browse Categories</h2>
              <Link href="/projects/categories">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  See All <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {/* All Categories Option */}
              <div 
                onClick={() => setSelectedCategory("")}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all",
                  selectedCategory === "" 
                    ? "bg-primary/10 border-2 border-primary/20" 
                    : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">All Projects</span>
              </div>
              
              {/* Category Options */}
              {categories.slice(0, 9).map((category) => (
                <div 
                  key={category}
                  onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all",
                    selectedCategory === category 
                      ? "bg-primary/10 border-2 border-primary/20" 
                      : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    {/* Use a different icon for each category */}
                    {category === "JavaScript" ? (
                      <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    ) : category === "Game" ? (
                      <Gamepad className="h-6 w-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{category}</span>
                </div>
              ))}
            </div>
            
            {/* Traditional horizontal category navigation as backup */}
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
                <div className="pb-8 border-b">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                        <Gift className="h-5 w-5 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Top {selectedCategory} Projects
                      </h2>
                    </div>
                    <Link href={`/projects?category=${selectedCategory}`}>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        See All <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                  
                  <ProjectsGrid 
                    projects={filteredProjects.slice(0, 6)} 
                    viewType="grid"
                    columns={3}
                  />
                </div>
              )}
              
              {/* Editor's Choice */}
              <div className="py-8 border-b">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">Editor's Choice</h2>
                  </div>
                  <Link href="/projects/editors-choice">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      See All <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid gap-6">
                  {featuredProjects.length > 0 ? featuredProjects.slice(0, 2).map(project => (
                    <Link href={`/project/${project.id}`} key={project.id}>
                      <div className="flex group items-center gap-4 p-3 rounded-xl transition-all hover:bg-muted/50">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={project.getDisplayImage()} 
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {project.trending && (
                            <div className="absolute top-1 right-1 w-2 h-2">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">{project.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Eye className="h-3 w-3 mr-1" />
                              {project.getFormattedViewCount()}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Heart className={cn("h-3 w-3 mr-1", project.isLiked && "fill-red-500 text-red-500")} />
                              {project.getFormattedLikeCount()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No featured projects yet</h3>
                      <p className="text-muted-foreground">Check back soon for hand-picked featured projects</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recently Added Section */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight">Recently Added</h2>
                  </div>
                  <Link href="/projects/latest">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      See All <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
                
                <ProjectsGrid 
                  projects={newProjects.length > 0 ? newProjects.slice(0, 6) : filteredProjects.slice(0, 6)} 
                  viewType="card"
                  columns={3}
                />
              </div>
            </div>
            
            {/* Right Column (1/3 width) */}
            <div className="space-y-8">
              {/* Top Charts with enhanced design */}
              <div className="bg-muted/10 rounded-xl p-5 border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Top Charts</h3>
                  </div>
                  <Link href="/projects/top">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      See All
                    </Button>
                  </Link>
                </div>
                
                <TopCharts 
                  projects={topProjects.length > 0 ? topProjects : filteredProjects.slice(0, 5)} 
                />
              </div>
              
              {/* Enhanced Category Selection */}
              <div className="bg-gradient-to-br from-muted/50 to-muted/10 rounded-xl p-5 border">
                <h3 className="font-medium mb-3">Quick Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Button 
                      key={category}
                      variant={category === selectedCategory ? "default" : "outline"}
                      className={cn(
                        "justify-start h-auto py-2 text-sm",
                        category === selectedCategory 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background/60 backdrop-blur-sm"
                      )}
                      onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
                    >
                      <span className="truncate">{category}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-3">
                  <Link href="/projects/categories">
                    <Button variant="ghost" className="w-full justify-center text-sm">
                      View All Categories
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Enhanced Upload CTA */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUpFromLine className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Share Your Project</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Showcase your work to the community and get feedback from developers worldwide
                  </p>
                  <Link href="/upload">
                    <Button className="w-full">Upload Project</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}