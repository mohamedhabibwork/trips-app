import type {
  ApplicationState,
  ApplicationValidationResult,
  DriverApplicationSubmission,
  OrganizationApplicationSubmission,
  PhotographerApplicationSubmission,
  SupplierApplicationType,
} from "./types";

export type {
  ApplicationState,
  ApplicationValidationResult,
  DriverApplicationSubmission,
  OrganizationApplicationSubmission,
  PhotographerApplicationSubmission,
  SupplierApplicationType,
} from "./types";

export const APPLICATION_STATES = [
  "Submitted",
  "Pending Review",
  "Changes Requested",
  "Approved",
  "Rejected",
  "Appealed",
  "Closed",
] as const satisfies readonly ApplicationState[];

export const SUPPLIER_APPLICATION_TYPES = [
  "organization",
  "platform_driver",
  "platform_photographer",
] as const satisfies readonly SupplierApplicationType[];

export const ALLOWED_APPLICATION_TRANSITIONS: Record<
  ApplicationState,
  readonly ApplicationState[]
> = {
  Submitted: ["Pending Review"],
  "Pending Review": ["Approved", "Changes Requested", "Rejected"],
  "Changes Requested": ["Pending Review", "Closed"],
  Approved: [],
  Rejected: ["Appealed"],
  Appealed: ["Approved", "Closed"],
  Closed: [],
};

export function canTransitionApplicationState(
  from: ApplicationState,
  to: ApplicationState,
): boolean {
  return ALLOWED_APPLICATION_TRANSITIONS[from].includes(to);
}

/**
 * Adds business working days (skipping Friday & Saturday for MENA operational calendar, or configurable weekend).
 */
export function addWorkingDays(start: Date, workingDays: number): Date {
  const result = new Date(start.getTime());
  let remaining = workingDays;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    const dayOfWeek = result.getUTCDay(); // 5 = Friday, 6 = Saturday
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      remaining -= 1;
    }
  }
  return result;
}

/**
 * Validates Organization Application fields per D-72, D-73, D-74, D-75, D-76, D-68.
 */
export function validateOrganizationApplication(
  input: OrganizationApplicationSubmission,
  now: Date = new Date(),
): ApplicationValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.legalEntityName.trim()) {
    errors.push({ field: "legalEntityName", message: "Legal entity name is required." });
  }
  if (!input.commercialRegNumber.trim()) {
    errors.push({
      field: "commercialRegNumber",
      message: "Commercial registration number is required.",
    });
  }
  if (!input.taxNumber.trim()) {
    errors.push({ field: "taxNumber", message: "Tax number is required." });
  }
  if (!input.tourismLicenseNumber.trim()) {
    errors.push({
      field: "tourismLicenseNumber",
      message: "Tourism license number is required.",
    });
  }
  if (input.tourismLicenseExpiry.getTime() <= now.getTime()) {
    errors.push({
      field: "tourismLicenseExpiry",
      message: "Tourism license must not be expired.",
    });
  }
  if (input.childSafetyProgramOptIn) {
    if (!input.safetyLeadName?.trim()) {
      errors.push({
        field: "safetyLeadName",
        message: "Child safety lead name is required when opting into child-tracked trips (D-68).",
      });
    }
    if (!input.safetyHotlinePhone?.trim()) {
      errors.push({
        field: "safetyHotlinePhone",
        message:
          "Child safety hotline phone is required when opting into child-tracked trips (D-68).",
      });
    }
    if (!input.emergencyEscalationAcknowledged) {
      errors.push({
        field: "emergencyEscalationAcknowledged",
        message: "Emergency escalation acknowledgement is required (D-68).",
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Platform Driver Application per FR-ONB-07, FR-ONB-08, D-79, D-80.
 */
export function validateDriverApplication(
  input: DriverApplicationSubmission,
  now: Date = new Date(),
): ApplicationValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (!input.labTestConsentSigned) {
    errors.push({
      field: "labTestConsentSigned",
      message: "Signed drug and safety lab-test consent is required (FR-ONB-08).",
    });
  }

  if (input.licenseExpiry.getTime() <= now.getTime()) {
    errors.push({
      field: "licenseExpiry",
      message: "Commercial driving license must not be expired.",
    });
  }

  // Lab result must be dated within the last 30 days
  const thirtyDaysAgoMs = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  if (input.labResultSubmittedAt.getTime() < thirtyDaysAgoMs) {
    errors.push({
      field: "labResultSubmittedAt",
      message: "Initial drug/medical test result must be dated within the last 30 days.",
    });
  }

  // Own vehicle is optional (D-79), but if provided, insurance must be valid >= 6 months (FR-ONB-07)
  if (input.hasOwnVehicle) {
    if (!input.vehiclePlateNumber?.trim()) {
      errors.push({
        field: "vehiclePlateNumber",
        message: "Vehicle plate number is required when registering an owned vehicle.",
      });
    }
    if (!input.insuranceExpiry) {
      errors.push({
        field: "insuranceExpiry",
        message: "Vehicle insurance expiry date is required when registering an owned vehicle.",
      });
    } else {
      const sixMonthsAhead = new Date(now.getTime());
      sixMonthsAhead.setUTCMonth(sixMonthsAhead.getUTCMonth() + 6);
      if (input.insuranceExpiry.getTime() < sixMonthsAhead.getTime()) {
        errors.push({
          field: "insuranceExpiry",
          message:
            "Vehicle insurance must be valid for at least 6 months from submission (FR-ONB-07).",
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Platform Photographer Application per FR-ONB-06, D-01, D-83, D-84, D-85.
 */
export function validatePhotographerApplication(
  input: PhotographerApplicationSubmission,
): ApplicationValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (input.portfolioPhotoCount < 8) {
    errors.push({
      field: "portfolioPhotoCount",
      message:
        "At least 8 portfolio photos are required for photographer onboarding (FR-ONB-06, D-01).",
    });
  }

  if (input.cameraBodies.length === 0) {
    errors.push({
      field: "cameraBodies",
      message: "At least one camera body must be listed in equipment details (D-84).",
    });
  }

  if (input.serviceRegions.length === 0) {
    errors.push({
      field: "serviceRegions",
      message: "At least one service region must be selected (D-85).",
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Checks whether a rejected applicant is still blocked from re-applying (30-day block unless appealed, FR-ONB-05).
 */
export function isRejectedApplicantBlocked(params: {
  state: ApplicationState;
  rejectedAt: Date | null;
  reapplyBlockedUntil: Date | null;
  now: Date;
}): boolean {
  if (params.state !== "Rejected") return false;
  if (params.reapplyBlockedUntil) {
    return params.reapplyBlockedUntil.getTime() > params.now.getTime();
  }
  if (!params.rejectedAt) return false;
  const blockUntilMs = params.rejectedAt.getTime() + 30 * 24 * 60 * 60 * 1000;
  return blockUntilMs > params.now.getTime();
}
