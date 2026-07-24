import { ToolProvider } from "../types";
import { geminiProvider } from "./antigravity";
import { claudeProvider } from "./claude";
import { codexProvider } from "./codex";

const providers = new Map<string, ToolProvider>([
  [claudeProvider.name, claudeProvider],
  [codexProvider.name, codexProvider],
  [geminiProvider.name, geminiProvider],
  ["antigravity", geminiProvider],
]);

export function getProvider(name: string): ToolProvider | undefined {
  return providers.get(name);
}

export function listProviders(): string[] {
  return Array.from(providers.keys()).sort();
}
