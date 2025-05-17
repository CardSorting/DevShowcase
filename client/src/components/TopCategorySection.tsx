import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Boxes, Code, PenTool, PackageOpen, AppWindow, ChevronRight } from "lucide-react";

// Icons for different categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Web App": <AppWindow className="h-5 w-5" />,
  "JavaScript": <Code className="h-5 w-5" />,
  "React": <Boxes className="h-5 w-5" />,
  "UI/UX": <PenTool className="h-5 w-5" />,
  "Game": <PackageOpen className="h-5 w-5" />,
  // Default icon for any other category
  "default": <Code className="h-5 w-5" />
};

interface TopCategorySectionProps {
  categoryCounts: Record<string, number>;
}

export default function TopCategorySection({ categoryCounts }: TopCategorySectionProps) {
  // Convert categories object to array and sort by count
  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Get top 6 categories
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <p className="text-lg text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Link 
          key={category.name} 
          href={`/projects?categories=${encodeURIComponent(category.name)}`}
        >
          <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-md group cursor-pointer">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {CATEGORY_ICONS[category.name] || CATEGORY_ICONS.default}
                </div>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} projects</p>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}