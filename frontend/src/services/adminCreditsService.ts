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

// Add User Credits manually
export const manuallyAdjustUserCredits = async (
  userId: string,
  amount: number, // amount to ADD (delta)
  type: "earned" | "purchased" | "bonus" | "refund" = "bonus",
  description?: string
): Promise<{
  amount_added: number;
  new_balance: number;
  lifetime_earned: number;
}> => {
  try {
    const url = `${API_BASE_URL}/api/admin/credits/manual-adjust`;
    const result = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({
        userId,
        amount, // positive delta
        type, // defaults to 'bonus'
        description: description ?? "Manual adjustment by admin",
      }),
    });
    return result.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to manually adjust credits");
  }
};
