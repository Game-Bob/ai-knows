import { mkdir, writeFile } from "node:fs/promises";
import type { TextWriter } from "./types.js";

export const fileWriter: TextWriter = {
    async ensureDir(path) {
        await mkdir(path, { recursive: true });
    },
    async writeText(path, content) {
        await writeFile(path, content, "utf8");
    }
};
