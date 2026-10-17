import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";

import { findScreenById, screenPath } from "@/screens/registry";

// Old SCR-… addresses redirect to the readable path of the same screen.
export const Route = createFileRoute("/screens/$screenId")({
  beforeLoad: ({ params }) => {
    const entry = findScreenById(params.screenId);
    if (!entry) {
      throw notFound();
    }
    throw redirect({ href: screenPath(entry) });
  },
  notFoundComponent: () => (
    <main className="container mx-auto max-w-5xl px-4 py-6">
      <p className="te-body">No screen matches this address.</p>
      <Link to="/screens" className="te-label underline">
        All screens
      </Link>
    </main>
  ),
});
