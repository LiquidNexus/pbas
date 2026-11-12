/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 kittycatgit */

import { ContentRating, SourceIntents, type ExtensionInfo } from "@paperback/types";

import { COMIC_BADGE, NOVEL_BADGE } from "../utils/badges";

export default {
  name: "DivaScans",
  description: "Extension that pulls content from divascans.org.",
  version: "1.0.1",
  icon: "icon.png",
  language: "en",
  contentRating: ContentRating.ADULT,
  badges: [COMIC_BADGE, NOVEL_BADGE],
  developers: [
    {
      name: "kittycatgit",
      website: "https://github.com/kittycatgit",
      github: "https://github.com/kittycatgit",
    },
  ],
  capabilities: [
    SourceIntents.CHAPTER_PROVIDING,
    SourceIntents.SEARCH_RESULT_PROVIDING,
    SourceIntents.DISCOVER_SECTION_PROVIDING,
    SourceIntents.CLOUDFLARE_BYPASS_PROVIDING,
  ],
} satisfies ExtensionInfo;
