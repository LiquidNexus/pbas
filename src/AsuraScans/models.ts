/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

export const DOMAIN = "https://asurascans.com";
export const API = "https://api.asurascans.com/api";

export const PAGE_SIZE = 20;

export const SECTION = {
  FEATURED: "featured",
  LATEST: "latest_updates",
  TRENDING: "trending_today",
  POPULAR: "popular",
  GENRES: "genres",
} as const;

export const SORTING_OPTIONS = [
  { id: "latest", label: "Latest Update" },
  { id: "popular", label: "Popularity" },
  { id: "rating", label: "Rating" },
  { id: "title", label: "Title" },
];

export const STATUSES = [
  { id: "ongoing", title: "Ongoing" },
  { id: "completed", title: "Completed" },
  { id: "hiatus", title: "Hiatus" },
  { id: "dropped", title: "Dropped" },
];

export const TYPES = [
  { id: "manhwa", title: "Manhwa" },
  { id: "manhua", title: "Manhua" },
  { id: "manga", title: "Manga" },
];

export type SearchMetadata = {
  genres?: string[];
  status?: string[];
  type?: string[];
  minChapters?: string;
};

export type PageMetadata = { page: number } | undefined;

// ---- API (api.asurascans.com) ----

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface ApiChapter {
  id: number;
  number: number;
  title?: string;
  slug: string;
  is_premium: boolean;
  early_access_until?: string;
  published_at: string;
  created_at: string;
}

export interface ApiSeries {
  id: number;
  slug: string;
  title: string;
  alt_titles?: string[];
  description: string;
  cover: string;
  banner?: string;
  status: string;
  type: string;
  author?: string;
  artist?: string;
  rating: number;
  chapter_count: number;
  public_url: string;
  genres: Genre[];
  latest_chapters?: ApiChapter[];
}

export interface SeriesListResponse {
  data: ApiSeries[] | null;
  meta: { total?: number; per_page: number; has_more?: boolean };
}

/** Series that have a linked novel come wrapped in `data`; the rest don't. */
export interface SeriesDetailResponse {
  series?: ApiSeries;
  data?: { series: ApiSeries };
}

export interface ChapterListResponse {
  data: ApiChapter[];
}

export interface ChapterResponse {
  data: {
    is_locked: boolean;
    chapter: ApiChapter & { pages: { url: string; width: number; height: number }[] };
  };
}

export interface GenresResponse {
  data: Genre[];
}

// ---- Homepage Astro island props (asurascans.com) ----

export interface FeaturedProps {
  items: {
    slug: string;
    title: string;
    cover_url: string;
    banner_url?: string;
    description: string;
    rating: number;
    type: string;
  }[];
}

export interface TrendingProps {
  items: {
    slug: string;
    title: string;
    cover_url: string;
    view_count: number;
  }[];
}
