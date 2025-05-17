import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useProjectQueries } from '../hooks/useProjectQueries';
import { useProjectCommands } from '../hooks/useProjectCommands';
import { Project } from '../../entities/Project';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  ExternalLink, 
  Calendar, 
  Eye, 
  ArrowLeft, 
  Share2,
  Bookmark,
  MessageSquare
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Enhanced Project Page Component
 * Displays detailed information about a single project
 * Uses domain-driven design architecture
 */
export function EnhancedProjectPage() {
  // Get project ID from URL
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Project loading state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current tab state
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Use our domain hooks
  const { loadProject } = useProjectQueries();
  const { toggleLike, isToggleLikeLoading } = useProjectCommands();
  
  // Load project data
  useEffect(() => {
    async function fetchProject() {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const projectId = parseInt(params.id, 10);
        const projectData = await loadProject(projectId);
        
        if (projectData) {
          setProject(projectData);
          setError(null);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to load project');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProject();
  }, [params.id, loadProject]);
  
  // Handle like/unlike project
  const handleToggleLike = () => {
    if (!project || isToggleLikeLoading) return;
    
    toggleLike(project.id);
    
    // Optimistic UI update
    setProject(prevProject => {
      if (!prevProject) return null;
      
      const newLikes = prevProject.isLiked ? prevProject.likes - 1 : prevProject.likes + 1;
      
      return Project.create({
        ...prevProject.toJSON(),
        likes: newLikes,
        isLiked: !prevProject.isLiked
      });
    });
  };
  
  // Handle share project
  const handleShare = () => {
    if (navigator.share && project) {
      navigator.share({
        title: `${project.title} - DevShowcase`,
        text: project.description,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied",
          description: "Project link copied to clipboard",
        });
      });
    }
  };
  
  // Handle project visit
  const handleVisitProject = () => {
    if (!project) return;
    window.open(project.projectUrl, '_blank');
  };
  
  // If loading, show skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-96 w-full mb-6 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  // If error, show error message
  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error || 'Project not found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the project you're looking for.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{project.title}</title>
        <meta name="description" content={project.description} />
      </Helmet>
      
      <main className="w-full bg-background pb-16">
        {/* Hero Section */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          {/* Project banner */}
          <div className="absolute inset-0">
            <img 
              src={project.getDisplayImage()} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          
          {/* Navigation */}
          <div className="absolute top-4 left-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-background/50 backdrop-blur-sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Header */}
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                      {project.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {project.getFormattedDate()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {project.getFormattedViewCount()} views
                      </span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {project.category}
                      </Badge>
                      {project.featured && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "flex items-center gap-1",
                        project.isLiked && "text-red-500"
                      )}
                      onClick={handleToggleLike}
                      disabled={isToggleLikeLoading}
                    >
                      <Heart className={cn(
                        "h-4 w-4",
                        project.isLiked && "fill-red-500"
                      )} />
                      <span>{project.getFormattedLikeCount()}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Save</span>
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleVisitProject}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Visit Project</span>
                    </Button>
                  </div>
                </div>
                
                {/* Creator Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${project.username}`} />
                    <AvatarFallback>{project.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.username}</p>
                    <p className="text-xs text-muted-foreground">Project Creator</p>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground whitespace-pre-line">
                  {project.description}
                </p>
              </div>
              
              {/* Tabs */}
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="discussion">
                      Discussion
                      <span className="ml-1 bg-primary/10 text-xs px-2 py-0.5 rounded-full">
                        0
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="related">Related</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                      <iframe
                        src={project.projectUrl}
                        title={project.title}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Project Details</h3>
                      <p className="text-muted-foreground mb-4">
                        This project was created by {project.username} and uploaded on {project.getFormattedDate()}.
                        It has been viewed {project.views} times and liked by {project.likes} users.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="discussion" className="mt-4">
                    <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No comments yet</p>
                        <Button variant="outline" className="mt-2">
                          Be the first to comment
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="related" className="mt-4">
                    <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">Related projects coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Preview */}
              <div className="bg-card rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-muted">
                  <img 
                    src={project.getDisplayImage()} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">Project Preview</h3>
                  <Button variant="default" className="w-full mb-2" onClick={handleVisitProject}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Project
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Project
                  </Button>
                </div>
              </div>
              
              {/* Ratings & Stats */}
              <div className="bg-card rounded-xl p-4 shadow-lg">
                <h3 className="font-medium mb-3">Project Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium">{project.getFormattedViewCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Likes</span>
                    <span className="font-medium">{project.getFormattedLikeCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Heart
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= project.getStarRating()
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="bg-card rounded-xl p-4 shadow-lg">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">{project.category}</Badge>
                  {project.featured && <Badge variant="secondary">Featured</Badge>}
                  {project.trending && <Badge variant="secondary">Trending</Badge>}
                  {project.isNew() && <Badge variant="outline">New</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}