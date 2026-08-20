import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { escapeXml, slugify, sourceDimensions, sourceToDataUri } from "./social-image-assets.js";
import type {
    ImageCardFormat,
    ImageCardLayout,
    ImageCardRenderConfig,
    ImageCardRenderInput,
    ImageCardRenderOutput,
    ImageCardRenderer,
    ImageCardTheme
} from "./social-image-types.js";

const defaultLayouts: Record<ImageCardFormat, ImageCardLayout> = {
    panoramic: {
        width: 1536,
        height: 1024,
        panel: { x: 430, y: 170, width: 1067, height: 667 },
        subtitle: { x: 560, y: 82, width: 620, height: 112 },
        brand: { x: 1288, y: 858, width: 178, height: 64 },
        mascot: { x: 1170, y: 830, width: 104, height: 104 }
    },
    instagram: {
        width: 1080,
        height: 1350,
        panel: { x: 45, y: 390, width: 990, height: 619 },
        subtitle: { x: 45, y: 150, width: 990, height: 130 },
        brand: { x: 790, y: 1080, width: 220, height: 80 },
        mascot: { x: 650, y: 1060, width: 120, height: 120 }
    },
    square: {
        width: 1080,
        height: 1080,
        panel: { x: 45, y: 310, width: 990, height: 619 },
        subtitle: { x: 45, y: 110, width: 990, height: 130 },
        brand: { x: 790, y: 965, width: 220, height: 80 },
        mascot: { x: 650, y: 945, width: 120, height: 120 }
    },
    story: {
        width: 1080,
        height: 1920,
        panel: { x: 40, y: 760, width: 1000, height: 625 },
        subtitle: { x: 40, y: 250, width: 1000, height: 140 },
        brand: { x: 760, y: 1480, width: 250, height: 90 },
        mascot: { x: 610, y: 1450, width: 135, height: 135 }
    }
};

const defaultTheme: ImageCardTheme = {
    panelFill: "#16110b",
    panelBorder: "#f7ebd7",
    subtitleFill: "#f7ebd7",
    subtitleBorder: "#08182b",
    subtitleText: "#08182b",
    accent: "#c45a2f",
    brandFill: "#f7ebd7",
    brandBorder: "#08182b",
    brandText: "#08182b",
    fontFamily: "Georgia, serif"
};

export class ImageCardRenderPanoramicRender implements ImageCardRenderer {
    readonly format = "panoramic" as const;

    constructor(private readonly config: ImageCardRenderConfig = {}) {}

    render(input: ImageCardRenderInput, outputDirectory: string): Promise<ImageCardRenderOutput> {
        return renderImageCard(this.format, input, outputDirectory, this.config);
    }
}

export class ImageCardRenderInstagramRender implements ImageCardRenderer {
    readonly format = "instagram" as const;

    constructor(private readonly config: ImageCardRenderConfig = {}) {}

    render(input: ImageCardRenderInput, outputDirectory: string): Promise<ImageCardRenderOutput> {
        return renderImageCard(this.format, input, outputDirectory, this.config);
    }
}

export class ImageCardRenderSquareRender implements ImageCardRenderer {
    readonly format = "square" as const;

    constructor(private readonly config: ImageCardRenderConfig = {}) {}

    render(input: ImageCardRenderInput, outputDirectory: string): Promise<ImageCardRenderOutput> {
        return renderImageCard(this.format, input, outputDirectory, this.config);
    }
}

export class ImageCardRenderStoryRender implements ImageCardRenderer {
    readonly format = "story" as const;

    constructor(private readonly config: ImageCardRenderConfig = {}) {}

    render(input: ImageCardRenderInput, outputDirectory: string): Promise<ImageCardRenderOutput> {
        return renderImageCard(this.format, input, outputDirectory, this.config);
    }
}

export function createImageCardRenderer(format: ImageCardFormat, config: ImageCardRenderConfig = {}): ImageCardRenderer {
    const renderers: Record<ImageCardFormat, ImageCardRenderer> = {
        panoramic: new ImageCardRenderPanoramicRender(config),
        instagram: new ImageCardRenderInstagramRender(config),
        square: new ImageCardRenderSquareRender(config),
        story: new ImageCardRenderStoryRender(config)
    };
    return renderers[format];
}

interface Assets {
    background: string;
    tool: string;
    toolDimensions: { width: number; height: number };
    brand?: string;
    mascot?: string;
}

async function renderImageCard(format: ImageCardFormat, input: ImageCardRenderInput, outputDirectory: string, config: ImageCardRenderConfig): Promise<ImageCardRenderOutput> {
    const layout = resolveLayout(format, config);
    const theme = { ...defaultTheme, ...config.theme };
    const assets = await loadAssets(input);
    const svg = buildSvg(input, layout, theme, assets);
    await mkdir(outputDirectory, { recursive: true });
    const stem = `${slugify(input.metadata.title)}-${format}`;
    const svgPath = join(outputDirectory, `${stem}.svg`);
    const pngPath = join(outputDirectory, `${stem}.png`);
    await writeFile(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    return { format, width: layout.width, height: layout.height, svgPath, pngPath };
}

async function loadAssets(input: ImageCardRenderInput): Promise<Assets> {
    const background = await sourceToDataUri(input.backgroundImage);
    const tool = await sourceToDataUri(input.toolImage);
    const toolDimensions = await sourceDimensions(input.toolImage);
    const brand = input.brandAsset ? await sourceToDataUri(input.brandAsset) : undefined;
    const mascot = input.mascotAsset ? await sourceToDataUri(input.mascotAsset) : undefined;
    return { background, tool, toolDimensions, ...(brand ? { brand } : {}), ...(mascot ? { mascot } : {}) };
}

function buildSvg(input: ImageCardRenderInput, layout: ImageCardLayout, theme: ImageCardTheme, assets: Assets): string {
    const subtitle = input.subtitle ?? input.metadata.title;
    const lines = wrapText(subtitle, Math.max(22, Math.floor(layout.subtitle.width / 16)));
    const panel = layout.panel;
    const clipId = `tool-panel-${input.format}`;
    const toolBox = containBox(panel, assets.toolDimensions);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">
${backgroundSvg(assets.background, layout)}
<defs><clipPath id="${clipId}"><rect x="${toolBox.x}" y="${toolBox.y}" width="${toolBox.width}" height="${toolBox.height}" rx="30"/></clipPath><filter id="shadow"><feGaussianBlur stdDeviation="18"/></filter></defs>
<rect x="${toolBox.x + 12}" y="${toolBox.y + 18}" width="${toolBox.width}" height="${toolBox.height}" rx="30" fill="#081221" opacity=".75" filter="url(#shadow)"/>
<rect x="${toolBox.x}" y="${toolBox.y}" width="${toolBox.width}" height="${toolBox.height}" rx="30" fill="${theme.panelFill}"/>
<image href="${assets.tool}" x="${toolBox.x}" y="${toolBox.y}" width="${toolBox.width}" height="${toolBox.height}" preserveAspectRatio="none" clip-path="url(#${clipId})"/>
<rect x="${toolBox.x}" y="${toolBox.y}" width="${toolBox.width}" height="${toolBox.height}" rx="30" fill="none" stroke="${theme.panelBorder}" stroke-width="3"/>
${subtitleSvg(lines, layout.subtitle, theme)}
${brandSvg(input, assets, layout, theme)}
</svg>`;
}

function containBox(box: ImageCardLayout["panel"], image: { width: number; height: number }): ImageCardLayout["panel"] {
    const ratio = Math.min(box.width / image.width, box.height / image.height);
    const width = image.width * ratio;
    const height = image.height * ratio;
    return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

function backgroundSvg(dataUri: string, layout: ImageCardLayout): string {
    return `<image href="${dataUri}" x="0" y="0" width="${layout.width}" height="${layout.height}" preserveAspectRatio="xMidYMid slice"/>`;
}

function subtitleSvg(lines: string[], box: ImageCardLayout["subtitle"], theme: ImageCardTheme): string {
    const lineHeight = 30;
    const textY = box.y + 50;
    const text = lines.map((line, index) => `<tspan x="${box.x + 34}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join("");
    return `<rect x="${box.x + 8}" y="${box.y + 10}" width="${box.width}" height="${box.height}" rx="24" fill="#08182b" opacity=".16" filter="url(#shadow)"/><rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="24" fill="${theme.subtitleFill}" stroke="${theme.subtitleBorder}" stroke-width="2"/><rect x="${box.x + 34}" y="${box.y + 29}" width="48" height="4" rx="2" fill="${theme.accent}"/><circle cx="${box.x + 92}" cy="${box.y + 31}" r="4" fill="${theme.accent}" opacity=".82"/><text x="${box.x + 34}" y="${textY}" fill="${theme.subtitleText}" font-family="${escapeXml(theme.fontFamily)}" font-size="25" font-weight="700">${text}</text><rect x="${box.x + 34}" y="${box.y + box.height - 18}" width="78" height="3" rx="2" fill="${theme.accent}"/>`;
}

function brandSvg(input: ImageCardRenderInput, assets: Assets, layout: ImageCardLayout, theme: ImageCardTheme): string {
    const box = layout.brand;
    const mascotBox = layout.mascot;
    const mascot = assets.mascot ? `<image href="${assets.mascot}" x="${mascotBox.x}" y="${mascotBox.y}" width="${mascotBox.width}" height="${mascotBox.height}" preserveAspectRatio="xMidYMid meet"/>` : "";
    if (assets.brand && input.metadata.brandDomain === "jjlmoya.es") {
        return `${mascot}<image href="${assets.brand}" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    if (input.metadata.brandDomain === "gamebob.dev") {
        const fontSize = Math.max(20, box.height * 0.38);
        return `${mascot}<text x="${box.x + box.width / 2}" y="${box.y + box.height * 0.63}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="800"><tspan fill="#f4f6fb">Game</tspan><tspan fill="#11d6c4">Bob</tspan><tspan fill="#f4f6fb">.dev</tspan></text>`;
    }
    return `${mascot}<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${box.height / 2}" fill="${theme.brandFill}" stroke="${theme.brandBorder}" stroke-width="2"/><text x="${box.x + box.width / 2}" y="${box.y + box.height * 0.63}" text-anchor="middle" fill="${theme.brandText}" font-family="Arial, sans-serif" font-size="${Math.max(20, box.height * 0.34)}" font-weight="700">${escapeXml(input.metadata.brandDomain)}</text>`;
}

function resolveLayout(format: ImageCardFormat, config: ImageCardRenderConfig): ImageCardLayout {
    const base = defaultLayouts[format];
    const override = config.layouts?.[format];
    return {
        ...base,
        ...override,
        panel: { ...base.panel, ...override?.panel },
        subtitle: { ...base.subtitle, ...override?.subtitle },
        brand: { ...base.brand, ...override?.brand },
        mascot: { ...base.mascot, ...override?.mascot }
    };
}

function wrapText(value: string, maxCharacters: number): string[] {
    const words = value.split(/\s+/u);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > maxCharacters && current) {
            lines.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines.slice(0, 2);
}
