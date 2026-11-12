/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 kittycatgit */

import { ContentRating, type ExtensionInfo } from "@paperback/types";

import { COMIC_BADGE, NOVEL_BADGE } from "../utils/badges";
import { basePbConfig } from "../vcomics/config";

const pbConfig = {
  ...basePbConfig,
  badges: [COMIC_BADGE, NOVEL_BADGE],
  name: "NuviaToon",
  description: "Extension that pulls content from nuviatoon.org.",
  version: "1.0.1",
  contentRating: ContentRating.MATURE as ContentRating,
  developers: [
    {
      name: "kittycatgit",
      website: "https://github.com/kittycatgit",
      github: "https://github.com/kittycatgit",
    },
  ],
} satisfies ExtensionInfo;

export default pbConfig;
