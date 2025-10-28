/**
 * =====================================================
 * AUTH HELPER UTILITY
 * =====================================================
 * 
 * Centralized authentication utility for handling:
 * - Token refresh
 * - Automatic logout on session expiry
 * - Authenticated API calls
 * 
 * This ensures consistent session management across all services
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

class AuthHelper {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  /**
   * Get the access token from localStorage
   */
  getAccessToken(): string | null {
    try {
      // First try the custom accessToken (used by our backend auth)
      const customToken = localStorage.getItem('accessToken');
      if (customToken) return customToken;

      // Fallback to Supabase token pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        if (/^sb-.*-auth-token$/.test(key)) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.access_token) return parsed.access_token as string;
          } catch {
            continue;
          }
        }
      }

      // Final fallback
      const sbSimple = localStorage.getItem('sb-access-token');
      if (sbSimple)       return sbSimple;
    } catch (error) {
      // Silently fail if can't get token
    }
    return null;
  }

  /**
   * Get the refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch (error) {
      return null;
    }
  }

  /**
   * Attempt to refresh the access token using the refresh token
   */
  private async tryRefreshToken(): Promise<boolean> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data?.accessToken) {
        try {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          return true;
        } catch (storageError) {
          return false;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Force logout and redirect to signin page
   */
  forceLogoutAndRedirect(reason: string = 'expired'): void {
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      // Silently fail if can't clear
    }

    // Avoid multiple redirects in rapid succession
    if (typeof window !== 'undefined') {
      const current = window.location.pathname;
      const url = `/signin?reason=${reason}`;
      
      // Only redirect if not already on signin page
      if (current !== '/signin') {
        window.location.href = url;
      }
    }
  }

  /**
   * Perform an authenticated fetch request with automatic token refresh
   * 
   * This method will:
   * 1. Add the Authorization header with the access token
   * 2. If the request returns 401, attempt to refresh the token once
   * 3. Retry the request with the new token
   * 4. If still 401, force logout and redirect to signin
   * 
   * @param input - The URL or Request object
   * @param init - The fetch options
   * @returns The Response object
   */
  async authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const performFetch = async (): Promise<Response> => {
      const token = this.getAccessToken();
      
      return await fetch(input, {
        ...init,
        headers: {
          ...(init?.headers || {}),
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });
    };

    // First attempt
    let response = await performFetch();

    // If 401, try to refresh token and retry once
    if (response.status === 401) {
      const refreshed = await this.tryRefreshToken();
      
      if (refreshed) {
        // Retry the request with the new token
        response = await performFetch();
      }

      // If still 401 after refresh, force logout
      if (response.status === 401) {
        this.forceLogoutAndRedirect('expired');
      }
    }

    return response;
  }

  /**
   * Get standard headers with authentication
   */
  getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const authUser = localStorage.getItem('authUser');
    return !!(token && authUser);
  }

  /**
   * Get current user data from localStorage
   */
  getCurrentUser(): any | null {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) return null;
      return JSON.parse(authUser);
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const authHelper = new AuthHelper();
export default authHelper;

