# ai-knows

`ai-knows` is the personal intelligence hub for GameBob Studio. It serves as the bridge between raw, live web data and strategic decision-making. By consolidating data from over 390 independent web utilities, this repository automates the extraction and structuring process, creating a "source of truth" for AI-assisted business analysis.

## Mission
To transform local-first performance data and user interaction metrics into actionable business insights without relying on third-party tracking or bloated server dependencies.

## Workflow
1.  **Extract**: Automated scraping/API calls targeting local-first web utilities.
2.  **Consolidate**: Aggregation into a structured, lightweight format (JSON/Markdown).
3.  **Analyze**: Feeding the structured context into LLMs to simulate strategic brainstorming, performance post-mortems, and growth planning.

## Directory Structure
- `/scripts`: Extraction logic and API hooks.
- `/data`: The generated "truth" (local database dump).
- `/docs`: Strategy notes and post-mortems.

## Setup
1.  **Clone the repo**: `git clone git@github.com:jjlmoya/ai-knows.git`
2.  **Initialize**: Run the sync script to pull the latest metrics from your local stack.
3.  **Analyze**: Upload the generated `/data` folder to your preferred AI environment.

---
*Don't ask the universe, ask the repo. ai-knows what's going on in GameBob Studio.*
