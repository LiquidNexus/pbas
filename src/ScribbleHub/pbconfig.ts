/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 kittycatgit */

import { ContentRating, SourceIntents, type ExtensionInfo } from "@paperback/types";

import { NOVEL_BADGE } from "../novel/badge";

export default {
  name: "ScribbleHub",
  description: "Original web novels from scribblehub.com.",
  version: "7.0.1",
  icon: "icon.png",
  language: "en",
  contentRating: ContentRating.ADULT,
  capabilities: [
    SourceIntents.DISCOVER_SECTION_PROVIDING,
    SourceIntents.SEARCH_RESULT_PROVIDING,
    SourceIntents.CHAPTER_PROVIDING,
    SourceIntents.CLOUDFLARE_BYPASS_PROVIDING,
  ],
  badges: [NOVEL_BADGE],
  developers: [{ name: "kittycatgit" }],
} satisfies ExtensionInfo;
