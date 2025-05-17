import ProjectsPage, { ProjectsQueryParams } from "./ProjectsPage";

/**
 * Popular Projects Page - follows Single Responsibility Principle
 * Responsible only for displaying popular projects
 */
export default function PopularProjectsPage() {
  // Query parameters following Command pattern
  const defaultQueryParams: ProjectsQueryParams = {
    sort: "popular",
    page: 1
  };

  return (
    <ProjectsPage
      title="Popular Projects"
      description="Browse the most popular projects from our community, based on likes and views."
      defaultQueryParams={defaultQueryParams}
    />
  );
}