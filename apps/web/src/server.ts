import handler from "@tanstack/react-start/server-entry";
import { initWorkersLogger, withEvlog } from "evlog/workers";

import { withRequestLocale } from "./i18n/server-locale";

initWorkersLogger({ env: { service: "trips-app-web" } });

export default withEvlog(async (request) => {
  return withRequestLocale(request, () => handler.fetch(request));
});
