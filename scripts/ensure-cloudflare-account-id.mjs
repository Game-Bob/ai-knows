import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const defaults = {
    accountId: "e11602a44026a48c5bd08c710f813934",
    organization: "Game-Bob",
    repositoryPrefix: "jjlmoya-utils-",
    variableName: "CLOUDFLARE_ACCOUNT_ID",
};

const argumentValue = (name) => {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
};

const hasFlag = (name) => process.argv.includes(name);

const ghCandidates = process.platform === "win32"
    ? ["C:\\Program Files\\GitHub CLI\\gh.exe", "gh"]
    : ["gh"];

const gh = ghCandidates.find((candidate) => candidate === "gh" || existsSync(candidate));
if (!gh) throw new Error("GitHub CLI no está instalado.");

const accountId = argumentValue("--account-id") ?? process.env.CLOUDFLARE_ACCOUNT_ID ?? defaults.accountId;
const organization = argumentValue("--org") ?? defaults.organization;
const repositoryPrefix = argumentValue("--prefix") ?? defaults.repositoryPrefix;
const variableName = argumentValue("--variable") ?? defaults.variableName;
const dryRun = hasFlag("--dry-run");

const runGh = (args) => execFileSync(gh, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
}).trim();

const repositories = JSON.parse(runGh([
    "repo",
    "list",
    organization,
    "--limit",
    "1000",
    "--json",
    "name",
])).map(({ name }) => name).filter((name) => name.startsWith(repositoryPrefix));

const changed = [];
const unchanged = [];
const failed = [];

for (const repository of repositories) {
    const fullName = `${organization}/${repository}`;
    try {
        const variables = JSON.parse(runGh([
            "variable",
            "list",
            "--repo",
            fullName,
            "--json",
            "name",
        ]));
        const exists = variables.some(({ name }) => name === variableName);
        if (exists) {
            unchanged.push(repository);
            continue;
        }
        if (!dryRun) {
            runGh([
                "variable",
                "set",
                variableName,
                "--repo",
                fullName,
                "--body",
                accountId,
            ]);
        }
        changed.push(repository);
    } catch (error) {
        failed.push({ repository, status: error.status ?? "unknown" });
    }
}

console.log(`Repositorios revisados: ${repositories.length}`);
console.log(`${dryRun ? "Pendientes" : "Añadidas"}: ${changed.length}`);
console.log(`Ya configuradas: ${unchanged.length}`);
if (changed.length > 0) console.log(changed.join(", "));
if (failed.length > 0) {
    console.error(`Fallos: ${failed.length}`);
    for (const { repository, status } of failed) console.error(`- ${repository} (${status})`);
    process.exitCode = 1;
}
