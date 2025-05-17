import ProjectsPage, { ProjectsQueryParams } from "./ProjectsPage";

/**
 * Trending Projects Page - follows Single Responsibility Principle
 * Responsible only for displaying trending projects
 */
export default function TrendingProjectsPage() {
  // Query parameters following Command pattern
  const defaultQueryParams: ProjectsQueryParams = {
    sort: "trending",
    page: 1
  };

  return (
    <ProjectsPage
      title="Trending Projects"
      description="Explore what's trending now – projects that are gaining traction and getting attention from the community."
      defaultQueryParams={defaultQueryParams}
    />
  );
}