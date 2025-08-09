import { toast } from "sonner";

export interface AppError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, unknown>;
}

export function createError(
  message: string,
  code?: string,
  status?: number,
  context?: Record<string, unknown>
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.status = status;
  error.context = context;
  return error;
}

export function logError(
  error: Error | AppError,
  context?: Record<string, unknown>
) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "server",
    url: typeof window !== "undefined" ? window.location.href : "server",
    ...("code" in error && { code: error.code }),
    ...("status" in error && { status: error.status }),
    ...("context" in error && { originalContext: error.context }),
    ...context,
  };

  if (process.env.NODE_ENV === "development") {
    console.error("App Error:", errorData);
  }
}

export function handleSupabaseError(
  error: unknown,
  context?: string
): AppError {
  let message = "An unexpected error occurred";
  let code = "UNKNOWN_ERROR";

  if (error && typeof error === "object" && "message" in error) {
    const errorMessage = (error as { message: string }).message;
    
    if (errorMessage.includes("duplicate key value")) {
      message = "This item already exists";
      code = "DUPLICATE_ENTRY";
    } else if (errorMessage.includes("violates row-level security policy")) {
      message = "You do not have permission to perform this action";
      code = "PERMISSION_DENIED";
    } else if (errorMessage.includes("JWT expired")) {
      message = "Your session has expired. Please sign in again";
      code = "SESSION_EXPIRED";
    } else if (
      errorMessage.includes("relation") &&
      errorMessage.includes("does not exist")
    ) {
      message = "Database configuration error";
      code = "DATABASE_ERROR";
    } else {
      message = errorMessage;
      code = (error as { code?: string }).code || "SUPABASE_ERROR";
    }
  }

  const appError = createError(
    message,
    code,
    (error as { status?: number })?.status,
    {
      originalError: error,
      context,
    }
  );

  logError(appError);
  return appError;
}

// Handle network errors
export function handleNetworkError(error: unknown): AppError {
  let message = "Network error. Please check your connection and try again";
  let code = "NETWORK_ERROR";

  if (error && typeof error === "object" && "name" in error) {
    if ((error as { name: string }).name === "TimeoutError") {
      message = "Request timed out. Please try again";
      code = "TIMEOUT_ERROR";
    } else if ((error as { name: string }).name === "AbortError") {
      message = "Request was cancelled";
      code = "CANCELLED_ERROR";
    }
  }

  const appError = createError(message, code, undefined, {
    originalError: error,
  });
  logError(appError);
  return appError;
}


export function showError(
  error: Error | AppError | string,
  fallbackMessage?: string
) {
  let message: string;

  if (typeof error === "string") {
    message = error;
  } else if ("code" in error && error.code) {
    
    message = getUserFriendlyMessage(error.code) || error.message;
  } else {
    message =
      error.message || fallbackMessage || "An unexpected error occurred";
  }

  toast.error(message);
}


function getUserFriendlyMessage(code: string): string | null {
  const messages: Record<string, string> = {
    PERMISSION_DENIED: "You do not have permission to perform this action",
    SESSION_EXPIRED: "Your session has expired. Please sign in again",
    DUPLICATE_ENTRY: "This item already exists",
    NETWORK_ERROR: "Network error. Please check your connection",
    TIMEOUT_ERROR: "Request timed out. Please try again",
    DATABASE_ERROR: "Database error. Please try again later",
    VALIDATION_ERROR: "Please check your input and try again",
    NOT_FOUND: "The requested item was not found",
    RATE_LIMITED: "Too many requests. Please wait a moment and try again",
  };

  return messages[code] || null;
}


export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        const appError =
          error.name === "PostgrestError" || error.name === "AuthError"
            ? handleSupabaseError(error, context)
            : error;

        showError(appError);
        return null;
      } else {
        const unknownError = createError(
          "An unexpected error occurred",
          "UNKNOWN_ERROR",
          undefined,
          { originalError: error, context }
        );
        showError(unknownError);
        return null;
      }
    }
  };
}


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

      
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}


export interface ValidationError {
  field: string;
  message: string;
}

export function validateForm(
  data: Record<string, unknown>,
  rules: Record<string, unknown>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const fieldRule = rule as {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      message?: string;
      custom?: (value: unknown) => boolean;
    };

    if (
      fieldRule.required &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    if (
      value &&
      fieldRule.minLength &&
      typeof value === "string" &&
      value.length < fieldRule.minLength
    ) {
      errors.push({
        field,
        message: `${field} must be at least ${fieldRule.minLength} characters`,
      });
    }

    if (
      value &&
      fieldRule.maxLength &&
      typeof value === "string" &&
      value.length > fieldRule.maxLength
    ) {
      errors.push({
        field,
        message: `${field} must be no more than ${fieldRule.maxLength} characters`,
      });
    }

    if (
      value &&
      fieldRule.pattern &&
      typeof value === "string" &&
      !fieldRule.pattern.test(value)
    ) {
      errors.push({
        field,
        message: fieldRule.message || `${field} format is invalid`,
      });
    }

    if (value && fieldRule.custom && !fieldRule.custom(value)) {
      errors.push({
        field,
        message: fieldRule.message || `${field} is invalid`,
      });
    }
  }

  return errors;
}


export function showValidationErrors(errors: ValidationError[]) {
  if (errors.length === 1) {
    toast.error(errors[0].message);
  } else if (errors.length > 1) {
    toast.error(`Please fix ${errors.length} validation errors`);
  }
}


export function debugLog(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${message}`, data);
  }
}

export function performanceLog(label: string, fn: () => unknown) {
  if (process.env.NODE_ENV === "development") {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
}
