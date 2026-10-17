import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Command from "alchemy/Command";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import "varlock/auto-load";

export type * from "./src/types";

export default Alchemy.Stack(
  "trips-app",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), Command.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    // Hyperdrive pools and caches connections to the Postgres database that apps/server uses (DATABASE_URL).
    const databaseUrl = new URL(Redacted.value(yield* Config.Redacted("DATABASE_URL")));
    // Named "trips": alchemy adopts the existing Hyperdrive config with this name (id 73e43d69dc6741efba2b717126381469) instead of creating a second one.
    const database = yield* Cloudflare.Hyperdrive.Connection("db", {
      name: "trips",
      origin: {
        scheme: "postgres",
        host: databaseUrl.hostname,
        port: Number(databaseUrl.port || 5432),
        database: databaseUrl.pathname.slice(1),
        user: decodeURIComponent(databaseUrl.username),
        password: Redacted.make(decodeURIComponent(databaseUrl.password)),
      },
    });
    // R2 object storage for uploads (albums, documents, thumbnails; SRS 4.3).
    const storage = yield* Cloudflare.R2.Bucket("storage", {});

    const webWorker = yield* Cloudflare.Website.Vite("web", {
      rootDir: "../../apps/web",
      compatibility: {
        flags: ["nodejs_compat"],
      },
      env: {
        VITE_SERVER_URL: Config.String("VITE_SERVER_URL"),
        HYPERDRIVE: database,
        STORAGE: storage,
      },
      dev: {
        port: 3001,
      },
    });
    const serverDev = yield* Command.Dev("server-dev", {
      command: "bun run dev:bare",
      cwd: "../../apps/server",
    });

    return {
      web: webWorker.url,
      server: serverDev.url,
    };
  }),
);
