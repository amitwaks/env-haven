import type { ValidationReport } from "./types.js";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function dim(s: string): string {
  return `${DIM}${s}${RESET}`;
}

function fmt(s: string, result: "pass" | "fail" | "warn"): string {
  const icon = result === "pass" ? "✓" : result === "warn" ? "!" : "✗";
  const color = result === "pass" ? GREEN : result === "warn" ? YELLOW : RED;
  return `${color}${icon}${RESET} ${s}`;
}

export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  const { summary } = report;

  lines.push(`${BOLD}env-haven${RESET} — Environment Variable Validation\n`);

  for (const r of report.results) {
    if (r.passed && r.errors.length === 0) {
      if (r.value === undefined) {
        lines.push(`  ${fmt(`${r.name}`, "warn")} ${dim("(not set, not required)")}`);
      } else {
        lines.push(`  ${fmt(`${r.name} = ${r.value}`, "pass")}`);
      }
    } else {
      lines.push(`  ${fmt(`${r.name} = ${r.value ?? "(not set)"}`, "fail")}`);
    }

    for (const err of r.errors) {
      lines.push(`    ${RED}│ ${err}${RESET}`);
    }
    for (const warn of r.warnings) {
      lines.push(`    ${YELLOW}│ ${warn}${RESET}`);
    }
  }

  lines.push("");

  const status = summary.failed === 0 ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
  lines.push(
    `${status}  ${summary.total} vars — ` +
    `${GREEN}${summary.passed} passed${RESET}, ` +
    `${RED}${summary.failed} failed${RESET}` +
    (summary.warnings > 0 ? `, ${YELLOW}${summary.warnings} warnings${RESET}` : "")
  );

  return lines.join("\n");
}

export function formatJson(report: ValidationReport): string {
  return JSON.stringify(report, null, 2);
}

export function exitCode(report: ValidationReport): number {
  return report.summary.failed > 0 ? 1 : 0;
}
