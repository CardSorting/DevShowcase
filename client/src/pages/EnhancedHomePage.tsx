import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

// Import domain components
import { ProjectsProvider } from "../domains/projects/providers/ProjectsProvider";
import { EnhancedHomePage as DomainEnhancedHomePage } from "../domains/projects/ui/pages/EnhancedHomePage";

/**
 * Enhanced Home Page - Bridge Component
 * This component integrates our domain-driven architecture with the existing app structure
 */
export default function EnhancedHomePage() {
  return (
    <ProjectsProvider>
      <DomainEnhancedHomePage />
    </ProjectsProvider>
  );
}