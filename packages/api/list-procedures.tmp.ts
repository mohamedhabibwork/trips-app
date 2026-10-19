// Temporary script: print every procedure path in the app router (deleted after use).
import { appRouter } from "./src/routers/index";
import { flattenRouter } from "./src/testing/procedure-catalog";

const entries = flattenRouter(appRouter as never);
console.log(
  entries
    .map((entry) => entry.path.join("."))
    .sort()
    .join("\n"),
);
