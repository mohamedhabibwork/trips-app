import handler from "@tanstack/react-start/server-entry";
import { createAxiomDrain } from "evlog/axiom";
import { initWorkersLogger, withEvlog } from "evlog/workers";

initWorkersLogger({ env: { service: "trips-app-web" } });

export default withEvlog(
  async (request) => {
    return handler.fetch(request);
  },
  { drain: createAxiomDrain() },
);
