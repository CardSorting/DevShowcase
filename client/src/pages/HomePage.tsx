import { Helmet } from "react-helmet";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ProjectCard from "@/components/ProjectCard";
import { Project, ProjectList } from "@shared/types";
import { 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  X, 
  ChevronUp, 
  Star, 
  Eye, 
  TrendingUp
} from "lucide-react";

export default function HomePage() {
  // Filter state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [minViews, setMinViews] = useState<number>(0);
  const [maxViews, setMaxViews] = useState<number>(1000);
  const [filtersVisible, setFiltersVisible] = useState<boolean>(true);
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef<boolean>(true);
  
  // Parallax elements refs
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch all projects
  const { data, isLoading, isFetching } = useQuery<ProjectList>({
    queryKey: ['/api/projects'],
  });

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setFiltersVisible(window.innerWidth >= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle filter change - reset displayed projects and page
  useEffect(() => {
    setPage(1);
    setDisplayedProjects([]);
    setHasMore(true);
    firstLoad.current = true;
  }, [activeCategory, selectedCategories, sortBy, searchTerm, minViews, maxViews]);

  // Filtering and pagination logic
  useEffect(() => {
    if (data?.projects) {
      // Apply all filters
      let filtered = [...data.projects];
      
      // Category filter
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
      }
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(search) || 
          p.description.toLowerCase().includes(search) ||
          p.username.toLowerCase().includes(search)
        );
      }
      
      // Views filter
      filtered = filtered.filter(p => p.views >= minViews && p.views <= maxViews);
      
      // Sort projects
      switch (sortBy) {
        case "newest":
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "most-viewed":
          filtered.sort((a, b) => b.views - a.views);
          break;
        case "most-liked":
          filtered.sort((a, b) => b.likes - a.likes);
          break;
      }
      
      // Calculate if there are more projects to load
      const projectsPerPage = 12;
      const totalPages = Math.ceil(filtered.length / projectsPerPage);
      setHasMore(page < totalPages);
      
      // Get paginated projects
      const paginatedProjects = filtered.slice(0, page * projectsPerPage);
      
      // Only set projects if the array is different to avoid unnecessary renders
      if (JSON.stringify(paginatedProjects) !== JSON.stringify(displayedProjects)) {
        setDisplayedProjects(paginatedProjects);
      }
    }
  }, [data, selectedCategories, sortBy, searchTerm, minViews, maxViews, page]);

  // Create a unique list of categories from the data
  const categories = data?.projects 
    ? Array.from(new Set(data.projects.map(p => p.category)))
    : [];

  // Calculate max views for slider
  useEffect(() => {
    if (data?.projects && data.projects.length > 0) {
      const maxProjectViews = Math.max(...data.projects.map(p => p.views));
      setMaxViews(maxProjectViews > 0 ? maxProjectViews : 1000);
    }
  }, [data]);

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

  // Clear filters handler
  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy("newest");
    setSearchTerm("");
    setMinViews(0);
    if (data?.projects) {
      const maxProjectViews = Math.max(...data.projects.map(p => p.views));
      setMaxViews(maxProjectViews > 0 ? maxProjectViews : 1000);
    } else {
      setMaxViews(1000);
    }
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      <Helmet>
        <title>DevShowcase - Interactive Project Gallery</title>
        <meta name="description" content="Explore our interactive developer showcase with advanced filtering, parallax effects and infinite scrolling. Discover amazing web projects." />
      </Helmet>
      
      {/* Parallax Hero Section */}
      <div 
        ref={parallaxRef}
        className="relative h-[60vh] overflow-hidden bg-gradient-to-b from-primary/30 to-background flex items-center justify-center"
      >
        <div 
          className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f')] bg-cover bg-center opacity-10"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        
        <div className="absolute w-full h-full bg-gradient-to-t from-background to-transparent" style={{ top: `${70 - scrollY * 0.1}%` }}></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            <span className="text-primary">Dev</span>Showcase
          </h1>
          <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto mb-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-purple-500" />
                Project Gallery
              </h2>
              <Link href="/projects" className="text-primary flex items-center font-medium">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Mobile Filter Toggle */}
            <div className="md:hidden w-full mb-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-between" 
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <span className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </span>
                {filtersVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Filters - E-commerce Style */}
            <div className={`md:w-64 shrink-0 space-y-6 ${filtersVisible ? 'block' : 'hidden'} md:block`}>
              {/* Search Box */}
              <div>
                <h3 className="text-lg font-medium mb-3">Search</h3>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Sort Options */}
              <div>
                <h3 className="text-lg font-medium mb-3">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="most-viewed">Most Viewed</SelectItem>
                    <SelectItem value="most-liked">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category Filter */}
              <Collapsible defaultOpen>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Categories</h3>
                  <CollapsibleTrigger className="p-1 rounded-md hover:bg-muted">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-3 space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label 
                          htmlFor={`category-${category}`}
                          className="capitalize cursor-pointer flex justify-between w-full"
                        >
                          <span>{category}</span>
                          {data?.categoryCounts?.[category] && (
                            <Badge variant="secondary" className="ml-2">
                              {data.categoryCounts[category]}
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Views Range Slider */}
              <Collapsible defaultOpen>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Views Range</h3>
                  <CollapsibleTrigger className="p-1 rounded-md hover:bg-muted">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-6 px-2">
                    <Slider
                      defaultValue={[minViews, maxViews]}
                      min={0}
                      max={maxViews}
                      step={1}
                      value={[minViews, maxViews]}
                      onValueChange={([min, max]) => {
                        setMinViews(min);
                        setMaxViews(max);
                      }}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{minViews} views</span>
                      <span>{maxViews} views</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full flex justify-center" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
                {isMobile && (
                  <Button className="w-full" onClick={() => setFiltersVisible(false)}>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                )}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Filter Summary */}
              {(selectedCategories.length > 0 || searchTerm || minViews > 0 || maxViews < (data?.projects ? Math.max(...data.projects.map(p => p.views)) : 1000)) && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium mr-2">Active filters:</span>
                    
                    {selectedCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                        {cat}
                        <button onClick={() => toggleCategory(cat)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    
                    {searchTerm && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Search: {searchTerm.length > 10 ? searchTerm.slice(0, 10) + '...' : searchTerm}
                        <button onClick={() => setSearchTerm('')} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    
                    {(minViews > 0 || maxViews < (data?.projects ? Math.max(...data.projects.map(p => p.views)) : 1000)) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Views: {minViews}-{maxViews}
                        <button onClick={() => {
                          setMinViews(0);
                          if (data?.projects) {
                            setMaxViews(Math.max(...data.projects.map(p => p.views)));
                          } else {
                            setMaxViews(1000);
                          }
                        }} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="ml-auto"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            
              {/* Results Info */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">
                  Showing {displayedProjects.length} result{displayedProjects.length !== 1 ? 's' : ''}
                  {data?.projects && ` out of ${data.projects.length} projects`}
                </div>
                <div className="flex items-center">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="most-viewed">Most Viewed</SelectItem>
                      <SelectItem value="most-liked">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            
              {/* Project Grid */}
              {isLoading && displayedProjects.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
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
              ) : displayedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              ) : (
                <div className="text-center py-16 bg-muted/30 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters to find more projects.</p>
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
              
              {/* Loading indicator */}
              {(isFetching || hasMore) && displayedProjects.length > 0 && (
                <div ref={loadingRef} className="my-12 flex justify-center items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="border-t bg-background/60 backdrop-blur-sm mt-12">
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
