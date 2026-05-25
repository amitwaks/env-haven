export type EnvType = "string" | "number" | "boolean" | "integer";

export type EnvFormat = "url" | "email" | "port" | "uuid" | "hostname" | "path" | "regexp";

export interface VarSpec {
  type?: EnvType;
  required?: boolean;
  default?: string | number | boolean;
  description?: string;
  format?: EnvFormat;
  enum?: (string | number)[];
  pattern?: string;
  min?: number;
  max?: number;
}

export interface Config {
  vars: Record<string, VarSpec>;
}

export interface VarResult {
  name: string;
  passed: boolean;
  value: string | undefined;
  errors: string[];
  warnings: string[];
}

export interface ValidationReport {
  passed: boolean;
  results: VarResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}
