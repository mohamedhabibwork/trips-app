// Labels of plan roles, limits and features, shared by SCR-ADM-15 (catalog), SCR-ADM-16 (editor)
// and SCR-ADM-17 (subscriptions). Keys follow PlanLimits and PlanFeatures in @trips-app/domain.
import { t } from "@trips-app/i18n";

export function planRoleLabel(role: string): string {
  switch (role) {
    case "organization":
      return t("screen.admin.plans.planLabels.organization");
    case "platform_driver":
      return t("screen.admin.plans.planLabels.platformDriver");
    case "platform_photographer":
      return t("screen.admin.plans.planLabels.photographer");
    case "traveler":
      return t("screen.admin.plans.planLabels.traveler");
    default:
      return role;
  }
}

/** Plan name in the reader's language. */
export function planName(plan: { nameEn: string; nameAr: string }, locale: string): string {
  return locale === "ar" ? plan.nameAr : plan.nameEn;
}

export function planLimitLabel(key: string): string {
  switch (key) {
    case "activeTripsPerMonth":
      return t("screen.admin.plans.planLabels.activeTripsPerMonth");
    case "vehiclesPerTrip":
      return t("screen.admin.plans.planLabels.vehiclesPerTrip");
    case "programsPerTrip":
      return t("screen.admin.plans.planLabels.programsPerTrip");
    case "employeesMax":
      return t("screen.admin.plans.planLabels.employeesMax");
    case "activeCouponsMax":
      return t("screen.admin.plans.planLabels.activeCouponsMax");
    case "portfolioPhotosMax":
      return t("screen.admin.plans.planLabels.portfolioPhotosMax");
    case "webhookEndpointsMax":
      return t("screen.admin.plans.planLabels.webhookEndpointsMax");
    default:
      return key;
  }
}

export function planFeatureLabel(key: string): string {
  switch (key) {
    case "platformSuppliers":
      return t("screen.admin.plans.planLabels.platformSuppliers");
    case "seatSelfSelection":
      return t("screen.admin.plans.planLabels.seatSelfSelection");
    case "childTracking":
      return t("screen.admin.plans.planLabels.childTracking");
    case "customBranding":
      return t("screen.admin.plans.planLabels.customBranding");
    case "watermarks":
      return t("screen.admin.plans.planLabels.watermarks");
    case "receiptExport":
      return t("screen.admin.plans.planLabels.receiptExport");
    case "vipEarlyAccess":
      return t("screen.admin.plans.planLabels.vipEarlyAccess");
    case "prioritySeatWindow":
      return t("screen.admin.plans.planLabels.prioritySeatWindow");
    default:
      return key;
  }
}
