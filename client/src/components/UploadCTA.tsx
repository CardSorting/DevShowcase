import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Upload, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadCTAProps {
  className?: string;
}

export default function UploadCTA({ className }: UploadCTAProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-primary p-6 sm:p-8", 
        className
      )}
    >
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 transform rotate-12">
        <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-white/10 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl relative z-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to showcase your project?</h2>
        <p className="text-white/90 text-sm sm:text-base mb-6 max-w-xl">
          Upload your web projects, get feedback from the community, and gain recognition for your work.
          It's quick, easy, and completely free.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/upload">
            <Button className="text-primary bg-white hover:bg-white/90 sm:px-6">
              Upload Now
            </Button>
          </Link>
          
          <Link href="/projects">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white sm:px-6">
              Browse Projects <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}