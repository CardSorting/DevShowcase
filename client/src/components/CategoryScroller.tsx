import { useState } from "react";
import { Link } from "wouter";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Code, Layout, Gamepad2, PenTool, 
  FileCode, GalleryHorizontal, PackageOpen, Bot, 
  Globe, Smartphone
} from "lucide-react";

// Define category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "JavaScript": <FileCode className="h-4 w-4" />,
  "Web App": <Layout className="h-4 w-4" />,
  "React": <Code className="h-4 w-4" />,
  "UI/UX": <PenTool className="h-4 w-4" />,
  "Game": <Gamepad2 className="h-4 w-4" />,
  "Portfolio": <GalleryHorizontal className="h-4 w-4" />,
  "Library": <PackageOpen className="h-4 w-4" />,
  "AI": <Bot className="h-4 w-4" />,
  "API": <Globe className="h-4 w-4" />,
  "Mobile": <Smartphone className="h-4 w-4" />,
  // Default icon for any other category
  "default": <Code className="h-4 w-4" />
};

// Pre-defined categories with fallback if none come from API
const DEFAULT_CATEGORIES = [
  "JavaScript", "Web App", "React", "UI/UX", "Game", 
  "Portfolio", "Library", "AI", "API", "Mobile"
];

interface CategoryScrollerProps {
  categories?: string[];
  activeCategoryFilter?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export default function CategoryScroller({ 
  categories = DEFAULT_CATEGORIES,
  activeCategoryFilter,
  onSelectCategory,
  className
}: CategoryScrollerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(activeCategoryFilter || null);
  
  const handleCategoryClick = (category: string) => {
    const newCategory = activeCategory === category ? null : category;
    setActiveCategory(newCategory);
    if (onSelectCategory) {
      onSelectCategory(newCategory || "");
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-2 pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border",
                activeCategory === category 
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "hover:bg-primary/5 border-border"
              )}
            >
              {CATEGORY_ICONS[category] || CATEGORY_ICONS.default}
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}