import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileUp, Check, X, Loader2 } from "lucide-react";
import { validateZipFile } from "@/lib/utils";

const uploadFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }).max(500),
  category: z.string().min(1, { message: "Please select a category" }),
  file: z.instanceof(File, { message: "Please upload a ZIP file" })
    .refine(file => file.size <= 10 * 1024 * 1024, { message: "File size must be less than 10MB" })
    .refine(file => validateZipFile(file), { message: "Only ZIP files are allowed" })
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload projects",
        variant: "destructive"
      });
      navigate("/login?redirect=/upload");
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (values: UploadFormValues) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("file", values.file);
      
      return apiRequest("/api/projects", "POST", undefined, formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Project Uploaded Successfully",
        description: "Your project has been uploaded and is now available",
        variant: "default"
      });
      navigate(`/project/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your project",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: UploadFormValues) => {
    uploadMutation.mutate(values);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateZipFile(file)) {
        setSelectedFile(file);
        form.setValue("file", file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a ZIP file",
          variant: "destructive"
        });
      }
    }
  };

  // Only render the form if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Upload Your Project - DevShowcase</title>
        <meta name="description" content="Share your web project with the community. Upload your ZIP file with HTML, CSS, and JavaScript to showcase your work." />
      </Helmet>
      <main className="w-full py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Project</h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Share your creation with the community. Package your project as a ZIP file with an index.html file at the root.
            </p>
          </div>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Enter information about your project to help others discover it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Project" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear and descriptive title for your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what your project does and what technologies you used" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details that will help others understand your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="web-app">Web Application</SelectItem>
                            <SelectItem value="game">Game</SelectItem>
                            <SelectItem value="tool">Tool/Utility</SelectItem>
                            <SelectItem value="portfolio">Portfolio</SelectItem>
                            <SelectItem value="education">Educational</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the category that best fits your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Project ZIP File</FormLabel>
                        <FormControl>
                          <div 
                            className={`border-2 border-dashed rounded-lg p-8 text-center ${
                              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
                            } transition-colors cursor-pointer`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <input
                              id="file-upload"
                              type="file"
                              accept=".zip"
                              className="hidden"
                              onChange={handleFileChange}
                              {...field}
                            />
                            
                            {selectedFile ? (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                                  <Check className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                    form.resetField("file");
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                  <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium">Drag & drop your ZIP file here</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  or click to browse (Max 10MB)
                                </p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your project must be packaged as a ZIP file with an index.html file at the root
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload Project
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
                <li>Project must be packaged as a ZIP file (max 10MB)</li>
                <li>Must contain an index.html file at the root or in a subfolder</li>
                <li>All assets (images, CSS, JS) should be included in the ZIP</li>
                <li>External CDN links are allowed (Bootstrap, jQuery, etc.)</li>
              </ul>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}