import { authHelper } from "../utils/authHelper";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await authHelper.authFetch(url, options);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      errorData.message || `Request failed: ${response.statusText}`
    );
  }

  return response.json();
};

// Admin: Change user's subscription plan manually
export const adminChangePlan = async ({
  userId,
  newPlanId,
  interval,
}: {
  userId: string;
  newPlanId: string;
  interval: "monthly" | "yearly";
}): Promise<{
  success: boolean;
  message: string;
  updatedPlan?: string;
}> => {
  try {
    const url = `${API_BASE_URL}/api/admin/billing/change-plan`;
    const result = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({
        userId,
        newPlanId,
        interval,
      }),
    });

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to change user plan");
  }
};
