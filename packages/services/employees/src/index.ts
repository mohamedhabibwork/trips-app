// Employees service. This file is the only public entry point; other code imports the package, never src/ paths.
export const SERVICE_ID = "employees";
export { EMPLOYEES_ERROR_CODE_MAP, EmployeesServiceError, mapEmployeesError } from "./errors";
export { routes } from "./routes";
export { createEmployeesService } from "./services";
export type * from "./types";
