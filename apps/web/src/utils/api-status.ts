import type { RouterAppContext } from "@/routes/__root";

// Route loader: fetches the API status on the server, so the first HTML already contains it.
// Pages read it with useSuspenseQuery (see components/api-status.tsx), so nothing fetches in the browser on load.
export function loadApiStatus({ context }: { context: RouterAppContext }) {
  return context.queryClient.ensureQueryData(context.orpc.healthCheck.queryOptions());
}
