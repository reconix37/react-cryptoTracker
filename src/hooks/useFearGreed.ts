import type { FearGreedResponse } from "@/types/FearGreedResponse";
import { useCallback, useEffect, useRef, useState } from "react"


export function useFearGreed() {
    
  const [data, setData] = useState<{ 
    value: number; 
    label: string; 
    color: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetched = useRef(0)

  const fetchFearGreed = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("https://api.alternative.me/fng/");
      if (!response.ok) throw new Error("Failed to fetch market sentiment");

      const json: FearGreedResponse = await response.json();
      const raw = json.data[0];
      const val = Number(raw.value);

      let colorClass = "text-emerald-500";
      if (val <= 25) colorClass = "text-rose-600"; 
      else if (val <= 45) colorClass = "text-orange-500";
      else if (val <= 55) colorClass = "text-yellow-500";
      else if (val <= 75) colorClass = "text-lime-500";

      setData({
        value: val,
        label: raw.value_classification,
        color: colorClass, 
      });

      lastFetched.current = Date.now();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFearGreed();
  }, [fetchFearGreed]);

  const refetch = async (force = false) => {
    const now = Date.now();

    if (!force && now - lastFetched.current <  86400000) {
      console.log("Too early for update, skipping...");
      return;
    }
    setError(null)
    setIsLoading(true)

    try {
      await fetchFearGreed();
    } finally {
      setIsLoading(false);
    }
  }

  return { data, isLoading, error, refetch };
}