/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

// Decodes the `props` attribute of Astro `<astro-island>` elements.
// Astro serialises every value as a `[type, value]` tuple, recursively.
// Based on the PropsReviver from Ivanmatthew's Paperback 0.8 AsuraScans extension.

import type { CheerioAPI } from "cheerio";

type Tuple = [type: number, value?: unknown];

function reviveObject(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, reviveTuple(value as Tuple)]),
  );
}

function reviveArray(raw: unknown): unknown[] {
  return (raw as Tuple[]).map(reviveTuple);
}

function reviveTuple(raw: Tuple): unknown {
  const [type, value] = raw;
  switch (type) {
    case 0:
      return reviveObject(value);
    case 1:
      return reviveArray(value);
    case 2:
      return new RegExp(value as string);
    case 3:
      return new Date(value as string);
    case 4:
      return new Map(reviveArray(value) as [unknown, unknown][]);
    case 5:
      return new Set(reviveArray(value));
    case 6:
      return BigInt(value as string);
    case 7:
      return value as string; // URL, kept as a string
    case 11:
      return Number.POSITIVE_INFINITY * (value as number);
    default:
      // 8-10 are typed arrays, which AsuraScans doesn't use.
      throw new Error(`[AsuraScans] Unknown Astro prop type: ${type}`);
  }
}

/** Find the island for the given component name and return its decoded props. */
export function getIslandProps<T>($: CheerioAPI, componentName: string): T {
  const opts = JSON.stringify({ name: componentName, value: true });
  const raw = $(`astro-island[opts='${opts}']`).attr("props");
  if (!raw) {
    throw new Error(`[AsuraScans] Couldn't find the "${componentName}" section on the page`);
  }
  return reviveObject(JSON.parse(raw)) as T;
}
