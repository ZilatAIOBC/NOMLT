import { authHelper } from '../utils/authHelper';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await authHelper.authFetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Request failed: ${response.statusText}`);
  }

  return response.json();
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'deleted';
  plan: string;
  credits: number;
  joinDate: string;
  lastLogin: string | null;
  profilePicture: string | null;
  verified: boolean;
  totalGenerations?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get all users with pagination and filters
export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const url = `${API_BASE_URL}/api/admin/users?${queryParams.toString()}`;
    const result = await fetchWithAuth(url, { method: 'GET' });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to fetch users');
  }
};

// Get user statistics
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const url = `${API_BASE_URL}/api/admin/users/stats`;
    const result = await fetchWithAuth(url, { method: 'GET' });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to fetch user statistics');
  }
};

// Get specific user details
export const getUserDetails = async (userId: string): Promise<User> => {
  try {
    const url = `${API_BASE_URL}/api/admin/users/${userId}`;
    const result = await fetchWithAuth(url, { method: 'GET' });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to fetch user details');
  }
};

// Update user status
export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'suspended'
): Promise<{ id: string; status: string }> => {
  try {
    const url = `${API_BASE_URL}/api/admin/users/${userId}/status`;
    const result = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to update user status');
  }
};

// Update user role
export const updateUserRole = async (
  userId: string,
  role: 'user' | 'admin'
): Promise<{ id: string; role: string }> => {
  try {
    const url = `${API_BASE_URL}/api/admin/users/${userId}/role`;
    const result = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to update user role');
  }
};

// Delete user (soft delete)
export const deleteUser = async (userId: string): Promise<{ id: string }> => {
  try {
    const url = `${API_BASE_URL}/api/admin/users/${userId}`;
    const result = await fetchWithAuth(url, { method: 'DELETE' });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to delete user');
  }
};

// Bulk update users
export const bulkUpdateUsers = async (
  userIds: string[],
  updates: Partial<Pick<User, 'status' | 'role'>>
): Promise<{ updatedCount: number }> => {
  try {
    const url = `${API_BASE_URL}/api/admin/users/bulk/update`;
    const result = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify({ userIds, updates }),
    });
    return result.data;
  } catch (error: any) {
    // Removed console for production
    throw new Error(error.message || 'Failed to bulk update users');
  }
};

// Export users to CSV
export const exportUsersToCSV = async (params: GetUsersParams = {}): Promise<Blob> => {
  try {
    // Fetch all users (without pagination)
    const allUsersParams = { ...params, limit: 10000 }; // Large limit to get all users
    const response = await getUsers(allUsersParams);
    
    // Convert to CSV
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Plan', 'Credits', 'Join Date', 'Last Login'];
    const csvRows = [headers.join(',')];
    
    response.users.forEach(user => {
      const row = [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.plan,
        user.credits,
        user.joinDate,
        user.lastLogin || 'N/A'
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });
    
    const csvString = csvRows.join('\n');
    return new Blob([csvString], { type: 'text/csv' });
  } catch (error: any) {
    // Removed console for production
    throw new Error('Failed to export users to CSV');
  }
};

export default {
  getUsers,
  getUserStats,
  getUserDetails,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  bulkUpdateUsers,
  exportUsersToCSV,
};
