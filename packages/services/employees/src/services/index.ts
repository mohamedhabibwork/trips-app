// Business logic for Employees. Routes call this factory with context.db; repositories are created here.
import { EmployeesServiceError } from "../errors";
import {
  canTransitionEmployeeStatus,
  computeInviteExpiresAt,
  findPlanCatalogEntry,
  generateRandomToken,
  hashSha256,
  normalizeEmail,
  normalizePhoneE164,
  resolvePermissionMatrix,
  type UserRole,
} from "../model";
import { createEmployeesRepository, type ServiceDatabase } from "../repository";
import type {
  AcceptEmployeeInviteInput,
  DeclineEmployeeInviteInput,
  EmployeeAuditLogDto,
  EmployeeInvitePreviewDto,
  EmployeeInviteState,
  EmployeeMemberDto,
  EmployeeQuotaSummaryDto,
  EmployeesRequestMeta,
  GetEmployeeByIdInput,
  InviteEmployeeInput,
  ListEmployeesInput,
  PreviewEmployeeInviteInput,
  ResendEmployeeInviteInput,
  UpdateEmployeePermissionsInput,
  UpdateEmployeeStatusInput,
} from "../schemas/dtos";

/** How an invitation reads from its link: pending until accepted, expired or withdrawn. */
export function inviteState(
  status: EmployeeMemberDto["status"],
  inviteExpiresAt: Date,
  now: Date,
): EmployeeInviteState {
  if (status === "active" || status === "suspended") return "accepted";
  if (status === "revoked") return "withdrawn";
  return inviteExpiresAt.getTime() <= now.getTime() ? "expired" : "pending";
}

function toEmployeeDto(
  row: {
    id: string;
    tenantId: string;
    accountId: string | null;
    invitedEmail: string;
    invitedPhone: string | null;
    roleTitle: string;
    permissions: EmployeeMemberDto["permissions"];
    status: EmployeeMemberDto["status"];
    inviteExpiresAt: Date;
    firstSignInCompletedAt: Date | null;
    invitedByAccountId: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  fullName: string | null = null,
  avatarUrl: string | null = null,
): EmployeeMemberDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    accountId: row.accountId,
    invitedEmail: row.invitedEmail,
    invitedPhone: row.invitedPhone,
    fullName,
    avatarUrl,
    roleTitle: row.roleTitle,
    permissions: row.permissions,
    status: row.status,
    inviteExpiresAt: row.inviteExpiresAt.toISOString(),
    firstSignInCompletedAt: row.firstSignInCompletedAt
      ? row.firstSignInCompletedAt.toISOString()
      : null,
    invitedByAccountId: row.invitedByAccountId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createEmployeesService(db: ServiceDatabase) {
  const repo = createEmployeesRepository(db);

  function requireTenantId(activeTenantId: string | null | undefined): string {
    if (!activeTenantId) {
      throw new EmployeesServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
    }
    return activeTenantId;
  }

  return {
    async list(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input?: ListEmployeesInput,
    ): Promise<{ employees: EmployeeMemberDto[]; quota: EmployeeQuotaSummaryDto }> {
      const tenantId = requireTenantId(actor.activeTenantId);
      const org = await repo.findOrganizationByTenantId(tenantId);
      if (!org || org.status === "deleted") {
        throw new EmployeesServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const items = await repo.listByTenant(tenantId);
      const usedCount = items.filter(
        ({ row }) => row.status === "invited" || row.status === "active",
      ).length;

      const searchTerm = input?.search?.trim().toLowerCase() ?? "";
      const filtered = items
        .filter(({ row, fullName }) => {
          if (input?.status && row.status !== input.status) return false;
          if (searchTerm.length > 0) {
            const matchEmail = row.invitedEmail.toLowerCase().includes(searchTerm);
            const matchName = (fullName ?? "").toLowerCase().includes(searchTerm);
            const matchRole = row.roleTitle.toLowerCase().includes(searchTerm);
            if (!matchEmail && !matchName && !matchRole) return false;
          }
          return true;
        })
        .map(({ row, fullName, avatarUrl }) => toEmployeeDto(row, fullName, avatarUrl));

      const plan = findPlanCatalogEntry("organization", org.planTier);
      return {
        employees: filtered,
        quota: {
          usedCount,
          maxAllowed: plan?.limits.employeesMax ?? null,
          planTier: org.planTier,
        },
      };
    },

    async getById(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: GetEmployeeByIdInput,
    ): Promise<{ employee: EmployeeMemberDto; recentAuditLogs: EmployeeAuditLogDto[] }> {
      const tenantId = requireTenantId(actor.activeTenantId);
      const found = await repo.findByIdAndTenant(input.membershipId, tenantId);
      if (!found) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      const logs = await repo.listAuditLogsForMembership(tenantId, input.membershipId);
      return {
        employee: toEmployeeDto(found.row, found.fullName, found.avatarUrl),
        recentAuditLogs: logs.map((log) => ({
          id: log.id,
          actorAccountId: log.actorAccountId,
          actorRole: log.actorRole,
          action: log.action,
          reason: log.reason,
          beforeState: log.beforeState ?? null,
          afterState: log.afterState ?? null,
          createdAt: log.createdAt.toISOString(),
        })),
      };
    },

    async invite(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: InviteEmployeeInput,
      meta?: EmployeesRequestMeta,
    ): Promise<{
      employee: EmployeeMemberDto;
      inviteToken: string;
      inviteExpiresAt: string;
    }> {
      const tenantId = requireTenantId(actor.activeTenantId);
      const org = await repo.findOrganizationByTenantId(tenantId);
      if (!org || org.status === "deleted") {
        throw new EmployeesServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const plan = findPlanCatalogEntry("organization", org.planTier);
      const maxAllowed = plan?.limits.employeesMax ?? null;
      const usedCount = await repo.countActiveOrInvitedForTenant(tenantId);
      if (maxAllowed !== null && usedCount >= maxAllowed) {
        throw new EmployeesServiceError(
          "PLAN_LIMIT_EXCEEDED",
          `Organization plan "${org.planTier}" allows at most ${maxAllowed} employees.`,
          { usedCount, maxAllowed, planTier: org.planTier },
        );
      }

      const normalizedEmail = normalizeEmail(input.invitedEmail);
      const normalizedPhone = input.invitedPhone ? normalizePhoneE164(input.invitedPhone) : null;

      const existing = await repo.findByEmailAndTenant(normalizedEmail, tenantId);
      if (existing && (existing.status === "invited" || existing.status === "active")) {
        throw new EmployeesServiceError(
          "DUPLICATE_RESOURCE",
          "An active or pending invitation already exists for this email in the organization.",
          { field: "invitedEmail" },
        );
      }

      const permissions = resolvePermissionMatrix({
        preset: input.preset,
        permissions: input.permissions,
      });
      const inviteToken = generateRandomToken(24);
      const inviteTokenHash = hashSha256(inviteToken);
      const inviteExpiresAt = computeInviteExpiresAt();

      const created = await repo.createMembership({
        tenantId,
        invitedEmail: normalizedEmail,
        invitedPhone: normalizedPhone,
        roleTitle: input.roleTitle ?? "Employee",
        permissions,
        inviteTokenHash,
        inviteExpiresAt,
        invitedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId,
        action: "employee.invited",
        targetEntityType: "employee_membership",
        targetEntityId: created.id,
        afterState: {
          invitedEmail: created.invitedEmail,
          roleTitle: created.roleTitle,
          permissions: created.permissions,
          status: created.status,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        employee: toEmployeeDto(created),
        inviteToken,
        inviteExpiresAt: created.inviteExpiresAt.toISOString(),
      };
    },

    async resendInvite(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: ResendEmployeeInviteInput,
      meta?: EmployeesRequestMeta,
    ): Promise<{
      employee: EmployeeMemberDto;
      inviteToken: string;
      inviteExpiresAt: string;
    }> {
      const tenantId = requireTenantId(actor.activeTenantId);
      const found = await repo.findByIdAndTenant(input.membershipId, tenantId);
      if (!found) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      if (found.row.status !== "invited") {
        throw new EmployeesServiceError(
          "INVALID_STATE_TRANSITION",
          `Cannot resend invitation when employee status is "${found.row.status}".`,
          { status: found.row.status },
        );
      }

      const inviteToken = generateRandomToken(24);
      const inviteTokenHash = hashSha256(inviteToken);
      const inviteExpiresAt = computeInviteExpiresAt();

      const updated = await repo.updateMembershipByTenant(input.membershipId, tenantId, {
        inviteTokenHash,
        inviteExpiresAt,
      });
      if (!updated) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId,
        action: "employee.invite_resent",
        targetEntityType: "employee_membership",
        targetEntityId: updated.id,
        afterState: {
          inviteExpiresAt: updated.inviteExpiresAt.toISOString(),
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        employee: toEmployeeDto(updated, found.fullName, found.avatarUrl),
        inviteToken,
        inviteExpiresAt: updated.inviteExpiresAt.toISOString(),
      };
    },

    /**
     * The invitation behind an email link, for a person who may not have an account yet. The
     * token is the secret: an unknown token is "not found" and reveals nothing.
     */
    async previewInvite(input: PreviewEmployeeInviteInput): Promise<EmployeeInvitePreviewDto> {
      const membership = await repo.findByInviteTokenHash(hashSha256(input.inviteToken));
      if (!membership) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee invitation not found.");
      }
      const org = await repo.findOrganizationByTenantId(membership.tenantId);
      if (!org || org.status === "deleted") {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee invitation not found.");
      }
      return {
        organizationNameEn: org.displayNameEn,
        organizationNameAr: org.displayNameAr,
        invitedEmail: membership.invitedEmail,
        roleTitle: membership.roleTitle,
        permissions: membership.permissions,
        inviteExpiresAt: membership.inviteExpiresAt.toISOString(),
        state: inviteState(membership.status, membership.inviteExpiresAt, new Date()),
      };
    },

    /** Declines a pending invitation from its email link; the person may be signed out. */
    async declineInvite(
      actor: { accountId: string; activeRole: UserRole } | null,
      input: DeclineEmployeeInviteInput,
      meta?: EmployeesRequestMeta,
    ): Promise<{ state: EmployeeInviteState }> {
      const membership = await repo.findByInviteTokenHash(hashSha256(input.inviteToken));
      if (!membership) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee invitation not found.");
      }
      const now = new Date();
      const state = inviteState(membership.status, membership.inviteExpiresAt, now);
      if (state !== "pending") {
        throw new EmployeesServiceError(
          "INVALID_STATE_TRANSITION",
          `Invitation cannot be declined from state "${state}".`,
          { state },
        );
      }
      const updated = await repo.declineMembershipInvite(membership.id, now);
      if (!updated) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee invitation not found.");
      }
      await repo.writeAuditLog({
        actorAccountId: actor?.accountId ?? null,
        actorRole: actor?.activeRole ?? "system",
        tenantId: membership.tenantId,
        action: "employee.invite_declined",
        targetEntityType: "employee_membership",
        targetEntityId: membership.id,
        reason: "Declined from the invitation link",
        beforeState: { status: membership.status },
        afterState: { status: updated.status },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });
      return { state: "withdrawn" };
    },

    async acceptInvite(
      actor: { accountId: string; activeRole: UserRole },
      input: AcceptEmployeeInviteInput,
      meta?: EmployeesRequestMeta,
    ): Promise<{ employee: EmployeeMemberDto; tenantId: string }> {
      const tokenHash = hashSha256(input.inviteToken);
      const membership = await repo.findByInviteTokenHash(tokenHash);
      if (!membership) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee invitation not found.");
      }

      if (membership.status !== "invited") {
        throw new EmployeesServiceError(
          "INVALID_STATE_TRANSITION",
          `Invitation cannot be accepted from status "${membership.status}".`,
          { status: membership.status },
        );
      }

      const now = new Date();
      if (membership.inviteExpiresAt.getTime() <= now.getTime()) {
        throw new EmployeesServiceError("PRECONDITION_FAILED", "Employee invitation has expired.", {
          inviteExpiresAt: membership.inviteExpiresAt.toISOString(),
        });
      }

      const org = await repo.findOrganizationByTenantId(membership.tenantId);
      if (!org || org.status === "deleted") {
        throw new EmployeesServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const updated = await repo.acceptMembershipInvite(membership.id, actor.accountId, now);
      if (!updated) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee invitation not found.");
      }

      await repo.ensureEmployeeAccountRole(actor.accountId, membership.tenantId, org.planTier);

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId: membership.tenantId,
        action: "employee.invite_accepted",
        targetEntityType: "employee_membership",
        targetEntityId: updated.id,
        beforeState: { status: membership.status },
        afterState: { status: updated.status, accountId: actor.accountId },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      const hydrated = await repo.findByIdAndTenant(updated.id, membership.tenantId);
      return {
        employee: toEmployeeDto(
          hydrated?.row ?? updated,
          hydrated?.fullName ?? null,
          hydrated?.avatarUrl ?? null,
        ),
        tenantId: membership.tenantId,
      };
    },

    async updatePermissions(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: UpdateEmployeePermissionsInput,
      meta?: EmployeesRequestMeta,
    ): Promise<{ employee: EmployeeMemberDto }> {
      const tenantId = requireTenantId(actor.activeTenantId);
      const found = await repo.findByIdAndTenant(input.membershipId, tenantId);
      if (!found) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      if (found.row.status === "revoked") {
        throw new EmployeesServiceError(
          "INVALID_STATE_TRANSITION",
          "Cannot update permissions on a revoked employee membership.",
        );
      }

      const updated = await repo.updateMembershipByTenant(input.membershipId, tenantId, {
        roleTitle: input.roleTitle ?? found.row.roleTitle,
        permissions: input.permissions,
      });
      if (!updated) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId,
        action: "employee.permissions_updated",
        targetEntityType: "employee_membership",
        targetEntityId: updated.id,
        beforeState: {
          roleTitle: found.row.roleTitle,
          permissions: found.row.permissions,
        },
        afterState: {
          roleTitle: updated.roleTitle,
          permissions: updated.permissions,
        },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        employee: toEmployeeDto(updated, found.fullName, found.avatarUrl),
      };
    },

    async updateStatus(
      actor: { accountId: string; activeRole: UserRole; activeTenantId?: string | null },
      input: UpdateEmployeeStatusInput,
      meta?: EmployeesRequestMeta,
    ): Promise<{ employee: EmployeeMemberDto; revokedSessionsCount: number }> {
      const tenantId = requireTenantId(actor.activeTenantId);
      const found = await repo.findByIdAndTenant(input.membershipId, tenantId);
      if (!found) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      const transition = canTransitionEmployeeStatus(found.row.status, input.status);
      if (!transition.valid) {
        throw new EmployeesServiceError("INVALID_STATE_TRANSITION", transition.reason!, {
          from: found.row.status,
          to: input.status,
        });
      }

      const updated = await repo.updateMembershipByTenant(input.membershipId, tenantId, {
        status: input.status,
      });
      if (!updated) {
        throw new EmployeesServiceError("RESOURCE_NOT_FOUND", "Employee membership not found.");
      }

      let revokedSessionsCount = 0;
      if (updated.accountId) {
        await repo.updateEmployeeAccountRoleStatus(updated.accountId, tenantId, input.status);
        if (input.status === "suspended" || input.status === "revoked") {
          revokedSessionsCount = await repo.revokeActiveTenantSessionsForAccount(
            updated.accountId,
            tenantId,
            input.reason ?? `Employee membership ${input.status}`,
          );
        }
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.activeRole,
        tenantId,
        action: `employee.status.${input.status}`,
        targetEntityType: "employee_membership",
        targetEntityId: updated.id,
        reason: input.reason ?? null,
        beforeState: { status: found.row.status },
        afterState: { status: updated.status, revokedSessionsCount },
        ipAddress: meta?.ipAddress,
        requestId: meta?.requestId,
      });

      return {
        employee: toEmployeeDto(updated, found.fullName, found.avatarUrl),
        revokedSessionsCount,
      };
    },
  };
}
