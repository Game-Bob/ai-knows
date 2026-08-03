interface FuzzyRule {
    category: string;
    keywords: string[];
}

export class CategoryResolverService {
    private mapping = new Map<string, string>();
    private rules: FuzzyRule[] = [
        { category: 'Sports', keywords: ['marcador', 'deporte', 'futbol', 'baloncesto', 'score'] },
        { category: 'Work', keywords: ['interes', 'dinero', 'nif', 'nie', 'trabajo', 'iban'] },
        { category: 'Health', keywords: ['anion', 'salud', 'medicina', 'peso', 'imc'] },
        { category: '3d Printing', keywords: ['impresora', '3d', 'filament'] },
        { category: 'Coffee', keywords: ['cafe', 'coffee'] },
        { category: 'Cooking', keywords: ['cocina', 'receta', 'cooking'] },
        { category: 'Hardware Tools', keywords: ['juego', 'game', 'teclado', 'mouse', 'gamepad'] }
    ];

    constructor() {
        this.populateDefaultMappings();
    }

    register(slug: string, category: string): void {
        if (slug && category && category !== 'Uncategorized') {
            this.mapping.set(this.normalizeSlug(slug), category);
        }
    }

    resolve(slug: string): string {
        const normalized = this.normalizeSlug(slug);
        const registered = this.mapping.get(normalized);
        if (registered) {
            return registered;
        }

        const matchedRule = this.rules.find((rule) =>
            rule.keywords.some((kw) => normalized.includes(kw))
        );

        return matchedRule ? matchedRule.category : 'Uncategorized';
    }

    private normalizeSlug(slug: string): string {
        return slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    private populateDefaultMappings(): void {
        const defaults: Record<string, string> = {
            'marcador': 'Sports',
            'marcador-futbol': 'Sports',
            'marcador-baloncesto': 'Sports',
            'interes-legal-dinero-2026': 'Work',
            'calculadora-de-anion-gap': 'Health',
            'gamepad-test-deutsch': 'Hardware Tools',
            'gamepad-vibration-test-online': 'Hardware Tools'
        };

        for (const [slug, cat] of Object.entries(defaults)) {
            this.register(slug, cat);
        }
    }
}
