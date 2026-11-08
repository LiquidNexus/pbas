/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

// Paperback 0.9 port of Ivanmatthew's 0.8 AsuraScans extension.
// Manga details, chapters, pages and search use the site's JSON API
// (api.asurascans.com); only the Featured and Trending sections are read
// from the homepage's Astro island props, because the API has no equivalent.
//
// Manga IDs are the plain series slug (e.g. "nano-machine"). The site's
// public URLs append a site-wide hash ("nano-machine-ab39de10") that the API
// doesn't need, so it's kept out of IDs to keep library entries stable.

import {
  BasicRateLimiter,
  CookieStorageInterceptor,
  DiscoverSectionType,
  type AdvancedSearchForm,
  type Chapter,
  type ChapterDetails,
  type Cookie,
  type DiscoverSection,
  type DiscoverSectionItem,
  type ExtensionImpl,
  type PagedResults,
  type Request,
  type SearchQuery,
  type SearchResultItem,
  type SortingOption,
  type SourceManga,
} from "@paperback/types";

import { AsuraAdvancedSearchForm } from "./forms/search";
import {
  PAGE_SIZE,
  SECTION,
  SORTING_OPTIONS,
  type ApiSeries,
  type ChapterListResponse,
  type ChapterResponse,
  type Genre,
  type GenresResponse,
  type PageMetadata,
  type SearchMetadata,
  type SeriesDetailResponse,
  type SeriesListResponse,
} from "./models";
import { AsuraInterceptor, fetchApi, fetchHomepage } from "./network";
import {
  parseChapterDetails,
  parseChapters,
  parseFeatured,
  parseMangaDetails,
  parseTrending,
  toChapterUpdateItem,
  toGenreItem,
  toSearchResultItem,
  toSimpleItem,
} from "./parsers";
import type AsuraScansConfig from "./pbconfig";

export class AsuraScansExtension implements ExtensionImpl<typeof AsuraScansConfig> {
  // "Balanced" preset (3 req/s); the 0.8 extension used 4 req/s without issues.
  globalRateLimiter = new BasicRateLimiter("rateLimiter", {
    numberOfRequests: 3,
    bufferInterval: 1,
    ignoreImages: true,
  });

  // Remembers the `cf_clearance` cookie after a Cloudflare challenge is solved.
  cookieStorageInterceptor = new CookieStorageInterceptor({ storage: "stateManager" });
  asuraInterceptor = new AsuraInterceptor("main");

  private genres: Genre[] | undefined;

  async initialise(): Promise<void> {
    this.globalRateLimiter.registerInterceptor();
    this.cookieStorageInterceptor.registerInterceptor();
    this.asuraInterceptor.registerInterceptor();
  }

  async cloudflareBypassCompleted(
    _request: Request,
    cookies: Cookie[],
    _localStorage: Record<string, string>,
  ): Promise<void> {
    for (const cookie of cookies) {
      if (cookie.name === "cf_clearance") this.cookieStorageInterceptor.setCookie(cookie);
    }
  }

  private async getGenres(): Promise<Genre[]> {
    this.genres ??= (await fetchApi<GenresResponse>(["genres"])).data;
    return this.genres;
  }

  /** One page of `/api/series`, which backs search and the paged discover sections. */
  private async fetchSeriesPage(
    page: number,
    query: Record<string, string | number | undefined>,
  ): Promise<{ series: ApiSeries[]; next: PageMetadata }> {
    const response = await fetchApi<SeriesListResponse>(["series"], {
      ...query,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
    const series = response.data ?? [];
    const next = response.meta.has_more && series.length > 0 ? { page: page + 1 } : undefined;
    return { series, next };
  }

  // ---- Discover ----

  async getDiscoverSections(): Promise<DiscoverSection[]> {
    return [
      { id: SECTION.FEATURED, title: "Featured", type: DiscoverSectionType.featured },
      { id: SECTION.LATEST, title: "Latest Updates", type: DiscoverSectionType.chapterUpdates },
      { id: SECTION.TRENDING, title: "Trending Today", type: DiscoverSectionType.simpleCarousel },
      { id: SECTION.POPULAR, title: "Popular", type: DiscoverSectionType.simpleCarousel },
      { id: SECTION.GENRES, title: "Genres", type: DiscoverSectionType.genres },
    ];
  }

  async getDiscoverSectionItems(
    section: DiscoverSection,
    metadata: PageMetadata,
  ): Promise<PagedResults<DiscoverSectionItem>> {
    const page = metadata?.page ?? 1;
    switch (section.id) {
      case SECTION.FEATURED:
        return { items: parseFeatured(await fetchHomepage()) };
      case SECTION.TRENDING:
        return { items: parseTrending(await fetchHomepage()) };
      case SECTION.LATEST: {
        const { series, next } = await this.fetchSeriesPage(page, { sort: "latest" });
        return { items: series.map(toChapterUpdateItem), metadata: next };
      }
      case SECTION.POPULAR: {
        const { series, next } = await this.fetchSeriesPage(page, { sort: "popular" });
        return { items: series.map(toSimpleItem), metadata: next };
      }
      case SECTION.GENRES:
        return { items: (await this.getGenres()).map(toGenreItem) };
      default:
        throw new Error(`[AsuraScans] Unknown discover section: ${section.id}`);
    }
  }

  // ---- Search ----

  async getSortingOptions(_query: SearchQuery<SearchMetadata>): Promise<SortingOption[]> {
    return SORTING_OPTIONS;
  }

  async getAdvancedSearchForm(
    searchQuery: SearchQuery<SearchMetadata>,
  ): Promise<AdvancedSearchForm> {
    return new AsuraAdvancedSearchForm(searchQuery, await this.getGenres());
  }

  async getSearchResults(
    searchQuery: SearchQuery<SearchMetadata>,
    metadata: PageMetadata,
    sortingOption: SortingOption | undefined,
  ): Promise<PagedResults<SearchResultItem>> {
    const filters = searchQuery.metadata ?? {};
    const title = searchQuery.title?.trim() ?? "";
    const { series, next } = await this.fetchSeriesPage(metadata?.page ?? 1, {
      search: title || undefined,
      sort: sortingOption?.id ?? "latest",
      order: sortingOption?.id === "title" ? "asc" : "desc",
      genres: filters.genres?.length ? filters.genres.join(",") : undefined,
      status: filters.status?.[0],
      type: filters.type?.[0],
      min_chapters: filters.minChapters || undefined,
    });

    const items = series.map(toSearchResultItem);
    // Surface exact title matches first, which makes migrating a library easier.
    if (title) {
      const wanted = title.toLowerCase();
      items.sort(
        (a, b) =>
          Number(b.title.toLowerCase() === wanted) - Number(a.title.toLowerCase() === wanted),
      );
    }
    return { items, metadata: next };
  }

  // ---- Manga, chapters, pages ----

  async getMangaDetails(mangaId: string): Promise<SourceManga> {
    const response = await fetchApi<SeriesDetailResponse>(["series", mangaId]);
    const series = response.series ?? response.data?.series;
    if (!series) throw new Error(`[AsuraScans] No series found for "${mangaId}"`);
    return parseMangaDetails(series);
  }

  async getChapters(sourceManga: SourceManga): Promise<Chapter[]> {
    const response = await fetchApi<ChapterListResponse>([
      "series",
      sourceManga.mangaId,
      "chapters",
    ]);
    return parseChapters(sourceManga, response.data);
  }

  async getChapterDetails(chapter: Chapter): Promise<ChapterDetails> {
    const mangaId = chapter.sourceManga.mangaId;
    const response = await fetchApi<ChapterResponse>([
      "series",
      mangaId,
      "chapters",
      chapter.chapterId,
    ]);
    return parseChapterDetails(mangaId, chapter.chapterId, response);
  }
}

export const AsuraScans = new AsuraScansExtension();
