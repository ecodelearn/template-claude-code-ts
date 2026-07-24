import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export interface CopyOperation {
  sourcePath: string;
  destination: string;
}

export interface TransactionManifest {
  id: string;
  targetDir: string;
  created: string[];
  replaced: string[];
  completed: boolean;
  rolledBackAt?: string;
}

interface TransactionOptions {
  id?: string;
  afterApply?: () => Promise<void>;
}

function safeDestination(targetDir: string, destination: string): string {
  if (path.isAbsolute(destination)) {
    throw new Error(`Destino absoluto nao permitido: ${destination}`);
  }

  const targetRoot = path.resolve(targetDir);
  const resolved = path.resolve(targetRoot, destination);
  const relative = path.relative(targetRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative) || relative === "") {
    throw new Error(`Destino fora do projeto nao permitido: ${destination}`);
  }
  return resolved;
}

function transactionPath(stateDir: string, id: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(id)) {
    throw new Error(`ID de transacao invalido: ${id}`);
  }
  return path.join(stateDir, "adopt-cli", "transactions", id);
}

function removeEmptyParents(targetDir: string, destination: string): void {
  const targetRoot = path.resolve(targetDir);
  let current = path.dirname(safeDestination(targetDir, destination));
  while (current !== targetRoot && current.startsWith(`${targetRoot}${path.sep}`)) {
    if (!existsSync(current) || readdirSync(current).length > 0) {
      return;
    }
    rmdirSync(current);
    current = path.dirname(current);
  }
}

function writeManifest(transactionDir: string, manifest: TransactionManifest): void {
  writeFileSync(path.join(transactionDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
  });
}

export function isSensitiveSourcePath(sourceRoot: string, candidate: string): boolean {
  const relative = path.relative(sourceRoot, candidate);
  const segments = relative === "" ? [path.basename(candidate)] : relative.split(path.sep);
  const basename = segments.at(-1) ?? "";
  return segments.includes("agent-memory-local")
    || segments.includes(".git")
    || basename === "README_MCP.md"
    || basename.startsWith(".env")
    || basename.includes(".local.")
    || basename.endsWith(".local")
    || /\.(pem|key|p12|pfx)$/i.test(basename);
}

function copySource(sourcePath: string, targetPath: string): void {
  cpSync(sourcePath, targetPath, {
    recursive: true,
    filter: (candidate) => !isSensitiveSourcePath(sourcePath, candidate),
  });
}

export function createTransactionId(now = new Date()): string {
  return `${now.toISOString().replace(/[:.]/g, "-")}-${process.pid}`;
}

export function rollbackTransaction(stateDir: string, targetDir: string, id: string): TransactionManifest {
  const transactionDir = transactionPath(stateDir, id);
  const manifestPath = path.join(transactionDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Transacao nao encontrada: ${id}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as TransactionManifest;
  if (path.resolve(manifest.targetDir) !== path.resolve(targetDir)) {
    throw new Error(`A transacao ${id} pertence a outro projeto.`);
  }
  if (manifest.rolledBackAt) {
    throw new Error(`A transacao ${id} ja foi restaurada.`);
  }
  for (const destination of [...manifest.created].reverse()) {
    rmSync(safeDestination(manifest.targetDir, destination), { recursive: true, force: true });
    removeEmptyParents(manifest.targetDir, destination);
  }

  for (const destination of [...manifest.replaced].reverse()) {
    const targetPath = safeDestination(manifest.targetDir, destination);
    const backupPath = safeDestination(path.join(transactionDir, "backup"), destination);
    rmSync(targetPath, { recursive: true, force: true });
    cpSync(backupPath, targetPath, { recursive: true });
  }

  manifest.rolledBackAt = new Date().toISOString();
  writeManifest(transactionDir, manifest);
  return manifest;
}

export function listTransactions(stateDir: string, targetDir: string): TransactionManifest[] {
  const root = path.join(stateDir, "adopt-cli", "transactions");
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const manifestPath = path.join(root, entry.name, "manifest.json");
      if (!existsSync(manifestPath)) {
        return [];
      }
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as TransactionManifest;
        return path.resolve(manifest.targetDir) === path.resolve(targetDir) ? [manifest] : [];
      } catch {
        return [];
      }
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function forgetTransaction(stateDir: string, targetDir: string, id: string): TransactionManifest {
  const transactionDir = transactionPath(stateDir, id);
  const manifestPath = path.join(transactionDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Transacao nao encontrada: ${id}`);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as TransactionManifest;
  if (path.resolve(manifest.targetDir) !== path.resolve(targetDir)) {
    throw new Error(`A transacao ${id} pertence a outro projeto.`);
  }
  rmSync(transactionDir, { recursive: true, force: true });
  return manifest;
}

export async function executeTransaction(
  stateDir: string,
  targetDir: string,
  operations: CopyOperation[],
  options: TransactionOptions = {},
): Promise<TransactionManifest> {
  for (const operation of operations) {
    if (isSensitiveSourcePath(operation.sourcePath, operation.sourcePath)) {
      throw new Error(`Fonte sensivel bloqueada: ${path.basename(operation.sourcePath)}`);
    }
    safeDestination(targetDir, operation.destination);
  }

  const id = options.id ?? createTransactionId();
  const transactionDir = transactionPath(stateDir, id);
  const backupDir = path.join(transactionDir, "backup");
  mkdirSync(backupDir, { recursive: true, mode: 0o700 });

  const manifest: TransactionManifest = {
    id,
    targetDir: path.resolve(targetDir),
    created: [],
    replaced: [],
    completed: false,
  };

  try {
    for (const operation of operations) {
      const targetPath = safeDestination(targetDir, operation.destination);
      if (existsSync(targetPath)) {
        const backupPath = safeDestination(backupDir, operation.destination);
        mkdirSync(path.dirname(backupPath), { recursive: true });
        cpSync(targetPath, backupPath, { recursive: true });
        manifest.replaced.push(operation.destination);
      } else {
        manifest.created.push(operation.destination);
      }

      writeManifest(transactionDir, manifest);
      rmSync(targetPath, { recursive: true, force: true });
      mkdirSync(path.dirname(targetPath), { recursive: true });
      copySource(operation.sourcePath, targetPath);
    }

    await options.afterApply?.();
    manifest.completed = true;
    writeManifest(transactionDir, manifest);
    return manifest;
  } catch (error) {
    writeManifest(transactionDir, manifest);
    rollbackTransaction(stateDir, targetDir, id);
    throw error;
  }
}
