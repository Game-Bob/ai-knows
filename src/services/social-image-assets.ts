import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import sharp from "sharp";
import type { ImageCardSource } from "./social-image-types.js";

const mimeTypes: Record<string, string> = {
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};

export async function sourceToDataUri(source: ImageCardSource): Promise<string> {
    if (source.path) {
        const data = await readFile(source.path);
        return imageDataUri(data, mimeTypes[extname(source.path).toLowerCase()]);
    }
    if (source.url) {
        const response = await fetch(source.url);
        if (!response.ok) {
            throw new Error(`No se pudo descargar la imagen: HTTP ${response.status}`);
        }
        const data = Buffer.from(await response.arrayBuffer());
        return imageDataUri(data, response.headers.get("content-type")?.split(";", 1)[0]);
    }
    throw new Error("Falta una fuente de imagen");
}

export async function sourceDimensions(source: ImageCardSource): Promise<{ width: number; height: number }> {
    const data = source.path ? await readFile(source.path) : await downloadSource(source);
    const metadata = await sharp(data).metadata();
    if (!metadata.width || !metadata.height) {
        throw new Error("No se pudo leer el tamaño de la imagen");
    }
    return { width: metadata.width, height: metadata.height };
}

async function downloadSource(source: ImageCardSource): Promise<Buffer> {
    if (!source.url) {
        throw new Error("Falta una fuente de imagen");
    }
    const response = await fetch(source.url);
    if (!response.ok) {
        throw new Error(`No se pudo descargar la imagen: HTTP ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

async function imageDataUri(data: Buffer, mimeType: string | undefined): Promise<string> {
    if (mimeType === "image/png") {
        return `data:image/png;base64,${data.toString("base64")}`;
    }
    const png = await sharp(data).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
}

export function escapeXml(value: string): string {
    return value
        .replace(/&/gu, "&amp;")
        .replace(/</gu, "&lt;")
        .replace(/>/gu, "&gt;")
        .replace(/"/gu, "&quot;")
        .replace(/'/gu, "&apos;");
}

export function slugify(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, "-")
        .replace(/^-+|-+$/gu, "")
        .slice(0, 70);
}
