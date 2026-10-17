// Coupons service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "coupons";
export { COUPONS_ERROR_CODE_MAP, CouponsServiceError, mapCouponsError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
