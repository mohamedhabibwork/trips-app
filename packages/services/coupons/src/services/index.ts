// Business logic for Coupons. Routes call this factory with context.db; repositories are created here.
import { CouponsServiceError } from "../errors";
import { calculateCouponDiscountMinor, findPlanCatalogEntry, normalizeCouponCode } from "../model";
import { createCouponsRepository, type ServiceDatabase } from "../repository";
import type {
  CouponDto,
  CouponsActorContext,
  CreateCouponInput,
  ListCouponsInput,
  UpdateCouponStatusInput,
  ValidateCouponInput,
} from "../types";

export function createCouponsService(db: ServiceDatabase) {
  const repo = createCouponsRepository(db);

  return {
    async createOrganizationCoupon(
      actor: CouponsActorContext,
      input: CreateCouponInput,
    ): Promise<CouponDto> {
      const tenantId = actor.activeTenantId;
      if (!tenantId) {
        throw new CouponsServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const orgPlanInfo = await repo.findOrganizationPlan(tenantId);
      if (!orgPlanInfo) {
        throw new CouponsServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const fallbackPlan = findPlanCatalogEntry("organization", orgPlanInfo.org.planTier);
      const maxCoupons =
        orgPlanInfo.plan?.limits.activeCouponsMax ?? fallbackPlan?.limits.activeCouponsMax ?? null;

      if (maxCoupons !== null) {
        const activeCount = await repo.countActiveCouponsForTenant(tenantId);
        if (activeCount >= maxCoupons) {
          throw new CouponsServiceError(
            "PLAN_LIMIT_EXCEEDED",
            `Organization plan "${orgPlanInfo.org.planTier}" allows at most ${maxCoupons} active coupon(s).`,
            {
              planTier: orgPlanInfo.org.planTier,
              maxActiveCoupons: maxCoupons,
              activeCount,
            },
          );
        }
      }

      const code = normalizeCouponCode(input.code);
      const existing = await repo.findByCode(code);
      if (existing) {
        throw new CouponsServiceError(
          "DUPLICATE_RESOURCE",
          `Coupon code "${code}" already exists.`,
          { field: "code", code },
        );
      }

      return repo.insertCoupon({
        scope: "organization",
        tenantId,
        ownerAccountId: actor.accountId,
        code,
        titleAr: input.titleAr.trim(),
        titleEn: input.titleEn.trim(),
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxDiscountMinor: input.maxDiscountMinor ?? null,
        minOrderMinor: input.minOrderMinor ?? 0,
        currencyCode: input.currencyCode ?? "EGP",
        maxRedemptions: input.maxRedemptions ?? null,
        tripId: input.tripId ?? null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });
    },

    async createPlatformCoupon(
      actor: CouponsActorContext,
      input: CreateCouponInput,
    ): Promise<CouponDto> {
      const code = normalizeCouponCode(input.code);
      const existing = await repo.findByCode(code);
      if (existing) {
        throw new CouponsServiceError(
          "DUPLICATE_RESOURCE",
          `Coupon code "${code}" already exists.`,
          { field: "code", code },
        );
      }

      return repo.insertCoupon({
        scope: "platform",
        tenantId: null,
        ownerAccountId: actor.accountId,
        code,
        titleAr: input.titleAr.trim(),
        titleEn: input.titleEn.trim(),
        discountType: input.discountType,
        discountValue: input.discountValue,
        maxDiscountMinor: input.maxDiscountMinor ?? null,
        minOrderMinor: input.minOrderMinor ?? 0,
        currencyCode: input.currencyCode ?? "EGP",
        maxRedemptions: input.maxRedemptions ?? null,
        tripId: input.tripId ?? null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });
    },

    async updateCouponStatus(
      actor: CouponsActorContext,
      input: UpdateCouponStatusInput,
    ): Promise<CouponDto> {
      const existing = await repo.findById(input.couponId);
      if (!existing) {
        throw new CouponsServiceError("RESOURCE_NOT_FOUND", "Coupon not found.");
      }

      if (actor.role !== "admin") {
        if (!actor.activeTenantId || existing.tenantId !== actor.activeTenantId) {
          throw new CouponsServiceError("RESOURCE_NOT_FOUND", "Coupon not found.");
        }
      }

      const updated = await repo.updateStatus(existing.id, input.status);
      return updated!;
    },

    async listOrganizationCoupons(
      actor: CouponsActorContext,
      input?: ListCouponsInput,
    ): Promise<{ items: CouponDto[] }> {
      if (!actor.activeTenantId) {
        throw new CouponsServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }
      const items = await repo.listForTenant(actor.activeTenantId, input?.status);
      return { items };
    },

    async listPlatformCoupons(input?: ListCouponsInput): Promise<{ items: CouponDto[] }> {
      const items = await repo.listPlatformCoupons(input?.status);
      return { items };
    },

    async validateCoupon(input: ValidateCouponInput): Promise<{
      coupon: CouponDto;
      discountMinor: number;
      finalAmountMinor: number;
    }> {
      const code = normalizeCouponCode(input.code);
      const coupon = await repo.findByCode(code);
      if (!coupon || coupon.status !== "active") {
        throw new CouponsServiceError(
          "COUPON_INVALID_OR_EXPIRED",
          "The coupon code is invalid or inactive.",
        );
      }

      const now = new Date();
      if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
        throw new CouponsServiceError("COUPON_INVALID_OR_EXPIRED", "The coupon is not yet active.");
      }
      if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
        throw new CouponsServiceError("COUPON_INVALID_OR_EXPIRED", "The coupon has expired.");
      }
      if (coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions) {
        throw new CouponsServiceError(
          "COUPON_INVALID_OR_EXPIRED",
          "The coupon has reached its maximum redemption limit.",
        );
      }
      if (input.subtotalMinor < coupon.minOrderMinor) {
        throw new CouponsServiceError(
          "COUPON_INVALID_OR_EXPIRED",
          `Minimum order amount of ${coupon.minOrderMinor} minor units is required for this coupon.`,
          { minOrderMinor: coupon.minOrderMinor, subtotalMinor: input.subtotalMinor },
        );
      }

      if (input.tripId) {
        if (coupon.tripId && coupon.tripId !== input.tripId) {
          throw new CouponsServiceError(
            "COUPON_INVALID_OR_EXPIRED",
            "This coupon is not valid for the selected trip.",
          );
        }
        if (coupon.scope === "organization" && coupon.tenantId) {
          const trip = await repo.findTripById(input.tripId);
          if (!trip || trip.tenantId !== coupon.tenantId) {
            throw new CouponsServiceError(
              "COUPON_INVALID_OR_EXPIRED",
              "This organization coupon does not apply to the selected trip.",
            );
          }
        }
      }

      const discountMinor = calculateCouponDiscountMinor(input.subtotalMinor, coupon);
      const finalAmountMinor = Math.max(0, input.subtotalMinor - discountMinor);

      return {
        coupon,
        discountMinor,
        finalAmountMinor,
      };
    },
  };
}
