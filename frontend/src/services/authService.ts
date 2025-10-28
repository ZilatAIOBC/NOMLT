import { supabase } from './supabaseClient';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  debug?: {
    verificationToken?: string;
    verificationLink?: string;
  };
  emailError?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  } | null;
}

function normalizeError(error: any): never {
  const message = error?.message || error?.error_description || 'Authentication error';
  const err: any = new Error(message);
  err.status = 400;
  err.data = { message };
  throw err;
}

export const authService = {
  googleStart(): void {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Redirect to backend which initiates Supabase Google OAuth
    window.location.assign(`${baseUrl}/auth/oauth/google`);
  },
  async forgotPassword(email: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) normalizeError(error);
    return { message: 'If that email exists, a reset link has been sent.' };
  },

  // For Supabase, reset happens after email link; we complete update when user lands on /reset-password
  async resetPassword(_token: string, password: string): Promise<{ message: string }> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) normalizeError(error);
    return { message: 'Password reset successful' };
  },
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: { name: payload.name },
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });
    if (error) normalizeError(error);
    return { message: data.user ? 'Registration successful. Check your email to verify your account.' : 'Check your email to verify your account.' };
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    // Use backend API to get user role
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || 'Login failed');
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    
    // Store tokens and user data
    try {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(data.user));
    } catch (storageError) {
      // Silently fail if can't store
    }

    return data;
  },

  async logout(): Promise<void> {
    // Clear local storage
    try { 
      localStorage.removeItem('authUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch {}
    
    // Also sign out from Supabase if session exists
    try {
      await supabase.auth.signOut();
    } catch {}
  },
  async logoutAdmin(): Promise<void> {
    // Call backend admin logout (non-essential but keeps parity), then clear local
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('accessToken');
      await fetch(`${baseUrl}/auth/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      }).catch(() => {});
    } catch {}
    try { 
      localStorage.removeItem('authUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch {}
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      throw new Error('No authentication tokens found');
    }

    const response = await fetch(`${baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        currentPassword, 
        newPassword,
        refreshToken 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    const data = await response.json();
    return data;
  },

  async updateProfile(name: string, email: string): Promise<{ message: string; user: any }> {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
      throw new Error('No authentication tokens found');
    }

    const response = await fetch(`${baseUrl}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        name,
        email,
        refreshToken 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    
    // Update the stored user data with the new information
    try {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, name, email };
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
      }
    } catch (storageError) {
      // Silently fail if can't update
    }

    return data;
  },
};
