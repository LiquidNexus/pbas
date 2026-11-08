/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Copyright © 2026 Inkdex */

import {
  CloudflareError,
  PaperbackInterceptor,
  URL,
  type Request,
  type Response,
} from "@paperback/types";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

import { API, DOMAIN } from "./models";

export class AsuraInterceptor extends PaperbackInterceptor {
  override async interceptRequest(request: Request): Promise<Request> {
    return {
      ...request,
      headers: {
        ...request.headers,
        // The API rejects requests that don't look like they come from the site.
        origin: DOMAIN,
        referer: `${DOMAIN}/`,
        "user-agent": await Application.getDefaultUserAgent(),
      },
    };
  }

  override async interceptResponse(
    request: Request,
    response: Response,
    data: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    const challenged =
      response.headers?.["cf-mitigated"] === "challenge" ||
      ((response.status === 403 || response.status === 503) && request.url.startsWith(DOMAIN));
    if (challenged) {
      throw new CloudflareError(
        {
          url: DOMAIN,
          method: "GET",
          headers: { "user-agent": await Application.getDefaultUserAgent() },
        },
        "Cloudflare challenge: open AsuraScans' homepage in Paperback and press the cloud icon.",
      );
    }
    return data;
  }
}

async function fetchText(url: string): Promise<string> {
  const [response, buffer] = await Application.scheduleRequest({ url, method: "GET" });
  if (response.status >= 400) {
    throw new Error(`[AsuraScans] Request to ${url} failed with HTTP ${response.status}`);
  }
  return Application.arrayBufferToUTF8String(buffer);
}

/** GET `api.asurascans.com/api/<path>?<query>` and parse it as JSON. */
export async function fetchApi<T>(
  path: string[],
  query: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(API);
  for (const segment of path) url.addPathComponent(segment);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.setQueryItem(key, String(value));
  }
  return JSON.parse(await fetchText(url.toString())) as T;
}

export async function fetchHomepage(): Promise<CheerioAPI> {
  return cheerio.load(await fetchText(`${DOMAIN}/`));
}
