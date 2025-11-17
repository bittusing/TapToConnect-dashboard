import { useCallback, useEffect, useState } from "react";
import { getAdminDashboardSummary } from "../services/qrAdminService";
import { AdminDashboardSummary } from "../types/qr";

interface UseQrDashboardState {
  summary: AdminDashboardSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useQrDashboard = (): UseQrDashboardState => {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardSummary();
      setSummary(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load dashboard summary";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh: fetchSummary,
  };
};


