import type { SocialOpportunity } from '../../core/contracts/social-post.interface.js';

export class SocialReportFormatter {
    formatMarkdown(opportunities: SocialOpportunity[]): string {
        const trafficOpps = opportunities.filter((o) => !o.isNewToolIdea && o.matchedTool);
        const newToolOpps = opportunities.filter((o) => o.isNewToolIdea);

        const lines: string[] = [
            '# Social Outreach & Live Opportunity Report',
            '',
            `Generated at: ${new Date().toISOString()}`,
            `Direct Traffic Opportunities: ${trafficOpps.length} | New Tool Ideas: ${newToolOpps.length}`,
            ''
        ];

        this.appendTrafficSection(lines, trafficOpps);
        this.appendNewToolsSection(lines, newToolOpps);

        return lines.join('\n');
    }

    private appendTrafficSection(lines: string[], list: SocialOpportunity[]): void {
        lines.push(
            '## Accion Inmediata: Captacion de Trafico (Herramientas Ya Creadas)',
            'Gente preguntando dudas tecnicas que tus herramientas ya resuelven. Responde con el link directo para captar usuarios y seguidores.',
            ''
        );

        for (const opp of list) {
            lines.push(
                `### [${opp.post.platform.toUpperCase()}] ${opp.post.title}`,
                `- **Autor:** ${opp.post.author}`,
                `- **Enlace Directo al Post/Tweet:** [Ver Publicacion](${opp.post.url})`,
                `- **Tu Herramienta Coincidente:** \`${opp.matchedTool?.title}\` ([${opp.matchedTool?.url}](${opp.matchedTool?.url}))`,
                '',
                '**Respuesta Sugerida (Copiar y Pegar):**',
                `> ${opp.suggestedReply}`,
                '',
                '---',
                ''
            );
        }
    }

    private appendNewToolsSection(lines: string[], list: SocialOpportunity[]): void {
        lines.push(
            '## Nuevas Necesidades Detectadas en Comunidades',
            'Usuarios buscando herramientas o calculos que aun no tenemos cubiertos.',
            '',
            '| Plataforma | Autor | Pregunta / Necesidad | Enlace |',
            '| :--- | :--- | :--- | :--- |'
        );

        for (const opp of list) {
            const cleanTitle = opp.post.title.replace(/\|/g, '-').slice(0, 75);
            lines.push(`| ${opp.post.platform} | ${opp.post.author} | ${cleanTitle} | [Link](${opp.post.url}) |`);
        }
        lines.push('');
    }
}
