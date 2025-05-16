import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useBasicAuth } from "../hooks/useBasicAuth";
import { useToast } from "../hooks/use-toast";

// Import UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginFormData {
  username: string;
}

export function BasicLoginForm({ isOpen, onClose }: LoginFormProps) {
  const { login, isLoginPending, loginError, isAuthenticated } = useBasicAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      username: ''
    }
  });

  // If already authenticated, close the modal
  if (isAuthenticated) {
    onClose();
    return null;
  }

  const onSubmit = (data: LoginFormData) => {
    login(data);
    
    if (!loginError) {
      toast({
        title: "Login successful",
        description: "You're now logged in and can upload projects"
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in to upload projects</DialogTitle>
          <DialogDescription>
            You need to be logged in to upload and share your projects with the community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {loginError}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Choose a username"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoginPending}
              className="w-full"
            >
              {isLoginPending ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>
            Simply enter a username to sign in. No password needed for this demo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Auth button component that displays user info or login button
export function AuthButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useBasicAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out"
    });
  };

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-1 px-2 h-auto">
            <div className="flex flex-col items-end mr-2 text-sm">
              <span className="font-medium">{user.username}</span>
              {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
            </div>
            <Avatar className="h-8 w-8">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={user.username} />
              ) : (
                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>Sign in</span>
      </Button>
      <BasicLoginForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}