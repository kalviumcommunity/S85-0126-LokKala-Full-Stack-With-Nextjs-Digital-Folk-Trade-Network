/**
 * API Client with Automatic Token Refresh
 * 
 * This utility provides a fetch wrapper that automatically handles:
 * - Expired access tokens by refreshing them
 * - Token rotation for enhanced security
 * - Credential inclusion for cookie-based auth
 * 
 * Security Features:
 * - Access tokens stored in HTTP-only cookies (not accessible via JavaScript)
 * - Automatic refresh when 401 Unauthorized is received
 * - One retry per request to prevent infinite loops
 * - Credentials always included to send cookies
 */

interface ApiRequestInit extends RequestInit {
  skipRefresh?: boolean;
}

/**
 * Refresh the access token using the refresh token
 * @returns true if refresh successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[API] Access token refreshed successfully. New version: ${data.data?.newRefreshTokenVersion}`);
      return true;
    }

    console.warn("[API] Token refresh failed. User needs to re-authenticate.");
    return false;
  } catch (error) {
    console.error("[API] Error refreshing token:", error);
    return false;
  }
}

/**
 * Enhanced fetch with automatic token refresh
 * 
 * Usage:
 * ```typescript
 * const response = await apiClient('/api/users/me', { method: 'GET' });
 * const data = await response.json();
 * ```
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options (skipRefresh: true to disable auto-refresh)
 * @returns Promise<Response>
 */
export async function apiClient(
  url: string,
  options: ApiRequestInit = {}
): Promise<Response> {
  const { skipRefresh, ...fetchOptions } = options;

  // Always include credentials for cookie-based auth
  const config: RequestInit = {
    ...fetchOptions,
    credentials: "include",
  };

  // Make the initial request
  let response = await fetch(url, config);

  // If unauthorized and refresh is not disabled, try to refresh token
  if (response.status === 401 && !skipRefresh) {
    console.log("[API] Received 401. Attempting token refresh...");

    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the original request with new access token
      console.log("[API] Retrying original request with refreshed token...");
      response = await fetch(url, {
        ...config,
        // Prevent infinite retry loops
        skipRefresh: true,
      } as ApiRequestInit);
    } else {
      // Refresh failed - redirect to login or handle accordingly
      console.error("[API] Token refresh failed. Redirecting to login...");
      // In a real app, you might want to redirect to login page
      // window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  /**
   * GET request with auto-refresh
   */
  get: async (url: string, options?: ApiRequestInit) => {
    return apiClient(url, { ...options, method: "GET" });
  },

  /**
   * POST request with auto-refresh
   */
  post: async (url: string, body?: unknown, options?: ApiRequestInit) => {
    return apiClient(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request with auto-refresh
   */
  put: async (url: string, body?: unknown, options?: ApiRequestInit) => {
    return apiClient(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PATCH request with auto-refresh
   */
  patch: async (url: string, body?: unknown, options?: ApiRequestInit) => {
    return apiClient(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request with auto-refresh
   */
  delete: async (url: string, options?: ApiRequestInit) => {
    return apiClient(url, { ...options, method: "DELETE" });
  },
};

export default api;
