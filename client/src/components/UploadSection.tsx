import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Rocket, LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function UploadSection() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/projects", undefined, formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project uploaded successfully!",
        description: "Your project is now live and can be viewed in the gallery.",
      });
      navigate(`/project/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your project. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    if (file.type !== "application/zip" && !file.name.endsWith(".zip")) {
      toast({
        title: "Invalid file format",
        description: "Please upload a ZIP file",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
    
    // Auto-fill title from filename if not already set
    if (!title) {
      const fileName = file.name.replace('.zip', '');
      setTitle(fileName);
    }
  };
  
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a ZIP file of your project",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your project",
        variant: "destructive",
      });
      return;
    }
    
    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category for your project",
        variant: "destructive",
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description for your project",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    
    uploadMutation.mutate(formData);
  };
  
  return (
    <section id="upload" className="mb-16">
      <Card>
        <CardContent className="pt-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-6">Upload Your Project</h2>
          
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="py-8 text-center">
              <h3 className="text-xl font-medium mb-4">Sign in to share your projects</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                You need to be logged in to upload projects to the community gallery
              </p>
              <Button asChild size="lg">
                <a href="/api/login" className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in to continue
                </a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <div 
                className={`drop-zone border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-primary/5'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
              >
                <div className="mb-4">
                  <Upload className="mx-auto h-16 w-16 text-gray-300" />
                </div>
                {file ? (
                  <div>
                    <p className="text-lg text-gray-700 font-medium">Selected file: {file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg text-gray-600 mb-2">Drag & drop your project ZIP file here</p>
                    <p className="text-sm text-gray-500 mb-6">or</p>
                    <Button type="button">
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept=".zip"
                />
                <p className="text-xs text-gray-500 mt-4">Maximum file size: 50MB. Accepts .zip files only.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="project-title">Project Title</Label>
                <Input
                  id="project-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value)}>
                  <SelectTrigger id="project-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="web-app">Web Application</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="game">Web Game</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project in a few sentences..."
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
                className="inline-flex justify-center items-center"
              >
                {uploadMutation.isPending ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                ) : (
                  <Rocket className="mr-2 h-4 w-4" />
                )}
                Publish Project
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
