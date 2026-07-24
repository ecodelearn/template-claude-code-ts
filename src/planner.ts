import { existsSync } from "node:fs";
import path from "node:path";
import { CopyRule } from "./types";

export type PlanAction = "copy" | "overwrite" | "prompt" | "preserve" | "missing";

export interface PlanItem {
  rule: CopyRule;
  sourcePath: string;
  targetPath: string;
  action: PlanAction;
}

export function planCopyRules(copyRules: CopyRule[], sourceDir: string, targetDir: string): PlanItem[] {
  return copyRules.map((rule) => {
    const sourcePath = path.join(sourceDir, rule.source);
    const targetPath = path.join(targetDir, rule.destination);

    if (!existsSync(sourcePath)) {
      return { rule, sourcePath, targetPath, action: "missing" };
    }

    if (!existsSync(targetPath)) {
      return { rule, sourcePath, targetPath, action: "copy" };
    }

    const actionByMode: Record<CopyRule["overwrite"], PlanAction> = {
      always: "overwrite",
      never: "preserve",
      prompt: "prompt",
    };

    return { rule, sourcePath, targetPath, action: actionByMode[rule.overwrite] };
  });
}
