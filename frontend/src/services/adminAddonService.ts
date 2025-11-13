// src/services/adminAddonService.ts

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

export interface AdminAddon {
  id: string;
  addon_key: string;
  label: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Admin: Get all add-ons with pricing
 */
export const adminGetAddons = async (): Promise<AdminAddon[]> => {
  const url = `${API_BASE_URL}/api/admin/addons`;

  try {
    const result = await fetchWithAuth(url, {
      method: "GET",
    });

    // Backend returns: { success: true, addons: [...] }
    if (!result || result.success === false) {
      throw new Error(result?.error || "Failed to fetch add-ons");
    }

    return result.addons || [];
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch add-ons");
  }
};

/**
 * Admin: Update the price of a specific add-on
 */
export const adminUpdateAddonPrice = async (
  addonId: string,
  price: number
): Promise<AdminAddon> => {
  if (!addonId) throw new Error("addonId is required");
  if (price === undefined || price === null)
    throw new Error("price is required");

  const url = `${API_BASE_URL}/api/admin/addons/change-price/${addonId}`;

  try {
    const result = await fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ price }),
    });

    if (!result?.success) {
      throw new Error(result?.error || "Failed to update addon price");
    }

    return result.addon;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update addon price");
  }
};

/**
 * Admin: Get details of a single add-on
 */
export const adminGetAddonById = async (
  addonId: string
): Promise<AdminAddon> => {
  if (!addonId) throw new Error("addonId is required");

  const url = `${API_BASE_URL}/api/admin/addons/${addonId}`;

  try {
    const result = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!result?.success) {
      throw new Error(result?.error || "Failed to fetch addon details");
    }

    return result.addon;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch addon details");
  }
};

const adminAddonService = {
  adminGetAddons,
  adminUpdateAddonPrice,
  adminGetAddonById,
};

export default adminAddonService;
