import { access, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createImageCardRenderer } from "./image-card-renderers.js";
import { slugify } from "./social-image-assets.js";
import { ToolPageReader } from "./tool-page-reader.js";
import { ChromiumToolScreenshotProvider, type ToolScreenshotProvider } from "./tool-screenshot-provider.js";
import type {
    ImageCardFormat,
    ImageCardRenderConfig,
    ImageCardRenderOutput,
    ImageCardSource
} from "./social-image-types.js";

export interface RenderToolImageOptions {
    format: ImageCardFormat;
    outputDirectory: string;
    toolImagePath?: string;
    backgroundImagePath?: string;
    subtitle?: string;
    brandAssetPath?: string;
    mascotAssetPath?: string;
    config?: ImageCardRenderConfig;
    toolSelector?: string;
}

export class SocialImageService {
    constructor(
        private readonly pageReader = new ToolPageReader(),
        private readonly screenshotProvider: ToolScreenshotProvider = new ChromiumToolScreenshotProvider()
    ) {}

    async renderFromUrl(url: string, options: RenderToolImageOptions): Promise<ImageCardRenderOutput> {
        const metadata = await this.pageReader.read(url);
        const backgroundImage = await resolveSource(options.backgroundImagePath, metadata.ogImageUrl, "background");
        const toolImage = await this.resolveToolImage(url, metadata.title, options);
        const defaultBrandPath = metadata.brandDomain === "jjlmoya.es" ? "assets/social/jjlmoya-overlay.png" : undefined;
        const brandAsset = await resolveOptionalAsset(options.brandAssetPath ?? defaultBrandPath);
        const mascotAsset = await resolveOptionalAsset(options.mascotAssetPath ?? "assets/social/pixel-cat.png");
        return createImageCardRenderer(options.format, options.config).render(
            {
                metadata,
                format: options.format,
                toolImage,
                backgroundImage,
                ...(options.subtitle ? { subtitle: options.subtitle } : {}),
                ...(brandAsset ? { brandAsset } : {}),
                ...(mascotAsset ? { mascotAsset } : {})
            },
            options.outputDirectory
        );
    }

    private async resolveToolImage(url: string, title: string, options: RenderToolImageOptions): Promise<ImageCardSource> {
        if (options.toolImagePath) {
            return resolveSource(options.toolImagePath, undefined, "tool");
        }
        const screenshotPath = join(options.outputDirectory, `${slugify(title)}-tool.png`);
        await mkdir(options.outputDirectory, { recursive: true });
        try {
            return { path: await this.screenshotProvider.capture(url, screenshotPath, options.toolSelector) };
        } catch (error) {
            if (error instanceof Error && error.message.includes("No se encontró Chrome")) {
                throw new Error(`${error.message}. Pasa --tool-image para usar una captura existente`);
            }
            throw error;
        }
    }
}

async function resolveOptionalAsset(path: string | undefined): Promise<ImageCardSource | undefined> {
    if (!path) {
        return undefined;
    }
    const absolutePath = resolve(path);
    try {
        await access(absolutePath);
        return { path: absolutePath };
    } catch {
        return undefined;
    }
}

async function resolveSource(path: string | undefined, url: string | undefined, role: string): Promise<ImageCardSource> {
    if (path) {
        await access(path);
        return { path: resolve(path) };
    }
    if (url) {
        return { url };
    }
    throw new Error(`La URL no contiene una imagen OG para usar como ${role}`);
}
