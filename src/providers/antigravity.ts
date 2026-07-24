import { ToolProvider } from "../types";

export const geminiProvider: ToolProvider = {
  name: "gemini",
  defaultSource: "ecodelearn/template-claude-code-ts",
  defaultRef: "a5df95baf46cd646936f9585347d8dcec5b40738",
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
