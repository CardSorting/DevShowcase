import { Helmet } from "react-helmet";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProjectCard from "@/components/ProjectCard";
import { Project, ProjectList } from "@shared/types";
import { ChevronDown, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef<boolean>(true);
  
  // Parallax elements refs
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Fetch all projects
  const { data, isLoading, isFetching } = useQuery<ProjectList>({
    queryKey: ['/api/projects'],
  });

  // Handle category change - reset displayed projects and page
  useEffect(() => {
    setPage(1);
    setDisplayedProjects([]);
    setHasMore(true);
    firstLoad.current = true;
  }, [activeCategory]);

  // Filtering and pagination logic
  useEffect(() => {
    if (data?.projects) {
      // Filter by category
      const filtered = activeCategory === 'all' 
        ? data.projects 
        : data.projects.filter(p => p.category === activeCategory);
      
      // Calculate if there are more projects to load
      const projectsPerPage = 8;
      const totalPages = Math.ceil(filtered.length / projectsPerPage);
      setHasMore(page < totalPages);
      
      // Get paginated projects
      const paginatedProjects = filtered.slice(0, page * projectsPerPage);
      
      // Only set projects if the array is different to avoid unnecessary renders
      if (JSON.stringify(paginatedProjects) !== JSON.stringify(displayedProjects)) {
        setDisplayedProjects(paginatedProjects);
      }
    }
  }, [data, activeCategory, page]);

  // Create a unique list of categories from the data
  const categories = data?.projects 
    ? ['all', ...Array.from(new Set(data.projects.map(p => p.category)))]
    : ['all'];

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Infinite scroll using Intersection Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProjectRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [isFetching, hasMore]);

  return (
    <>
      <Helmet>
        <title>DevShowcase - Interactive Project Gallery</title>
        <meta name="description" content="Explore our interactive developer showcase with parallax effects and infinite scrolling. Discover amazing web projects." />
      </Helmet>
      
      {/* Parallax Hero Section */}
      <div 
        ref={parallaxRef}
        className="relative h-[70vh] overflow-hidden bg-gradient-to-b from-primary/30 to-background flex items-center justify-center"
      >
        <div 
          className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f')] bg-cover bg-center opacity-10"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        
        <div className="absolute w-full h-full bg-gradient-to-t from-background to-transparent" style={{ top: `${70 - scrollY * 0.1}%` }}></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
            <span className="text-primary">Dev</span>Showcase
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto mb-8">
            Discover and explore innovative web projects in our interactive gallery
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" asChild>
              <Link href="#gallery">Explore Gallery</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth/github">Sign Up to Share</a>
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <a href="#gallery" className="text-foreground/60 hover:text-foreground">
            <ChevronDown size={36} />
          </a>
        </div>
      </div>
      
      <main className="w-full bg-background" id="gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Interactive Tabs */}
          <div className="sticky top-0 pt-4 pb-4 bg-background z-20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-purple-500" />
                Project Gallery
              </h2>
              <Link href="/projects" className="text-primary flex items-center font-medium">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
              <TabsList className="h-auto p-1 grid grid-flow-col auto-cols-max gap-2 overflow-x-auto max-w-full justify-start pb-2">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="px-4 py-2 capitalize rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
          
          <Separator className="my-4" />
          
          {/* Infinite Scrolling Project Grid */}
          {isLoading && displayedProjects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedProjects.map((project, index) => {
                if (displayedProjects.length === index + 1) {
                  return (
                    <div ref={lastProjectRef} key={project.id}>
                      <ProjectCard project={project} viewMode="grid" />
                    </div>
                  );
                } else {
                  return <ProjectCard key={project.id} project={project} viewMode="grid" />;
                }
              })}
            </div>
          )}
          
          {/* Loading indicator */}
          {(isFetching || hasMore) && displayedProjects.length > 0 && (
            <div ref={loadingRef} className="my-12 flex justify-center items-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}
          
          {/* No results message */}
          {!isLoading && displayedProjects.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-6">There are no projects in this category yet.</p>
              <Button asChild variant="outline">
                <Link href="#gallery" onClick={() => setActiveCategory('all')}>View All Categories</Link>
              </Button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="border-t bg-background/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="text-lg font-bold">DevShowcase</h3>
                <p className="text-sm text-muted-foreground">Discover, share, and get inspired</p>
              </div>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects">Browse Projects</Link>
                </Button>
                <Button size="sm" asChild>
                  <a href="/auth/github">Sign Up</a>
                </Button>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DevShowcase. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
