// Emits the machine-readable contract the mobile codegen consumes.
//
// The TypeScript tables are the source; this script is the only thing allowed to write the JSON and
// the generated Kotlin object, so neither can drift from `en.ts` / `ar.ts`. It mirrors what the
// Gradle `:shared:generateAuthContract` task produces (same header, same ordering, same helpers) and
// keeps the helpers untouched, replacing only the key list and the message map.
//
// Run: `bun run --cwd packages/i18n emit:mobile`
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ar } from "../src/auth/ar";
import { en } from "../src/auth/en";

const HERE = dirname(fileURLToPath(import.meta.url));
const I18N = join(HERE, "..");
const KOTLIN = join(
  I18N,
  "..",
  "..",
  "mobile",
  "shared",
  "build",
  "generated",
  "authContract",
  "com",
  "tripsenjoy",
  "auth",
  "AuthStrings.kt",
);

const keys = (Object.keys(en) as (keyof typeof en)[]).sort();

// --- messages.json: the input the Gradle task reads --------------------------
const json: Record<string, Record<string, string>> = { en: {}, ar: {} };
for (const key of Object.keys(en) as (keyof typeof en)[]) {
  json.en[key] = en[key];
  json.ar[key] = ar[key];
}
writeFileSync(join(I18N, "src", "auth", "messages.json"), `${JSON.stringify(json, null, 2)}\n`);

// --- AuthStrings.kt: keys + map, helpers preserved ---------------------------
const escape = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$");

const keyBlock = keys.map((key) => `        "${escape(key)}",`).join("\n");
const mapBlock = keys
  .map(
    (key) =>
      `        "${escape(key)}" to mapOf("en" to "${escape(en[key])}", "ar" to "${escape(ar[key])}"),`,
  )
  .join("\n");

let source = readFileSync(KOTLIN, "utf8");

const keysPattern = /(val keys: List<String> = listOf\(\n)[\s\S]*?(\n {4}\))/;
if (!keysPattern.test(source)) throw new Error("AuthStrings.kt: keys block not found");
source = source.replace(keysPattern, `$1${keyBlock}$2`);

const mapPattern =
  /(private val messages: Map<String, Map<String, String>> = mapOf\(\n)[\s\S]*?(\n {4}\))/;
if (!mapPattern.test(source)) throw new Error("AuthStrings.kt: messages block not found");
source = source.replace(mapPattern, `$1${mapBlock}$2`);

writeFileSync(KOTLIN, source);

console.log(`wrote messages.json and AuthStrings.kt (${keys.length} keys)`);
