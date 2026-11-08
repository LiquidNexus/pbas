/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import {
  AdvancedSearchForm,
  InputRow,
  Section,
  SelectRow,
  type FormSectionElement,
  type SearchQuery,
} from "@paperback/types";

import { STATUSES, TYPES, type Genre, type SearchMetadata } from "../models";

export class AsuraAdvancedSearchForm extends AdvancedSearchForm {
  private metadata: SearchMetadata;

  constructor(
    searchQuery: SearchQuery<SearchMetadata>,
    private readonly genres: Genre[],
  ) {
    super();
    this.metadata = { ...searchQuery.metadata };
  }

  override getSearchQueryMetadata(): SearchMetadata {
    return this.metadata;
  }

  override getSections(): FormSectionElement<unknown>[] {
    return [
      Section("filters", [
        SelectRow("genres", {
          title: "Genres",
          subtitle: "Results must match every selected genre",
          value: this.metadata.genres ?? [],
          minItemCount: 0,
          maxItemCount: this.genres.length,
          layout: "flow",
          items: this.genres.map((genre) => ({ id: genre.slug, title: genre.name })),
          onValueChange: Application.Selector(this as AsuraAdvancedSearchForm, "setGenres"),
        }),
        SelectRow("status", {
          title: "Status",
          value: this.metadata.status ?? [],
          minItemCount: 0,
          maxItemCount: 1,
          layout: "list",
          items: STATUSES,
          onValueChange: Application.Selector(this as AsuraAdvancedSearchForm, "setStatus"),
        }),
        SelectRow("type", {
          title: "Type",
          value: this.metadata.type ?? [],
          minItemCount: 0,
          maxItemCount: 1,
          layout: "list",
          items: TYPES,
          onValueChange: Application.Selector(this as AsuraAdvancedSearchForm, "setType"),
        }),
        InputRow("min_chapters", {
          title: "Minimum Chapters",
          value: this.metadata.minChapters ?? "",
          onValueChange: Application.Selector(this as AsuraAdvancedSearchForm, "setMinChapters"),
        }),
      ]),
    ];
  }

  async setGenres(value: string[]): Promise<void> {
    this.metadata.genres = value;
  }

  async setStatus(value: string[]): Promise<void> {
    this.metadata.status = value;
  }

  async setType(value: string[]): Promise<void> {
    this.metadata.type = value;
  }

  async setMinChapters(value: string): Promise<void> {
    this.metadata.minChapters = value.trim();
  }

  override async formDidSubmit(): Promise<void> {
    const min = this.metadata.minChapters;
    if (min && !/^\d+$/.test(min)) {
      throw new Error("Minimum Chapters must be a whole number.");
    }
  }
}
