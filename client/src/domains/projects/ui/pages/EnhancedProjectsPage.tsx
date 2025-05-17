import { useState } from "react";
import { Helmet } from "react-helmet";
import { useProjectQueries } from "../hooks/useProjectQueries";
import { ProjectCategory } from "../../entities/Project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Grid, 
  List, 
  LayoutGrid, 
  Search as SearchIcon, 
  Filter, 
} from "lucide-react";
import { ProjectsGrid } from "../components/ProjectsGrid";
import { CategoryNavigation } from "../components/CategoryNavigation";
import { ProjectSortOption } from "../../interfaces/ProjectRepository";

/**
 * EnhancedProjectsPage Component
 * Showcases all projects with filtering and sorting capabilities
 * Uses our domain-driven design architecture
 */
export function EnhancedProjectsPage() {
  // State for view mode
  const [viewMode, setViewMode] = useState<'grid' | 'card' | 'list'>('grid');
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // State for sort option
  const [sortOption, setSortOption] = useState<ProjectSortOption>('popular');
  
  // Use our domain-specific hooks for data and queries
  const {
    projectsData,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error
  } = useProjectQueries();
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here using searchProjects from useProjectQueries
  };
  
  return (
    <>
      <Helmet>
        <title>Explore Projects - DevShowcase</title>
        <meta 
          name="description" 
          content="Browse the latest web development projects, games, and tools created by talented developers." 
        />
      </Helmet>
      
      <main className="w-full bg-background pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Explore Projects</h1>
                <p className="text-muted-foreground mt-1">
                  Discover amazing projects from developers around the world
                </p>
              </div>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex w-full lg:w-auto lg:min-w-[300px]">
                <Input 
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-l-md rounded-r-none border-r-0"
                />
                <Button type="submit" variant="default" className="rounded-l-none">
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            {/* Filters section */}
            <div className="flex flex-col space-y-4">
              {/* Category Navigation */}
              <CategoryNavigation 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />
              
              {/* Filter & Sort Options */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select 
                    value={sortOption} 
                    onValueChange={(value) => setSortOption(value as ProjectSortOption)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'card' | 'list')}>
                  <TabsList>
                    <TabsTrigger value="grid">
                      <Grid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="card">
                      <LayoutGrid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Project Content */}
            <div className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
                  Error loading projects. Please try again.
                </div>
              ) : projectsData?.projects && projectsData.projects.length > 0 ? (
                <>
                  <ProjectsGrid 
                    projects={projectsData.projects} 
                    viewType={viewMode}
                    columns={viewMode === 'list' ? 1 : 4}
                  />
                  
                  {/* Pagination (simplified) */}
                  {projectsData.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-1">
                        {Array.from({ length: projectsData.totalPages }).map((_, i) => (
                          <Button
                            key={i}
                            variant={i + 1 === projectsData.currentPage ? "default" : "outline"}
                            size="sm"
                            className="w-9 h-9"
                          >
                            {i + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedCategory 
                      ? `No projects found in the "${selectedCategory}" category.` 
                      : "No projects match your search criteria."}
                  </p>
                  {selectedCategory && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedCategory("")}
                    >
                      Clear Category Filter
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}