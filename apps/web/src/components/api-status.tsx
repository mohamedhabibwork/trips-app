import { useSuspenseQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

// Reads the API status that the route loader prefetched on the server (see utils/api-status.ts).
export function ApiStatus() {
  const healthCheck = useSuspenseQuery(orpc.healthCheck.queryOptions());
  const isConnected = healthCheck.data === "OK";

  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-2 font-medium">API Status</h2>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-muted-foreground text-sm">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </section>
  );
}
