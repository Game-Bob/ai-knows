import { describe, expect, it } from 'vitest';
import { buildReportModel, createCsv, createHtml, normalizeRows, parseCsv } from '../scripts/monthly-tools-report.mjs';

const baseRow = {
    domain: 'gamebob.dev',
    language: 'en',
    category: 'bike',
    tool_id: 'gear-calculator',
    tool_name: 'Gear Calculator',
    slug: 'gear-calculator',
    visits: '0',
    requests: '0'
};

describe('monthly tools report', () => {
    it('parses quoted CSV values and normalizes metrics', () => {
        const rows = normalizeRows(parseCsv('month,domain,language,category,tool_id,tool_name,slug,pageviews,visits,requests\n2026-08,gamebob.dev,en,bike,gear-calculator,"Gear, Calculator",gear-calculator,10,8,12'));
        expect(rows[0]).toMatchObject({ month: '2026-08', tool_name: 'Gear, Calculator', pageviews: 10, visits: 8, requests: 12 });
    });

    it('calculates growth, decline and new activity against the previous month', () => {
        const rows = normalizeRows([
            { ...baseRow, month: '2026-07', pageviews: '100' },
            { ...baseRow, month: '2026-08', pageviews: '150' },
            { ...baseRow, tool_id: 'old-tool', tool_name: 'Old Tool', slug: 'old-tool', month: '2026-07', pageviews: '200' },
            { ...baseRow, tool_id: 'old-tool', tool_name: 'Old Tool', slug: 'old-tool', month: '2026-08', pageviews: '100' },
            { ...baseRow, tool_id: 'new-tool', tool_name: 'New Tool', slug: 'new-tool', month: '2026-08', pageviews: '25' }
        ]);
        const model = buildReportModel(rows);
        const latest = model.rows.filter((row) => row.month === '2026-08');
        expect(latest.find((row) => row.tool_id === 'gear-calculator')?.status).toBe('crece');
        expect(latest.find((row) => row.tool_id === 'old-tool')?.status).toBe('decrece');
        expect(latest.find((row) => row.tool_id === 'new-tool')?.status).toBe('nueva');
        expect(model.monthTotals.at(-1)).toMatchObject({ tools: 3, newTools: 1, grows: 1, declines: 1, pageviews: 275 });
    });

    it('exports a filterable HTML report and an analysis CSV', () => {
        const rows = normalizeRows([{ ...baseRow, month: '2026-08', pageviews: '10' }]);
        const model = buildReportModel(rows);
        expect(createCsv(model)).toContain('status,delta,change_percent');
        expect(createHtml(model)).toContain('id="domain"');
        expect(createHtml(model)).toContain('Detalle por tool');
    });
});
