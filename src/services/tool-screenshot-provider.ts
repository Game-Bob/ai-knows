import { access } from "node:fs/promises";
import { chromium, type Page } from "playwright-core";

export interface ToolScreenshotProvider {
    capture(url: string, outputPath: string, selector?: string): Promise<string>;
}

export class ChromiumToolScreenshotProvider implements ToolScreenshotProvider {
    async capture(url: string, outputPath: string, selector?: string): Promise<string> {
        const browser = await chromium.launch({
            headless: true,
            executablePath: await findBrowserExecutable()
        });
        try {
            const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
            await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
            await page.waitForTimeout(500);
            const toolSelector = selector ?? await findToolSelector(page);
            await page.locator(toolSelector).first().screenshot({ path: outputPath });
            return outputPath;
        } finally {
            await browser.close();
        }
    }
}

async function findBrowserExecutable(): Promise<string> {
    const candidates = [
        process.env["CHROME_PATH"],
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    ].filter((candidate): candidate is string => Boolean(candidate));
    for (const candidate of candidates) {
        if (await isFile(candidate)) {
            return candidate;
        }
    }
    throw new Error("No se encontró Chrome o Edge. Define CHROME_PATH para capturar la herramienta automáticamente");
}

async function isFile(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function findToolSelector(page: Page): Promise<string> {
    const selector = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-tool-container], [id], [aria-label]"));
        const visible = candidates.filter((element) => {
            const rect = element.getBoundingClientRect();
            const label = element.getAttribute("aria-label")?.toLowerCase() ?? "";
            return rect.width > window.innerWidth * 0.45 && rect.height > window.innerHeight * 0.35 && !/idioma|language|menu|header|footer|nav/u.test(label);
        });
        const candidate = visible.sort((left, right) => area(right) - area(left))[0];
        if (!candidate) {
            return "main";
        }
        if (candidate.id) {
            return `#${candidate.id}`;
        }
        const label = candidate.getAttribute("aria-label");
        return label ? `[aria-label=${JSON.stringify(label)}]` : "[data-tool-container]";

        function area(element: HTMLElement): number {
            const rect = element.getBoundingClientRect();
            return rect.width * rect.height;
        }
    });
    return selector;
}
