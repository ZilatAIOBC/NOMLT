/**
 * =====================================================
 * USE CREDIT COST HOOK
 * =====================================================
 * 
 * Custom React hook to fetch and cache credit pricing from database
 * Falls back to default values if API fails
 */

import { useState, useEffect } from 'react';
import { getCreditCosts, type CreditCosts } from '../services/creditsService';

// Default fallback costs (same as backend fallback)
const DEFAULT_COSTS: CreditCosts = {
  text_to_image: 30,
  image_to_image: 30,
  text_to_video: 80,
  image_to_video: 80,
};

// In-memory cache to avoid repeated API calls
let cachedCosts: CreditCosts | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (matches backend cache)

/**
 * Hook to get credit cost for a specific generation type
 * Fetches from database on first call, then caches for 5 minutes
 * 
 * @param generationType - The type of generation (text_to_image, etc.)
 * @returns Object with cost and loading state
 * 
 * @example
 * const { cost, loading } = useCreditCost('text_to_image');
 * // cost = 30 (from database)
 */
export function useCreditCost(generationType: keyof CreditCosts) {
  const [cost, setCost] = useState<number>(DEFAULT_COSTS[generationType]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCost = async () => {
      try {
        setLoading(true);

        // Check if we have valid cached data
        const now = Date.now();
        if (cachedCosts && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
          setCost(cachedCosts[generationType]);
          setLoading(false);
          return;
        }

        // Fetch fresh data from API
        const result = await getCreditCosts();
        
        // Update cache
        cachedCosts = result.costs;
        cacheTimestamp = now;

        // Update component state
        setCost(result.costs[generationType]);
        
      } catch (error) {
        // Removed console for production
        // Use default/fallback cost on error
        setCost(DEFAULT_COSTS[generationType]);
      } finally {
        setLoading(false);
      }
    };

    fetchCost();
  }, [generationType]);

  return { cost, loading };
}

/**
 * Hook to get all credit costs at once
 * Useful for displaying multiple generation type costs
 * 
 * @returns Object with all costs and loading state
 * 
 * @example
 * const { costs, loading } = useAllCreditCosts();
 * // costs = { text_to_image: 30, text_to_video: 80, ... }
 */
export function useAllCreditCosts() {
  const [costs, setCosts] = useState<CreditCosts>(DEFAULT_COSTS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        setLoading(true);

        // Check cache first
        const now = Date.now();
        if (cachedCosts && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
          setCosts(cachedCosts);
          setLoading(false);
          return;
        }

        // Fetch from API
        const result = await getCreditCosts();
        
        // Update cache
        cachedCosts = result.costs;
        cacheTimestamp = now;

        // Update state
        setCosts(result.costs);
        
      } catch (error) {
        // Removed console for production
        setCosts(DEFAULT_COSTS);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, []);

  return { costs, loading };
}

/**
 * Invalidate the credit costs cache
 * Call this after admin updates pricing
 */
export function invalidateCreditCostCache() {
  cachedCosts = null;
  cacheTimestamp = null;
}

export default useCreditCost;

