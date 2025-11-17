export type ShortStatus = "draft" | "published" | "archived";

export interface ShortCreator {
  _id: string;
  name: string;
  profilePic?: string;
  role: string;
}

export interface ShortItem {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  duration: number;
  hashtags: string[];
  likeCount: number;
  viewCount: number;
  shareCount: number;
  status: ShortStatus;
  isActive: boolean;
  publishedAt?: string;
  creator?: ShortCreator;
  createdAt: string;
  updatedAt: string;
}

export interface ShortsFilters {
  page: number;
  limit: number;
  shuffle?: boolean;
  hashtag?: string;
  creator?: string;
  status?: ShortStatus;
  search?: string;
}

export interface ShortsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ShortsListResponse {
  items: ShortItem[];
  pagination: ShortsPagination;
}

export interface ShortPayload {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  duration: number;
  hashtags: string[];
  status?: ShortStatus;
}




