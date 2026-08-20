export type ImageCardFormat = "panoramic" | "instagram" | "square" | "story";

export interface ImageCardBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageCardLayout {
    width: number;
    height: number;
    panel: ImageCardBox;
    subtitle: ImageCardBox;
    brand: ImageCardBox;
    mascot: ImageCardBox;
}

export interface ImageCardTheme {
    panelFill: string;
    panelBorder: string;
    subtitleFill: string;
    subtitleBorder: string;
    subtitleText: string;
    accent: string;
    brandFill: string;
    brandBorder: string;
    brandText: string;
    fontFamily: string;
}

export interface ImageCardLayoutOverride {
    width?: number;
    height?: number;
    panel?: Partial<ImageCardBox>;
    subtitle?: Partial<ImageCardBox>;
    brand?: Partial<ImageCardBox>;
    mascot?: Partial<ImageCardBox>;
}

export interface ImageCardRenderConfig {
    layouts?: Partial<Record<ImageCardFormat, ImageCardLayoutOverride>>;
    theme?: Partial<ImageCardTheme>;
}

export interface ToolPageMetadata {
    url: string;
    title: string;
    description?: string;
    ogImageUrl?: string;
    brandDomain: "jjlmoya.es" | "gamebob.dev";
}

export interface ImageCardSource {
    path?: string;
    url?: string;
}

export interface ImageCardRenderInput {
    metadata: ToolPageMetadata;
    format: ImageCardFormat;
    toolImage: ImageCardSource;
    backgroundImage: ImageCardSource;
    subtitle?: string;
    brandAsset?: ImageCardSource;
    mascotAsset?: ImageCardSource;
}

export interface ImageCardRenderOutput {
    format: ImageCardFormat;
    width: number;
    height: number;
    svgPath: string;
    pngPath: string;
}

export interface ImageCardRenderer {
    readonly format: ImageCardFormat;
    render(input: ImageCardRenderInput, outputDirectory: string): Promise<ImageCardRenderOutput>;
}
