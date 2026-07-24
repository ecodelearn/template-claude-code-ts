# Adopting an existing project

[Português](../pt-BR/existing-project.md) · [English](existing-project.md)

## Before adoption

- create a dedicated branch;
- start from a clean working tree or explicitly account for local changes;
- run the existing test suite to establish a baseline;
- avoid `--yes` during the first adoption.

```bash
git switch -c chore/adopt-agent-harness
git status
```

## Preview

```bash
node /path/to/agent-harness/dist/adopt.js \
  --tool codex \
  --target "$PWD" \
  --dry-run
```

Existing instruction files and `.gitignore` are preserved according to provider
policy. Skill or memory directories may require confirmation.

## Apply and inspect

```bash
node /path/to/agent-harness/dist/adopt.js --tool codex --target "$PWD"
git status
git diff
```

Run `project-adopt`. It should document the real codebase instead of replacing
existing conventions with generic defaults.

## Roll back

```bash
node /path/to/agent-harness/dist/adopt.js \
  --target "$PWD" \
  --rollback <id>
```

Rollback removes created destinations and restores replaced ones. It is bound to
the project path and can be executed only once.

## Acceptance

- instructions match real commands;
- memory contains no secrets;
- build, lint, and tests remain green;
- the diff contains only intended artifacts;
- another agent can resume the work from repository context.
