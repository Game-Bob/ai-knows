import type { SitemapDocument, SitemapEntry } from "./types.js";

type SitemapTree = {
    apps: Map<string, SitemapEntry[]>;
    utilities: Map<string, SitemapEntry[]>;
};

export function sitemapToMarkdown(document: SitemapDocument): string {
    const tree = createSitemapTree(document.entries);
    const lines = [
        `# ${document.target.title}`,
        "",
        `Source: ${document.source.url}`,
        `Generated at: ${document.generatedAt.toISOString()}`,
        `Relevant URLs: ${countTreeEntries(tree)}`,
        ""
    ];

    lines.push(...sectionToMarkdown("Apps", tree.apps));
    lines.push(...sectionToMarkdown("Utilities", tree.utilities));

    return `${lines.join("\n").trimEnd()}\n`;
}

function createSitemapTree(entries: SitemapEntry[]): SitemapTree {
    return entries.reduce<SitemapTree>(
        (tree, entry) => {
            addEntry(tree, entry);
            return tree;
        },
        { apps: new Map(), utilities: new Map() }
    );
}

function addEntry(tree: SitemapTree, entry: SitemapEntry): void {
    const pathname = new URL(entry.url).pathname;
    const segments = pathname.split("/").filter(Boolean);
    const appIndex = segments.indexOf("apps");
    const categoryIndex = segments.indexOf("categories");

    const app = segments[appIndex + 1];
    const category = segments[categoryIndex + 1];

    if (appIndex >= 0 && app !== undefined) {
        addGroupedEntry(tree.apps, app, entry);
    }

    if (categoryIndex >= 0 && category !== undefined) {
        addGroupedEntry(tree.utilities, category, entry);
    }
}

function addGroupedEntry(groups: Map<string, SitemapEntry[]>, key: string, entry: SitemapEntry): void {
    groups.set(key, [...(groups.get(key) ?? []), entry]);
}

function sectionToMarkdown(title: string, groups: Map<string, SitemapEntry[]>): string[] {
    if (groups.size === 0) {
        return [];
    }

    const lines = [`## ${title}`, ""];

    for (const [group, entries] of [...groups.entries()].sort(compareGroups)) {
        lines.push(`### ${humanizeSlug(group)}`);
        lines.push("");
        lines.push(...entriesToMarkdown(entries));
        lines.push("");
    }

    return lines;
}

function entriesToMarkdown(entries: SitemapEntry[]): string[] {
    return entries.map((entry) => `- ${humanizeSlug(lastSegment(entry.url))}: ${entry.url}`);
}

function countTreeEntries(tree: SitemapTree): number {
    return sumEntries(tree.apps) + sumEntries(tree.utilities);
}

function sumEntries(groups: Map<string, SitemapEntry[]>): number {
    return [...groups.values()].reduce((total, entries) => total + entries.length, 0);
}

function compareGroups(left: [string, SitemapEntry[]], right: [string, SitemapEntry[]]): number {
    return left[0].localeCompare(right[0]);
}

function lastSegment(url: string): string {
    return new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? url;
}

function humanizeSlug(slug: string): string {
    return slug
        .split("-")
        .filter(Boolean)
        .map(capitalize)
        .join(" ");
}

function capitalize(value: string): string {
    return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
