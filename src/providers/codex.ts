import { ToolProvider } from "../types";

export const codexProvider: ToolProvider = {
  name: "codex",
  defaultSource: "ecodelearn/template-claude-code-open",
  defaultRef: "eb8e8e6302cd1a93e09226681ea34f483bc74e73",
  copyRules: [
    {
      source: "AGENTS.md",
      destination: "AGENTS.md",
      overwrite: "never",
      required: true,
    },
    {
      source: ".claude",
      destination: ".claude",
      overwrite: "prompt",
      required: true,
    },
    {
      source: ".claude/skills",
      destination: ".agents/skills",
      overwrite: "prompt",
      required: true,
    },
    {
      source: ".gitignore",
      destination: ".gitignore",
      overwrite: "never",
      required: false,
    },
  ],
  nextSteps: [
    "Abra o Codex na raiz do projeto; ele carrega AGENTS.md automaticamente.",
    "Use /skills para confirmar as skills em .agents/skills.",
    "Execute project-init em projeto novo ou project-adopt em projeto existente.",
  ],
};
