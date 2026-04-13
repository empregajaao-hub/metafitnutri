/**
 * Supabase Configuration and Error Handling
 */

export const supabaseConfig = {
  // Timeout for Supabase operations (in milliseconds)
  timeout: 10000,
  
  // Retry configuration
  retries: {
    maxAttempts: 3,
    delayMs: 1000,
  },
  
  // Error messages
  errorMessages: {
    networkError: "Erro de conexão. Verifica a tua ligação à internet.",
    authError: "Erro de autenticação. Por favor, faz login novamente.",
    databaseError: "Erro ao aceder aos dados. Por favor, tenta mais tarde.",
    timeoutError: "A operação demorou muito tempo. Por favor, tenta novamente.",
    unknownError: "Ocorreu um erro inesperado. Por favor, tenta novamente.",
  },
};

/**
 * Safely handle Supabase errors
 */
export const handleSupabaseError = (error: any): string => {
  if (!error) {
    return supabaseConfig.errorMessages.unknownError;
  }

  // Network errors
  if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
    return supabaseConfig.errorMessages.networkError;
  }

  // Auth errors
  if (error.message?.includes("Auth") || error.status === 401) {
    return supabaseConfig.errorMessages.authError;
  }

  // Database errors
  if (error.message?.includes("database") || error.status === 400) {
    return supabaseConfig.errorMessages.databaseError;
  }

  // Timeout errors
  if (error.message?.includes("timeout") || error.code === "ETIMEDOUT") {
    return supabaseConfig.errorMessages.timeoutError;
  }

  // Return the original error message if available
  return error.message || supabaseConfig.errorMessages.unknownError;
};
