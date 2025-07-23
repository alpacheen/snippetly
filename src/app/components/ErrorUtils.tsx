// Error handling utilities for better UX and debugging

import { toast } from "sonner";

// Error types
export interface AppError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, any>;
}

// Create a structured error
export function createError(
  message: string,
  code?: string,
  status?: number,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.status = status;
  error.context = context;
  return error;
}

// Error logging function
export function logError(error: Error | AppError, context?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    ...('code' in error && { code: error.code }),
    ...('status' in error && { status: error.status }),
    ...('context' in error && { originalContext: error.context }),
    ...context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('App Error:', errorData);
  }

  // In production, you would send this to an external service like Sentry
  // Example: Sentry.captureException(error, { extra: errorData });
}

// Handle Supabase errors
export function handleSupabaseError(error: any, context?: string): AppError {
  let message = 'An unexpected error occurred';
  let code = 'UNKNOWN_ERROR';

  if (error?.message) {
    // Common Supabase error patterns
    if (error.message.includes('duplicate key value')) {
      message = 'This item already exists';
      code = 'DUPLICATE_ENTRY';
    } else if (error.message.includes('violates row-level security policy')) {
      message = 'You do not have permission to perform this action';
      code = 'PERMISSION_DENIED';
    } else if (error.message.includes('JWT expired')) {
      message = 'Your session has expired. Please sign in again';
      code = 'SESSION_EXPIRED';
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      message = 'Database configuration error';
      code = 'DATABASE_ERROR';
    } else {
      message = error.message;
      code = error.code || 'SUPABASE_ERROR';
    }
  }

  const appError = createError(message, code, error.status, { 
    originalError: error,
    context 
  });
  
  logError(appError);
  return appError;
}

// Handle network errors
export function handleNetworkError(error: any): AppError {
  let message = 'Network error. Please check your connection and try again';
  let code = 'NETWORK_ERROR';

  if (error.name === 'TimeoutError') {
    message = 'Request timed out. Please try again';
    code = 'TIMEOUT_ERROR';
  } else if (error.name === 'AbortError') {
    message = 'Request was cancelled';
    code = 'CANCELLED_ERROR';
  }

  const appError = createError(message, code, undefined, { originalError: error });
  logError(appError);
  return appError;
}

// Show user-friendly error messages
export function showError(error: Error | AppError | string, fallbackMessage?: string) {
  let message: string;

  if (typeof error === 'string') {
    message = error;
  } else if ('code' in error && error.code) {
    // Use user-friendly messages for known error codes
    message = getUserFriendlyMessage(error.code) || error.message;
  } else {
    message = error.message || fallbackMessage || 'An unexpected error occurred';
  }

  toast.error(message);
}

// Get user-friendly error messages
function getUserFriendlyMessage(code: string): string | null {
  const messages: Record<string, string> = {
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again',
    DUPLICATE_ENTRY: 'This item already exists',
    NETWORK_ERROR: 'Network error. Please check your connection',
    TIMEOUT_ERROR: 'Request timed out. Please try again',
    DATABASE_ERROR: 'Database error. Please try again later',
    VALIDATION_ERROR: 'Please check your input and try again',
    NOT_FOUND: 'The requested item was not found',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again',
  };

  return messages[code] || null;
}

// Async error handler wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        const appError = error.name === 'PostgrestError' || error.name === 'AuthError'
          ? handleSupabaseError(error, context)
          : error;
        
        showError(appError);
        return null;
      } else {
        const unknownError = createError(
          'An unexpected error occurred',
          'UNKNOWN_ERROR',
          undefined,
          { originalError: error, context }
        );
        showError(unknownError);
        return null;
      }
    }
  };
}

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Form validation helpers
export interface ValidationError {
  field: string;
  message: string;
}

export function validateForm(data: Record<string, any>, rules: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push({ field, message: `${field} must be at least ${rule.minLength} characters` });
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push({ field, message: `${field} must be no more than ${rule.maxLength} characters` });
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push({ field, message: rule.message || `${field} format is invalid` });
    }

    if (value && rule.custom && !rule.custom(value)) {
      errors.push({ field, message: rule.message || `${field} is invalid` });
    }
  }

  return errors;
}

// Show validation errors
export function showValidationErrors(errors: ValidationError[]) {
  if (errors.length === 1) {
    toast.error(errors[0].message);
  } else if (errors.length > 1) {
    toast.error(`Please fix ${errors.length} validation errors`);
  }
}

// Development helpers
export function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
}

export function performanceLog(label: string, fn: () => any) {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
}