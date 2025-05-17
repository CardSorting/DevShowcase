import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ProjectCard from "@/components/ProjectCard";
import { Project, ProjectList } from "@shared/types";
import { ChevronRight, Star, Sparkles, TrendingUp, Eye } from "lucide-react";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<Project[]>([]);

  // Fetch projects with pagination
  const { data, isLoading } = useQuery<ProjectList>({
    queryKey: ['/api/projects'],
  });

  useEffect(() => {
    if (data?.projects) {
      // Extract featured projects
      const featured = data.projects.filter(project => project.featured);
      setFeaturedProjects(featured.slice(0, 4));
      
      // Extract trending projects
      const trending = data.projects.filter(project => project.trending || project.views > 50);
      setTrendingProjects(trending.slice(0, 4));
    }
  }, [data]);

  // Create a unique list of categories from the data
  const categories = data?.projects 
    ? ['all', ...Array.from(new Set(data.projects.map(p => p.category)))]
    : ['all'];

  // Filter projects by active category
  const filteredProjects = data?.projects 
    ? activeCategory === 'all' 
      ? data.projects
      : data.projects.filter(p => p.category === activeCategory)
    : [];

  return (
    <>
      <Helmet>
        <title>DevShowcase - Web Project Gallery</title>
        <meta name="description" content="Discover innovative web projects created by developers. Browse trending and featured projects and get inspired." />
      </Helmet>
      
      <main className="w-full bg-background">
        {/* App Store Style Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              <span className="text-primary">Dev</span>Showcase
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
              Discover, explore, and get inspired by innovative web projects from developers around the world.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Projects Carousel */}
          {featuredProjects.length > 0 && (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Featured Projects
                </h2>
                <Link href="/projects?featured=true" className="text-primary flex items-center text-sm font-medium hover:underline">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} viewMode="grid" />
                ))}
              </div>
            </section>
          )}
          
          {/* Trending Projects */}
          {trendingProjects.length > 0 && (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                  Trending Now
                </h2>
                <Link href="/projects?trending=true" className="text-primary flex items-center text-sm font-medium hover:underline">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingProjects.map(project => (
                  <ProjectCard key={project.id} project={project} viewMode="grid" />
                ))}
              </div>
            </section>
          )}
          
          {/* Main Project Gallery with Categories */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                Project Gallery
              </h2>
            </div>
            
            <div className="mb-6">
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
                <TabsList className="flex overflow-x-auto pb-2 mb-2 w-full">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="capitalize"
                    >
                      {category}
                      {category !== 'all' && data?.categoryCounts?.[category] && (
                        <Badge variant="secondary" className="ml-2">
                          {data.categoryCounts[category]}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <CardContent className="p-5">
                      <div className="h-5 bg-gray-200 animate-pulse mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 animate-pulse mb-1"></div>
                      <div className="h-4 bg-gray-200 animate-pulse w-5/6"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProjects.slice(0, 12).map(project => (
                    <ProjectCard key={project.id} project={project} viewMode="grid" />
                  ))}
                </div>
                
                {filteredProjects.length > 12 && (
                  <div className="mt-8 text-center">
                    <Button asChild variant="outline" size="lg">
                      <Link href="/projects">View All Projects</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
          
          {/* App Store Style Footer Section */}
          <section className="mt-16 mb-8">
            <Separator className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">About DevShowcase</h3>
                <p className="text-muted-foreground">
                  DevShowcase is a platform for developers to share their projects with the world. 
                  Get inspired, showcase your work, and connect with other developers.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Join the Community</h3>
                <p className="text-muted-foreground">
                  Sign up to upload your own projects, like and comment on others' work, and get personalized recommendations.
                </p>
                <div className="mt-4">
                  <Button asChild className="mr-4">
                    <a href="/auth/github">Sign Up</a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/projects">Browse Projects</Link>
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4">Top Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => c !== 'all').slice(0, 8).map(category => (
                    <Badge key={category} variant="secondary" className="capitalize cursor-pointer">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
