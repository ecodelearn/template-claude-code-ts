const assert = require("node:assert/strict");
const test = require("node:test");
const packageJson = require("../package.json");

test("keeps package contents allowlisted and publish access public", () => {
  assert.equal(packageJson.name, "@ecodelearn/agent-harness");
  assert.deepEqual(packageJson.bin, { "agent-harness": "dist/adopt.js" });
  assert.equal(packageJson.private, false);
  assert.equal(packageJson.publishConfig.access, "public");
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
