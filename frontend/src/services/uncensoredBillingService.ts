// src/services/uncensoredBillingService.ts

import { authHelper } from "../utils/authHelper";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

// Helper to make authenticated requests
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

export const createUncensoredCheckoutSession = async (
  addonId: string
): Promise<{ url: string }> => {
  if (!addonId) {
    throw new Error("addonId is required");
  }

  const url = `${API_BASE_URL}/api/billing/uncensored/create-checkout-session`;

  const result = await fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify({ addonId }),
  });

  if (!result?.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: result.url };
};

const uncensoredBillingService = {
  createUncensoredCheckoutSession,
};

export default uncensoredBillingService;
