import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
    createManifest,
    diffManifests,
    filePathToRoute,
    resolvePageUrl,
} from "../../scripts/indexnow/indexnow.mjs";

const tempRoot = join(process.cwd(), ".vitest-indexnow");

afterEach(async () => {
    await rm(tempRoot, { recursive: true, force: true });
});

describe("IndexNow page manifests", () => {
    it("converts Astro index files into trailing-slash routes", () => {
        expect(filePathToRoute("en/games/axon-surge/index.html")).toBe("/en/games/axon-surge/");
        expect(filePathToRoute("index.html")).toBe("/");
        expect(filePathToRoute("404.html")).toBeNull();
    });

    it("selects the most specific domain prefix", () => {
        expect(
            resolvePageUrl("/juegos/axon-surge/", [
                { baseUrl: "https://www.gamebob.dev", pathPrefixes: ["/"] },
                { baseUrl: "https://www.jjlmoya.es", pathPrefixes: ["/juegos/"] },
            ])
        ).toBe("https://www.jjlmoya.es/juegos/axon-surge/");
    });

    it("detects changed, new and deleted pages from hashes", async () => {
        const dist = join(tempRoot, "dist");
        await mkdir(join(dist, "juegos", "old"), { recursive: true });
        await mkdir(join(dist, "juegos", "new"), { recursive: true });
        await writeFile(join(dist, "juegos", "old", "index.html"), "updated");
        await writeFile(join(dist, "juegos", "new", "index.html"), "new");
        const current = await createManifest({
            dist,
            routeMap: [{ baseUrl: "https://www.jjlmoya.es", pathPrefixes: ["/juegos/"] }],
        });
        const previous = {
            pages: {
                "https://www.jjlmoya.es/juegos/old/": { hash: "old-hash" },
                "https://www.jjlmoya.es/juegos/removed/": { hash: "removed-hash" },
            },
        };
        expect(diffManifests(previous, current)).toMatchObject({
            changedUrls: ["https://www.jjlmoya.es/juegos/new/", "https://www.jjlmoya.es/juegos/old/"],
            deletedUrls: ["https://www.jjlmoya.es/juegos/removed/"],
        });
    });
});
