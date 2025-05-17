import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Domain Providers
import { ProjectsProvider } from './domains/projects/providers/ProjectsProvider';

// Enhanced App Implementation 
import EnhancedApp from './domains/projects/ui/App';

/**
 * App Component with Domain-Driven Architecture
 * This is the entry point that wraps our enhanced domain-driven architecture
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="showcase-theme">
        <ProjectsProvider>
          {/* Use our enhanced domain-driven implementation */}
          <EnhancedApp />
          
          <Toaster />
        </ProjectsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}