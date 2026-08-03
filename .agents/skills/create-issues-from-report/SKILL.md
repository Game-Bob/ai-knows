---
name: create-issues-from-report
description: Parses NotebookLM strategy reports or action plans and automatically creates GitHub issues in target category repositories named jjl-moya-utils-${category}.
---

# Create Issues From Report Skill

This skill parses a NotebookLM strategy report provided by the user, extracts individual action items, maps them to their respective category repository, and executes `gh issue create`.

## Target Repository Convention
Target repositories follow the convention:
- Local path: `d:\code\jjlmoya-utils-${category}`
- GitHub Repository format: `Game-Bob/jjlmoya-utils-${category}` (or as configured).

## Workflow

1. **Parse Input Report**:
   - Extract title, affected URLs, category, and execution details for each action item in the report.

2. **Determine Target Category Repository**:
   - Normalize category name into lowercase slug (e.g., `Sports` -> `sports`, `Hardware Tools` -> `hardware-tools`).
   - Construct repo name: `jjlmoya-utils-${categorySlug}`.

3. **Create Issue via gh CLI**:
   - Run `gh issue create` command targeting the specific category repository:
     ```bash
     gh issue create --repo Game-Bob/jjlmoya-utils-${categorySlug} --title "${actionTitle}" --body "${actionBody}"
     ```
