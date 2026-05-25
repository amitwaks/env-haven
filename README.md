# env-haven

Validate `.env` files against a JSON schema. Catches misconfiguration before it reaches production.

## Quick start

```bash
npx env-haven
```

Or install globally:

```bash
npm install -g env-haven
```

Create a `checkmyenv.config.json` in your project root:

```json
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
```

Run:

```bash
env-haven
```

## Commands

| Command | Description |
|---------|-------------|
| `env-haven` | Validate `.env` against `checkmyenv.config.json` |
| `env-haven generate` | Generate `.env.example` from config |
| `env-haven types` | Generate TypeScript type definitions (`env.d.ts`) |
| `env-haven --json` | Output validation as JSON |
| `env-haven --help` | Show help |
| `env-haven --version` | Show version |

## Schema reference

| Option | Type | Description |
|--------|------|-------------|
| `type` | `string \| number \| boolean \| integer` | Expected type |
| `required` | `boolean` | Fail if not set and no default |
| `default` | `string \| number \| boolean` | Fallback if not set |
| `description` | `string` | Human-readable description |
| `format` | `url \| email \| port \| uuid \| hostname \| path \| regexp` | Value format validation |
| `enum` | `array` | Allow-list of valid values |
| `pattern` | `string` | Regex pattern to match |
| `min` | `number` | Minimum (length for strings, value for numbers) |
| `max` | `number` | Maximum (length for strings, value for numbers) |

### Config file locations (checked in order)

- `checkmyenv.config.json`
- `.checkmyenvrc`
- `.checkmyenvrc.json`
- `checkmyenv.config.jsonc`

## Exit codes

- `0` — All variables valid
- `1` — One or more variables failed validation

## API

```typescript
import { loadConfig, parseEnvFile, validateAll, formatReport } from "env-haven";

const config = loadConfig("checkmyenv.config.json");
const env = parseEnvFile(".env");
const results = validateAll(env, config);
console.log(formatReport({ passed: true, results, summary }));
```

## License

MIT
