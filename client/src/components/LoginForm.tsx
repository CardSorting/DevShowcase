import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSimpleAuth } from "../hooks/useSimpleAuth";
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

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginFormData {
  username: string;
  password: string;
}

export function LoginForm({ isOpen, onClose }: LoginFormProps) {
  const { login, isLoginPending, loginError, isAuthenticated } = useSimpleAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: ''
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
        description: "You're now logged in",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log in to your account</DialogTitle>
          <DialogDescription>
            Log in to upload your projects and contribute to the community.
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
              placeholder="Enter your username"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoginPending}
              className="w-full"
            >
              {isLoginPending ? "Logging in..." : "Log in"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>
            Don't have an account? Just enter a username and password to sign up automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Login button component with modal
export function LoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useSimpleAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">Welcome, {user.username}</span>
        <Button variant="outline" onClick={handleLogout}>Log out</Button>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Log in</Button>
      <LoginForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}