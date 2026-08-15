import { readdir, writeFile } from 'node:fs/promises';

export class WorkspaceGenerator {
    async generate(parentDir: string, targetFile: string): Promise<void> {
        const entries = await readdir(parentDir, { withFileTypes: true });
        const folders = [
            {
                name: 'Command Center (ai-knows)',
                path: '.'
            }
        ];

        for (const entry of entries) {
            if (entry.isDirectory() && entry.name.startsWith('jjlmoya-utils-')) {
                const category = entry.name.replace('jjlmoya-utils-', '');
                folders.push({
                    name: `Utils - ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    path: `../${entry.name}`
                });
            }
        }

        const workspaceConfig = {
            folders,
            settings: {}
        };

        await writeFile(targetFile, JSON.stringify(workspaceConfig, null, 4), 'utf-8');
    }
}

const generator = new WorkspaceGenerator();
generator.generate('d:/code', 'd:/code/ai-knows/ai-knows.code-workspace')
    .then(() => console.log('Workspace generated successfully.'))
    .catch(err => console.error('Error generating workspace:', err));
