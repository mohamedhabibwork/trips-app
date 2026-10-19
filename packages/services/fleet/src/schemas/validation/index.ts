// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions (see .claude/rules/drizzle-zod-schemas.md).
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
  schema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import {
  SEAT_LAYOUT_CELL_TYPES,
  VEHICLE_REGISTRATION_STATUSES,
  VEHICLE_STATUSES,
  VEHICLE_TYPE_SCOPES,
  VEHICLE_TYPE_STATUSES,
} from "../../model";

export const seatLayoutCellSchema = z.object({
  row: z.number().int().min(0).max(39),
  col: z.number().int().min(0).max(11),
  type: z.enum(SEAT_LAYOUT_CELL_TYPES),
  seatLabel: z.string().trim().min(1).max(16).nullable().optional(),
  isAccessible: z.boolean().optional(),
  isPriority: z.boolean().optional(),
});

export const seatLayoutConfigSchema = z.object({
  rows: z.number().int().min(1).max(40),
  cols: z.number().int().min(1).max(12),
  cells: z.array(seatLayoutCellSchema).min(1).max(480),
});

export const vehicleTypeSelectSchema = createSelectSchema(schema.vehicleTypes);

export const vehicleTypeInsertBaseSchema = createInsertSchema(schema.vehicleTypes, {
  categoryLookupCode: (column) => column.trim().min(1).max(120),
  nameAr: (column) => column.trim().min(1).max(160),
  nameEn: (column) => column.trim().min(1).max(160),
  descriptionAr: (column) => column.trim().max(500),
  descriptionEn: (column) => column.trim().max(500),
  seatCount: (column) => column.int().min(1).max(120),
  seatLayout: () => seatLayoutConfigSchema,
  scope: () => z.enum(VEHICLE_TYPE_SCOPES),
  status: () => z.enum(VEHICLE_TYPE_STATUSES),
});

export const vehicleTypeUpdateBaseSchema = createUpdateSchema(schema.vehicleTypes, {
  categoryLookupCode: (column) => column.trim().min(1).max(120),
  nameAr: (column) => column.trim().min(1).max(160),
  nameEn: (column) => column.trim().min(1).max(160),
  descriptionAr: (column) => column.trim().max(500),
  descriptionEn: (column) => column.trim().max(500),
  seatCount: (column) => column.int().min(1).max(120),
  seatLayout: () => seatLayoutConfigSchema,
  status: () => z.enum(VEHICLE_TYPE_STATUSES),
});

export const listVehicleTypesInputSchema = z
  .object({
    scope: z.enum(VEHICLE_TYPE_SCOPES).optional(),
    includeArchived: z.boolean().optional(),
  })
  .optional();

export const createVehicleTypeInputSchema = vehicleTypeInsertBaseSchema
  .pick({
    categoryLookupCode: true,
    nameAr: true,
    nameEn: true,
    seatCount: true,
    seatLayout: true,
  })
  .extend({
    descriptionAr: z.string().trim().max(500).nullable().optional(),
    descriptionEn: z.string().trim().max(500).nullable().optional(),
  });

export const createPlatformVehicleTypeInputSchema = createVehicleTypeInputSchema;

export const updateVehicleTypeInputSchema = vehicleTypeUpdateBaseSchema
  .pick({
    categoryLookupCode: true,
    nameAr: true,
    nameEn: true,
    descriptionAr: true,
    descriptionEn: true,
    seatCount: true,
    seatLayout: true,
    status: true,
  })
  .extend({
    vehicleTypeId: z.uuid(),
  });

export const vehicleSelectSchema = createSelectSchema(schema.vehicles);

export const vehicleInsertBaseSchema = createInsertSchema(schema.vehicles, {
  plateNumber: (column) => column.trim().min(2).max(32),
  model: (column) => column.trim().min(1).max(160),
  manufacturingYear: (column) => column.int().min(1990).max(2100),
  seatCount: (column) => column.int().min(1).max(120),
  registrationStatus: () => z.enum(VEHICLE_REGISTRATION_STATUSES),
  registrationDocumentUrl: (column) => column.trim().max(2048),
  photoUrls: () => z.array(z.string().trim().min(1).max(2048)).max(20),
  amenityCodes: () => z.array(z.string().trim().min(1).max(64)).max(30),
  status: () => z.enum(VEHICLE_STATUSES),
  notes: (column) => column.trim().max(1000),
});

export const vehicleUpdateBaseSchema = createUpdateSchema(schema.vehicles, {
  plateNumber: (column) => column.trim().min(2).max(32),
  model: (column) => column.trim().min(1).max(160),
  manufacturingYear: (column) => column.int().min(1990).max(2100),
  seatCount: (column) => column.int().min(1).max(120),
  registrationStatus: () => z.enum(VEHICLE_REGISTRATION_STATUSES),
  registrationDocumentUrl: (column) => column.trim().max(2048),
  photoUrls: () => z.array(z.string().trim().min(1).max(2048)).max(20),
  amenityCodes: () => z.array(z.string().trim().min(1).max(64)).max(30),
  status: () => z.enum(VEHICLE_STATUSES),
  notes: (column) => column.trim().max(1000),
});

export const listVehiclesInputSchema = z
  .object({
    status: z.enum(VEHICLE_STATUSES).optional(),
    vehicleTypeId: z.uuid().optional(),
    search: z.string().trim().max(120).optional(),
  })
  .optional();

export const getVehicleInputSchema = z.object({
  vehicleId: z.uuid(),
});

export const createVehicleInputSchema = vehicleInsertBaseSchema
  .pick({
    vehicleTypeId: true,
    plateNumber: true,
    model: true,
    manufacturingYear: true,
    seatCount: true,
  })
  .extend({
    registrationStatus: z.enum(VEHICLE_REGISTRATION_STATUSES).optional(),
    registrationDocumentUrl: z.string().trim().max(2048).nullable().optional(),
    photoUrls: z.array(z.string().trim().min(1).max(2048)).max(20).optional(),
    amenityCodes: z.array(z.string().trim().min(1).max(64)).max(30).optional(),
    status: z.enum(VEHICLE_STATUSES).optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    registrationExpiry: z.iso.datetime().nullable().optional(),
    fileIds: z.array(z.uuid()).max(25).optional(),
  });

export const updateVehicleInputSchema = vehicleUpdateBaseSchema
  .pick({
    vehicleTypeId: true,
    plateNumber: true,
    model: true,
    manufacturingYear: true,
    seatCount: true,
    registrationStatus: true,
    registrationDocumentUrl: true,
    photoUrls: true,
    amenityCodes: true,
    status: true,
    notes: true,
  })
  .extend({
    vehicleId: z.uuid(),
    registrationExpiry: z.iso.datetime().nullable().optional(),
    fileIds: z.array(z.uuid()).max(25).optional(),
  });

export const removeVehicleInputSchema = z.object({
  vehicleId: z.uuid(),
});
