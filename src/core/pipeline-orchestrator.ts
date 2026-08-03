import type { IExtractor } from './contracts/extractor.interface.js';
import type { IExporter } from './contracts/exporter.interface.js';
import type { ILogger } from './logging/logger.interface.js';
import type { KnowledgeItem } from './contracts/knowledge-item.interface.js';

export class PipelineOrchestrator {
    private extractors: IExtractor[];
    private exporters: IExporter[];
    private logger: ILogger;

    constructor(extractors: IExtractor[], exporters: IExporter[], logger: ILogger) {
        this.extractors = extractors;
        this.exporters = exporters;
        this.logger = logger;
    }

    async run(): Promise<void> {
        this.logger.info('Starting pipeline execution...');
        const allItems: KnowledgeItem[] = [];

        for (const extractor of this.extractors) {
            this.logger.info(`Running extractor: ${extractor.name}`);
            try {
                const items = await extractor.extract();
                allItems.push(...items);
                this.logger.info(`Extractor ${extractor.name} returned ${items.length} items.`);
            } catch (error) {
                this.logger.error(`Extractor ${extractor.name} failed:`, error);
            }
        }

        this.logger.info(`Total items extracted: ${allItems.length}. Exporting...`);

        for (const exporter of this.exporters) {
            this.logger.info(`Running exporter: ${exporter.name}`);
            try {
                await exporter.export(allItems);
                this.logger.info(`Exporter ${exporter.name} finished successfully.`);
            } catch (error) {
                this.logger.error(`Exporter ${exporter.name} failed:`, error);
            }
        }

        this.logger.info('Pipeline execution finished successfully.');
    }
}
