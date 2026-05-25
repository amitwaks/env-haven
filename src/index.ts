import { resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { findConfig, loadConfig, parseEnvFile } from "./config.js";
import { validateAll } from "./validator.js";
import { formatReport, formatJson, exitCode } from "./formatter.js";
import { generateEnvExample, generateTypeScriptTypes } from "./generators.js";
import type { ValidationReport } from "./types.js";

export { loadConfig, parseEnvFile, validateAll, formatReport, generateEnvExample, generateTypeScriptTypes };
export type { Config, VarSpec, VarResult, ValidationReport } from "./types.js";

function printHelp(): void {
  console.log(`
env-haven — Validate .env files against a JSON schema

USAGE
  env-haven                 Validate .env against checkmyenv.config.json
  env-haven generate        Generate .env.example from config
  env-haven types           Generate TypeScript type definitions
  env-haven --json          Output validation as JSON
  env-haven --help          Show this help
  env-haven --version       Show version

CONFIG
  Create a checkmyenv.config.json in project root:

    {
      "vars": {
        "PORT": {
          "type": "number",
          "required": true,
          "format": "port",
          "default": 3000,
          "description": "Server port"
        },
        "DATABASE_URL": {
          "type": "string",
          "required": true,
          "format": "url"
        }
      }
    }

EXIT CODES
  0   All required variables are valid
  1   One or more variables failed validation
`);
}

function printVersion(): void {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const pkg = JSON.parse(readFileSync(pkgUrl, "utf-8"));
  console.log(pkg.version);
}

function main(): void {
  const cmd = process.argv[2];

  if (cmd === "--help" || cmd === "-h") {
    printHelp();
    process.exit(0);
  }

  if (cmd === "--version" || cmd === "-v") {
    printVersion();
    process.exit(0);
  }

  const configPath = findConfig();
  if (!configPath) {
    console.error("env-haven: No config file found (checkmyenv.config.json, .checkmyenvrc, etc.)");
    console.error("Run `env-haven --help` for usage.");
    process.exit(1);
  }

  const config = loadConfig(configPath);
  const cwd = resolve(configPath, "..");

  if (cmd === "generate") {
    const example = generateEnvExample(config);
    const outPath = resolve(cwd, ".env.example");
    if (existsSync(outPath) && !process.argv.includes("--force")) {
      console.error(`env-haven: ${outPath} already exists. Use --force to overwrite.`);
      process.exit(1);
    }
    writeFileSync(outPath, example);
    console.log(`env-haven: Generated ${outPath}`);
    process.exit(0);
  }

  if (cmd === "types") {
    const types = generateTypeScriptTypes(config);
    const outPath = resolve(cwd, "env.d.ts");
    writeFileSync(outPath, types);
    console.log(`env-haven: Generated ${outPath}`);
    process.exit(0);
  }

  const envPath = resolve(cwd, ".env");
  const env = parseEnvFile(envPath);
  const results = validateAll(env, config);

  const report: ValidationReport = {
    passed: results.every((r) => r.passed),
    results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.passed && r.errors.length === 0).length,
      failed: results.filter((r) => !r.passed || r.errors.length > 0).length,
      warnings: results.reduce((s, r) => s + r.warnings.length, 0),
    },
  };

  if (process.argv.includes("--json")) {
    console.log(formatJson(report));
  } else {
    console.log(formatReport(report));
  }

  process.exit(exitCode(report));
}

main();
