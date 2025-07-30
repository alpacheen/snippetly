"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code, Search, Users, Star, ArrowRight, Play, Sparkles, Terminal, Zap } from 'lucide-react';
import { Suspense } from 'react';

// Lazy load heavy components
const CodeExampleCarousel = () => {
  const [currentExample, setCurrentExample] = useState(0);

  const codeExamples = [
    {
      language: "JavaScript",
      code: `const fetchUser = async (id) => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};`,
      description: "Clean async/await pattern"
    },
    {
      language: "Python", 
      code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    return quicksort([x for x in arr if x < pivot])`,
      description: "Elegant quicksort algorithm"
    },
    {
      language: "React",
      code: `const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
};`,
      description: "Custom React hook"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % codeExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <div className="flex-1 text-center">
          <span className="text-xs text-gray-400">
            {codeExamples[currentExample].description}
          </span>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-lightGreen/20 text-lightGreen rounded text-xs font-medium">
            {codeExamples[currentExample].language}
          </span>
        </div>
        
        <pre className="text-sm text-gray-300 overflow-hidden">
          <code className="block whitespace-pre-wrap">
            {codeExamples[currentExample].code}
          </code>
        </pre>

        {/* AI Features Showcase */}
        <div className="mt-4 p-3 bg-purple-900/30 rounded border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">AI Assistant</span>
          </div>
          <p className="text-xs text-purple-100">
            This code demonstrates modern {codeExamples[currentExample].language} patterns with clean, readable syntax.
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-lightGreen/20 rounded-full flex items-center justify-center animate-pulse">
        <Zap className="w-8 h-8 text-lightGreen" />
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Code Snippets", value: "10K+", icon: Code },
    { label: "Active Developers", value: "2.5K+", icon: Users },
    { label: "Languages", value: "20+", icon: Terminal },
    { label: "Average Rating", value: "4.8", icon: Star }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-primary overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lightGreen/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lightGreen/10 border border-lightGreen/30 rounded-full text-lightGreen text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Code Discovery
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6">
              Your
              <span className="bg-lightGreen bg-clip-text text-transparent">
                {" "}AI-powered{" "}
              </span>
              Snippet Brain
            </h1>
            
            <p className="text-xl lg:text-2xl text-textSecondary mb-8 max-w-2xl">
              Discover, save, and share code snippets with AI-powered explanations. 
              <span className="text-lightGreen font-semibold"> Like Spotify, but for code.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/snippets"
                className="group px-8 py-4 bg-lightGreen text-gray-900 font-bold rounded-lg hover:shadow-lg hover:shadow-lightGreen/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Browse Snippets
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/snippets/create"
                className="px-8 py-4 border border-lightGreen text-lightGreen font-bold rounded-lg hover:bg-lightGreen hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Code className="w-5 h-5" />
                Create Snippet
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-lightGreen" />
                  </div>
                  <div className="text-2xl font-bold text-text">{stat.value}</div>
                  <div className="text-sm text-textSecondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Code Preview */}
          <div className="relative">
            <Suspense fallback={<div className="h-96 bg-gray-800 rounded-2xl animate-pulse"></div>}>
              <CodeExampleCarousel />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Developers Love Snippetly</h2>
            <p className="text-xl text-textSecondary">
              More than just a snippet manager - it's your coding companion
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "AI-Powered Search",
                description: "Find exactly what you need with intelligent search that understands context and intent.",
                color: "blue"
              },
              {
                icon: Sparkles,
                title: "Smart Explanations", 
                description: "Get instant AI explanations for any code snippet to understand how it works.",
                color: "purple"
              },
              {
                icon: Users,
                title: "Community-Driven",
                description: "Learn from the best developers and share your knowledge with the community.",
                color: "green"
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-primary border border-textSecondary rounded-2xl hover:border-lightGreen/50 transition-all duration-300 hover:shadow-lg hover:shadow-lightGreen/10"
              >
                <div className="w-16 h-16 rounded-2xl bg-lightGreen/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-lightGreen" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-textSecondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to supercharge your coding?
          </h2>
          <p className="text-xl text-textSecondary mb-8">
            Join thousands of developers who've made Snippetly their go-to coding companion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="group px-8 py-4 bg-lightGreen text-gray-900 font-bold rounded-lg hover:shadow-lg hover:shadow-lightGreen/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/snippets"
              className="px-8 py-4 border border-lightGreen text-lightGreen font-bold rounded-lg hover:bg-lightGreen hover:text-gray-900 transition-all duration-300"
            >
              Explore Snippets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
