import { chmodSync, existsSync } from "node:fs";
import path from "node:path";
import { ToolProvider } from "../types";

export const claudeProvider: ToolProvider = {
  name: "claude",
  defaultSource: "ecodelearn/template-claude-code-open",
  defaultRef: "eb8e8e6302cd1a93e09226681ea34f483bc74e73",
  copyRules: [
    {
      source: ".claude",
      destination: ".claude",
      overwrite: "prompt",
      required: true,
    },
    {
      source: "CLAUDE.md",
      destination: "CLAUDE.md",
      overwrite: "never",
      required: false,
    },
    {
      source: ".gitignore",
      destination: ".gitignore",
      overwrite: "never",
      required: false,
    },
  ],
  afterCopy: async ({ targetDir }) => {
    const hooksDir = path.join(targetDir, ".claude", "hooks");
    if (!existsSync(hooksDir)) {
      return;
    }

    const scripts = ["auto-format.sh", "block-destructive.sh", "session-end-context.sh"];
    for (const script of scripts) {
      const fullPath = path.join(hooksDir, script);
      if (existsSync(fullPath)) {
        chmodSync(fullPath, 0o755);
      }
    }
  },
  nextSteps: [
    "Abra a ferramenta na raiz do projeto (ex.: `claude`).",
    "Rode o onboarding inicial da ferramenta (ex.: `/project-adopt`).",
  ],
};
