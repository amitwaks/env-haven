# env-haven

> A safe harbor for your environment variables. Catch misconfiguration before it reaches production.

[![npm](https://img.shields.io/npm/v/env-haven?color=%2325c2a0&label=env-haven&logo=npm&style=flat-square)](https://www.npmjs.com/package/env-haven)
[![license](https://img.shields.io/npm/l/env-haven?color=%23000&style=flat-square)](https://github.com/amitwaks/env-haven/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/env-haven?color=%23339933&logo=node.js&style=flat-square)](https://nodejs.org)
[![bundle size](https://img.shields.io/bundlephobia/minzip/env-haven?color=%23ff69b4&label=size&style=flat-square)](https://www.npmjs.com/package/env-haven)
[![github](https://img.shields.io/badge/github-amitwaks%2Fenv--haven-%23181717?logo=github&style=flat-square)](https://github.com/amitwaks/env-haven)
[![ko-fi](https://img.shields.io/badge/support-ko--fi-%23FF5E5B?logo=ko-fi&style=flat-square)](https://ko-fi.com/amitwaks)

---

You have a `.env` file. You have eight services, three environments, and a deploy pipeline that silently uses defaults when a variable is missing. You've been burned by a production outage caused by `NODE_ENV=staging` instead of `production`. You're not alone.

**env-haven** validates every variable in your `.env` against a schema you define — types, formats, required fields, allowed values, min/max boundaries. It runs in milliseconds, fits in any CI pipeline, and kills the build before bad config reaches production.

```bash
npx env-haven        # validate right now
npx env-haven types  # generate TypeScript types
npx env-haven generate # scaffold .env.example
```

---

## Features

- **Type checking** — `string`, `number`, `boolean`, `integer` with min/max bounds
- **Format validation** — `url`, `email`, `port`, `uuid`, `hostname`, `path`, `regexp`
- **Required vs optional** — fail the build if a critical variable is missing
- **Enum allow-lists** — restrict values to a defined set
- **Smart defaults** — fall back to a value when a variable isn't set
- **Clear error messages** — know exactly which variable failed and why
- **TypeScript types** — generate `env.d.ts` from your schema in one command
- **`.env.example` generation** — always up to date with your schema
- **Zero dependencies** — 3.5 kB gzipped, installs instantly
- **CI-ready** — exit code `0` on pass, `1` on fail

---

## Quick start

```bash
# 1. Create a schema
cat > checkmyenv.config.json <<EOF
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
    },
    "NODE_ENV": {
      "type": "string",
      "enum": ["development", "production", "test"],
      "default": "development"
    },
    "API_KEY": {
      "type": "string",
      "required": true,
      "description": "API authentication key"
    }
  }
}
EOF

# 2. Validate your .env
npx env-haven

# 3. Ship with confidence
```

---

## Commands

| Command | Description |
|---------|-------------|
| `env-haven` | Validate `.env` against schema |
| `env-haven generate` | Generate `.env.example` from schema |
| `env-haven types` | Generate `env.d.ts` TypeScript definitions |
| `env-haven --json` | Machine-readable JSON output |
| `env-haven --help` | Show usage |
| `env-haven --version` | Show version |

---

## Schema reference

### Per-variable options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `string \| number \| boolean \| integer` | Expected type |
| `required` | `boolean` | Fail if not set and no default |
| `default` | `string \| number \| boolean` | Fallback value |
| `description` | `string` | Human-readable description |
| `format` | `url \| email \| port \| uuid \| hostname \| path \| regexp` | Value format validation |
| `enum` | `(string \| number)[]` | Allow-list of valid values |
| `pattern` | `string` | Regex pattern the value must match |
| `min` | `number` | Minimum (length for strings, value for numbers) |
| `max` | `number` | Maximum (length for strings, value for numbers) |

### Example

```json
{
  "vars": {
    "REDIS_URL": {
      "type": "string",
      "required": true,
      "format": "url",
      "description": "Redis connection string"
    },
    "SESSION_TIMEOUT": {
      "type": "integer",
      "default": 3600,
      "min": 60,
      "max": 86400,
      "description": "Session timeout in seconds"
    },
    "LOG_LEVEL": {
      "type": "string",
      "default": "info",
      "enum": ["debug", "info", "warn", "error"],
      "description": "Logging verbosity"
    },
    "FEATURE_FLAG_NEW_CHECKOUT": {
      "type": "boolean",
      "default": false,
      "description": "Enable new checkout flow"
    }
  }
}
```

### Config file search order

- `checkmyenv.config.json`
- `.checkmyenvrc`
- `.checkmyenvrc.json`
- `checkmyenv.config.jsonc`

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | All variables pass validation |
| `1` | One or more variables failed |

Use in CI:

```yaml
# GitHub Actions example
- run: npx env-haven
```

---

## API usage

```typescript
import { loadConfig, parseEnvFile, validateAll, formatReport } from "env-haven";

const config = loadConfig("checkmyenv.config.json");
const env = parseEnvFile(".env");
const results = validateAll(env, config);

const report = {
  passed: results.every(r => r.passed),
  results,
  summary: {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    warnings: results.reduce((s, r) => s + r.warnings.length, 0),
  },
};

console.log(formatReport(report));
process.exit(report.summary.failed > 0 ? 1 : 0);
```

---

## Why env-haven?

| Problem | Solution |
|---------|----------|
| `.env` typos crash in production | Catch them before deploy |
| Missing variables silently default to `undefined` | `required: true` fails the build |
| `NODE_ENV` set to `staging` instead of `production` | `enum: ["development", "production", "test"]` |
| Team members don't know what vars are needed | `generate` creates `.env.example` |
| No type safety for `process.env` | `types` generates `env.d.ts` |
| Config drifts between environments | Single source-of-truth schema |

---

## License

MIT.
