const assert = require("node:assert/strict");
const test = require("node:test");
const { getProvider, listProviders } = require("../dist/providers/index.js");

test("registers Codex with the public canonical source pinned by commit", () => {
  const provider = getProvider("codex");
  assert.ok(provider);
  assert.equal(provider.defaultSource, "ecodelearn/template-claude-code-open");
  assert.match(provider.defaultRef, /^[0-9a-f]{40}$/);
  assert.equal(
    provider.copyRules.some(
      (rule) => rule.source === ".claude/skills" && rule.destination === ".agents/skills",
    ),
    true,
  );
  assert.deepEqual(listProviders(), ["antigravity", "claude", "codex", "gemini"]);
});
