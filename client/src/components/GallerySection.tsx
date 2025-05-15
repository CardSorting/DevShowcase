import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ProjectList } from "@shared/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LayoutGrid, List, ArrowLeft, ArrowRight } from "lucide-react";
import ProjectCard from "./ProjectCard";

export default function GallerySection() {
  const { toast } = useToast();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const searchQuery = searchParams.get('search') || '';
  
  // State
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [popularityFilter, setPopularityFilter] = useState<string>("any");
  const [page, setPage] = useState(1);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [sortBy, selectedCategories, popularityFilter, searchQuery]);
  
  // Fetch projects
  const { data, isLoading, error } = useQuery<ProjectList>({
    queryKey: ['/api/projects', {
      sort: sortBy,
      categories: selectedCategories.join(','),
      popularity: popularityFilter,
      search: searchQuery,
      page
    }],
  });
  
  if (error) {
    toast({
      title: "Error loading projects",
      description: "There was a problem loading the projects. Please try again.",
      variant: "destructive",
    });
  }
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };
  
  const categoryCount = {
    all: data?.totalCount || 0,
    'landing-page': data?.categoryCounts?.['landing-page'] || 0,
    'web-app': data?.categoryCounts?.['web-app'] || 0,
    'portfolio': data?.categoryCounts?.['portfolio'] || 0,
    'game': data?.categoryCounts?.['game'] || 0,
    'ecommerce': data?.categoryCounts?.['ecommerce'] || 0,
    'other': data?.categoryCounts?.['other'] || 0,
  };
  
  const totalPages = data?.totalPages || 1;
  
  return (
    <section id="explore" className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Project Gallery</h2>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className={viewMode === "grid" ? "bg-white shadow-sm" : ""}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={viewMode === "list" ? "bg-white shadow-sm" : ""}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 shrink-0 mb-6 md:mb-0 md:mr-6">
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="category-all" 
                  checked={selectedCategories.length === 0}
                  onCheckedChange={() => setSelectedCategories([])}
                />
                <label htmlFor="category-all" className="ml-2 text-sm text-gray-700 flex-1">
                  All Projects
                </label>
                <span className="text-xs text-gray-500">{categoryCount.all}</span>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="category-landing-page" 
                  checked={selectedCategories.includes('landing-page')}
                  onCheckedChange={(checked) => handleCategoryChange('landing-page', checked as boolean)}
                />
                <label htmlFor="category-landing-page" className="ml-2 text-sm text-gray-700 flex-1">
                  Landing Pages
                </label>
                <span className="text-xs text-gray-500">{categoryCount['landing-page']}</span>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="category-web-app" 
                  checked={selectedCategories.includes('web-app')}
                  onCheckedChange={(checked) => handleCategoryChange('web-app', checked as boolean)}
                />
                <label htmlFor="category-web-app" className="ml-2 text-sm text-gray-700 flex-1">
                  Web Applications
                </label>
                <span className="text-xs text-gray-500">{categoryCount['web-app']}</span>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="category-portfolio" 
                  checked={selectedCategories.includes('portfolio')}
                  onCheckedChange={(checked) => handleCategoryChange('portfolio', checked as boolean)}
                />
                <label htmlFor="category-portfolio" className="ml-2 text-sm text-gray-700 flex-1">
                  Portfolios
                </label>
                <span className="text-xs text-gray-500">{categoryCount['portfolio']}</span>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="category-game" 
                  checked={selectedCategories.includes('game')}
                  onCheckedChange={(checked) => handleCategoryChange('game', checked as boolean)}
                />
                <label htmlFor="category-game" className="ml-2 text-sm text-gray-700 flex-1">
                  Web Games
                </label>
                <span className="text-xs text-gray-500">{categoryCount['game']}</span>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="category-ecommerce" 
                  checked={selectedCategories.includes('ecommerce')}
                  onCheckedChange={(checked) => handleCategoryChange('ecommerce', checked as boolean)}
                />
                <label htmlFor="category-ecommerce" className="ml-2 text-sm text-gray-700 flex-1">
                  E-commerce
                </label>
                <span className="text-xs text-gray-500">{categoryCount['ecommerce']}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-medium text-gray-900 mb-3">Popularity</h3>
            <RadioGroup value={popularityFilter} onValueChange={setPopularityFilter}>
              <div className="space-y-2">
                <div className="flex items-center">
                  <RadioGroupItem value="any" id="popularity-any" />
                  <Label htmlFor="popularity-any" className="ml-2 text-sm text-gray-700">
                    Any
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="trending" id="popularity-trending" />
                  <Label htmlFor="popularity-trending" className="ml-2 text-sm text-gray-700">
                    Trending
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="popular" id="popularity-popular" />
                  <Label htmlFor="popularity-popular" className="ml-2 text-sm text-gray-700">
                    Popular (1000+ views)
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="featured" id="popularity-featured" />
                  <Label htmlFor="popularity-featured" className="ml-2 text-sm text-gray-700">
                    Featured
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Gallery Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gray-200 mr-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No projects match your search "${searchQuery}".`
                  : "No projects match your current filters."}
              </p>
              <Button onClick={() => {
                setSelectedCategories([]);
                setPopularityFilter("any");
                setSortBy("popular");
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "flex flex-col space-y-4"
            }>
              {data?.projects.map(project => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  viewMode={viewMode} 
                />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {data && data.projects.length > 0 && (
            <div className="mt-10 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Button
                  variant="outline"
                  className="rounded-l-md"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    className="rounded-none border-x-0"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  className="rounded-r-md"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
