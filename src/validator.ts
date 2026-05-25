import type { Config, VarSpec, VarResult } from "./types.js";

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOSTNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;

export function validateValue(value: string | undefined, spec: VarSpec, name: string): VarResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value === undefined || value === "") {
    if (spec.required && spec.default === undefined) {
      errors.push(`Missing required variable "${name}"`);
    }
    return { name, passed: errors.length === 0, value, errors, warnings };
  }

  if (spec.enum && !spec.enum.includes(value)) {
    errors.push(`"${name}" must be one of: ${spec.enum.join(", ")} (got "${value}")`);
  }

  if (spec.type) {
    validateType(value, spec.type, spec, name, errors, warnings);
  }

  if (spec.format) {
    validateFormat(value, spec.format, name, errors);
  }

  if (spec.pattern) {
    const regex = new RegExp(spec.pattern);
    if (!regex.test(value)) {
      errors.push(`"${name}" does not match pattern ${spec.pattern}`);
    }
  }

  return { name, passed: errors.length === 0, value, errors, warnings };
}

function validateType(
  value: string,
  type: string,
  spec: VarSpec,
  name: string,
  errors: string[],
  warnings: string[]
): void {
  switch (type) {
    case "number": {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`"${name}" must be a number (got "${value}")`);
      } else {
        if (spec.min !== undefined && num < spec.min) {
          errors.push(`"${name}" must be >= ${spec.min} (got ${num})`);
        }
        if (spec.max !== undefined && num > spec.max) {
          errors.push(`"${name}" must be <= ${spec.max} (got ${num})`);
        }
      }
      break;
    }
    case "integer": {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) {
        errors.push(`"${name}" must be an integer (got "${value}")`);
      } else {
        if (spec.min !== undefined && num < spec.min) {
          errors.push(`"${name}" must be >= ${spec.min} (got ${num})`);
        }
        if (spec.max !== undefined && num > spec.max) {
          errors.push(`"${name}" must be <= ${spec.max} (got ${num})`);
        }
      }
      break;
    }
    case "boolean": {
      const normalized = value.toLowerCase();
      if (!["true", "false", "1", "0", "yes", "no"].includes(normalized)) {
        errors.push(`"${name}" must be a boolean (got "${value}")`);
      }
      break;
    }
    case "string": {
      if (typeof value !== "string") {
        errors.push(`"${name}" must be a string`);
      }
      if (spec.min !== undefined && value.length < spec.min) {
        errors.push(`"${name}" must be at least ${spec.min} characters (got ${value.length})`);
      }
      if (spec.max !== undefined && value.length > spec.max) {
        errors.push(`"${name}" must be at most ${spec.max} characters (got ${value.length})`);
      }
      break;
    }
  }
}

function validateFormat(value: string, format: string, name: string, errors: string[]): void {
  switch (format) {
    case "url":
      if (!isValidUrl(value)) errors.push(`"${name}" must be a valid URL (got "${value}")`);
      break;
    case "email":
      if (!EMAIL_REGEX.test(value)) errors.push(`"${name}" must be a valid email (got "${value}")`);
      break;
    case "port": {
      const port = parseInt(value, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push(`"${name}" must be a valid port (1-65535, got "${value}")`);
      }
      break;
    }
    case "uuid":
      if (!UUID_REGEX.test(value)) errors.push(`"${name}" must be a valid UUID (got "${value}")`);
      break;
    case "hostname":
      if (!HOSTNAME_REGEX.test(value)) errors.push(`"${name}" must be a valid hostname (got "${value}")`);
      break;
    case "path":
      if (!value.startsWith("/") && !value.startsWith("./") && !value.startsWith("~") && !value.includes(":\\")) {
        errors.push(`"${name}" must be a valid path (got "${value}")`);
      }
      break;
    case "regexp":
      try {
        new RegExp(value);
      } catch {
        errors.push(`"${name}" must be a valid regular expression (got "${value}")`);
      }
      break;
  }
}

export function validateAll(env: Record<string, string>, config: Config): VarResult[] {
  return Object.entries(config.vars).map(([name, spec]) => {
    const value = env[name] ?? spec.default?.toString();
    return validateValue(value, spec, name);
  });
}
