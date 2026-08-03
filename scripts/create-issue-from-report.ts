import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

export interface ActionIssue {
    categorySlug: string;
    title: string;
    body: string;
}

export class ReportIssueCreator {
    async processReport(filePath: string, owner: string = 'Game-Bob'): Promise<void> {
        const content = await readFile(filePath, 'utf-8');
        const issues = this.parseReport(content);

        for (const issue of issues) {
            const repo = `${owner}/jjlmoya-utils-${issue.categorySlug}`;
            console.log(`[INFO] Creating issue in repo ${repo}: ${issue.title}`);
            try {
                const cmd = `gh issue create --repo ${repo} --title "${issue.title.replace(/"/g, '\\"')}" --body "${issue.body.replace(/"/g, '\\"')}"`;
                execSync(cmd, { stdio: 'inherit' });
            } catch (err) {
                console.error(`[ERROR] Failed to create issue in ${repo}:`, err);
            }
        }
    }

    private parseReport(content: string): ActionIssue[] {
        const lines = content.split('\n');
        const issues: ActionIssue[] = [];
        let currentTitle = '';
        let currentBody: string[] = [];
        let currentCategory = 'general';

        for (const line of lines) {
            if (line.match(/^#+\s+\d+\./) || line.match(/^\d+\.\s+/)) {
                if (currentTitle) {
                    issues.push({
                        categorySlug: currentCategory,
                        title: currentTitle,
                        body: currentBody.join('\n')
                    });
                }
                currentTitle = line.replace(/^#+\s+/, '').trim();
                currentBody = [];
                currentCategory = this.extractCategory(currentTitle);
            } else if (currentTitle) {
                currentBody.push(line);
                if (line.includes('Categoría') || line.includes('Vertical')) {
                    currentCategory = this.extractCategory(line);
                }
            }
        }

        if (currentTitle) {
            issues.push({
                categorySlug: currentCategory,
                title: currentTitle,
                body: currentBody.join('\n')
            });
        }

        return issues;
    }

    private extractCategory(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes('deporte') || lower.includes('sports') || lower.includes('marcador')) return 'sports';
        if (lower.includes('trabajo') || lower.includes('work') || lower.includes('interes')) return 'work';
        if (lower.includes('salud') || lower.includes('health') || lower.includes('medicina')) return 'health';
        if (lower.includes('hardware') || lower.includes('gamepad')) return 'hardware-tools';
        if (lower.includes('3d')) return '3d-printing';
        if (lower.includes('cocina') || lower.includes('cooking')) return 'cooking';
        return 'general';
    }
}
