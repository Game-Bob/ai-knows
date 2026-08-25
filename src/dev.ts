import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { findMatchingUtility } from './dev-resolver.js';

async function findUtilityDirectory(key: string): Promise<string | undefined> {
    const parentDirectory = dirname(process.cwd());
    const entries = await readdir(parentDirectory, { withFileTypes: true });
    const directoryNames = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    const utilityName = findMatchingUtility(directoryNames, key);

    return utilityName ? join(parentDirectory, utilityName) : undefined;
}

function runNpmScript(scriptName: string, workingDirectory: string): Promise<void> {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    return new Promise((resolve, reject) => {
        const child = spawn(npmCommand, ['run', scriptName], {
            cwd: workingDirectory,
            stdio: 'inherit',
            shell: process.platform === 'win32'
        });

        child.once('error', reject);
        child.once('close', (exitCode) => {
            if (exitCode !== 0) {
                process.exitCode = exitCode ?? 1;
            }
            resolve();
        });
    });
}

async function main(): Promise<void> {
    const [key] = process.argv.slice(2);

    if (!key) {
        await runNpmScript('dev:ai-knows', process.cwd());
        return;
    }

    const utilityDirectory = await findUtilityDirectory(key);

    if (!utilityDirectory) {
        throw new Error(`No se encontró ningún repositorio jjlmoya-utils-* para "${key}".`);
    }

    console.log(`Arrancando ${utilityDirectory}`);
    await runNpmScript('dev', utilityDirectory);
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
