// Media service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "media";
export { MEDIA_ERROR_CODE_MAP, MediaServiceError, mapMediaError } from "./errors";
export { routes } from "./routes";
export type * from "./types";
