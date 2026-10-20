// SCR-PHO-03 Profile and visibility: what organizations see in the photographer pool
// (docs/design/web/PhoWebProfile.dc.html). Specialties and service regions persist through
// `photographer.updateProfile`; the name and contacts come from the account and are read-only
// here, and the visibility tier follows the plan (no visibility procedure exists yet).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioBadge,
  StudioButton,
  StudioCard,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";
import { useStudioPlan, type StudioTier } from "../studio-plan";

const SPECIALTY_OPTIONS = ["Event", "Group", "Portrait", "Travel"] as const;

/** The visibility tiers in the pool and the plan each one needs. */
const VISIBILITY_TIERS: ReadonlyArray<{ id: string; needs: StudioTier | null }> = [
  { id: "standard", needs: "basic" },
  { id: "featured", needs: "studio" },
  { id: "top", needs: "pro" },
];

const TIER_RANK: Record<StudioTier, number> = { basic: 0, studio: 1, pro: 2 };

export function StudioProfile() {
  const { t } = useAuth();
  const enabled = typeof window !== "undefined";
  const queryClient = useQueryClient();
  const plan = useStudioPlan();

  const accountQuery = useQuery({
    ...serverQueryOptions(orpc.traveler.getProfile, "traveler/getProfile", {
      input: undefined,
      enabled,
      retry: false,
    }),
  });

  const [specialties, setSpecialties] = useState<string[] | null>(null);
  const [regionsInput, setRegionsInput] = useState("");
  const [regions, setRegions] = useState<string[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const chosenSpecialties = specialties ?? plan.profile?.specialties ?? [];
  const chosenRegions = regions ?? plan.profile?.serviceRegions ?? [];

  const updateMutation = useMutation(
    serverMutationOptions(orpc.photographer.updateProfile, "photographer/updateProfile", {
      onSuccess: (updated) => {
        setSpecialties(
          (updated.specialties ?? []).filter((s): s is string => typeof s === "string"),
        );
        setRegions(
          (updated.serviceRegions ?? []).filter((s): s is string => typeof s === "string"),
        );
        setSaved(true);
        setSaveFailed(false);
        void queryClient.invalidateQueries({ queryKey: orpc.photographer.key() });
      },
      onError: () => {
        setSaved(false);
        setSaveFailed(true);
      },
    }),
  );

  const tier = plan.tier;
  const account = accountQuery.data ?? null;
  const dirty = specialties !== null || regions !== null;

  function toggleSpecialty(label: string) {
    setSaved(false);
    setSpecialties((current) => {
      const base = current ?? plan.profile?.specialties ?? [];
      return base.includes(label) ? base.filter((item) => item !== label) : [...base, label];
    });
  }

  function addRegion() {
    const value = regionsInput.trim();
    if (!value || value.length > 80) return;
    setSaved(false);
    setRegions((current) => {
      const base = current ?? plan.profile?.serviceRegions ?? [];
      return base.includes(value) ? base : [...base, value];
    });
    setRegionsInput("");
  }

  function removeRegion(value: string) {
    setSaved(false);
    setRegions((current) =>
      (current ?? plan.profile?.serviceRegions ?? []).filter((item) => item !== value),
    );
  }

  function handleSave() {
    setSaveFailed(false);
    updateMutation.mutate({
      specialties: chosenSpecialties,
      serviceRegions: chosenRegions,
    });
  }

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.profile.title")}
        caption={t("screen.studio.profile.caption")}
        actions={
          <>
            {saved ? (
              <span role="status" className="text-sm font-semibold text-[var(--te-success)]">
                {t("screen.studio.profile.saved")}
              </span>
            ) : null}
            {saveFailed ? (
              <span role="alert" className="text-sm font-semibold text-[var(--te-danger)]">
                {t("screen.studio.profile.saveFailed")}
              </span>
            ) : null}
            <StudioButton onClick={handleSave} disabled={!dirty || updateMutation.isPending}>
              {updateMutation.isPending
                ? t("screen.studio.common.saving")
                : t("screen.studio.profile.save")}
            </StudioButton>
          </>
        }
      />

      <StudioRow align="start">
        <StudioCard
          title={t("screen.studio.profile.details")}
          className="basis-[560px] lg:flex-[3]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField
              label={t("screen.studio.profile.name")}
              value={account?.fullName ?? NO_VALUE}
            />
            <ReadOnlyField
              label={t("screen.studio.profile.studioName")}
              value={NO_VALUE}
              hint={t("screen.studio.profile.studioNameHint")}
            />
          </div>

          <ReadOnlyField
            label={t("screen.studio.profile.description")}
            value={NO_VALUE}
            hint={t("screen.studio.profile.descriptionHint")}
          />

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="text-sm font-semibold">
              {t("screen.studio.profile.specialties")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_OPTIONS.map((label) => {
                const on = chosenSpecialties.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSpecialty(label)}
                    className={`h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold ${
                      on
                        ? "border-[var(--te-ink)] bg-[var(--te-ink)] text-[var(--te-ink-inverse)]"
                        : "border-[var(--te-control-border)] bg-[var(--te-surface-raised)] text-[var(--te-ink)]"
                    }`}
                  >
                    {t(`screen.studio.profile.specialty.${label.toLowerCase()}`)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-end gap-2">
            <label className="flex min-w-0 flex-1 basis-[220px] flex-col gap-1 text-sm leading-5">
              <span className="font-semibold">{t("screen.studio.profile.addCity")}</span>
              <input
                value={regionsInput}
                onChange={(event) => setRegionsInput(event.target.value)}
                maxLength={80}
                placeholder={t("screen.studio.profile.addCityPlaceholder")}
                className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3.5 text-base"
              />
            </label>
            <StudioButton variant="secondary" onClick={addRegion} disabled={!regionsInput.trim()}>
              {t("screen.studio.profile.addCityButton")}
            </StudioButton>
          </div>
          <div className="flex flex-wrap gap-2" aria-label={t("screen.studio.profile.cities")}>
            {chosenRegions.length === 0 ? (
              <span className="text-sm text-[var(--te-ink-muted)]">
                {t("screen.studio.profile.citiesEmpty")}
              </span>
            ) : (
              chosenRegions.map((city) => (
                <span
                  key={city}
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-[var(--te-info-soft)] px-3 text-sm font-semibold"
                >
                  {city}
                  <button
                    type="button"
                    aria-label={t("screen.studio.profile.removeCity", { city })}
                    onClick={() => removeRegion(city)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-transparent text-[var(--te-ink)]"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField
              label={t("screen.studio.profile.email")}
              value={account?.email ?? NO_VALUE}
            />
            <ReadOnlyField
              label={t("screen.studio.profile.phone")}
              value={account?.phoneE164 ?? NO_VALUE}
            />
          </div>
        </StudioCard>

        <div className="flex min-w-0 basis-[360px] flex-[2] flex-col gap-4">
          <StudioCard title={t("screen.studio.profile.visibility")}>
            <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
              {t("screen.studio.profile.visibilityCaption")}
            </p>
            <div className="flex flex-col gap-2">
              {VISIBILITY_TIERS.map((option) => {
                const locked =
                  option.needs === null ||
                  tier === null ||
                  TIER_RANK[tier] < TIER_RANK[option.needs];
                const selected = !locked && option.needs !== null && tier === option.needs;
                return (
                  <div
                    key={option.id}
                    className={`flex items-start gap-3 rounded-[var(--te-radius-md)] border p-3 ${
                      locked
                        ? "border-dashed border-[var(--te-control-border)] bg-[var(--te-surface)]"
                        : selected
                          ? "border-2 border-[var(--te-accent)] bg-[var(--te-surface-raised)]"
                          : "border-[var(--te-hairline)] bg-[var(--te-surface-raised)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={selected}
                      disabled={true}
                      readOnly
                      className="mt-1.5 size-4 shrink-0 accent-[var(--te-ink)]"
                      aria-label={t(`screen.studio.profile.visibilityTier.${option.id}`)}
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">
                        {t(`screen.studio.profile.visibilityTier.${option.id}`)}{" "}
                        <StudioBadge tone={locked ? "neu" : "info"} icon={false}>
                          {option.needs ? t(`component.shell.studio.plan.${option.needs}`) : ""}
                        </StudioBadge>
                      </span>
                      <span className="text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
                        {t(`screen.studio.profile.visibilityHint.${option.id}`)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.studio.profile.visibilityNote")}
            </p>
          </StudioCard>

          <StudioCard title={t("screen.studio.profile.preview")}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-full bg-[var(--te-info-soft)] text-lg font-bold text-[var(--te-ink)]"
              >
                {(account?.fullName ?? "?").slice(0, 1)}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[17px] font-bold">{account?.fullName ?? NO_VALUE}</span>
                <span className="text-[13px] text-[var(--te-ink-muted)]">
                  {chosenRegions.length > 0
                    ? chosenRegions.join(", ")
                    : t("screen.studio.profile.citiesEmpty")}
                </span>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {plan.profile?.status === "active" ? (
                    <StudioBadge tone="ok" icon={false}>
                      {t("screen.studio.profile.previewActive")}
                    </StudioBadge>
                  ) : null}
                  {tier ? (
                    <StudioBadge tone="info" icon={false}>
                      {t(`component.shell.studio.plan.${tier}`)}
                    </StudioBadge>
                  ) : null}
                  <StudioBadge tone="neu" icon={false}>
                    {t("screen.studio.profile.previewSpecialties", {
                      count: chosenSpecialties.length,
                    })}
                  </StudioBadge>
                </span>
              </span>
            </div>
            <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
              {t("screen.studio.profile.previewCaption")}
            </p>
          </StudioCard>
        </div>
      </StudioRow>
    </StudioPage>
  );
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm leading-5">
      <span className="font-semibold">{label}</span>
      <output className="flex h-12 items-center rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface)] px-3.5 text-base">
        {value}
      </output>
      {hint ? (
        <span className="text-[13px] leading-[18px] text-[var(--te-ink-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
