#!/usr/bin/env node
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { spawnSync } from "node:child_process";
import { createLogger } from "./logger";
import { planCopyRules } from "./planner";
import { getProvider, listProviders } from "./providers";
import {
  executeTransaction,
  forgetTransaction,
  listTransactions,
  rollbackTransaction,
} from "./transaction";
import { ToolProvider } from "./types";

interface Args {
  tool: string;
  source?: string;
  target: string;
  yes: boolean;
  dryRun: boolean;
  ref?: string;
  rollback?: string;
  forget?: string;
  listTransactions: boolean;
}

function printHelp(): void {
  process.stdout.write(`agent-harness\n\n`);
  process.stdout.write(`Uso:\n`);
  process.stdout.write(`  agent-harness --tool <nome> [--source <repo-ou-caminho>] [--ref <tag-ou-commit>] [--target <dir>] [--yes] [--dry-run]\n`);
  process.stdout.write(`  agent-harness --target <dir> --rollback <id>\n\n`);
  process.stdout.write(`  agent-harness --target <dir> --list-transactions\n`);
  process.stdout.write(`  agent-harness --target <dir> --forget <id> [--yes]\n\n`);
  process.stdout.write(`Opcoes:\n`);
  process.stdout.write(`  --tool     Nome do provider (ex.: claude)\n`);
  process.stdout.write(`  --source   Repositorio git (owner/repo, URL) ou caminho local\n`);
  process.stdout.write(`  --ref      Tag ou commit da fonte remota\n`);
  process.stdout.write(`  --target   Diretorio de destino (padrao: diretorio atual)\n`);
  process.stdout.write(`  --yes      Nao perguntar confirmacoes\n`);
  process.stdout.write(`  --dry-run  Exibe o plano sem alterar o projeto\n`);
  process.stdout.write(`  --rollback Restaura uma transacao pelo ID\n`);
  process.stdout.write(`  --list-transactions Lista backups deste projeto\n`);
  process.stdout.write(`  --forget   Exclui definitivamente um backup pelo ID\n`);
  process.stdout.write(`  --help     Exibe ajuda\n\n`);
  process.stdout.write(`Providers disponiveis: ${listProviders().join(", ")}\n`);
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    tool: "claude",
    target: process.cwd(),
    yes: false,
    dryRun: false,
    listTransactions: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];

    if (current === "--help" || current === "-h") {
      printHelp();
      process.exit(0);
    }

    if (current === "--yes") {
      args.yes = true;
      continue;
    }

    if (current === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (current === "--list-transactions") {
      args.listTransactions = true;
      continue;
    }

    if (current === "--tool") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error(`Valor ausente para ${current}`);
      }
      args.tool = nextValue;
      i += 1;
      continue;
    }

    if (current === "--source") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error(`Valor ausente para ${current}`);
      }
      args.source = nextValue;
      i += 1;
      continue;
    }

    if (current === "--ref" || current === "--rollback" || current === "--forget") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error(`Valor ausente para ${current}`);
      }
      if (current === "--ref") {
        args.ref = nextValue;
      } else if (current === "--rollback") {
        args.rollback = nextValue;
      } else {
        args.forget = nextValue;
      }
      i += 1;
      continue;
    }

    if (current === "--target") {
      const nextValue = argv[i + 1];
      if (!nextValue) {
        throw new Error(`Valor ausente para ${current}`);
      }
      args.target = path.resolve(nextValue);
      i += 1;
      continue;
    }

    throw new Error(`Argumento desconhecido: ${current}`);
  }

  return args;
}

function ensureGitRepo(targetDir: string): void {
  const gitDir = path.join(targetDir, ".git");
  if (!existsSync(gitDir)) {
    throw new Error("Execute este comando na raiz de um repositorio git (ou use --target). ");
  }

  const gitMeta = statSync(gitDir);
  if (!gitMeta.isDirectory() && !gitMeta.isFile()) {
    throw new Error("Execute este comando na raiz de um repositorio git (ou use --target). ");
  }
}

function resolveGitStateDir(targetDir: string): string {
  const result = spawnSync("git", ["-C", targetDir, "rev-parse", "--absolute-git-dir"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`Nao foi possivel localizar o diretorio Git de ${targetDir}`);
  }
  return result.stdout.trim();
}

function expandHome(input: string): string {
  if (input === "~") {
    return os.homedir();
  }
  if (input.startsWith("~/")) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

function isLocalPath(source: string): boolean {
  const expanded = expandHome(source);
  if (expanded.startsWith(".") || expanded.startsWith("/") || /^[a-zA-Z]:\\/.test(expanded) || expanded.startsWith("\\\\")) {
    return true;
  }
  return existsSync(path.resolve(expanded));
}

function normalizeRepoSource(source: string): string {
  if (source.startsWith("https://") || source.startsWith("git@") || source.startsWith("ssh://")) {
    return source;
  }

  if (source.includes("/")) {
    return `https://github.com/${source}.git`;
  }

  return source;
}

function fetchSource(source: string, ref: string | undefined, logger: ReturnType<typeof createLogger>): { dir: string; cleanup: () => void } {
  if (isLocalPath(source)) {
    if (ref) {
      throw new Error("Nao use --ref com uma fonte local; o working tree local e usado como esta.");
    }
    const fullPath = path.resolve(expandHome(source));
    if (!existsSync(fullPath)) {
      throw new Error(`Template local nao encontrado: ${fullPath}`);
    }

    return { dir: fullPath, cleanup: () => {} };
  }

  const tempDir = mkdtempSync(path.join(os.tmpdir(), "adopt-cli-"));
  const repo = normalizeRepoSource(source);
  if (!ref) {
    rmSync(tempDir, { recursive: true, force: true });
    throw new Error("Fontes remotas exigem --ref <tag-ou-commit> para uma instalacao reproduzivel.");
  }

  const gitAvailable = spawnSync("git", ["--version"], { stdio: "ignore" }).status === 0;
  if (!gitAvailable) {
    rmSync(tempDir, { recursive: true, force: true });
    throw new Error("Git nao encontrado. Instale o git para clonar templates remotos.");
  }

  logger.info(`Obtendo template: ${repo} @ ${ref}`);
  const commands = [
    ["init", "--quiet", tempDir],
    ["-C", tempDir, "remote", "add", "origin", repo],
    ["-C", tempDir, "fetch", "--depth=1", "--quiet", "origin", ref],
    ["-C", tempDir, "checkout", "--detach", "--quiet", "FETCH_HEAD"],
  ];
  const failed = commands.some((command) => spawnSync("git", command, {
    stdio: "inherit",
    timeout: 60_000,
  }).status !== 0);
  if (failed) {
    rmSync(tempDir, { recursive: true, force: true });
    throw new Error(`Falha ao obter template versionado: ${repo} @ ${ref}`);
  }
  const resolved = spawnSync("git", ["-C", tempDir, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
  logger.info(`Commit resolvido: ${resolved}`);

  return {
    dir: tempDir,
    cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
  };
}

async function shouldOverwrite(target: string, yes: boolean): Promise<boolean> {
  if (yes) {
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(`\`${target}\` ja existe. Deseja sobrescrever? [s/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "s";
}

async function shouldForget(id: string, yes: boolean): Promise<boolean> {
  if (yes) {
    return true;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Excluir definitivamente o backup ${id}? [s/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "s";
}

async function applyProvider(
  provider: ToolProvider,
  sourceDir: string,
  targetDir: string,
  stateDir: string,
  yes: boolean,
): Promise<void> {
  const logger = createLogger();

  logger.info(`Provider: ${provider.name}`);
  logger.info(`Template: ${sourceDir}`);
  logger.info(`Destino: ${targetDir}`);

  const operations = [];
  for (const item of planCopyRules(provider.copyRules, sourceDir, targetDir)) {
    if (item.action === "missing") {
      if (item.rule.required) {
        throw new Error(`Arquivo/diretorio obrigatorio nao encontrado no template: ${item.rule.source}`);
      }
      continue;
    }
    if (item.action === "preserve") {
      logger.warn(`${item.rule.destination} ja existe. Mantendo arquivo existente.`);
      continue;
    }
    if (item.action === "prompt") {
      const allowed = await shouldOverwrite(item.rule.destination, yes);
      if (!allowed) {
        logger.warn(`Copia de ${item.rule.destination} cancelada.`);
        continue;
      }
    }
    operations.push({ sourcePath: item.sourcePath, destination: item.rule.destination });
  }

  const manifest = await executeTransaction(stateDir, targetDir, operations, {
    afterApply: async () => provider.afterCopy?.({
      sourceDir,
      targetDir,
      yes,
      logger,
    }),
  });
  operations.forEach((operation) => logger.ok(`${operation.destination} copiado`));

  process.stdout.write("\n");
  logger.ok(`Estrutura ${provider.name} adicionada ao projeto.`);
  logger.info(`Transacao: ${manifest.id}`);
  logger.info(`Rollback: agent-harness --target "${targetDir}" --rollback ${manifest.id}`);

  if (provider.nextSteps && provider.nextSteps.length > 0) {
    process.stdout.write("\nProximos passos:\n");
    provider.nextSteps.forEach((step, index) => {
      process.stdout.write(`${index + 1}. ${step}\n`);
    });
  }
}

function printPlan(provider: ToolProvider, sourceDir: string, targetDir: string): void {
  const logger = createLogger();
  const labels = {
    copy: "COPIAR",
    overwrite: "SOBRESCREVER",
    prompt: "PERGUNTAR",
    preserve: "PRESERVAR",
    missing: "AUSENTE",
  } as const;

  logger.info(`Previa do provider: ${provider.name}`);
  for (const item of planCopyRules(provider.copyRules, sourceDir, targetDir)) {
    const required = item.action === "missing" && item.rule.required ? " (obrigatorio)" : "";
    process.stdout.write(`[${labels[item.action]}] ${item.rule.source} -> ${item.rule.destination}${required}\n`);
  }
  process.stdout.write("\nNenhum arquivo foi alterado.\n");
}

async function main(): Promise<void> {
  const logger = createLogger();

  try {
    const args = parseArgs(process.argv.slice(2));
    const provider = getProvider(args.tool);

    if (!provider) {
      throw new Error(`Provider desconhecido: ${args.tool}. Disponiveis: ${listProviders().join(", ")}`);
    }

    ensureGitRepo(args.target);
    const stateDir = resolveGitStateDir(args.target);

    if (args.rollback) {
      const manifest = rollbackTransaction(stateDir, args.target, args.rollback);
      logger.ok(`Transacao ${manifest.id} restaurada.`);
      return;
    }

    if (args.listTransactions) {
      const transactions = listTransactions(stateDir, args.target);
      if (transactions.length === 0) {
        logger.info("Nenhuma transacao encontrada para este projeto.");
        return;
      }
      transactions.forEach((transaction) => {
        const status = transaction.rolledBackAt ? "restaurada" : "aplicada";
        process.stdout.write(`${transaction.id}\t${status}\n`);
      });
      return;
    }

    if (args.forget) {
      if (!await shouldForget(args.forget, args.yes)) {
        logger.warn("Exclusao cancelada.");
        return;
      }
      forgetTransaction(stateDir, args.target, args.forget);
      logger.ok(`Backup ${args.forget} excluido definitivamente.`);
      return;
    }

    const source = args.source ?? provider.defaultSource;
    if (!source) {
      throw new Error(`Provider ${provider.name} nao definiu fonte padrao. Use --source.`);
    }

    const ref = args.ref ?? (args.source ? undefined : provider.defaultRef);
    const fetched = fetchSource(source, ref, logger);
    try {
      if (args.dryRun) {
        printPlan(provider, fetched.dir, args.target);
      } else {
        await applyProvider(provider, fetched.dir, args.target, stateDir, args.yes);
      }
    } finally {
      fetched.cleanup();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(message);
  }
}

void main();
