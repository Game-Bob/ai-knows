import { describe, expect, it } from "vitest";
import { getBrandDomain, getDefaultSubtitle, ToolPageReader, type PageFetcher } from "../src/services/tool-page-reader.js";

describe("ToolPageReader", () => {
    it("reads the title, description, OG image and brand from a production page", async () => {
        const html = `
            <html>
                <head>
                    <title>Fallback title</title>
                    <meta property="og:title" content="Calculadora de &amp; alcance">
                    <meta property="og:description" content="Mide el alcance. Con una segunda frase.">
                    <meta property="og:image" content="/social/card.png">
                </head>
            </html>
        `;
        const fetcher: PageFetcher = async () => new Response(html, { status: 200 });
        const metadata = await new ToolPageReader(fetcher).read("https://www.jjlmoya.es/utilidades/alcance/");

        expect(metadata).toEqual({
            url: "https://www.jjlmoya.es/utilidades/alcance/",
            title: "Calculadora de & alcance",
            description: "Mide el alcance. Con una segunda frase.",
            ogImageUrl: "https://www.jjlmoya.es/social/card.png",
            brandDomain: "jjlmoya.es"
        });
        expect(getDefaultSubtitle(metadata)).toBe("Mide el alcance");
    });

    it("accepts the two supported brands and rejects other domains", () => {
        expect(getBrandDomain("www.gamebob.dev")).toBe("gamebob.dev");
        expect(getBrandDomain("jjlmoya.es")).toBe("jjlmoya.es");
        expect(() => getBrandDomain("example.com")).toThrow("Dominio no permitido");
    });
});
