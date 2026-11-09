# Qissa Studio Packs

Free, hand-checked packs for [Qissa Studio](https://qissa-packs.vercel.app): people, places, animals, faith items,
sounds, backgrounds and fonts. Every pack is CC0 or MIT style; its licence is inside the pack.

## Layout

- `packs/<id>/` one pack: `pack.json` (with `category`), its pictures / sounds, and a `LICENSE` file
- `site/` the website (static; Vercel serves it). `catalog.json` and `previews/` are generated
- `market.json` where the zips are published (this repo's GitHub Releases)

## Publishing a pack (maintainer)

1. Add or update `packs/<id>/` and bump its `version`.
2. From the Qissa Studio project: `node cli/bin/reel.js pack market <this folder>`
   (checks every pack, zips it to `dist/<id>-<version>.zip`, writes previews and `site/catalog.json`).
3. Publish the zip as a release: `gh release create <id>-v<version> dist/<id>-<version>.zip --title "<name> <version>"`.
4. Commit and push; Vercel redeploys the site.

Only the maintainer publishes packs. Suggestions are welcome as issues.
