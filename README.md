# ai-knows

`ai-knows` is the personal intelligence hub for GameBob Studio. It serves as the bridge between raw, live web data and strategic decision-making. By consolidating data from over 390 independent web utilities, this repository automates the extraction and structuring process, creating a "source of truth" for AI-assisted business analysis.

## Mission
To transform local-first performance data and user interaction metrics into actionable business insights without relying on third-party tracking or bloated server dependencies.

## Workflow
1.  **Extract**: Automated scraping/API calls targeting local-first web utilities.
2.  **Consolidate**: Aggregation into a structured, lightweight format (JSON/Markdown).
3.  **Analyze**: Feeding the structured context into LLMs to simulate strategic brainstorming, performance post-mortems, and growth planning.

## Directory Structure
- `/src/core`: Shared pipeline, contracts, context, and IO helpers.
- `/src/skills`: Independent extraction skills. Each skill owns one data source.
- `/src/exporters`: Output formats for AI tools such as NotebookLM.
- `/data/raw`: Untouched downloaded payloads.
- `/data/normalized`: Contract-based JSON generated from raw data.
- `/data/notebooklm`: Markdown files ready to upload to NotebookLM.
- `/docs`: Architecture, strategy notes, and post-mortems.

## Setup
1.  **Clone the repo**: `git clone git@github.com:jjlmoya/ai-knows.git`
2.  **Use Node 22+**: The first version avoids runtime dependencies.
3.  **List skills**: `npm run list:skills`
4.  **Sync sitemaps**: `npm run sync:sitemaps`
5.  **Analyze**: Upload the generated `/data/notebooklm` files to your preferred AI environment.

## Current Architecture

The project is intentionally modular. A skill extracts one source, stores the raw payload, normalizes it into the shared `KnowledgeItem` contract, and exporters convert that contract into AI-ready files.

See [`docs/architecture.md`](docs/architecture.md) for the extension model.

## Social image renderer

The image renderer creates the reusable composition for tool posts from a production URL. It reads the page title, description, OG image and brand domain from `jjlmoya.es` or `gamebob.dev`, opens the page in headless Chrome or Edge, captures the real tool container and combines it with the background.

```bash
npm run render:image -- \
  --url https://www.jjlmoya.es/utilidades/alcance-telescopio/ \
  --format panoramic \
  --tool-image tweetImages/alcance-telescopio-tool.png \
  --background tweetImages/alcance-telescopio-background.png \
  --brand-asset tweetImages/jjlmoya-overlay.png
```

Available formats are `panoramic`, `instagram`, `square` and `story`. The renderer writes both SVG and PNG files to `tweetImages/`, which is ignored by Git. If no background is supplied, it uses the page OG image. If no `--tool-image` is supplied, it captures the tool automatically; pass `--tool-selector` only when a page needs a custom container selector.

The automatic capture looks for the shared tool container structure used by the sites. If the machine has no Chrome or Edge, define `CHROME_PATH` or pass an existing capture with `--tool-image`.

The shared identity uses `assets/social/jjlmoya-overlay.png` and `assets/social/pixel-cat.png` by default for `jjlmoya.es`. The mascot can be replaced with `--mascot-asset`, and its position is configurable per format.

The composition can be adjusted without changing the renderer by passing a JSON file with `--config`:

```bash
npm run render:image -- --url https://www.gamebob.dev/en/tools/example/ --format instagram --config social-image-config.example.json
```

The configuration overrides per-format positions and the shared palette, so the same renderer can produce consistent cards for different platforms and brands.

### Visual editor

For manual composition, run:

```bash
npm run editor
```

Open `http://127.0.0.1:4173`. You can paste a production URL to load its title, OG background and real tool capture automatically. You can also replace the background, tool capture, logo and mascot manually, edit the title, move layers on the canvas, scale them, change the shared colors and download the final PNG. The automatic URL renderer and the visual editor use the same layout presets and brand assets.

---
*Don't ask the universe, ask the repo. ai-knows what's going on in GameBob Studio.*
