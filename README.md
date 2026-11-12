# PBAS

Personal Paperback 0.9 extensions, forked from [inkdex/general-extensions](https://github.com/inkdex/general-extensions).

## Available Extensions

- [AsuraScans](https://asurascans.com), a 0.9 port of [Ivanmatthew's 0.8 extension](https://github.com/Ivanmatthew/ivans-paperback-extensions)
- [LNori](https://lnori.com), light novels, from upstream

Novel sources copied from [kittycatgit/kitty-extensions-0.9](https://github.com/kittycatgit/kitty-extensions-0.9) (GPL-3.0):

- [DanmeiNovel](https://danmeinovel.com)
- [DivaScans](https://divascans.org), comics and novels
- [DivineDaoLibrary](https://www.divinedaolibrary.com)
- [ExiledRebels](https://exiledrebelsscanlations.com)
- [FanFiction](https://www.fanfiction.net)
- [Foxaholic](https://www.foxaholic.com)
- [KnoxT](https://knoxt.space)
- [LazyGirlTranslations](https://lazygirltranslations.com)
- [NoodleBrainSquad](https://noodlebrainsquad.org)
- [NuviaToon](https://nuviatoon.org), comics and novels
- [PandaTranslations](https://panda-translations.com)
- [ReadNovel](https://readnovel.eu)
- [ScribbleHub](https://www.scribblehub.com)
- [SirenScans](https://sirenscans.org), comics and novels
- [SleepyTranslations](https://sleepytranslations.com)
- [XNovel](https://xnovel.me)

## Installation

Add this repository in Paperback: `https://liquidnexus.github.io/pbas/0.9/stable`

For local testing, run `npm run dev` and add `http://<your-computer's-LAN-IP>:<port>` (the port is printed on startup) as a repository instead.

## Development

```sh
npm ci
npm run conformance          # type check, lint, format check
npm test -- AsuraScans       # live tests against the site
npm run dev                  # serve bundles with watch for the Paperback app
npm run logcat               # stream logs from the app
```

To pick up upstream toolchain or CI fixes: `git fetch upstream && git merge upstream/0.9/stable`.
