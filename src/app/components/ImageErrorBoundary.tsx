// src/app/components/ImageErrorBoundary.tsx
"use client";

import React from 'react';
import { ImageOff } from 'lucide-react';

interface ImageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ImageErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
  width?: number;
  height?: number;
  className?: string;
}

class ImageErrorBoundary extends React.Component<ImageErrorBoundaryProps, ImageErrorBoundaryState> {
  constructor(props: ImageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ImageErrorBoundaryState {
    // Only catch image-related errors
    if (error.message.includes('Invalid src prop') || 
        error.message.includes('hostname') || 
        error.message.includes('next/image')) {
      return {
        hasError: true,
        error,
      };
    }
    
    // Re-throw non-image errors
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Image Error Boundary caught an error:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} />;
      }

      return (
        <div 
          className={`flex items-center justify-center bg-lightGreen text-primary ${this.props.className || ''}`}
          style={{ 
            width: this.props.width || 40, 
            height: this.props.height || 40 
          }}
        >
          <ImageOff className="w-4 h-4" />
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping images
export function withImageErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackProps?: Partial<ImageErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ImageErrorBoundary {...fallbackProps}>
      <Component {...props} />
    </ImageErrorBoundary>
  );
  
  WrappedComponent.displayName = `withImageErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ImageErrorBoundary;