import { useMutation } from '@tanstack/react-query';
import { useProjects } from '../../providers/ProjectsProvider';
import { queryClient } from '@/lib/queryClient';
import { useState } from 'react';
import { ProjectAttributes, Project } from '../../entities/Project';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for project commands
 * Handles command-side operations following CQRS pattern
 */
export const useProjectCommands = () => {
  const { commands, repository } = useProjects();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [projectBeingDeleted, setProjectBeingDeleted] = useState<number | null>(null);

  // Mutation for toggling project like (optimistic update)
  const toggleLikeMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return await commands.toggleProjectLike.execute(projectId);
    },
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/projects/${projectId}`] });
      await queryClient.cancelQueries({ queryKey: ['/api/projects'] });
      
      // Snapshot the previous values
      const previousProject = queryClient.getQueryData([`/api/projects/${projectId}`]);
      
      // Perform optimistic update
      queryClient.setQueryData([`/api/projects/${projectId}`], (old: Project | undefined) => {
        if (!old) return old;
        
        // Create a new project with toggled isLiked and updated likes count
        const newLikes = old.isLiked ? old.likes - 1 : old.likes + 1;
        
        // Get the attributes and create updated project
        const attrs = {
          id: old.id,
          userId: old.userId,
          username: old.username,
          title: old.title,
          description: old.description,
          category: old.category,
          projectUrl: old.projectUrl,
          previewUrl: old.previewUrl,
          thumbnailUrl: old.thumbnailUrl,
          views: old.views,
          likes: newLikes,
          featured: old.featured,
          trending: old.trending,
          createdAt: old.createdAt,
          updatedAt: old.updatedAt,
          isLiked: !old.isLiked
        };
        
        return Project.create(attrs);
      });
      
      // Return the snapshot so we can rollback if something goes wrong
      return { previousProject };
    },
    onError: (error, projectId, context) => {
      // Rollback to the previous value if the mutation fails
      if (context?.previousProject) {
        queryClient.setQueryData([`/api/projects/${projectId}`], context.previousProject);
      }
      
      // Show error toast
      toast({
        title: "Error toggling like",
        description: "There was a problem updating your like. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (result, projectId) => {
      // Update the project data with the actual result from the server
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });
  
  // Mutation for creating a new project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<ProjectAttributes, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>) => {
      return await repository.createProject(projectData);
    },
    onSuccess: (createdProject) => {
      // Invalidate projects list and show success message
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project created",
        description: `Your project "${createdProject.title}" has been created successfully.`,
      });
      
      return createdProject;
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: "Error creating project",
        description: error.message || "There was a problem creating your project. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for updating a project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: number, data: Partial<ProjectAttributes> }) => {
      return await repository.updateProject(projectId, data);
    },
    onSuccess: (updatedProject) => {
      if (updatedProject) {
        // Invalidate specific project and projects list
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${updatedProject.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        });
        
        return updatedProject;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message || "There was a problem updating your project. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for deleting a project
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      setIsDeleting(true);
      setProjectBeingDeleted(projectId);
      try {
        return await repository.deleteProject(projectId);
      } finally {
        setIsDeleting(false);
        setProjectBeingDeleted(null);
      }
    },
    onSuccess: (success, projectId) => {
      if (success) {
        // Invalidate projects list
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        queryClient.removeQueries({ queryKey: [`/api/projects/${projectId}`] });
        
        toast({
          title: "Project deleted",
          description: "Your project has been deleted successfully.",
        });
        
        return true;
      } else {
        throw new Error("Failed to delete project");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting project",
        description: error.message || "There was a problem deleting your project. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Like commands
    toggleLike: (projectId: number) => toggleLikeMutation.mutate(projectId),
    isToggleLikeLoading: toggleLikeMutation.isPending,
    
    // Create commands
    createProject: (projectData: Omit<ProjectAttributes, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>) => 
      createProjectMutation.mutateAsync(projectData),
    isCreating: createProjectMutation.isPending,
    
    // Update commands
    updateProject: (projectId: number, data: Partial<ProjectAttributes>) => 
      updateProjectMutation.mutateAsync({ projectId, data }),
    isUpdating: updateProjectMutation.isPending,
    
    // Delete commands
    deleteProject: (projectId: number) => deleteProjectMutation.mutateAsync(projectId),
    isDeleting,
    projectBeingDeleted,
  };
};