import ProjectsPage, { ProjectsQueryParams } from "./ProjectsPage";

/**
 * Latest Projects Page - follows Single Responsibility Principle
 * Responsible only for displaying latest projects
 */
export default function LatestProjectsPage() {
  // Query parameters following Command pattern
  const defaultQueryParams: ProjectsQueryParams = {
    sort: "recent",
    page: 1
  };

  return (
    <ProjectsPage
      title="Latest Projects"
      description="Discover the most recent projects added to our platform by creators just like you."
      defaultQueryParams={defaultQueryParams}
    />
  );
}