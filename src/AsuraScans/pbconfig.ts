/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import { ContentRating, SourceIntents, type ExtensionInfo } from "@paperback/types";

export default {
  name: "AsuraScans",
  description: "Extension that pulls content from asurascans.com.",
  version: "1.0.0-alpha.2",
  icon: "icon.png",
  language: "en",
  contentRating: ContentRating.MATURE,
  capabilities: [
    SourceIntents.DISCOVER_SECTION_PROVIDING,
    SourceIntents.SEARCH_RESULT_PROVIDING,
    SourceIntents.CHAPTER_PROVIDING,
    SourceIntents.CLOUDFLARE_BYPASS_PROVIDING,
  ],
  badges: [],
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
