import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ProjectCategory } from "../../entities/Project";
import { 
  Code, Layout, Gamepad2, PenTool, 
  FileCode, GalleryHorizontal, PackageOpen, Bot, 
  Globe, Smartphone, BadgeCheck, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define category icons with modern app-store style
const CATEGORY_ICONS: Record<string, {
  icon: React.ReactNode,
  color: string,
  bgColor: string
}> = {
  "JavaScript": {
    icon: <FileCode className="h-5 w-5" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  "Web App": {
    icon: <Layout className="h-5 w-5" />,
    color: "text-blue-600", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  "React": {
    icon: <Code className="h-5 w-5" />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30"
  },
  "UI/UX": {
    icon: <PenTool className="h-5 w-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  "Game": {
    icon: <Gamepad2 className="h-5 w-5" />,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30"
  },
  "Portfolio": {
    icon: <GalleryHorizontal className="h-5 w-5" />,
    color: "text-pink-600",
    bgColor: "bg-pink-100 dark:bg-pink-900/30"
  },
  "Library": {
    icon: <PackageOpen className="h-5 w-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30"
  },
  "AI": {
    icon: <Bot className="h-5 w-5" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  "API": {
    icon: <Globe className="h-5 w-5" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  "Mobile": {
    icon: <Smartphone className="h-5 w-5" />,
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-900/30"
  },
  "Other": {
    icon: <Search className="h-5 w-5" />,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-800/60"
  }
};

// Get icon styling for a category
const getCategoryStyle = (category: string) => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
};

interface AppStoreCategoriesProps {
  categories: ProjectCategory[];
  selectedCategory: ProjectCategory | "";
  onSelectCategory: (category: ProjectCategory | "") => void;
  className?: string;
}

/**
 * AppStoreCategories Component
 * Modern app-store style category grid
 */
export function AppStoreCategories({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  className 
}: AppStoreCategoriesProps) {
  // Show "All" button at the top, which clears the category filter
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Link href="/projects/categories">
          <Button variant="ghost" size="sm">See all</Button>
        </Link>
      </div>
      
      <ScrollArea className="pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div 
            onClick={() => onSelectCategory("")}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all",
              selectedCategory === "" 
                ? "bg-primary/10 border-2 border-primary/20" 
                : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3",
              "bg-primary/10"
            )}>
              <BadgeCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium">All Projects</span>
          </div>
          
          {categories.map((category) => {
            const { icon, color, bgColor } = getCategoryStyle(category);
            return (
              <div 
                key={category}
                onClick={() => onSelectCategory(category === selectedCategory ? "" : category)}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all",
                  selectedCategory === category 
                    ? "bg-primary/10 border-2 border-primary/20" 
                    : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                  bgColor
                )}>
                  <div className={color}>{icon}</div>
                </div>
                <span className="text-sm font-medium">{category}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}