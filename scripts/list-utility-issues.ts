import { execSync } from 'node:child_process';

export interface Issue {
    repo: string;
    number: string;
    state: string;
    title: string;
    labels: string;
    date: string;
}

export class GitHubIssueFetcher {
    fetchOpenIssues(owner: string): Issue[] {
        const stdout = execSync(`gh search issues --owner=${owner} --state=open --limit 200`, { encoding: 'utf-8' });
        return this.parseIssues(stdout);
    }

    private parseIssues(stdout: string): Issue[] {
        return stdout
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
                const parts = line.split('\t');
                return {
                    repo: parts[0] || '',
                    number: parts[1] || '',
                    state: parts[2] || '',
                    title: parts[3] || '',
                    labels: parts[4] || '',
                    date: parts[5] || '',
                };
            });
    }
}

export class UtilityIssueFilter {
    filter(issues: Issue[]): Issue[] {
        return issues.filter(issue => issue.repo.includes('jjlmoya-utils-'));
    }
}

export class IssueConsolePrinter {
    printGroupedByRepo(issues: Issue[]): void {
        const groups: Record<string, Issue[]> = {};
        for (const issue of issues) {
            if (!groups[issue.repo]) {
                groups[issue.repo] = [];
            }
            groups[issue.repo].push(issue);
        }

        for (const [repo, repoIssues] of Object.entries(groups)) {
            console.log(`\nRepository: ${repo}`);
            console.log('='.repeat(repo.length + 12));
            for (const issue of repoIssues) {
                console.log(`  #${issue.number} - ${issue.title} (${issue.date.split('T')[0]})`);
                console.log(`  Link: https://github.com/${repo}/issues/${issue.number}`);
                console.log('');
            }
        }
    }
}

const fetcher = new GitHubIssueFetcher();
const filterer = new UtilityIssueFilter();
const printer = new IssueConsolePrinter();

const allIssues = fetcher.fetchOpenIssues('Game-Bob');
const utilityIssues = filterer.filter(allIssues);
printer.printGroupedByRepo(utilityIssues);
