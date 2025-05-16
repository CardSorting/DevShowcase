import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, TrendingUp, Star, Clock, 
  Gamepad2, Globe, Layout, Award, Zap, ArrowRight,
  DownloadCloud
} from "lucide-react";
import { ProjectList, Project } from "@shared/types";

// Card for featured app in hero section
function FeaturedCard({ project }: { project: Project }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400"></div>
      <div className="relative p-6 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
        <div className="w-full md:w-1/2">
          <div className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-2">Featured Project</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{project.title}</h2>
          <p className="text-gray-600 mb-4">{project.description}</p>
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-xs py-1 px-2 bg-gray-100 rounded-full text-gray-600">{project.category}</div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(project.createdAt)}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="default" 
              className="px-6"
              asChild
            >
              <Link href={`/project/${project.id}`}>
                <span className="mr-2">View Project</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center text-gray-600">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{project.likes} likes</span>
              <span className="mx-2">•</span>
              <DownloadCloud className="h-4 w-4 text-blue-500 mr-1" />
              <span>{project.views} views</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-100 transform transition-transform hover:scale-[1.02]">
            <img 
              src={project.thumbnailUrl || project.previewUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="default"
                size="sm"
                className="bg-black/70 hover:bg-black/90"
                asChild
              >
                <Link href={`/project/${project.id}`}>
                  Preview
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collection header
function SectionHeader({ title, viewAllLink }: { title: string; viewAllLink: string }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Link href={viewAllLink} className="text-sm font-medium text-primary flex items-center">
        See All <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// App card for collections
function AppCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col group">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm">
        <img 
          src={project.thumbnailUrl || project.previewUrl} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            variant="default"
            size="sm"
            className="bg-black/70 hover:bg-black/90"
            asChild
          >
            <Link href={`/project/${project.id}`}>
              View
            </Link>
          </Button>
        </div>
      </div>
      <h3 className="font-medium text-gray-900 mb-1 truncate">{project.title}</h3>
      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{project.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="text-xs py-1 px-2 bg-gray-100 rounded-full text-gray-600">{project.category}</div>
        <div className="flex items-center text-xs text-gray-500">
          <Star className="h-3 w-3 text-yellow-500 mr-1" />
          {project.likes}
        </div>
      </div>
    </div>
  );
}

// Category card
function CategoryCard({ icon, title, description, link }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link href={link}>
      <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-xl border border-gray-200 h-full flex flex-col">
        <div className="mb-3 text-primary">
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 flex-1">{description}</p>
      </div>
    </Link>
  );
}

// Grid of category cards
function CategoriesSection() {
  const categories = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Web Apps",
      description: "Interactive applications built for browsers",
      link: "/?category=web-app"
    },
    {
      icon: <Gamepad2 className="h-6 w-6" />,
      title: "Games",
      description: "Fun and engaging web-based games",
      link: "/?category=game"
    },
    {
      icon: <Layout className="h-6 w-6" />,
      title: "Portfolio",
      description: "Showcase your skills and achievements",
      link: "/?category=portfolio"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Tools",
      description: "Useful utilities and productivity tools",
      link: "/?category=tool"
    }
  ];

  return (
    <section className="mb-12">
      <SectionHeader title="Categories" viewAllLink="/" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <CategoryCard key={index} {...category} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);

  // Fetch trending projects
  const { data: trendingData } = useQuery<ProjectList>({
    queryKey: ['/api/projects', { sort: 'trending', limit: 6 }],
  });

  // Fetch recent projects
  const { data: recentData } = useQuery<ProjectList>({
    queryKey: ['/api/projects', { sort: 'recent', limit: 6 }],
  });

  // Fetch popular projects
  const { data: popularData } = useQuery<ProjectList>({
    queryKey: ['/api/projects', { sort: 'popular', limit: 6 }],
  });

  // Fetch web apps
  const { data: webAppsData } = useQuery<ProjectList>({
    queryKey: ['/api/projects', { category: 'web-app', limit: 6 }],
  });

  // Fetch games
  const { data: gamesData } = useQuery<ProjectList>({
    queryKey: ['/api/projects', { category: 'game', limit: 6 }],
  });

  // Set featured project from trending or most liked
  useEffect(() => {
    if (trendingData?.projects && trendingData.projects.length > 0) {
      // Sort by likes and get the first
      const sorted = [...trendingData.projects].sort((a, b) => b.likes - a.likes);
      setFeaturedProject(sorted[0]);
    }
  }, [trendingData]);

  return (
    <>
      <Helmet>
        <title>DevShowcase - Your Project Marketplace</title>
        <meta name="description" content="Discover amazing web projects, games, tools and more. Download, fork and get inspired by the latest creations from our developer community." />
      </Helmet>
      <main className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Featured Project (Hero) */}
          <section className="mb-12">
            {featuredProject && <FeaturedCard project={featuredProject} />}
          </section>

          {/* Categories */}
          <CategoriesSection />
          
          {/* Today's Picks (similar to Apple's Today tab) */}
          <section className="mb-12">
            <SectionHeader title="Today's Picks" viewAllLink="/trending" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {trendingData?.projects?.slice(0, 6).map((project) => (
                <AppCard key={project.id} project={project} />
              ))}
            </div>
          </section>
          
          {/* New & Noteworthy */}
          <section className="mb-12">
            <SectionHeader title="New & Noteworthy" viewAllLink="/?sort=recent" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {recentData?.projects?.slice(0, 6).map((project) => (
                <AppCard key={project.id} project={project} />
              ))}
            </div>
          </section>
          
          {/* Web Applications */}
          <section className="mb-12">
            <SectionHeader title="Web Applications" viewAllLink="/?category=web-app" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {webAppsData?.projects?.slice(0, 6).map((project) => (
                <AppCard key={project.id} project={project} />
              ))}
            </div>
          </section>
          
          {/* Games */}
          <section className="mb-12">
            <SectionHeader title="Games & Entertainment" viewAllLink="/?category=game" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {gamesData?.projects?.slice(0, 6).map((project) => (
                <AppCard key={project.id} project={project} />
              ))}
            </div>
          </section>
          
          {/* Upload CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl overflow-hidden">
              <div className="px-6 py-12 sm:px-12 sm:py-16 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-6 sm:mb-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to share your project?</h2>
                  <p className="text-blue-100 max-w-md">Upload your creation and join our community of developers showcasing their work.</p>
                </div>
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6"
                  size="lg"
                  asChild
                >
                  <Link href="/upload">
                    Upload Project
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
