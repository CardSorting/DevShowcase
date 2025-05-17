import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Sparkles, Gift, Crown, Zap, Clock, Eye, 
  Heart, ArrowUpFromLine, Code, FileCode, Layout, 
  PenTool, PackageOpen, Bot, Globe, Smartphone, BadgeCheck 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";
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

// Additional UI components
import UploadCTA from "@/components/UploadCTA"; // we still use this existing component

/**
 * EnhancedHomePage Component
 * App Store inspired design with clean architecture
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
    
  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case "JavaScript":
        return <FileCode className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case "Web App":
        return <Layout className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case "React":
        return <Code className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />;
      case "UI/UX":
        return <PenTool className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case "Game":
        return <PackageOpen className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case "Portfolio":
        return <FileCode className="h-6 w-6 text-pink-600 dark:text-pink-400" />;
      case "AI":
        return <Bot className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case "API":
        return <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
      case "Mobile":
        return <Smartphone className="h-6 w-6 text-violet-600 dark:text-violet-400" />;
      default:
        return <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

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
        {/* App Store Style Hero Banner */}
        <div className="bg-gradient-to-r from-primary/90 to-primary/60 dark:from-primary/80 dark:to-primary/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Today's Featured
                </h1>
                <p className="text-white/90 text-lg">
                  Discover innovative developer projects
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/projects">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Discover
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                    Upload
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Showcase - App Store Style Carousel */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {featuredProjects.length > 0 ? (
            <div className="rounded-2xl overflow-hidden shadow-md mb-8">
              <FeaturedProjects projects={featuredProjects} />
            </div>
          ) : (
            <div className="h-[300px] rounded-2xl bg-muted/20 flex items-center justify-center mb-8">
              <p className="text-muted-foreground">Featured projects coming soon</p>
            </div>
          )}
          
          {/* Main Content Tabs - App Store Inspired */}
          <Tabs defaultValue="forYou" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="forYou" className="relative px-6">
                  For You
                </TabsTrigger>
                <TabsTrigger value="trending" className="px-6">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="new" className="px-6">
                  New
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* For You Tab Content */}
            <TabsContent value="forYou" className="space-y-8">
              {/* Category Navigation - App Store Style */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <ScrollArea className="pb-4">
                  <div className="flex space-x-4 pb-2">
                    {/* All Category */}
                    <div 
                      onClick={() => setSelectedCategory("")}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all w-24",
                        selectedCategory === "" 
                          ? "bg-primary/10 border-2 border-primary/20" 
                          : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-center">All</span>
                    </div>
                    
                    {/* Category Options */}
                    {categories.map((category) => (
                      <div 
                        key={category}
                        onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
                        className={cn(
                          "flex-shrink-0 flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all w-24",
                          selectedCategory === category 
                            ? "bg-primary/10 border-2 border-primary/20" 
                            : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                          {getCategoryIcon(category)}
                        </div>
                        <span className="text-sm font-medium text-center">{category}</span>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
              
              {/* Recommendations Section - App Store Style */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recommended For You</h2>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      See All <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="rounded-2xl bg-muted h-40 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
                    Error loading projects. Please try again.
                  </div>
                ) : recommendedProjects.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendedProjects.slice(0, 4).map(project => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="group space-y-2">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
                            <img 
                              src={project.thumbnailUrl || project.previewUrl} 
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
                            <p className="text-xs text-muted-foreground">{project.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredProjects.slice(0, 4).map(project => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="group space-y-2">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
                            <img 
                              src={project.thumbnailUrl || project.previewUrl} 
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
                            <p className="text-xs text-muted-foreground">{project.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Editor's Choice - App Store Style */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold">Editor's Choice</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredProjects.slice(0, 2).map(project => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <div className="group relative rounded-2xl overflow-hidden">
                        <div className="aspect-[16/9] w-full">
                          <img 
                            src={project.thumbnailUrl || project.previewUrl} 
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                          <div className="text-white">
                            <div className="text-sm text-white/80 mb-1">{project.category}</div>
                            <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                            <p className="text-sm text-white/90 line-clamp-2">{project.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Must-Try Projects - App Store Style */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-semibold">Must-Try Projects</h2>
                </div>
                
                <ScrollArea className="pb-4">
                  <div className="flex space-x-4">
                    {featuredProjects.map(project => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="w-[200px] flex-shrink-0 group space-y-2">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
                            <img 
                              src={project.thumbnailUrl || project.previewUrl} 
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
                            <p className="text-xs text-muted-foreground">{project.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
              
              {/* Top Charts - App Store Style */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold">Top Charts</h2>
                  </div>
                  <Link href="/projects/top">
                    <Button variant="ghost" size="sm">See All</Button>
                  </Link>
                </div>
                
                <div className="bg-muted/20 rounded-2xl p-6">
                  <TopCharts projects={topProjects.slice(0, 5)} />
                </div>
              </div>
              
              {/* Category Specific Projects - Shows when a category is selected */}
              {selectedCategory && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Top {selectedCategory} Projects</h2>
                    <Link href={`/projects?category=${selectedCategory}`}>
                      <Button variant="ghost" size="sm">See All</Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredProjects.slice(0, 4).map(project => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="group space-y-2">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
                            <img 
                              src={project.thumbnailUrl || project.previewUrl} 
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
                            <p className="text-xs text-muted-foreground">{project.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload CTA Section - App Store Style */}
              <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="text-2xl font-bold mb-2">Share Your Projects</h2>
                  <p className="text-white/90 mb-6">
                    Join our community of developers and showcase your work to the world
                  </p>
                  <Link href="/upload">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Upload Your Project
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            {/* Trending Tab Content - App Store Style */}
            <TabsContent value="trending" className="space-y-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Trending Now</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="rounded-2xl bg-muted h-40 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : trendingProjects.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {trendingProjects.slice(0, 8).map(project => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="group space-y-2">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
                            <img 
                              src={project.thumbnailUrl || project.previewUrl} 
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
                            <p className="text-xs text-muted-foreground">{project.category}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/30 rounded-lg">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No trending projects</h3>
                    <p className="text-muted-foreground">Check back soon for trending content</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* New Arrivals Tab Content - App Store Style */}
            <TabsContent value="new" className="space-y-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">New Arrivals</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="rounded-2xl bg-muted h-40 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : newProjects.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {newProjects.slice(0, 8).map(project => (
                      <Link key={project.id} href={`/project/${project.id}`}>
                        <div className="group space-y-2">
                          <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
                            <img 
                              src={project.thumbnailUrl || project.previewUrl} 
                              alt={project.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm line-clamp-1">{project.title}</h3>
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground">{project.category}</p>
                              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                                New
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/30 rounded-lg">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No new projects</h3>
                    <p className="text-muted-foreground">Check back soon for new content</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}