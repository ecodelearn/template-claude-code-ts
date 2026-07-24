const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");
const cli = path.join(projectRoot, "dist", "adopt.js");
const ansi = /\u001b\[[0-9;]*m/g;

function run(command, args, cwd = projectRoot) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    0,
    `command failed: ${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
  );
  return `${result.stdout}${result.stderr}`.replace(ansi, "");
}

function makeProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adopt-cli-integration-"));
  const target = path.join(root, "project");
  fs.mkdirSync(target);
  run("git", ["init", "--quiet"], target);
  return { root, target };
}

test("Codex lifecycle is portable and keeps sensitive local files out", (t) => {
  const dirs = makeProject();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));

  run(process.execPath, [
    cli,
    "--tool",
    "codex",
    "--source",
    projectRoot,
    "--target",
    dirs.target,
    "--yes",
  ]);
  const transactionsDir = path.join(dirs.target, ".git", "adopt-cli", "transactions");
  const [transactionId] = fs.readdirSync(transactionsDir);
  assert.ok(transactionId);
  assert.equal(fs.existsSync(path.join(dirs.target, "AGENTS.md")), true);
  assert.equal(
    fs.existsSync(path.join(dirs.target, ".agents", "skills", "project-init", "SKILL.md")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(dirs.target, ".claude", "settings.local.json.example")),
    false,
  );

  run(process.execPath, [cli, "--target", dirs.target, "--list-transactions"]);

  run(process.execPath, [cli, "--target", dirs.target, "--rollback", transactionId]);
  assert.equal(fs.existsSync(path.join(dirs.target, "AGENTS.md")), false);
  assert.equal(fs.existsSync(path.join(dirs.target, ".agents")), false);

  run(process.execPath, [
    cli,
    "--target",
    dirs.target,
    "--forget",
    transactionId,
    "--yes",
  ]);
  run(process.execPath, [cli, "--target", dirs.target, "--list-transactions"]);
  assert.deepEqual(fs.readdirSync(transactionsDir), []);
});

test("dry-run leaves a project unchanged", (t) => {
  const dirs = makeProject();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.target, "AGENTS.md"), "keep");

  run(process.execPath, [
    cli,
    "--tool",
    "codex",
    "--source",
    projectRoot,
    "--target",
    dirs.target,
    "--dry-run",
  ]);

  assert.equal(fs.readFileSync(path.join(dirs.target, "AGENTS.md"), "utf8"), "keep");
  assert.equal(fs.existsSync(path.join(dirs.target, ".agents")), false);
  assert.equal(fs.existsSync(path.join(dirs.target, ".git", "adopt-cli")), false);
});
