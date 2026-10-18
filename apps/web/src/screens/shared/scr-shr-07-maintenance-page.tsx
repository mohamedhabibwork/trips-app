import { TeButton } from "@trips-app/ui/components/te-button";
import { TeMaintenanceNotice } from "@trips-app/ui/components/te-maintenance";
import { t } from "@trips-app/i18n";

/** Planned maintenance. The window is shown in the viewer's time zone. Payment callbacks keep queueing. */
export function ScrShr07MaintenancePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center gap-6 px-4 py-12">
      <TeMaintenanceNotice
        title={t("screen.shared.scrShr07MaintenancePage.plannedMaintenance")}
        description={t("screen.shared.scrShr07MaintenancePage.tripsEnjoyIsUnavailableDuring")}
        estimatedReturn={t("screen.shared.scrShr07MaintenancePage.startAndEndTimesIn")}
        estimatedReturnLabel={t("screen.shared.scrShr07MaintenancePage.plannedWindow")}
      />
      <TeButton variant="secondary" disabled>
        {t("screen.shared.scrShr07MaintenancePage.tryAgainAfterTheWindow")}
      </TeButton>
    </div>
  );
}
