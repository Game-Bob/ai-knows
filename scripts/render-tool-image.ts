import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SocialImageService } from "../src/services/social-image-service.js";
import type { ImageCardFormat, ImageCardRenderConfig } from "../src/services/social-image-types.js";

const formats = new Set<ImageCardFormat>(["panoramic", "instagram", "square", "story"]);

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2));
    const url = args.url;
    if (!url) {
        throw new Error("Uso: npm run render:image -- --url <url> [--format panoramic|instagram|square|story]");
    }
    const format = readFormat(args.format);
    const config = args.config ? await readConfig(args.config) : undefined;
    const result = await new SocialImageService().renderFromUrl(url, {
        format,
        outputDirectory: resolve(args.output ?? "tweetImages"),
        ...(args["tool-image"] ? { toolImagePath: args["tool-image"] } : {}),
        ...(args.background ? { backgroundImagePath: args.background } : {}),
        ...(args.subtitle ? { subtitle: args.subtitle } : {}),
        ...(args["brand-asset"] ? { brandAssetPath: args["brand-asset"] } : {}),
        ...(args["mascot-asset"] ? { mascotAssetPath: args["mascot-asset"] } : {}),
        ...(config ? { config } : {}),
        ...(args["tool-selector"] ? { toolSelector: args["tool-selector"] } : {})
    });
    console.log(JSON.stringify(result, null, 2));
}

async function readConfig(path: string): Promise<ImageCardRenderConfig> {
    const content = await readFile(resolve(path), "utf8");
    return JSON.parse(content) as ImageCardRenderConfig;
}

function parseArgs(values: string[]): Record<string, string> {
    const args: Record<string, string> = {};
    for (let index = 0; index < values.length; index += 1) {
        const value = values[index];
        if (value?.startsWith("--")) {
            const key = value.slice(2);
            const next = values[index + 1];
            if (next && !next.startsWith("--")) {
                args[key] = next;
                index += 1;
            }
        }
    }
    return args;
}

function readFormat(value: string | undefined): ImageCardFormat {
    const format = value ?? "panoramic";
    if (!formats.has(format as ImageCardFormat)) {
        throw new Error(`Formato no soportado: ${format}`);
    }
    return format as ImageCardFormat;
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
