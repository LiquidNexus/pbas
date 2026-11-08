/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import {
  ContentRating,
  type Chapter,
  type ChapterDetails,
  type DiscoverSectionItem,
  type SearchResultItem,
  type SourceManga,
  type TagSection,
} from "@paperback/types";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

import {
  DOMAIN,
  type ApiChapter,
  type ApiSeries,
  type ChapterResponse,
  type FeaturedProps,
  type Genre,
  type TrendingProps,
} from "./models";
import { getIslandProps } from "./utils/props";

/** Descriptions and some titles arrive as HTML (`<p>…</p>`, `&amp;`). */
function htmlToText(value: string | undefined): string {
  if (!value) return "";
  return cheerio.load(value).text().trim();
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Early-access chapters are paywalled until `early_access_until` passes.
 * Without that date, `is_premium` marks a permanently paid chapter.
 */
export function isLocked(chapter: ApiChapter): boolean {
  if (chapter.early_access_until) {
    return new Date(chapter.early_access_until).getTime() > Date.now();
  }
  return chapter.is_premium;
}

function chapterLabel(chapter: ApiChapter): string {
  const title = htmlToText(chapter.title);
  return `${isLocked(chapter) ? "[Early Access] " : ""}Ch. ${chapter.number}${title ? ` - ${title}` : ""}`;
}

function latestChapter(series: ApiSeries): ApiChapter | undefined {
  return [...(series.latest_chapters ?? [])].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )[0];
}

// ---- Search / API lists ----

export function toSearchResultItem(series: ApiSeries): SearchResultItem {
  const latest = latestChapter(series);
  return {
    mangaId: series.slug,
    title: htmlToText(series.title),
    imageUrl: series.cover,
    subtitle: latest ? chapterLabel(latest) : undefined,
  };
}

export function toChapterUpdateItem(series: ApiSeries): DiscoverSectionItem {
  const latest = latestChapter(series);
  if (!latest) return toSimpleItem(series);
  return {
    type: "chapterUpdatesCarouselItem",
    mangaId: series.slug,
    chapterId: latest.slug,
    title: htmlToText(series.title),
    imageUrl: series.cover,
    subtitle: chapterLabel(latest),
    publishDate: new Date(latest.published_at),
  };
}

export function toSimpleItem(series: ApiSeries): DiscoverSectionItem {
  return {
    type: "simpleCarouselItem",
    mangaId: series.slug,
    title: htmlToText(series.title),
    imageUrl: series.cover,
    subtitle: series.rating ? `★ ${series.rating.toFixed(1)}` : undefined,
  };
}

export function toGenreItem(genre: Genre): DiscoverSectionItem {
  return {
    type: "genresCarouselItem",
    name: genre.name,
    searchQuery: { title: "", metadata: { genres: [genre.slug] } },
  };
}

// ---- Homepage islands ----

export function parseFeatured($: CheerioAPI): DiscoverSectionItem[] {
  const props = getIslandProps<FeaturedProps>($, "HeroCarouselEmbla");
  return props.items.map((item) => ({
    type: "featuredCarouselItem",
    mangaId: item.slug,
    title: htmlToText(item.title),
    imageUrl: item.cover_url,
    supertitle: item.type ? capitalise(item.type) : undefined,
    summary: htmlToText(item.description),
    infoItems: item.rating ? [{ symbol: "star.fill", text: item.rating.toFixed(1) }] : undefined,
  }));
}

export function parseTrending($: CheerioAPI): DiscoverSectionItem[] {
  const props = getIslandProps<TrendingProps>($, "TrendingSection");
  const views = Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
  return props.items.map((item) => ({
    type: "simpleCarouselItem",
    mangaId: item.slug,
    title: htmlToText(item.title),
    imageUrl: item.cover_url,
    subtitle: `${views.format(item.view_count)} views`,
  }));
}

// ---- Manga, chapters, pages ----

export function parseMangaDetails(series: ApiSeries): SourceManga {
  const genres: TagSection = {
    id: "genres",
    title: "Genres",
    tags: series.genres.map((genre) => ({ id: genre.slug, title: genre.name })),
  };

  return {
    mangaId: series.slug,
    mangaInfo: {
      primaryTitle: htmlToText(series.title),
      secondaryTitles: (series.alt_titles ?? []).map(htmlToText).filter(Boolean),
      thumbnailUrl: series.cover,
      bannerUrl: series.banner || undefined,
      synopsis: htmlToText(series.description),
      status: series.status ? capitalise(series.status) : undefined,
      author: series.author || undefined,
      artist: series.artist || undefined,
      rating: series.rating ? series.rating / 10 : undefined,
      contentRating: ContentRating.MATURE,
      tagGroups: genres.tags.length > 0 ? [genres] : [],
      shareUrl: `${DOMAIN}${series.public_url}`,
    },
  };
}

export function parseChapters(sourceManga: SourceManga, chapters: ApiChapter[]): Chapter[] {
  return chapters
    .filter((chapter) => !isLocked(chapter))
    .map((chapter) => ({
      chapterId: chapter.slug,
      sourceManga,
      langCode: "en",
      chapNum: chapter.number,
      volume: 0, // Asura has no volumes; undefined shows as "Volume TBA" in the app
      title: htmlToText(chapter.title) || undefined,
      publishDate: new Date(chapter.published_at),
    }));
}

export function parseChapterDetails(
  mangaId: string,
  chapterId: string,
  response: ChapterResponse,
): ChapterDetails {
  const { is_locked, chapter } = response.data;
  if (is_locked || chapter.pages.length === 0) {
    throw new Error(`[AsuraScans] Chapter ${chapter.number} is locked (early access).`);
  }
  return { id: chapterId, mangaId, pages: chapter.pages.map((page) => page.url) };
}
