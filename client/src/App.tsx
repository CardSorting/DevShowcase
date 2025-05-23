import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import MyProjectsPage from "@/pages/MyProjectsPage";

// Project category pages
import PopularProjectsPage from "@/pages/projects/PopularProjectsPage";
import LatestProjectsPage from "@/pages/projects/LatestProjectsPage";
import TrendingProjectsPage from "@/pages/projects/TrendingProjectsPage";

import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route path="/my/projects" component={MyProjectsPage} />
      
      {/* Project category routes */}
      <Route path="/projects/popular" component={PopularProjectsPage} />
      <Route path="/projects/latest" component={LatestProjectsPage} />
      <Route path="/projects/trending" component={TrendingProjectsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
