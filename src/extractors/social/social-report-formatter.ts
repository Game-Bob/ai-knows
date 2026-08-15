import type { SocialOpportunity } from '../../core/contracts/social-post.interface.js';

export class SocialReportFormatter {
    formatTrafficReport(opportunities: SocialOpportunity[]): string {
        const trafficOpps = opportunities.filter((o) => !o.isNewToolIdea && o.matchedTool);
        const twitterOpps = trafficOpps.filter((o) => o.post.platform === 'twitter');
        const redditOpps = trafficOpps.filter((o) => o.post.platform === 'reddit');

        const lines: string[] = [
            '# Captacion de Trafico Inmediato (Publicaciones Recientes)',
            '',
            `Generado: ${new Date().toISOString()}`,
            `Oportunidades en X/Twitter: ${twitterOpps.length} | Oportunidades en Reddit: ${redditOpps.length}`,
            '',
            '## 1. Oportunidades en X (Twitter)',
            ''
        ];

        this.appendTrafficList(lines, twitterOpps);
        lines.push('## 2. Oportunidades en Reddit', '');
        this.appendTrafficList(lines, redditOpps);

        return lines.join('\n');
    }

    formatRequestsReport(opportunities: SocialOpportunity[]): string {
        const newToolOpps = opportunities.filter((o) => o.isNewToolIdea);
        const twitterOpps = newToolOpps.filter((o) => o.post.platform === 'twitter');
        const redditOpps = newToolOpps.filter((o) => o.post.platform === 'reddit');

        const lines: string[] = [
            '# Nuevas Necesidades y Herramientas Solicitadas en Redes',
            '',
            `Generado: ${new Date().toISOString()}`,
            `Consultas en X/Twitter: ${twitterOpps.length} | Consultas en Reddit: ${redditOpps.length}`,
            ''
        ];

        this.appendTableSection(lines, '1. Peticiones y Dudas en X (Twitter)', twitterOpps);
        this.appendTableSection(lines, '2. Peticiones y Dudas en Reddit', redditOpps);

        return lines.join('\n');
    }

    private appendTableSection(lines: string[], heading: string, list: SocialOpportunity[]): void {
        lines.push(`## ${heading}`, '', '| Autor / Origen | Pregunta o Necesidad | Enlace Directo |', '| :--- | :--- | :--- |');
        for (const opp of list) {
            const cleanTitle = opp.post.title.replace(/\|/g, '-').slice(0, 80);
            lines.push(`| ${opp.post.author} | ${cleanTitle} | [Abrir Enlace](${opp.post.url}) |`);
        }
        lines.push('');
    }

    private appendTrafficList(lines: string[], list: SocialOpportunity[]): void {
        if (list.length === 0) {
            lines.push('No se detectaron publicaciones directas en este momento.', '');
            return;
        }

        for (const opp of list) {
            lines.push(
                `### ${opp.post.title}`,
                `- **Autor:** ${opp.post.author}`,
                `- **Enlace Directo:** [Abrir Publicacion](${opp.post.url})`,
                `- **Herramienta Coincidente:** \`${opp.matchedTool?.title}\` ([${opp.matchedTool?.url}](${opp.matchedTool?.url}))`,
                '',
                '**Respuesta Sugerida:**',
                `> ${opp.suggestedReply}`,
                '',
                '---',
                ''
            );
        }
    }
}
