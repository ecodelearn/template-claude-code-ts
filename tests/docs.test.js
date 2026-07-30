const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const pairedGuides = [
  "getting-started.md",
  "alternatives.md",
  "new-project.md",
  "existing-project.md",
  "cli-reference.md",
  "providers.md",
  "architecture-security.md",
];

test("ships equivalent PT-BR and English documentation entry points", () => {
  for (const file of [
    "README.md",
    "README.en.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "CODE_OF_CONDUCT.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/bug_report.yml",
    ".github/ISSUE_TEMPLATE/feature_request.yml",
  ]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, `${file} is required`);
  }
  for (const guide of pairedGuides) {
    assert.equal(fs.existsSync(path.join(root, "docs", "pt-BR", guide)), true, `pt-BR/${guide}`);
    assert.equal(fs.existsSync(path.join(root, "docs", "en", guide)), true, `en/${guide}`);
  }
});

test("documents the published npm package as available via npx", () => {
  for (const file of ["README.md", "README.en.md"]) {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(content, /private: true/);
    assert.match(content, /npx @ecodelearn\/agent-harness/);
  }
});

test("validates the supported Node releases and Node 24 in CI", () => {
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "ci.yml"), "utf8");
  for (const version of [20, 22, 24]) {
    assert.match(workflow, new RegExp(`node: ${version}`));
  }
});

test("new public Markdown documents do not contain broken relative links", () => {
  const files = [
    "README.md",
    "README.en.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "CODE_OF_CONDUCT.md",
    ...pairedGuides.flatMap((guide) => [
      path.join("docs", "pt-BR", guide),
      path.join("docs", "en", guide),
    ]),
  ];

  for (const file of files) {
    const absoluteFile = path.join(root, file);
    const content = fs.readFileSync(absoluteFile, "utf8");
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1].split("#")[0];
      if (!target || /^[a-z]+:\/\//i.test(target) || target.startsWith("#")) {
        continue;
      }
      const resolved = path.resolve(path.dirname(absoluteFile), decodeURIComponent(target));
      assert.equal(fs.existsSync(resolved), true, `${file} -> ${target}`);
    }
  }
});
