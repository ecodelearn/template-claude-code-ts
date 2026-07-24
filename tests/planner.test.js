const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { planCopyRules } = require("../dist/planner.js");

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "adopt-planner-test-"));
  const source = path.join(root, "source");
  const target = path.join(root, "target");
  fs.mkdirSync(source);
  fs.mkdirSync(target);
  return { root, source, target };
}

test("plans copy when source exists and target does not", (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dirs.source, "AGENTS.md"), "source");

  const [item] = planCopyRules(
    [{ source: "AGENTS.md", destination: "AGENTS.md", overwrite: "never" }],
    dirs.source,
    dirs.target,
  );

  assert.equal(item.action, "copy");
});

test("maps every overwrite policy without modifying target", (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));

  for (const name of ["always", "never", "prompt"]) {
    fs.writeFileSync(path.join(dirs.source, name), "new");
    fs.writeFileSync(path.join(dirs.target, name), "original");
  }

  const items = planCopyRules(
    [
      { source: "always", destination: "always", overwrite: "always" },
      { source: "never", destination: "never", overwrite: "never" },
      { source: "prompt", destination: "prompt", overwrite: "prompt" },
    ],
    dirs.source,
    dirs.target,
  );

  assert.deepEqual(items.map((item) => item.action), ["overwrite", "preserve", "prompt"]);
  assert.equal(fs.readFileSync(path.join(dirs.target, "always"), "utf8"), "original");
});

test("reports missing sources and preserves required metadata", (t) => {
  const dirs = fixture();
  t.after(() => fs.rmSync(dirs.root, { recursive: true, force: true }));

  const [item] = planCopyRules(
    [{ source: ".claude", destination: ".claude", overwrite: "prompt", required: true }],
    dirs.source,
    dirs.target,
  );

  assert.equal(item.action, "missing");
  assert.equal(item.rule.required, true);
});
