import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import {
  ShortItem,
  ShortPayload,
  ShortsFilters,
  ShortsListResponse,
  ShortsPagination,
} from "../types/shorts";
import shortsService from "../services/shortsService";

const DEFAULT_FILTERS: ShortsFilters = {
  page: 1,
  limit: 10,
  shuffle: false,
};

const DEFAULT_PAGINATION: ShortsPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasMore: false,
};

const normaliseShorts = (items: ShortItem[]): ShortItem[] =>
  items.map((item) => ({
    ...item,
    hashtags: Array.isArray(item.hashtags)
      ? item.hashtags.map((tag) => tag.toLowerCase())
      : [],
  }));

interface UseShortsListOptions {
  autoFetch?: boolean;
}

export const useShortsList = (
  initialFilters: Partial<ShortsFilters> = {},
  options: UseShortsListOptions = {}
) => {
  const autoFetch = options.autoFetch ?? true;
  const [filters, setFilters] = useState<ShortsFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [pagination, setPagination] = useState<ShortsPagination>(
    DEFAULT_PAGINATION
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchShorts = useCallback(
    async (overrideFilters: Partial<ShortsFilters> = {}) => {
      const mergedFilters = { ...filters, ...overrideFilters };
      setIsLoading(true);
      try {
        const { data, error } = await shortsService.fetchShorts(mergedFilters);
        if (error) {
          throw new Error(typeof error === "string" ? error : "Failed to load shorts");
        }

        const list = normaliseShorts(data?.items ?? []);
        setShorts(list);
        setPagination(data?.pagination ?? {
          ...DEFAULT_PAGINATION,
          page: mergedFilters.page,
          limit: mergedFilters.limit,
        });
        setFilters(mergedFilters);
      } catch (err: any) {
        toast.error(err.message || "Unable to fetch shorts");
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (!autoFetch) return;
    fetchShorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchTerm: string) => {
        fetchShorts({ page: 1, search: searchTerm });
      }, 400),
    [fetchShorts]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleDelete = useCallback(
    async (shortId: string) => {
      try {
        const { error } = await shortsService.deleteShort(shortId);
        if (error) {
          throw new Error(
            typeof error === "string" ? error : "Failed to delete short"
          );
        }
        toast.success("Short deleted successfully");
        fetchShorts();
      } catch (err: any) {
        toast.error(err.message || "Unable to delete short");
      }
    },
    [fetchShorts]
  );

  return {
    shorts,
    pagination,
    filters,
    isLoading,
    setFilters,
    fetchShorts,
    refetch: fetchShorts,
    debouncedSearch,
    handleDelete,
  };
};

export const useShortDetails = (shortId: string | null, fetchOnInit = true) => {
  const [shortDetails, setShortDetails] = useState<ShortItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadShort = useCallback(
    async (id?: string) => {
      const targetId = id ?? shortId;
      if (!targetId) return null;

      setIsLoading(true);
      try {
        const { data, error } = await shortsService.fetchShortById(targetId);
        if (error) {
          throw new Error(
            typeof error === "string" ? error : "Failed to load short"
          );
        }
        setShortDetails(data ? normaliseShorts([data])[0] : null);
        return data ?? null;
      } catch (err: any) {
        toast.error(err.message || "Unable to load short details");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [shortId]
  );

  useEffect(() => {
    if (fetchOnInit && shortId) {
      loadShort(shortId);
    }
  }, [fetchOnInit, loadShort, shortId]);

  return {
    shortDetails,
    isLoading,
    loadShort,
  };
};

export const useShortMutations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createShort = useCallback(async (payload: ShortPayload) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await shortsService.createShort(payload);
      if (error) {
        throw new Error(
          typeof error === "string" ? error : "Failed to create short"
        );
      }
      toast.success("Short created successfully");
      return data ?? null;
    } catch (err: any) {
      toast.error(err.message || "Unable to create short");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateShort = useCallback(
    async (shortId: string, payload: Partial<ShortPayload>) => {
      setIsSubmitting(true);
      try {
        const { data, error } = await shortsService.updateShort(
          shortId,
          payload
        );
        if (error) {
          throw new Error(
            typeof error === "string" ? error : "Failed to update short"
          );
        }
        toast.success("Short updated successfully");
        return data ?? null;
      } catch (err: any) {
        toast.error(err.message || "Unable to update short");
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    isSubmitting,
    createShort,
    updateShort,
  };
};

