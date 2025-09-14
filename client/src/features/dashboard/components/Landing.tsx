/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Bot, MessageSquare, Sparkles, Zap, Users, Globe, CheckCircle, Brain, Shield, Rocket } from "lucide-react";
import { useAuthContext } from "@/features/auth";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { TypewriterText } from "@/shared/components/ui/TypewriterText";

interface LandingProps {
  onShowLogin: () => void;
  onShowSignup: () => void;
}

export default function Landing({ onShowLogin, onShowSignup }: LandingProps) {
  const [activeTab, setActiveTab] = useState("features");

  const features = [
    {
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      title: "Advanced AI Conversations",
      description: "Powered by cutting-edge language models for natural, intelligent interactions"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: "Multi-Modal Chat",
      description: "Support for text, voice, and visual conversations with context awareness"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and privacy controls for sensitive conversations"
    },
    {
      icon: <Rocket className="h-6 w-6 text-orange-600" />,
      title: "Custom Integrations",
      description: "Seamlessly integrate with your existing tools and workflows"
    }
  ];

  const aiCapabilities = [
    { name: "Natural Language", icon: <MessageSquare className="h-8 w-8" />, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "Code Generation", icon: <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">&lt;/&gt;</div>, color: "bg-blue-600" },
    { name: "Data Analysis", icon: <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">📊</div>, color: "bg-green-600" },
    { name: "Creative Writing", icon: <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✍️</div>, color: "bg-orange-600" }
  ];

  const testimonials = [
    {
      text: "SAAS ChatBot AI has revolutionized our customer support. The AI understands context perfectly and provides accurate responses!",
      author: "Sarah Johnson",
      role: "Customer Success Manager"
    },
    {
      text: "The natural conversation flow is incredible. Our users can't tell they're talking to an AI assistant!",
      author: "Mike Chen",
      role: "Product Manager"
    },
    {
      text: "Implementation was seamless and the results were immediate. Our response time improved by 90%!",
      author: "Emma Rodriguez",
      role: "Operations Director"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/20 bg-background/90 backdrop-blur-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 via-purple-500 to-cyan-600 p-3 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Bot className="h-7 w-7 text-white relative z-10" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x leading-tight">
                  AI ChatBot SAAS 
                </span>
                <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                  Local Intelligent Conversations
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("features")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === "features"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
                data-testid="tab-features"
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === "about"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                }`}
                data-testid="tab-about"
              >
                About
              </button>
            </div>

            {/* Enhanced Auth Buttons */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <Button
                variant="ghost"
                onClick={onShowLogin}
                className="text-muted-foreground hover:text-primary font-semibold text-base px-6 py-3 transition-all duration-300 hover:bg-primary/5 rounded-xl hover:scale-105 group"
                data-testid="button-login"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-200">Login</span>
              </Button>
              <Button
                onClick={onShowSignup}
                className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:scale-105 transform transition-all duration-300 font-semibold text-base px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 border-0 group overflow-hidden"
                data-testid="button-signup"
              >
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-25 to-cyan-50 dark:from-background dark:via-purple-950/10 dark:to-background min-h-[90vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
          <div className="text-center space-y-10">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-tight tracking-tight">
                Next-Generation{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x">
                  <TypewriterText
                    texts={[
                      "AI Assistant",
                      "ChatBot Platform",
                      "Conversation Engine",
                      "Intelligence Hub"
                    ]}
                    speed={120}
                    deleteSpeed={80}
                    pauseTime={2000}
                    className="inline-block"
                    cursorClassName="bg-gradient-to-r from-blue-600 to-purple-600"
                  />
                </span>
              </h1>
            </div>
            <div className="animate-fade-in-up animation-delay-300">
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                Transform your business with intelligent conversations. Our advanced AI platform delivers human-like interactions that understand context, learn from every conversation, and scale infinitely.
              </p>
            </div>
            
            <div className="animate-fade-in-up animation-delay-600">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button
                  onClick={onShowSignup}
                  size="lg"
                  className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:scale-105 transform transition-all duration-300 px-10 py-5 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-purple-500/25 border-0"
                  data-testid="button-hero-signup"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-border hover:border-primary hover:bg-primary/5 px-10 py-5 text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 transform backdrop-blur-sm bg-background/80"
                  data-testid="button-hero-demo"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Social Platform Integrations */}
            <div className="pt-16 animate-fade-in-up animation-delay-900">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-8 font-medium">
                AI CHATBOT SAAS CAPABILITIES
              </p>
              <div className="flex justify-center items-center space-x-12 flex-wrap gap-6">
                {aiCapabilities.map((capability, index) => (
                  <div 
                    key={capability.name} 
                    className="flex flex-col items-center space-y-3 group cursor-pointer"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className={`${capability.color} p-4 rounded-2xl text-white shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1`}>
                      {capability.icon}
                    </div>
                    <span className="text-sm text-muted-foreground font-medium group-hover:text-primary transition-colors">{capability.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {activeTab === "features" && (
        <section className="py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-5 blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Intelligent conversations that
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  understand and adapt
                </span>
              </h2>
              <p className="text-2xl text-muted-foreground font-light">
                Advanced AI capabilities in one platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card/80 backdrop-blur-sm hover:bg-card"
                >
                  <CardContent className="p-8 text-center">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* About Section */}
      {activeTab === "about" && (
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose SAAS ChatBot AI?
              </h2>
              <p className="text-xl text-muted-foreground">
                Trusted by thousands of businesses & indivisuals worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-5 h-5 bg-yellow-400 rounded-full mr-1"></div>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Users className="h-6 w-6 text-purple-600" />
                <span className="text-2xl font-bold text-foreground">10,000+</span>
              </div>
              <p className="text-muted-foreground">
                Businesses worldwide trust AI ChatBot SAAS for intelligent conversations
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            Ready to revolutionize your
            <span className="block bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              customer conversations?
            </span>
          </h2>
          <p className="text-2xl text-purple-100 mb-12 font-light leading-relaxed max-w-3xl mx-auto">
            Join the next generation of intelligent AI conversations
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
            <Button
              onClick={onShowSignup}
              size="lg"
              className="group bg-white text-purple-600 hover:bg-gray-50 px-12 py-6 text-2xl font-bold rounded-2xl shadow-2xl hover:scale-105 transform transition-all duration-300 hover:shadow-white/25"
              data-testid="button-cta-signup"
            >
              Start Your Free Trial
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-3 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-6 text-2xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 transform hover:border-white"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black dark:from-sidebar-background dark:to-black text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 p-3 rounded-2xl shadow-xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-2xl blur-sm opacity-50"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">AI ChatBot SAAS</span>
                  <p className="text-gray-400 text-sm">Next-Generation Local AI Platform</p>
                </div>
              </div>
              <p className="text-gray-300 max-w-md leading-relaxed">
                Transform your work with AI-powered content creation, smart and professional templates.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="#" className="block hover:text-purple-400 transition-colors duration-200">Features</a>
                <a href="#" className="block hover:text-purple-400 transition-colors duration-200">Solutions</a>
                <a href="#" className="block hover:text-purple-400 transition-colors duration-200">Templates</a>
                <a href="#" className="block hover:text-purple-400 transition-colors duration-200">Integrations</a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <a href="/terms-of-service" className="block hover:text-purple-400 transition-colors duration-200">Terms of Service</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 AI ChatBot SAAS. All rights reserved Dr. Kunal Suri
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}