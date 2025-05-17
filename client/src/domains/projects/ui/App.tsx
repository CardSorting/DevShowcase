import { Switch, Route } from 'wouter';
import { Helmet } from 'react-helmet';

// UI Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Pages
import { EnhancedHomePage } from './pages/EnhancedHomePage';
import { EnhancedProjectsPage } from './pages/EnhancedProjectsPage';
import { EnhancedProjectPage } from './pages/EnhancedProjectPage';

/**
 * App Component with Domain-Driven Architecture
 * This version uses our enhanced domain architecture with SOLID principles
 */
export default function EnhancedApp() {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet 
        defaultTitle="DevShowcase - Web Project Gallery" 
        titleTemplate="%s | DevShowcase"
      >
        <meta 
          name="description" 
          content="A curated gallery of innovative web projects showcasing developer creativity and technical expertise" 
        />
      </Helmet>
      
      <Header />
      
      <div className="flex-1">
        <Switch>
          <Route path="/" component={EnhancedHomePage} />
          <Route path="/projects" component={EnhancedProjectsPage} />
          <Route path="/project/:id" component={EnhancedProjectPage} />
          {/* Other routes would be added here */}
        </Switch>
      </div>
      
      <Footer />
    </div>
  );
}