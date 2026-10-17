// Onboarding service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "onboarding";
export { mapOnboardingError, ONBOARDING_ERROR_CODE_MAP, OnboardingServiceError } from "./errors";
export { routes } from "./routes";
export { createOnboardingService } from "./services";
export type * from "./types";
