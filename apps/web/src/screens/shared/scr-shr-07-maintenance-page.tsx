import { TeButton } from "@trips-app/ui/components/te-button";
import { TeMaintenanceNotice } from "@trips-app/ui/components/te-maintenance";

/** Planned maintenance. The window is shown in the viewer's time zone. Payment callbacks keep queueing. */
export function ScrShr07MaintenancePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center gap-6 px-4 py-12">
      <TeMaintenanceNotice
        title="Planned maintenance"
        description="Trips Enjoy is unavailable during a planned maintenance window. Payment callbacks keep queueing and are processed after the window."
        estimatedReturn="Start and end times, in your time zone"
        estimatedReturnLabel="Planned window"
      />
      <TeButton variant="secondary" disabled>
        Try again after the window ends
      </TeButton>
    </div>
  );
}
