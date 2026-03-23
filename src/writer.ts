import * as fs from "fs";
import * as path from "path";

export function writeTestPlan(content: string, outputDir: string): string {
  const filePath = path.join(outputDir, "test-plan.md");
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export function writeSpecFile(content: string, outputDir: string): string {
  const testsDir = path.join(outputDir, "tests");
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
  const filePath = path.join(testsDir, "generated.spec.ts");
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}
