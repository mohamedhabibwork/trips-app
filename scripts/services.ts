#!/usr/bin/env bun
// Service architecture tool: scaffolds API services, wires them into packages/api, and checks the layering rules.
// Rules: .claude/rules/service-architecture.md. Usage:
//   bun scripts/services.ts init            create every registered service that is missing
//   bun scripts/services.ts create <name>   create one service (name is kebab-case)
//   bun scripts/services.ts sync            regenerate packages/api router composition and dependencies
//   bun scripts/services.ts check           verify structure, import directions and wiring
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SERVICES_DIR = join(ROOT, "packages", "services");
const API_DIR = join(ROOT, "packages", "api");
const API_ROUTERS_FILE = join(API_DIR, "src", "routers", "services.ts");
const API_PACKAGE_JSON = join(API_DIR, "package.json");
const PACKAGE_PREFIX = "@trips-app/service-";
const RPC_PACKAGE = "@trips-app/rpc";
const NAME_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// Registry: one service per SRS module (ARCHITECTURE.md section 3). Add a name here before creating a service.
export const SERVICE_NAMES = [
  "auth",
  "onboarding",
  "organization",
  "employees",
  "trips",
  "programs",
  "fleet",
  "staffing",
  "negotiation",
  "seats",
  "booking",
  "payments",
  "coupons",
  "plans",
  "check-in",
  "moderator",
  "tracking",
  "parent",
  "media",
  "photographer",
  "driver",
  "admin",
  "accounting",
  "notifications",
  "traveler",
  "availability",
] as const;

// Every service has these folders under src/, each with an index.ts. Purpose is written into that index.ts.
const REQUIRED_FOLDERS: Record<string, string> = {
  model: "Entities and aggregates with their invariants. No I/O.",
  types: "Shared TypeScript types, ids and enums. No I/O.",
  errors: "Error categories from SRS IF-04 and this service's error classes.",
  "schemas/validation": "Zod schemas that validate input at the boundary.",
  "schemas/dtos": "Request and response shapes derived from the validation schemas.",
  repository:
    "Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).",
  services: "Business logic. Calls repositories and domain rules, never the database directly.",
  routes:
    "oRPC procedures. Validate input, call services, map errors. Merged into packages/api appRouter.",
};

// The only top-level folders allowed under src/ (index.ts is always allowed).
const LAYER_FOLDERS = ["model", "types", "errors", "schemas", "repository", "services", "routes"];

// Which layer may import which. A file may always import from its own layer.
const ALLOWED_IMPORTS: Record<string, string[]> = {
  routes: ["services", "schemas", "model", "types", "errors"],
  services: ["repository", "schemas", "model", "types", "errors"],
  repository: ["model", "types", "errors"],
  schemas: ["model", "types", "errors"],
  model: ["types", "errors"],
  errors: ["types"],
  types: ["schemas"],
};

function listServices(): string[] {
  if (!existsSync(SERVICES_DIR)) return [];
  return readdirSync(SERVICES_DIR)
    .filter((entry) => statSync(join(SERVICES_DIR, entry)).isDirectory())
    .sort();
}

function titleOf(name: string): string {
  return name
    .split("-")
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

// "check-in" -> "CheckIn"; used for identifiers.
function pascalOf(name: string): string {
  return titleOf(name).replace(/ /g, "");
}

// "check-in" -> "checkIn"; used for router keys and import aliases.
function camelOf(name: string): string {
  const pascal = pascalOf(name);
  return pascal[0]!.toLowerCase() + pascal.slice(1);
}

// Integration files: the wiring every service gets. Owned by this tool at creation time.
function integrationFiles(name: string): Record<string, string> {
  const pascal = pascalOf(name);
  return {
    "src/index.ts": `// ${titleOf(name)} service. This file is the only public entry point; other code imports the package, never src/ paths.\nexport const SERVICE_ID = "${name}";\nexport { ${pascal}ServiceError, map${pascal}Error } from "./errors";\nexport { routes } from "./routes";\n`,
    "src/types/index.ts": `// Shared TypeScript types, ids and enums. No I/O.\nexport type { ErrorCategory, ErrorHttpStatus, SharedErrorCode, SharedErrorCode as ${pascal}ErrorCode } from "@trips-app/domain";\n`,
    "src/errors/index.ts": `// Error categories from SRS IF-04 and this service's error classes referencing centralized shared error codes.\nimport { createServiceErrorMapper, ServiceError, type ServiceErrorOptions } from "@trips-app/domain";\n\nimport type { SharedErrorCode } from "../types";\n\nexport const ${name.replace(/-/g, "_").toUpperCase()}_ERROR_CODE_MAP: Readonly<Record<string, SharedErrorCode>> = {};\n\nexport class ${pascal}ServiceError extends ServiceError {\n\tconstructor(\n\t\tcode: SharedErrorCode,\n\t\tmessage?: string,\n\t\tdetailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,\n\t) {\n\t\tsuper(code, message, detailsOrOptions, "${name}");\n\t\tthis.name = "${pascal}ServiceError";\n\t}\n}\n\nexport const map${pascal}Error = createServiceErrorMapper(\n\t"${name}",\n\t${name.replace(/-/g, "_").toUpperCase()}_ERROR_CODE_MAP,\n);\n`,
    "src/routes/index.ts": `// oRPC procedures for ${titleOf(name)}. Validate input with schemas, call services, map errors.\n// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.\nimport { procedure } from "./procedure";\n\nexport const routes = {\n\tstatus: procedure\n\t\t.route({\n\t\t\tmethod: "GET",\n\t\t\tpath: "/${name}/status",\n\t\t\toperationId: "${camelOf(name)}Status",\n\t\t\tsummary: "${titleOf(name)} service health status",\n\t\t\ttags: ["${name}"],\n\t\t})\n\t\thandler(() => ({ service: "${name}", status: "ok" as const })),\n};\n`,
    "src/routes/procedure.ts": `// Procedure for ${titleOf(name)}. Extends the shared publicProcedure from ${RPC_PACKAGE}; add this service's middleware and error definitions here.\nimport { createServiceErrorMiddleware, publicProcedure } from "${RPC_PACKAGE}";\n\nimport { map${pascal}Error } from "../errors";\n\nconst mapErrors = createServiceErrorMiddleware(map${pascal}Error, "${name}");\n\nexport const procedure = publicProcedure.use(mapErrors);\n`,
    "src/services/index.ts": `// Business logic for ${titleOf(name)}. Routes call this factory with context.db; repositories are created here.\nimport type { ServiceDatabase } from "../repository";\n\nexport function create${pascal}Service(_db: ServiceDatabase) {\n\treturn {};\n}\n`,
    "src/repository/index.ts": `// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).\nexport type { Database as ServiceDatabase } from "@trips-app/db";\n`,
  };
}

function serviceFiles(name: string): Record<string, string> {
  const files: Record<string, string> = {
    "package.json": `${JSON.stringify(
      {
        name: `${PACKAGE_PREFIX}${name}`,
        type: "module",
        exports: { ".": "./src/index.ts" },
        scripts: { build: "tsc -b", "check-types": "tsc -b" },
        dependencies: {
          "@trips-app/db": "workspace:*",
          "@trips-app/domain": "workspace:*",
          [RPC_PACKAGE]: "workspace:*",
          zod: "catalog:",
        },
        devDependencies: {
          "@trips-app/config": "workspace:*",
          typescript: "catalog:",
        },
      },
      null,
      2,
    )}\n`,
    "tsconfig.json": `${JSON.stringify(
      {
        extends: "@trips-app/config/tsconfig.base.json",
        compilerOptions: {
          composite: true,
          declaration: true,
          declarationMap: true,
          emitDeclarationOnly: true,
          outDir: "dist",
        },
        include: ["src/**/*.ts"],
        references: [{ path: "../../db" }, { path: "../../domain" }, { path: "../../rpc" }],
      },
      null,
      2,
    )}\n`,
  };
  for (const [folder, purpose] of Object.entries(REQUIRED_FOLDERS)) {
    files[`src/${folder}/index.ts`] = `// ${purpose}\nexport {};\n`;
  }
  return { ...files, ...integrationFiles(name) };
}

function writeServiceFiles(name: string, overwrite: boolean): void {
  for (const [path, content] of Object.entries(serviceFiles(name))) {
    const full = join(SERVICES_DIR, name, path);
    if (!overwrite && existsSync(full)) continue;
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
}

function assertValidName(name: string | undefined): asserts name is string {
  if (!name || !NAME_PATTERN.test(name)) {
    throw new Error(
      `Invalid service name "${name ?? ""}": use kebab-case, for example "check-in".`,
    );
  }
}

function create(name: string | undefined): void {
  assertValidName(name);
  if (!(SERVICE_NAMES as readonly string[]).includes(name)) {
    throw new Error(
      `"${name}" is not in SERVICE_NAMES. Add it to the registry in scripts/services.ts first.`,
    );
  }
  if (existsSync(join(SERVICES_DIR, name)))
    throw new Error(`packages/services/${name} already exists`);
  writeServiceFiles(name, false);
  console.log(`Created packages/services/${name} (${PACKAGE_PREFIX}${name})`);
}

// Writes every missing file of every registered service. Existing files are left alone.
function init(): void {
  for (const name of SERVICE_NAMES) {
    const existed = existsSync(join(SERVICES_DIR, name));
    writeServiceFiles(name, false);
    console.log(`${existed ? "Completed" : "Created"} packages/services/${name}`);
  }
}

// Dependencies this tool owns: every service needs the rpc base; the api package needs every service.
// Routes build procedures with oRPC, so every service depends on @orpc/server directly (Bun resolves it from the service folder).
function serviceDependencies(): Record<string, string> {
  return { [RPC_PACKAGE]: "workspace:*", "@orpc/server": "catalog:" };
}

function apiDependencies(): Record<string, string> {
  const deps: Record<string, string> = { [RPC_PACKAGE]: "workspace:*" };
  for (const name of SERVICE_NAMES) deps[`${PACKAGE_PREFIX}${name}`] = "workspace:*";
  return deps;
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

// Keys whose workspace dependency is missing or different in package.json.
function missingDependencies(path: string, required: Record<string, string>): string[] {
  const deps = (readJson(path).dependencies ?? {}) as Record<string, string>;
  return Object.keys(required).filter((key) => deps[key] !== required[key]);
}

function addDependencies(path: string, required: Record<string, string>): void {
  const pkg = readJson(path);
  const deps = {
    ...((pkg.dependencies ?? {}) as Record<string, string>),
    ...required,
  };
  pkg.dependencies = Object.fromEntries(
    Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

// Renders packages/rpc/src/routers/services.ts. Each service's routes are mounted under its camelCase name.
function renderServiceRouters(): string {
  const names = SERVICE_NAMES.map((name) => ({ name, alias: camelOf(name) }));
  const imports = names
    .map(({ name, alias }) => `import { routes as ${alias} } from "${PACKAGE_PREFIX}${name}";`)
    .join("\n");
  const entries = names.map(({ alias }) => `\t${alias},`).join("\n");
  return `// GENERATED by \`bun scripts/services.ts sync\`. Do not edit: change the service's routes instead.\n${imports}\n\nexport const serviceRouters = {\n${entries}\n};\n`;
}

function sync(): void {
  writeFileSync(API_ROUTERS_FILE, renderServiceRouters());
  addDependencies(API_PACKAGE_JSON, apiDependencies());
  for (const name of SERVICE_NAMES) {
    addDependencies(join(SERVICES_DIR, name, "package.json"), serviceDependencies());
  }
  console.log(`Synced packages/api and ${SERVICE_NAMES.length} service dependencies.`);
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return entry.name.endsWith(".ts") ? [full] : [];
  });
}

function checkStructure(name: string): string[] {
  const dir = join(SERVICES_DIR, name);
  const src = join(dir, "src");
  const problems: string[] = [];

  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) {
    problems.push("missing package.json");
  } else {
    const pkg = readJson(pkgPath) as {
      name?: string;
      exports?: Record<string, string>;
    };
    if (pkg.name !== `${PACKAGE_PREFIX}${name}`)
      problems.push(`package name must be ${PACKAGE_PREFIX}${name}`);
    if (Object.keys(pkg.exports ?? {}).join(",") !== ".") {
      problems.push('exports must be exactly "." (no deep imports into src/)');
    }
    for (const dep of missingDependencies(pkgPath, serviceDependencies())) {
      problems.push(
        `package.json is missing dependency ${dep} (run: bun scripts/services.ts sync)`,
      );
    }
  }
  if (!existsSync(join(dir, "tsconfig.json"))) problems.push("missing tsconfig.json");
  if (!existsSync(join(src, "index.ts"))) problems.push("missing src/index.ts");

  for (const folder of Object.keys(REQUIRED_FOLDERS)) {
    if (!existsSync(join(src, folder, "index.ts"))) problems.push(`missing src/${folder}/index.ts`);
  }
  const errorsFile = join(src, "errors", "index.ts");
  if (existsSync(errorsFile)) {
    const errorsSource = readFileSync(errorsFile, "utf8");
    if (!errorsSource.includes('from "@trips-app/domain"')) {
      problems.push(
        "src/errors/index.ts must reference the shared error code system from @trips-app/domain",
      );
    }
  }
  const routesDir = join(src, "routes");
  const routesIndex = join(routesDir, "index.ts");
  const procedureFile = join(routesDir, "procedure.ts");
  if (!existsSync(procedureFile))
    problems.push("missing src/routes/procedure.ts (local procedure extends publicProcedure)");
  if (existsSync(procedureFile)) {
    const procedureSource = readFileSync(procedureFile, "utf8");
    if (
      !procedureSource.includes(`from "${RPC_PACKAGE}"`) ||
      !/publicProcedure/.test(procedureSource)
    )
      problems.push(`src/routes/procedure.ts must extend publicProcedure from ${RPC_PACKAGE}`);
  }
  if (existsSync(routesIndex)) {
    const routes = readFileSync(routesIndex, "utf8");
    if (!routes.includes('from "./procedure"'))
      problems.push(
        "src/routes/index.ts must build its procedures on the local procedure in ./procedure",
      );
    if (!/\.handler\(/.test(routes))
      problems.push(
        "src/routes/index.ts must define at least one procedure (every service needs one)",
      );
  }
  for (const entry of readdirSync(src)) {
    if (entry === "index.ts") continue;
    if (!LAYER_FOLDERS.includes(entry)) {
      problems.push(`unknown src/${entry}: add it to the architecture rule before using it`);
    }
  }
  return problems;
}

// Layer of a source file: the top-level folder it sits in, or "root" for src/index.ts.
function layerOf(srcDir: string, file: string): string {
  const parts = relative(srcDir, file).split(sep);
  return parts.length === 1 ? "root" : parts[0]!;
}

// Layer an import points at. A folder such as ../repository is a layer, not the root.
function layerOfTarget(srcDir: string, target: string): string {
  const rel = relative(srcDir, target);
  if (rel === "" || rel === "index" || rel === "index.ts") return "root";
  return rel.split(sep)[0]!;
}

function importSpecifiers(text: string): string[] {
  const pattern = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;
  return [...text.matchAll(pattern)].map((match) => match[1]!);
}

function checkRelativeImport(from: string, to: string, spec: string): string | null {
  if (to !== "root" && !LAYER_FOLDERS.includes(to)) return `imports unknown module "${spec}"`;
  if (to === "root" && from !== "root")
    return `${from} imports the service root "${spec}" (cycle risk)`;
  if (from === "root" || to === from) return null;
  if (!ALLOWED_IMPORTS[from]?.includes(to)) return `${from} may not import ${to} ("${spec}")`;
  return null;
}

function checkPackageImport(name: string, from: string, spec: string): string | null {
  if (spec === "@trips-app/db/zod") {
    return ["schemas", "repository"].includes(from)
      ? null
      : `only schemas and repository may import @trips-app/db/zod (found in ${from})`;
  }
  if (spec === "@trips-app/db" || spec.startsWith("@trips-app/db/")) {
    return from === "repository"
      ? null
      : `only repository may import @trips-app/db (found in ${from})`;
  }
  if (spec === RPC_PACKAGE || spec.startsWith(`${RPC_PACKAGE}/`)) {
    return from === "routes" ? null : `only routes may import ${RPC_PACKAGE} (found in ${from})`;
  }
  if (spec === "@trips-app/domain" || spec.startsWith("@trips-app/domain/")) {
    return ["services", "model", "errors", "types", "schemas", "routes", "root"].includes(from)
      ? null
      : `only services, model, errors, types, schemas, and routes may import @trips-app/domain (found in ${from})`;
  }
  if (spec.startsWith(PACKAGE_PREFIX)) {
    const rest = spec.slice(PACKAGE_PREFIX.length);
    if (rest.includes("/")) return `deep import "${spec}": import the service package root only`;
    if (rest === name) return `service ${name} imports itself by package name`;
    if (!(SERVICE_NAMES as readonly string[]).includes(rest)) return `unknown service "${spec}"`;
  }
  return null;
}

function checkImports(name: string): string[] {
  const srcDir = join(SERVICES_DIR, name, "src");
  const problems: string[] = [];
  for (const file of listSourceFiles(srcDir)) {
    const from = layerOf(srcDir, file);
    const text = readFileSync(file, "utf8");
    for (const spec of importSpecifiers(text)) {
      const problem = spec.startsWith(".")
        ? checkRelativeImport(from, layerOfTarget(srcDir, resolve(dirname(file), spec)), spec)
        : checkPackageImport(name, from, spec);
      if (problem) problems.push(`${relative(ROOT, file)}: ${problem}`);
    }
  }
  return problems;
}

// Wiring between the services and packages/api: generated file in sync, api depends on every service.
function checkWiring(): string[] {
  const problems: string[] = [];
  if (
    !existsSync(API_ROUTERS_FILE) ||
    readFileSync(API_ROUTERS_FILE, "utf8") !== renderServiceRouters()
  ) {
    problems.push(
      "packages/rpc/src/routers/services.ts is out of date (run: bun scripts/services.ts sync)",
    );
  }
  for (const dep of missingDependencies(API_PACKAGE_JSON, apiDependencies())) {
    problems.push(
      `packages/rpc/package.json is missing dependency ${dep} (run: bun scripts/services.ts sync)`,
    );
  }
  const routers = readFileSync(join(API_DIR, "src", "routers", "index.ts"), "utf8");
  if (!routers.includes("...serviceRouters")) {
    problems.push("packages/rpc/src/routers/index.ts must spread ...serviceRouters into appRouter");
  }
  return problems;
}

function check(): number {
  const present = listServices();
  const problems: string[] = [];

  for (const name of SERVICE_NAMES) {
    if (!present.includes(name))
      problems.push(
        `packages/services/${name} is registered but missing (run: bun scripts/services.ts init)`,
      );
  }
  for (const name of present) {
    if (!(SERVICE_NAMES as readonly string[]).includes(name)) {
      problems.push(`packages/services/${name} is not in SERVICE_NAMES; register it first`);
      continue;
    }
    for (const problem of [...checkStructure(name), ...checkImports(name)]) {
      problems.push(`packages/services/${name}: ${problem}`);
    }
  }
  problems.push(...checkWiring());

  if (problems.length === 0) {
    console.log(`Service architecture OK: ${present.length} services checked.`);
    return 0;
  }
  console.error(`Service architecture: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  return 1;
}

function main(): void {
  const [command, argument] = process.argv.slice(2);
  try {
    switch (command) {
      case "init":
        init();
        return;
      case "create":
        create(argument);
        return;
      case "sync":
        sync();
        return;
      case "check":
        process.exit(check());
      default:
        console.error("Usage: bun scripts/services.ts <init | create <name> | sync | check>");
        process.exit(2);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
