// src/services/adminCensoredModeService.ts

import { authHelper } from "../utils/authHelper";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await authHelper.authFetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.message ||
        errorData.error ||
        `Request failed: ${response.statusText}`
    );
  }

  return response.json();
};

export interface AdminChangeCensoredModePayload {
  userId: string;
  censoredEnabled: boolean; // true = filtered / censored mode ON
}

export interface AdminChangeCensoredModeResponse {
  success: boolean;
  message: string;
  censoredEnabled?: boolean;
}

/**
 * Admin: Enable/disable censored mode for a user
 */
export const adminChangeCensoredMode = async (
  payload: AdminChangeCensoredModePayload
): Promise<AdminChangeCensoredModeResponse> => {
  const url = `${API_BASE_URL}/api/admin/billing/set-censored-mode`;

  try {
    const result = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return result as AdminChangeCensoredModeResponse;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update censored mode");
  }
};

const adminCensoredModeService = {
  adminChangeCensoredMode,
};

export default adminCensoredModeService;
