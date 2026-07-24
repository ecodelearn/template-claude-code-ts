export type OverwriteMode = "always" | "never" | "prompt";

export interface CopyRule {
  source: string;
  destination: string;
  overwrite: OverwriteMode;
  required?: boolean;
}

export interface AdoptContext {
  sourceDir: string;
  targetDir: string;
  yes: boolean;
  logger: Logger;
}

export interface ToolProvider {
  name: string;
  defaultSource?: string;
  defaultRef?: string;
  copyRules: CopyRule[];
  afterCopy?: (context: AdoptContext) => Promise<void>;
  nextSteps?: string[];
}

export interface Logger {
  info: (message: string) => void;
  ok: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => never;
}
