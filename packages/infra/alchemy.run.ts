import * as Alchemy from "alchemy";
import * as Axiom from "alchemy/Axiom";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Command from "alchemy/Command";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import "varlock/auto-load";

export const observability = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;
  const datasetName = `trips-app-${stage}-logs`;

  const dataset = yield* Axiom.Dataset("logs", {
    name: datasetName,
    kind: "axiom:events:v1",
    description: "trips-app application logs",
  });
  const ingest = yield* Axiom.ApiToken("logs-ingest", {
    name: `trips-app-${stage}-logs-ingest`,
    datasetCapabilities: {
      [datasetName]: {
        ingest: ["create"],
      },
    },
  });

  return {
    dataset,
    runtimeEnv: {
      AXIOM_API_KEY: ingest.token,
      AXIOM_DATASET: dataset.name,
      AXIOM_EDGE_URL: dataset.edgeDeploymentUrl,
    },
  };
});

export const observabilityEnv = observability.pipe(Effect.map(({ runtimeEnv }) => runtimeEnv));

export const observabilityBindings = {
  AXIOM_API_KEY: observabilityEnv.pipe(Effect.map(({ AXIOM_API_KEY }) => AXIOM_API_KEY)),
  AXIOM_DATASET: observabilityEnv.pipe(Effect.map(({ AXIOM_DATASET }) => AXIOM_DATASET)),
  AXIOM_EDGE_URL: observabilityEnv.pipe(Effect.map(({ AXIOM_EDGE_URL }) => AXIOM_EDGE_URL)),
};

export default Alchemy.Stack(
  "trips-app",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), Axiom.providers(), Command.providers()),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const observabilityResources = yield* observability;
    const webWorker = yield* Cloudflare.Website.Vite("web", {
      rootDir: "../../apps/web",
      compatibility: {
        flags: ["nodejs_compat"],
      },
      env: {
        ...observabilityBindings,
        VITE_SERVER_URL: Config.String("VITE_SERVER_URL"),
      },
      dev: {
        port: 3001,
      },
    });
    const serverDev = yield* Command.Dev("server-dev", {
      command: "bun run dev:bare",
      cwd: "../../apps/server",
      env: observabilityResources.runtimeEnv,
    });

    return {
      web: webWorker.url,
      server: serverDev.url,
      axiomDataset: observabilityResources.dataset.name,
    };
  }),
);
