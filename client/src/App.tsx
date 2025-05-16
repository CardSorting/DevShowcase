import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProjectPage from "@/pages/ProjectPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import DeveloperDashboardPage from "@/pages/DeveloperDashboardPage";
import UploadPage from "@/pages/UploadPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/developer/dashboard" component={DeveloperDashboardPage} />
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">
          <Router />
        </div>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;