import { ToolProvider } from "../types";

export const geminiProvider: ToolProvider = {
  name: "gemini",
  defaultSource: "ecodelearn/template-claude-code-ts",
  defaultRef: "b19d828d46a5943e07541672a0cc7960c4da9e5b",
  copyRules: [
    {
      source: "GEMINI.md",
      destination: "GEMINI.md",
      overwrite: "never",
      required: false,
    },
    {
      source: "AGENTS.md",
      destination: "AGENTS.md",
      overwrite: "never",
      required: false,
    },
    {
      source: ".claude/skills",
      destination: ".gemini/skills",
      overwrite: "prompt",
      required: false,
    },
    {
      source: ".gitignore",
      destination: ".gitignore",
      overwrite: "never",
      required: false,
    },
  ],
  nextSteps: [
    "Abra a ferramenta na raiz do projeto (ex.: `gemini`).",
    "Rode o onboarding inicial para mapear o projeto.",
  ],
};

export const antigravityProvider = geminiProvider;
