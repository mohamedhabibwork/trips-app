// Request and response DTOs inferred from validation schemas.
import type { z } from "zod/v4";

import type {
  createPlatformVehicleTypeInputSchema,
  createVehicleInputSchema,
  createVehicleTypeInputSchema,
  getVehicleInputSchema,
  listVehiclesInputSchema,
  listVehicleTypesInputSchema,
  removeVehicleInputSchema,
  updateVehicleInputSchema,
  updateVehicleTypeInputSchema,
} from "../validation";

export type ListVehicleTypesInput = z.infer<typeof listVehicleTypesInputSchema>;
export type CreateVehicleTypeInput = z.infer<typeof createVehicleTypeInputSchema>;
export type CreatePlatformVehicleTypeInput = z.infer<typeof createPlatformVehicleTypeInputSchema>;
export type UpdateVehicleTypeInput = z.infer<typeof updateVehicleTypeInputSchema>;

export type ListVehiclesInput = z.infer<typeof listVehiclesInputSchema>;
export type GetVehicleInput = z.infer<typeof getVehicleInputSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleInputSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleInputSchema>;
export type RemoveVehicleInput = z.infer<typeof removeVehicleInputSchema>;
