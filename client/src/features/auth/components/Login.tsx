/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { Sparkles, Instagram, Calendar, BarChart3, ArrowLeft } from "lucide-react";

interface LoginProps {
  onBack?: () => void;
  isSignup?: boolean;
}

export default function Login({ onBack, isSignup = false }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(isSignup);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      await login("admin", "admin123");
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to SaaS ChatBot AI.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignupMode) {
        if (password !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          return;
        }
        
        await signup(username, email, password);
        toast({
          title: "Account created!",
          description: "Welcome to SaaS ChatBot AI! You're now logged in.",
        });
      } else {
        await login(username, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to SaaS ChatBot AI.",
        });
      }
      setLocation("/");
    } catch (error) {
      toast({
        title: isSignupMode ? "Signup failed" : "Login failed",
        description: isSignupMode 
          ? "Please check your information and try again."
          : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-6 left-6 z-20"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      )}
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col space-y-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SaaS ChatBot AI
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Modern AI-powered chatbot platform with advanced conversation capabilities and intelligent responses
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Instagram className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI-Powered Conversations</h3>
                <p className="text-gray-600 dark:text-gray-300">Generate intelligent responses with advanced AI models and natural language processing</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Conversation Flow</h3>
                <p className="text-gray-600 dark:text-gray-300">Handle complex conversations with intelligent routing and context awareness</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">Monitor conversation success rates, user satisfaction, and engagement metrics</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5.0 rating</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "SaaS ChatBot AI has transformed how we interact with customers. The AI-powered conversations are incredibly intelligent and natural!"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">- Sarah Johnson, Customer Experience Manager</p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex flex-col items-center space-y-6">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 lg:hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  SaaS ChatBot AI
                </CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {isSignupMode ? "Create your account to get started" : "Sign in to your account to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Login Button - Only show in login mode */}
              {!isSignupMode && (
                <Button
                  onClick={handleQuickLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                  data-testid="button-quick-login"
                >
                  {isLoading ? "Signing in..." : "🚀 Quick Login (Admin)"}
                </Button>
              )}

              {!isSignupMode && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
              )}

              {/* Login/Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                    data-testid="input-username"
                  />
                </div>
                
                {isSignupMode && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                      data-testid="input-email"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                    data-testid="input-password"
                  />
                </div>
                
                {isSignupMode && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                      data-testid="input-confirm-password"
                    />
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 py-3 rounded-xl font-medium transition-all duration-200"
                  data-testid={isSignupMode ? "button-signup" : "button-login"}
                >
                  {isLoading ? (isSignupMode ? "Creating Account..." : "Signing in...") : (isSignupMode ? "Create Account" : "Sign In")}
                </Button>
              </form>

              {/* Toggle between login/signup */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isSignupMode ? "Already have an account?" : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsSignupMode(!isSignupMode)}
                    className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
                    data-testid="button-toggle-mode"
                  >
                    {isSignupMode ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
              
              {/* Demo Credentials - Only show in login mode */}
              {!isSignupMode && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo Credentials:</p>
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    Username: <span className="font-bold">admin</span>
                  </p>
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    Password: <span className="font-bold">admin123</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-md">
            By signing in, you agree to our Terms of Service and Privacy Policy. 
            Start creating amazing social media content today!
          </p>
        </div>
      </div>
    </div>
  );
}