# FOOTHOLD local Figma plugin

[한국어](./README.ko.md) · English

The plugin synchronizes canonical Git sources into the existing FOOTHOLD Figma file without consuming Figma MCP calls. It never writes to Git and has no network access.

## One-time setup

Figma assigns plugin IDs. In the Figma desktop app:

1. Open a design file.
2. Choose **Plugins → Development → New plugin**.
3. Choose **Figma design** and **Custom UI** and save the temporary plugin anywhere.
4. Copy the numeric `id` from its generated `manifest.json`.
5. From this repository, run:

   ```bash
   node scripts/configure-plugin.mjs YOUR_NUMERIC_ID
   ```

6. In Figma desktop choose **Plugins → Development → Import plugin from manifest** and select `figma/plugin/manifest.json`.

The generated `manifest.json` is intentionally ignored by Git because the development ID belongs to the local Figma account context.

## Commands

- **Inspect file**: read-only inventory of pages, collections, variables, and styles.
- **Sync foundations**: idempotently creates or updates the five Starter-compatible variable collections and five text styles.
- **Build Master Board skeleton**: creates or updates the three-page structure and evidence-aware M01–M10 skeleton.
- **Export review package**: downloads a JSON + SVG + PNG bundle. The package is a change proposal, not an automatic Git update.

## Safety

- The plugin only updates objects carrying its exact `foothold.owner` key or exact canonical variable identities.
- It never deletes pages, variables, components, or user-owned nodes.
- It stops rather than creating a fourth page on Starter.
- It does not invent pending project facts.
