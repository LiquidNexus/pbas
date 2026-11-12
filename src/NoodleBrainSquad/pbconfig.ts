/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 kittycatgit */

import { ContentRating, type ExtensionInfo } from "@paperback/types";

import { basePbConfig } from "../mangastream/config";
import { NOVEL_BADGE } from "../utils/badges";

const pbConfig = {
  ...basePbConfig,
  badges: [NOVEL_BADGE],
  name: "NoodleBrainSquad",
  description: "Extension that pulls content from noodlebrainsquad.org.",
  version: "2.0.1",
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
