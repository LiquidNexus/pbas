/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import { ContentRating, SourceIntents, type ExtensionInfo } from "@paperback/types";

import { COMIC_BADGE } from "../utils/badges";

export default {
  name: "AsuraScans",
  description: "Extension that pulls content from asurascans.com.",
  version: "1.0.0-alpha.3",
  icon: "icon.png",
  language: "en",
  contentRating: ContentRating.MATURE,
  capabilities: [
    SourceIntents.DISCOVER_SECTION_PROVIDING,
    SourceIntents.SEARCH_RESULT_PROVIDING,
    SourceIntents.CHAPTER_PROVIDING,
    SourceIntents.CLOUDFLARE_BYPASS_PROVIDING,
  ],
  badges: [COMIC_BADGE],
  developers: [
    {
      name: "LiquidNexus",
      github: "https://github.com/LiquidNexus",
    },
    {
      // Original Paperback 0.8 extension this port is based on.
      name: "Ivanmatthew",
      github: "https://github.com/Ivanmatthew",
    },
  ],
} satisfies ExtensionInfo;
