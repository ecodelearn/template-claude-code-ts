const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  executeTransaction,
  forgetTransaction,
  isSensitiveSourcePath,
  listTransactions,
  rollbackTransaction,
} = require("../dist/transaction.js");

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adopt-transaction-test-"));
  const source = path.join(root, "source");
  const target = path.join(root, "target");
  const state = path.join(root, "git-state");
  fs.mkdirSync(source);
  fs.mkdirSync(target);
  fs.mkdirSync(state);
  return { root, source, target, state };
}

test("backs up replaced paths and restores created and replaced paths", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "existing"), "new");
  fs.writeFileSync(path.join(dirs.source, "created"), "created");
  fs.writeFileSync(path.join(dirs.target, "existing"), "original");

  const manifest = await executeTransaction(
    dirs.state,
    dirs.target,
    [
      { sourcePath: path.join(dirs.source, "existing"), destination: "existing" },
      { sourcePath: path.join(dirs.source, "created"), destination: "created" },
    ],
    { id: "test-success" },
  );

  assert.equal(manifest.completed, true);
  assert.equal(fs.readFileSync(path.join(dirs.target, "existing"), "utf8"), "new");
  rollbackTransaction(dirs.state, dirs.target, manifest.id);
  assert.equal(fs.readFileSync(path.join(dirs.target, "existing"), "utf8"), "original");
  assert.equal(fs.existsSync(path.join(dirs.target, "created")), false);
  assert.throws(
    () => rollbackTransaction(dirs.state, dirs.target, manifest.id),
    /ja foi restaurada/,
  );
});

test("removes parent directories created only for a transaction", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "file"), "new");
  const manifest = await executeTransaction(
    dirs.state,
    dirs.target,
    [{ sourcePath: path.join(dirs.source, "file"), destination: ".agents/skills/file" }],
    { id: "test-empty-parents" },
  );

  rollbackTransaction(dirs.state, dirs.target, manifest.id);
  assert.equal(fs.existsSync(path.join(dirs.target, ".agents")), false);
});

test("lists and forgets only transactions bound to the project", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "file"), "new");
  await executeTransaction(
    dirs.state,
    dirs.target,
    [{ sourcePath: path.join(dirs.source, "file"), destination: "file" }],
    { id: "test-list" },
  );

  assert.deepEqual(listTransactions(dirs.state, dirs.target).map((item) => item.id), ["test-list"]);
  forgetTransaction(dirs.state, dirs.target, "test-list");
  assert.deepEqual(listTransactions(dirs.state, dirs.target), []);
});

test("refuses a manifest that points to another project", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "file"), "new");
  const manifest = await executeTransaction(
    dirs.state,
    dirs.target,
    [{ sourcePath: path.join(dirs.source, "file"), destination: "file" }],
    { id: "test-target-binding" },
  );

  assert.throws(
    () => rollbackTransaction(dirs.state, path.join(dirs.root, "other"), manifest.id),
    /outro projeto/,
  );
});

test("rolls back automatically when post-processing fails", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "file"), "new");
  fs.writeFileSync(path.join(dirs.target, "file"), "original");

  await assert.rejects(
    executeTransaction(
      dirs.state,
      dirs.target,
      [{ sourcePath: path.join(dirs.source, "file"), destination: "file" }],
      {
        id: "test-failure",
        afterApply: async () => {
          throw new Error("post-processing failed");
        },
      },
    ),
    /post-processing failed/,
  );

  assert.equal(fs.readFileSync(path.join(dirs.target, "file"), "utf8"), "original");
});

test("rejects destinations outside the project before copying", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "file"), "new");

  await assert.rejects(
    executeTransaction(
      dirs.state,
      dirs.target,
      [{ sourcePath: path.join(dirs.source, "file"), destination: "../escape" }],
      { id: "test-traversal" },
    ),
    /fora do projeto/,
  );
  assert.equal(fs.existsSync(path.join(dirs.root, "escape")), false);
});

test("excludes local memory, secrets and private keys from recursive copies", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  const harness = path.join(dirs.source, ".claude");
  fs.mkdirSync(path.join(harness, "agent-memory-local"), { recursive: true });
  fs.writeFileSync(path.join(harness, "AGENTS.md"), "safe");
  fs.writeFileSync(path.join(harness, "settings.local.json"), "secret");
  fs.writeFileSync(path.join(harness, ".env"), "secret");
  fs.writeFileSync(path.join(harness, ".envrc"), "secret");
  fs.writeFileSync(path.join(harness, "private.pem"), "secret");
  fs.writeFileSync(path.join(harness, "agent-memory-local", "session.md"), "secret");

  await executeTransaction(
    dirs.state,
    dirs.target,
    [{ sourcePath: harness, destination: ".claude" }],
    { id: "test-sensitive" },
  );

  assert.equal(fs.readFileSync(path.join(dirs.target, ".claude", "AGENTS.md"), "utf8"), "safe");
  for (const excluded of [
    "settings.local.json",
    ".env",
    ".envrc",
    "private.pem",
    path.join("agent-memory-local", "session.md"),
  ]) {
    assert.equal(fs.existsSync(path.join(dirs.target, ".claude", excluded)), false);
  }
  assert.equal(isSensitiveSourcePath(harness, path.join(harness, "AGENTS.md")), false);
  assert.equal(isSensitiveSourcePath(path.join(harness, ".env"), path.join(harness, ".env")), true);

  await assert.rejects(
    executeTransaction(
      dirs.state,
      dirs.target,
      [{ sourcePath: path.join(harness, ".env"), destination: ".env" }],
      { id: "test-sensitive-root" },
    ),
    /Fonte sensivel bloqueada/,
  );
});

test("validates every destination before creating transaction state", async (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "first"), "new");
  fs.writeFileSync(path.join(dirs.source, "second"), "escape");
  fs.writeFileSync(path.join(dirs.target, "first"), "original");

  await assert.rejects(
    executeTransaction(
      dirs.state,
      dirs.target,
      [
        { sourcePath: path.join(dirs.source, "first"), destination: "first" },
        { sourcePath: path.join(dirs.source, "second"), destination: "../escape" },
      ],
      { id: "test-upfront-validation" },
    ),
    /fora do projeto/,
  );

  assert.equal(fs.readFileSync(path.join(dirs.target, "first"), "utf8"), "original");
  assert.equal(fs.existsSync(path.join(dirs.state, "adopt-cli")), false);
});
