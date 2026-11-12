# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal fork (`LiquidNexus/pbas`) of [inkdex/general-extensions](https://github.com/inkdex/general-extensions), used to build and home-test Paperback 0.9 extensions (`@paperback/types`, `@paperback/toolchain`). It is not part of the Inkdex registry, and nothing here is published to it.

Extensions in this fork:

| Extension         | Origin                                                                                                                            | Notes                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/AsuraScans/` | Our 0.9 port of [Ivanmatthew's 0.8 extension](https://github.com/Ivanmatthew/ivans-paperback-extensions) (`paperback-0.8` branch) | See [AsuraScans notes](#asurascans-notes)                                                                                                                    |
| `src/LNori/`      | Copied unchanged from upstream                                                                                                    | Light novels: `contentType: "novel"` and `type: "html"` chapters. Inkdex's registry ships the same extension ID, so only install it from one repo in the app |

All other upstream extensions were removed on purpose. Don't restore them unless asked.

### Novel sources from kitty-extensions-0.9

Sixteen novel sources were copied from [kittycatgit/kitty-extensions-0.9](https://github.com/kittycatgit/kitty-extensions-0.9) (GPL-3.0, checked out at `~/git/public/kitty-extensions-0.9`) at commit `b348200`. The only changes are the ones this repo's lint and format rules forced, such as `import type`. Their tests came across too, except ScribbleHub, which has no test upstream.

- **Novel-only:** DanmeiNovel, DivineDaoLibrary, ExiledRebels, FanFiction, Foxaholic, KnoxT, LazyGirlTranslations, NoodleBrainSquad, PandaTranslations, ReadNovel, ScribbleHub, SleepyTranslations, XNovel.
- **Comics and novels:** DivaScans, SirenScans, NuviaToon. They set `contentType` per series.

Unlike AsuraScans and LNori, some of these depend on shared code copied with them. Directories without a `pbconfig.ts` are libraries, not extensions:

- `src/novel/xhtml.ts`: turns prose HTML into the XHTML document the app renders for `type: "html"` chapters. Most novel sources use it.
- `src/generic/`: kitty's Madara engine (`MadaraGeneric`), plus `src/shared/madaraNovel.ts` for Madara novel chapters. Used by DanmeiNovel and SleepyTranslations.
- `src/mangastream/` (Themesia) and `src/lightnovel/` on top of it. Used by LazyGirlTranslations, PandaTranslations and NoodleBrainSquad.
- `src/vcomics/config.ts`: only the base `pbconfig`. Used by ReadNovel and NuviaToon.

These sources keep their kitty extension IDs. If the kitty repo is also installed in the app, install each source from only one repo.

To pull a later kitty fix, diff the source's directory (and any engine it uses) against kitty, copy it over, then run `npm run lint && npm run format && npm run conformance`. Kitty's histories aren't related to this repo's, so a git merge won't work. Update the commit hash above when you do.

## Remotes and syncing

- `origin`: `git@github.com:LiquidNexus/pbas.git`. Push here.
- `upstream`: `inkdex/general-extensions`. Fetch only, never push.
- To pick up upstream toolchain, CI or LNori fixes, run `git fetch upstream && git merge upstream/0.9/stable`. If upstream changed an extension we deleted, git flags a modify/delete conflict. Resolve it with `git rm` on that path.

## Release pipeline (fork)

1. A push to `0.9/stable` runs `bundle-deploy.yaml`: `npm run bundle` → `bundles/` → this repo's `gh-pages` under `0.9/stable/`. It takes about a minute, then Pages serves it.
2. Paperback installs from `https://liquidnexus.github.io/pbas/0.9/stable`. Check what's live with `curl -s https://liquidnexus.github.io/pbas/0.9/stable/versioning.json`.
3. Branches that don't match `[0-9]+.[0-9]+/*` don't deploy, so use those for work in progress.

Differences from upstream CI:

- `registry-management.yaml` is removed. It dispatched to `inkdex/extensions` and needs Inkdex secrets.
- `test.yaml` has no hourly cron. It runs after a deploy, on PRs, and on manual dispatch.
- `.github/dependabot.yml` is removed.

`version` in each `pbconfig.ts` flows into `versioning.json`, and that version is what Paperback compares when offering updates. Bump it for every change you want the app to pick up. The repository name shown in the app is `name` in `package.json`.

## Environment

- Node 24 is **not** installed system-wide on this machine. Install it, or put a portable Node on `PATH`, before running anything below.
- The husky pre-push hook runs `npm run conformance` on **every** push, including `git push --delete`. A push fails if `npm` isn't on `PATH`.
- `gh` is not installed. For read-only checks of Actions runs, use the public API, e.g. `curl -s "https://api.github.com/repos/LiquidNexus/pbas/actions/runs?per_page=5"`. Its `head_sha` filter needs the full SHA.

## Commands

```sh
npm ci
npm run conformance          # tsc + lint:check + format:check, the same check the pre-push hook runs
npm run tsc                  # type check only (noEmit; src/tests is excluded)
npm run lint                 # oxlint --type-aware --fix
npm run format               # oxfmt
npm test                     # run all extension tests (live network), writes bundles/tests.json
npm test -- AsuraScans       # test a single extension
npx paperback-cli test --generate NewExt   # scaffold tests for a new extension
npm run bundle               # build bundles/ for all extensions
npm run dev                  # serve bundles with watch; add http://<LAN-IP>:<port> as a repo in the app
npm run logcat               # stream logs from the app
```

Tests hit the real websites, so a failure may come from the site (Cloudflare, layout or API changes) rather than from a code bug.

## Architecture

- Each `src/<Extension>/` with a `pbconfig.ts` is one extension. AsuraScans and LNori are self-contained and share only `src/utils/` (e.g. `getState`, a wrapper around `Application.getState`). The kitty novel sources also use the engine and helper directories listed under [Novel sources from kitty-extensions-0.9](#novel-sources-from-kitty-extensions-09).
- `pbconfig.ts` default-exports the `ExtensionInfo`: name, `version`, capabilities as `SourceIntents`, content rating and badges. `static/icon.png` is the icon it references.
- `main.ts` defines a class implementing `ExtensionImpl<typeof Config>` and exports a singleton (e.g. `export const AsuraScans = new AsuraScansExtension()`). The capabilities declared in `pbconfig.ts` must match the methods implemented.
- The typical split within an extension:
  - `network.ts`: a `PaperbackInterceptor` subclass for headers and Cloudflare detection, plus fetch helpers.
  - `parsers.ts`: site data → Paperback types.
  - `models.ts`: constants and API types.
  - `forms/`: search and settings forms.
- Interceptors and `BasicRateLimiter` are class fields, registered in `initialise()`.
- Runtime globals like `Application` (state, requests, user agent) come from the Paperback runtime, not from imports.
- Each `src/tests/<Extension>.ts` exports `runTests(logger)` and calls `registerDefaultTests` from `src/tests/suite.ts`. That function runs generic checks (search, details, chapters, pages) based on the extension's declared intents. Extra `suite.test(...)` cases can be added. Test files that use chai property assertions need `/* eslint-disable @typescript-eslint/no-unused-expressions */` at the top.

## AsuraScans notes

- **Data source:** almost everything comes from the JSON API at `https://api.asurascans.com/api`. The API rejects requests without `Origin` and `Referer` set to the site; the interceptor adds them.
  - `series?search&sort&order&genres&status&type&min_chapters&limit&offset`: search and the paged discover sections. `sort` is `latest`, `popular`, `rating` or `title`. `genres` is comma-separated and ANDed. Paging uses `meta.has_more`.
  - `series/<slug>`: details. Series that have a linked novel come wrapped in `data`; others don't. Handle both shapes.
  - `series/<slug>/chapters`: the chapter list.
  - `series/<slug>/chapters/<chapter-slug>`: pages, plus `is_locked`.
  - `genres`: the genre list.
- **Homepage sections:** only Featured (`HeroCarouselEmbla`) and Trending (`TrendingSection`) are read from the homepage. They come from Astro `<astro-island>` props, decoded by `utils/props.ts`. Astro encodes every value as `[type, value]`, and `[0]` means undefined.
- **Manga IDs:** an ID is the plain series slug. Public URLs append a site-wide hash (`nano-machine-ab39de10`). The API doesn't need it, so keep it out of IDs to keep library entries stable. Chapter IDs are chapter slugs (`chapter-101`).
- **Early access:** a chapter is locked if `early_access_until` is in the future. If there's no date, `is_premium` decides. Locked chapters are left out of the chapter list.
- **Volumes:** chapters set `volume: 0`. If it's undefined, the app shows "Volume TBA".
- **Novels:** Asura's novels (`linked_novel`, `linked_ebook`, `/api/novels`) are paid ebooks, so they aren't readable through this extension.

## Conventions

- Every source file starts with the SPDX header. The fork keeps upstream's GPL-3.0 license:
  ```ts
  /* SPDX-License-Identifier: GPL-3.0-or-later */
  /* Copyright © 2026 Inkdex */
  ```
- Use `import type` or inline `type` imports. This is enforced by `typescript/consistent-type-imports`, and `verbatimModuleSyntax` is on. Prefix unused vars and args with `_`.
- When modifying an extension, bump `version` in its `pbconfig.ts` (SemVer, `1.0.0-alpha.N`).
- Always rate-limit outgoing requests (e.g. with `BasicRateLimiter`). If the site publishes no limit, use one of these presets: strict 1 req/s, balanced 3 req/s, loose 10 req/s.
- `name` in `pbconfig.ts` must exactly match the website's name. Directory and class names are PascalCase with no spaces or special characters. The icon must be a square PNG, taken from the website where possible.
- Sites without volumes set `volume: 0` on chapters.
- When adding an extension, add it to the README list and generate its test file.
- Commit messages use `type(Scope): summary`, where Scope is the extension name, or `CI` for workflows (e.g. `fix(AsuraScans): Hide "Volume TBA" on chapters`).
- AI-assisted commits carry an `Assisted-by: AGENT_NAME:MODEL_VERSION` trailer (e.g. `Assisted-by: ClaudeCode:claude-opus-5-5`).
