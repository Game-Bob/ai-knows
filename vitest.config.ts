import { defineConfig } from "vitest/config";

export default defineConfig({
    cacheDir: ".vitest-cache",
    test: {
        coverage: {
            enabled: false
        },
        globals: false,
        include: ["tests/**/*.test.ts"]
    }
});
