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

---
*Don't ask the universe, ask the repo. ai-knows what's going on in GameBob Studio.*
