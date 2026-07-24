const assert = require("node:assert/strict");
const test = require("node:test");
const packageJson = require("../package.json");

test("keeps publication disabled and package contents allowlisted", () => {
  assert.equal(packageJson.name, "@ecodelearn/agent-harness");
  assert.deepEqual(packageJson.bin, { "agent-harness": "dist/adopt.js" });
  assert.equal(packageJson.private, true);
  assert.deepEqual(packageJson.files, [
    "dist/",
    "docs/en/",
    "docs/pt-BR/",
    "README.en.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "CODE_OF_CONDUCT.md",
    "LICENSE",
  ]);
  assert.equal(packageJson.scripts.prepack, "npm run build");
  assert.equal(packageJson.engines.node, ">=20");
});
