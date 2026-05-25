import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Config } from "./types.js";

const CONFIG_FILES = [
  "checkmyenv.config.json",
  ".checkmyenvrc",
  ".checkmyenvrc.json",
  "checkmyenv.config.jsonc",
];

export function findConfig(startDir = process.cwd()): string | null {
  for (const file of CONFIG_FILES) {
    const path = resolve(startDir, file);
    if (existsSync(path)) return path;
  }
  return null;
}

export function loadConfig(path: string): Config {
  const raw = readFileSync(path, "utf-8");
  const parsed = JSON.parse(raw);

  if (!parsed.vars || typeof parsed.vars !== "object") {
    throw new Error(`Config file "${path}" must have a "vars" object`);
  }

  return parsed as Config;
}

export function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};

  const raw = readFileSync(path, "utf-8");
  const vars: Record<string, string> = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) vars[key] = value;
  }

  return vars;
}
