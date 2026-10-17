# Trips Enjoy: App and Package Architecture

Derived from the docs in `../docs/`: SRS 3.1 (product parts), 3.5 (constraints), 4.1 (surfaces), 6.2 (data isolation), 9 (API conventions); decision register D-86, D-124, D-327; Tasks FND-23. The current code layout is described here; where it differs from the docs, section 8 lists the open decisions.

## 1. Surfaces and apps

Each surface is its own app and its own deployment (UI-07, FND-23). The docs fix one domain per surface (D-327).

| Surface                                            | Folder(s) on disk                                                                    | Domain                   | Users                                         | Access (SRS 4.1)                              | Platform (D-86)                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------ | --------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Traveler app, incl. parent tracker section (D-124) | `apps/web/src/surfaces/traveler/`, `mobile/` (root `androidApp`, `webApp`, `iosApp`) | trips-enjoy.com          | Travelers, parents, guardians                 | Public browse; sign-in to book                | Responsive web and mobile                       |
| Organization dashboard                             | `apps/web/src/surfaces/business/`                                                    | business.trips-enjoy.com | Organization owners and employees             | Staff sign-in, tenant-scoped                  | Responsive web                                  |
| Admin console                                      | `apps/web/src/surfaces/admin/`                                                       | admin.trips-enjoy.com    | Platform staff (roles D-49)                   | Sign-in with mandatory authenticator          | Responsive web                                  |
| Driver app                                         | `mobile/driver/` (`androidApp`, `webApp`, `iosApp`)                                  | driver.trips-enjoy.com   | Platform and organization-owned drivers       | Sign-in; locked during a lab test (FR-DRV-03) | Mobile; web limited to documents and profile    |
| Photographer studio                                | `apps/web/src/surfaces/studio/` and `mobile/photographer/`                           | studio.trips-enjoy.com   | Platform and organization-owned photographers | Sign-in; plan-gated features                  | Responsive web (see section 8, decision 2)      |
| Moderator app                                      | `apps/web/src/surfaces/crew/` and `mobile/moderator/`                                | crew.trips-enjoy.com     | Vehicle moderators                            | Scoped to one vehicle                         | PWA, web not native (see section 8, decision 2) |

Layout rules:

- All web surfaces live in one app, `apps/web`, one folder per surface under `src/surfaces/`. Each surface is a route area inside that app, and each deploys separately by domain (UI-07).
- Native mobile apps live in the top-level `mobile/` folder (section 7). The Gradle build there compiles every app.

### 1.1 Traveler app

The traveler web surface is `apps/web/src/surfaces/traveler/`. The TanStack Start routes in `apps/web/src/routes/` serve every surface. The traveler mobile apps are at the root of `mobile/`.

### 1.2 Shared backend

`apps/server` serves every surface. It mounts the `appRouter` from `packages/api`, which in turn mounts the routes of all 26 services. It owns:

- the versioned API (IF-01, IF-03, IF-04),
- the real-time channel (IF-11, TRK), not built yet,
- scheduled jobs (A5 schedule), not built yet,
- outbound webhooks (IF-10, D-63), not built yet,
- payment callbacks (COM-05), not built yet.

Domain code lives in `packages/services/<module>/`, one package per SRS module (section 3). Each service follows the layers in `.claude/rules/service-architecture.md`. A service can later be deployed as its own app.

## 2. Shared packages

| Package             | Status                                                                | Purpose                                                                                                                                                     | Source                         |
| ------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `packages/api`      | existing                                                              | `appRouter` and the generated `routers/services.ts`, which mounts every service's routes. Imported by `apps/server` and the web app (types only)            | IF-01 to IF-08                 |
| `packages/rpc`      | existing, `@trips-app/rpc`                                            | Procedure base: `publicProcedure` and the `Context` type (`{ db }`). Only service `routes` import it                                                        | IF-03, IF-04                   |
| `packages/db`       | existing                                                              | Connection (`createDb`, `Database` type), `schema` and migrations. Every owned row carries a tenant ID. Only service `repository` layers import it          | DAT-01, T-FND-06               |
| `packages/services` | 26 packages, see section 3                                            | Domain services (`@trips-app/service-<module>`)                                                                                                             | SRS 3.2                        |
| `packages/domain`   | new, set up (`@trips-app/domain`)                                     | Pure rules, no I/O: state machines (SRS 7), plan and permission gates, money as amount plus currency code. Currently exports `money()` and the `Money` type | CON-06, CON-07, DAT-06, SRS 7  |
| `packages/i18n`     | new, set up (`@trips-app/i18n`), used by `apps/server` and `apps/web` | Arabic and English strings, RTL helpers, build check for missing Arabic strings. Currently exports `SUPPORTED_LOCALES`, `Locale`, `directionOf()`           | CON-03, UI-01, UI-02, T-FND-19 |
| `packages/ui`       | existing                                                              | Shared web components. Must support RTL and phone width (360 px, 16 px gutter)                                                                              | UI-02, UI-04, T-FND-21         |
| `packages/config`   | existing                                                              | Shared TypeScript config                                                                                                                                    |                                |
| `packages/infra`    | existing (Alchemy stack)                                              | Infrastructure as code: Cloudflare web worker, Hyperdrive config `trips`, R2 bucket `storage`, dev server                                                   | SRS 5.x FND, D-36              |

Rule: `packages/domain` must not import from `db`, `api` or any app. The apps and server depend on it, never the reverse.

`packages/domain`, `packages/i18n`, `packages/rpc` and `packages/api` are workspace packages. Consumers depend on them with `"@trips-app/<name>": "workspace:*"`. `mobile/shared` is not an npm package. It is a Gradle module (section 7).

## 3. Services

One package per SRS module (SRS 3.2, with AVL from SRS 5.26), in `packages/services/<module>/`, named `@trips-app/service-<module>`. Each owns its model, schemas, repository, services and routes. Rules: `.claude/rules/service-architecture.md`. Check: `bun run services:check`.

| Folder         | Code | Folder          | Code |
| -------------- | ---- | --------------- | ---- |
| `auth`         | AUTH | `payments`      | PAY  |
| `onboarding`   | ONB  | `coupons`       | CPN  |
| `organization` | ORG  | `plans`         | SUB  |
| `employees`    | EMP  | `check-in`      | CHK  |
| `trips`        | TRIP | `moderator`     | MOD  |
| `programs`     | PRG  | `tracking`      | TRK  |
| `fleet`        | FLT  | `parent`        | PAR  |
| `staffing`     | STF  | `media`         | MED  |
| `negotiation`  | NEG  | `photographer`  | PHO  |
| `seats`        | SEAT | `driver`        | DRV  |
| `booking`      | BKG  | `admin`         | ADM  |
| `accounting`   | ACC  | `notifications` | NTF  |
| `traveler`     | TRV  | `availability`  | AVL  |

Each service currently exposes one `status` procedure (a placeholder). Real procedures replace it as each module gets endpoints.

## 4. Stack conflict (decision needed)

The docs and the scaffold disagree, and the mobile apps add a third option.

- Docs (SRS CON-05, D-36, Tasks FND-01): NestJS backend, Next.js web, React Native with Expo for mobile, PostgreSQL 16 with row-level security, Redis 7, SQS, TimescaleDB, S3, Terraform, GitHub Actions.
- Scaffold (`bts.jsonc`): TanStack Start web, Elysia server, oRPC, Drizzle on Postgres, Cloudflare deploy (Alchemy), Bun.
- Mobile on disk: Kotlin Multiplatform with Compose Multiplatform (section 7). The docs call for React Native with Expo.

D-36 says changing the stack needs a decision record signed off by Engineering. Until one exists, the docs' stack is the requirement. The folder layout above is the same under either stack, apart from the folder names.

## 5. Rules that apply to every app

1. Tenant isolation at the data, service and API layers (DAT-01, CON-01). A request for another tenant's record returns not-found (IF-12).
2. Plan limits and permissions are enforced on the server. Screens only reflect the result (CON-06).
3. Money is stored as an amount with a currency code, and shown with its currency (DAT-06, UI-06). Web code uses `@trips-app/domain`. Kotlin code uses the `Money` formatter in `mobile/shared`.
4. Card data never reaches our servers. Payment uses the gateway's hosted page or SDK (CON-02).
5. Every surface is Arabic and English with RTL mirroring, and reflows to a phone width with no horizontal scroll (UI-01, UI-02, UI-04).
6. Child data is never used for advertising, marketing or model training (CON-08).
7. Every financial event is written to the double-entry ledger (CON-07).
8. Secrets stay out of tracked files. Credentials live in gitignored `.env` files, not in `.env.schema` or source. Service-account keys (for example Firebase admin SDK JSON) are never kept in the repo.

## 6. API integration

How the pieces connect (rules in `.claude/rules/service-architecture.md`):

- `@trips-app/db` owns the connection (`createDb`, the `Database` type, and `schema`). Only service repositories import it.
- `@trips-app/rpc` owns the procedure base (`publicProcedure`) and the `Context` type, which carries `db`. Only service routes import it. It is its own package so that `packages/api` and the services do not import each other in a cycle.
- Each service exports `routes`. `packages/api` mounts all of them under `appRouter`, through the generated `packages/api/src/routers/services.ts`.
- `bun scripts/services.ts sync` regenerates that file and the workspace dependencies of `packages/api` and each service. `bun run services:check` fails when they are out of date.
- `apps/server` serves `appRouter` and builds the `Context` (`apps/server/src/context.ts`). The web app calls the same router through its typed client (`apps/web/src/utils/orpc.ts`).
- Web pages fetch data in route loaders on the server, so every page is server-rendered (`apps/web/src/utils/api-status.ts`).

## 7. Mobile apps (Kotlin Multiplatform)

### 7.1 Layout

```
mobile/
  build.gradle.kts, settings.gradle.kts, gradle/   one Gradle build for every app
  shared/                       Kotlin Multiplatform module, shared by all apps
    src/commonMain/kotlin/com/tripsenjoy/
      api/                      ApiClient (typed oRPC client), ApiPlatform (expect: base URL and HTTP engine), rememberApiClient
      ui/                       TripsApp (theme and shell), components/ (StateViews, Indicators, Money)
      surfaces/                 SurfaceRole, AppShell (role tab + traveler tab), SurfaceScreen, RoleHome
        traveler/               TravelerSurface and ApiStatusView (offered by every app)
        driver/, moderator/, photographer/   role apps, each a thin wrapper over AppShell
      traveler/                 traveler App() entry, Greeting, Platform (expect declarations)
    src/androidMain, iosMain, jsMain, wasmJsMain   platform actuals (HTTP engine, base URL)
    src/commonTest              ApiClientTest (MockEngine), MoneyFormatTest
  androidApp/                   traveler Android app       (com.tripsenjoy.traveler)
  iosApp/                       traveler iOS shell (Xcode project)
  webApp/                       KMP test harness in a browser: pick an app to run its screens (Kotlin/Wasm and JS). Not production web.
  driver/      androidApp/, iosApp/                        (com.tripsenjoy.driver)
  photographer/ androidApp/, iosApp/                       (com.tripsenjoy.photographer)
  moderator/   androidApp/, iosApp/                        (com.tripsenjoy.moderator)
```

Production web for every surface is `apps/web` (section 1). There are no per-role web modules in `mobile/`.

### 7.2 Gradle modules

`mobile/settings.gradle.kts` includes `:shared`, `:androidApp`, `:webApp`, `:driver:androidApp`, `:photographer:androidApp`, `:moderator:androidApp`. The root project is named `trips-enjoy-mobile` (an npm-safe name, required by the Kotlin/Wasm build). The iOS shells (`iosApp/`, `driver/iosApp`, `photographer/iosApp`, `moderator/iosApp`) are Xcode projects, not Gradle modules, so they build from Xcode.

Build commands (run from `mobile/`), all verified:

- `./gradlew :shared:allTests` runs the shared tests on Android (host), JS, Wasm and the iOS simulator.
- `./gradlew buildAllApps` builds the four Android debug apps and the Kotlin/Wasm test harness.
- `./gradlew :androidApp:assembleDebug` builds the traveler Android app.
- `./gradlew :webApp:wasmJsBrowserDevelopmentRun` runs the test harness in a browser (`jsBrowserDevelopmentRun` for older browsers).
- After changing Kotlin/Wasm npm dependencies, run `./gradlew kotlinWasmUpgradeYarnLock` to update the lock file.

### 7.3 Dependency rules

1. App modules depend on `:shared` only. `:shared` never depends on an app module.
2. Screens and UI state live in `shared/src/commonMain`. Platform code is limited to `expect`/`actual` declarations in the platform source sets.
3. Each app's Android `namespace` and `applicationId` are `com.tripsenjoy.<app>`, and the Kotlin packages match.
4. Shared UI never calls a database directly. Data comes through `com.tripsenjoy.api.ApiClient`, which calls the oRPC `/rpc` endpoint of `apps/server`. The base URL is per platform (`ApiPlatform`): `10.0.2.2:3000` for the Android emulator, `localhost:3000` elsewhere. Cleartext HTTP is allowed only in debug builds (`src/debug/AndroidManifest.xml`). Release builds need an HTTPS base URL.
   4a. Every app offers the traveler surface. Role apps get it as a second tab from `AppShell`. The traveler app shows it directly.
5. RTL, Arabic and English strings, and phone-width layouts follow section 5. Money is formatted with the shared `Money` helper.

### 7.4 Firebase

- Each Android app has its `google-services.json` in its `androidApp` folder. Each iOS app has `GoogleService-Info.plist` in its `iosApp` folder. Both are client configuration.
- Dependencies come from `firebase-bom` in `mobile/gradle/libs.versions.toml`, with the Google services, Crashlytics and Performance plugins. Messaging, Crashlytics, Performance and Analytics are declared. Their SDK initialization is not done.
- Known issue: a Firebase admin SDK key (`trips-enjoy-com-firebase-adminsdk-*.json`) is in the repo root. It is gitignored by the `*-firebase-adminsdk-*.json` rule, but it should move out of the repo. Rotate it if it has been shared.

## 8. Open decisions

Decided (user, this round):

- **Mobile stack: Kotlin Multiplatform only.** All mobile apps are KMP. The React Native and Expo option in the docs is not used. This still needs a D-36 decision record, because the docs name React Native.
- **Web: one place.** Production web for every surface is `apps/web`. The per-role web modules in `mobile/` were removed. `mobile/webApp` is a KMP test harness that runs the mobile screens in a browser.
- **API client.** Built in `mobile/shared` (`com.tripsenjoy.api`), with tests against a mock engine.
- **Traveler surface.** Offered by every app through `AppShell`.
- **Firebase admin SDK key.** Kept in the repo root for now, at the user's direction. It is gitignored by pattern, but a service-account key in the repo is a risk. Move it out, and rotate it if it has been shared.

Still open:

1. **D-86 for photographer and moderator.** D-86 says only the driver app is native. `mobile/photographer` and `mobile/moderator` are now native KMP apps, and the docs make them web and PWA. Record a decision that changes D-86, or remove their native shells.
2. **Stack record.** Add the KMP decision under D-36 so the docs match.
3. **Release base URL.** The API base URL for release builds is not set yet. It must be HTTPS.
