import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/lib/theme";

// Import the Projects Provider
import { ProjectsProvider } from "./domains/projects";

// Import Pages
import { HomePage } from "./domains/projects";
import MyProjectsPage from "./pages/MyProjectsPage";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/not-found";

// Create the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Router Component
 * Handles application routing with Domain-Driven Design
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/my-projects" component={MyProjectsPage} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * App Component
 * Main application entry point with all providers following SOLID principles
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProjectsProvider>
          <div className="min-h-screen bg-background">
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                <Router />
              </div>
            </div>
          </div>
          <Toaster />
        </ProjectsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}