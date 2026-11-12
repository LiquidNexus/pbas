/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 kittycatgit */

import { ContentRating, type ExtensionInfo } from "@paperback/types";

import { NOVEL_BADGE } from "../novel/badge";
import { basePbConfig } from "../vcomics/config";

const pbConfig = {
  ...basePbConfig,
  badges: [NOVEL_BADGE],
  name: "ReadNovel",
  description: "Extension that pulls content from readnovel.eu.",
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
