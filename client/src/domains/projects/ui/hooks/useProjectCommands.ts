import { useMutation } from '@tanstack/react-query';
import { useProjects } from '../../providers/ProjectsProvider';
import { queryClient } from '@/lib/queryClient';

/**
 * Custom hook for project commands
 * Handles command-side operations following CQRS pattern
 */
export const useProjectCommands = () => {
  const { commands } = useProjects();

  // Mutation for toggling project like
  const toggleLikeMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return await commands.toggleProjectLike.execute(projectId);
    },
    onSuccess: () => {
      // Invalidate all project queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
  });

  return {
    toggleLike: (projectId: number) => toggleLikeMutation.mutate(projectId),
    isToggleLikeLoading: toggleLikeMutation.isPending,
  };
};