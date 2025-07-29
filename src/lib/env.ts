// src/lib/env.ts
interface EnvironmentConfig {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_BASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
  }
  
  function validateEnvironment(): EnvironmentConfig {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];
  
    const missing = requiredVars.filter(
      (varName) => !process.env[varName]
    );
  
    if (missing.length > 0) {
      Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
      );
    }
  
    // Validate URL format
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    } catch {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL');
    }
  
    // Set default base URL for development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://your-domain.vercel.app'
      );
  
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      NEXT_PUBLIC_BASE_URL: baseUrl,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }
  
  export const env = validateEnvironment();
  
  // Type-safe environment access
  export function getEnv<K extends keyof EnvironmentConfig>(
    key: K
  ): EnvironmentConfig[K] {
    return env[key];
  }
  
  // Runtime environment checks
  export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
  
  export function isPreview(): boolean {
    return process.env.VERCEL_ENV === 'preview';
  }