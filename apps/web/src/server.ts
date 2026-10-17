import handler from "@tanstack/react-start/server-entry";
import { initWorkersLogger, withEvlog } from "evlog/workers";

initWorkersLogger({ env: { service: "trips-app-web" } });

export default withEvlog(async (request) => {
  return handler.fetch(request);
});
