import type { ReactNode } from "react";
import { useState } from "react";

import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChip } from "@trips-app/ui/components/te-chip";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeErrorState } from "@trips-app/ui/components/te-error-state";
import {
  TeGlassButton,
  TeGlassNavBar,
  TeGlassSurface,
  TeGlassTabBar,
  type TeGlassTab,
} from "@trips-app/ui/components/te-glass";
import { TE_ICON_NAMES, TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeRetryBanner } from "@trips-app/ui/components/te-retry-banner";
import { TE_ROLES, TeRoleBadge } from "@trips-app/ui/components/te-role-badge";
import { TeToast } from "@trips-app/ui/components/te-toast";
import {
  TE_TRACKING_STATUSES,
  TeTrackingStatus,
} from "@trips-app/ui/components/te-tracking-status";
import { TeTripCard } from "@trips-app/ui/components/te-trip-card";
import { t } from "@trips-app/i18n";

// Inline placeholder so the gallery needs no network image.
const TRIP_IMAGE = () => ({
  url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23fb8030'/></svg>",
  alt: t("component.componentGallery.placeholderTripImage"),
});

const CHIP_OPTIONS = () =>
  [
    { id: "beach", label: t("component.componentGallery.beach") },
    { id: "desert", label: t("component.componentGallery.desertSafari") },
    { id: "museums", label: t("component.componentGallery.museums") },
  ] as const;

const GLASS_TABS = (): readonly TeGlassTab[] => [
  { id: "trips", label: t("component.componentGallery.trips"), icon: "bus" },
  { id: "track", label: t("component.componentGallery.track"), icon: "clock" },
  { id: "profile", label: t("component.componentGallery.profile"), icon: "user" },
];

const MIN_PHONE_LENGTH = 10;
const PHONE_ERROR = "Enter the full number, with the country code.";

function noop() {
  return undefined;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="te-h2">{title}</h2>
      {children}
    </section>
  );
}

function BrandSection() {
  return (
    <Section title={t("component.componentGallery.brand")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="m-0 grid place-items-center gap-3 rounded-[20px] bg-[var(--te-brand-cream)] p-8">
          <img
            src="/brand/trips-enjoy-horizontal-fullcolor.svg"
            alt={t("component.componentGallery.tripsEnjoyLogoFullColour")}
            className="h-16 w-auto"
          />
          <figcaption className="te-caption text-[color:var(--te-brand-navy)]">
            {t("component.componentGallery.horizontalLogoOnCream")}
          </figcaption>
        </figure>
        <figure className="m-0 grid place-items-center gap-3 rounded-[20px] bg-[var(--te-brand-navy)] p-8">
          <img
            src="/brand/trips-enjoy-horizontal-reversed.svg"
            alt={t("component.componentGallery.tripsEnjoyLogoReversedFor")}
            className="h-16 w-auto"
          />
          <figcaption className="te-caption text-[color:var(--te-brand-cream)]">
            {t("component.componentGallery.reversedLogoOnNavy")}
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}

function ActionsSection() {
  return (
    <Section title={t("component.componentGallery.actions")}>
      <div className="flex flex-wrap items-center gap-3">
        <TeButton>{t("component.componentGallery.bookTrip")}</TeButton>
        <TeButton variant="secondary">{t("component.componentGallery.addActivity")}</TeButton>
        <TeButton variant="ghost">{t("component.componentGallery.viewItinerary")}</TeButton>
        <TeButton size="lg">{t("component.componentGallery.payNow")}</TeButton>
      </div>
    </Section>
  );
}

function ChipsSection() {
  const [selectedId, setSelectedId] = useState<string>("desert");
  return (
    <Section title={t("component.componentGallery.chips")}>
      <div className="flex flex-wrap gap-2">
        {CHIP_OPTIONS().map((option) => (
          <TeChip
            key={option.id}
            selected={selectedId === option.id}
            onClick={() => setSelectedId(option.id)}
          >
            {option.label}
          </TeChip>
        ))}
      </div>
    </Section>
  );
}

function InputsSection() {
  const [phone, setPhone] = useState("0100");
  const phoneError = phone.length < MIN_PHONE_LENGTH ? PHONE_ERROR : undefined;
  return (
    <Section title={t("component.componentGallery.inputs")}>
      <TeInput label={t("component.componentGallery.travelerName")} defaultValue="Omar Habib" />
      <TeInput
        label={t("component.componentGallery.parentPhone")}
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={phoneError}
        supportingText={t("component.componentGallery.usedForLiveBusUpdates")}
      />
    </Section>
  );
}

function ContentSection() {
  return (
    <Section title={t("component.componentGallery.tripCardAndRoles")}>
      <div className="max-w-sm">
        <TeTripCard
          title={t("component.componentGallery.bus3Hurghada")}
          meta="Departs 07:30 from Nasr City"
          image={TRIP_IMAGE()}
          status={<TeBadge tone="success">{t("component.componentGallery.seatConfirmed")}</TeBadge>}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {TE_ROLES.map((role) => (
          <TeRoleBadge key={role} role={role} />
        ))}
      </div>
    </Section>
  );
}

function BadgesSection() {
  return (
    <Section title={t("component.componentGallery.status")}>
      <div className="flex flex-wrap gap-2">
        <TeBadge tone="neutral">{t("component.componentGallery.neutral")}</TeBadge>
        <TeBadge tone="accent">{t("component.componentGallery.accent")}</TeBadge>
        <TeBadge tone="highlight">{t("component.componentGallery.new")}</TeBadge>
        <TeBadge tone="success">{t("component.componentGallery.boarded")}</TeBadge>
        <TeBadge tone="warning">{t("component.componentGallery.delayed")}</TeBadge>
        <TeBadge tone="danger">{t("component.componentGallery.notBoarded")}</TeBadge>
        <TeBadge tone="info">{t("component.componentGallery.organization")}</TeBadge>
      </div>
      <div className="flex flex-col gap-2">
        {TE_TRACKING_STATUSES.map((status) => (
          <TeTrackingStatus key={status} status={status} />
        ))}
      </div>
    </Section>
  );
}

function FeedbackSection() {
  const [retrying, setRetrying] = useState(false);
  const [toastOpen, setToastOpen] = useState(true);
  return (
    <Section title={t("component.componentGallery.feedback")}>
      <TeInlineAlert tone="error" title={t("component.componentGallery.paymentNotCompleted")}>
        {t("component.componentGallery.yourBankDeclinedTheCard")}
      </TeInlineAlert>
      <TeInlineAlert tone="warning" title={t("component.componentGallery.seatsAreOnHold")}>
        {t("component.componentGallery.payWithin10MinutesTo")}
      </TeInlineAlert>
      <TeInlineAlert tone="info" title={t("component.componentGallery.tripUpdated")}>
        {t("component.componentGallery.theDeparturePointMovedTo")}
      </TeInlineAlert>
      <TeInlineAlert tone="success" title={t("component.componentGallery.bookingSaved")}>
        {t("component.componentGallery.seatConfirmedForBus3")}
      </TeInlineAlert>
      <TeRetryBanner
        message={t("component.componentGallery.connectionLostRetryingIn5")}
        onRetry={() => setRetrying((value) => !value)}
        retrying={retrying}
      />
      {toastOpen ? (
        <TeToast
          message={t("component.componentGallery.seatConfirmedForBus3Message")}
          onClose={() => setToastOpen(false)}
        />
      ) : null}
    </Section>
  );
}

function StatesSection() {
  return (
    <Section title={t("component.componentGallery.errorAndEmptyStates")}>
      <TeErrorState kind="server" referenceId="TE-4821" onAction={noop} />
      <TeErrorState kind="offline" platform="mobile" onAction={noop} />
      <TeEmptyState
        title={t("component.componentGallery.noTripsYet")}
        description={t("component.componentGallery.whenYourCompanyAddsA")}
        action={
          <TeButton variant="secondary">{t("component.componentGallery.browseTrips")}</TeButton>
        }
      />
    </Section>
  );
}

function GlassSection() {
  const [activeTab, setActiveTab] = useState("trips");
  return (
    <Section title={t("component.componentGallery.liquidGlass")}>
      <TeGlassSurface className="grid gap-4 rounded-[20px] bg-[var(--te-brand-navy)] p-8">
        <TeGlassNavBar aria-label={t("component.componentGallery.main")}>
          <span className="te-label">{t("component.componentGallery.tripsEnjoy")}</span>
        </TeGlassNavBar>
        <TeGlassTabBar
          tabs={GLASS_TABS()}
          activeId={activeTab}
          onSelect={setActiveTab}
          ariaLabel={t("component.componentGallery.sections")}
        />
        <div className="flex justify-end">
          <TeGlassButton tint>{t("component.componentGallery.trackBus")}</TeGlassButton>
        </div>
      </TeGlassSurface>
    </Section>
  );
}

function IconsSection() {
  return (
    <Section title={t("component.componentGallery.icons")}>
      <div className="flex flex-wrap gap-4">
        {TE_ICON_NAMES.map((name) => (
          <TeIcon key={name} name={name} label={name} className="size-6" />
        ))}
      </div>
    </Section>
  );
}

// Component reference for building screens and pages. Each surface composes these pieces.
export function ComponentGallery() {
  return (
    <main className="container mx-auto grid max-w-5xl gap-10 px-4 py-6">
      <header className="grid gap-2">
        <h1 className="te-h1">{t("component.componentGallery.tripsEnjoyComponents")}</h1>
        <p className="te-body">{t("component.componentGallery.everyComponentReadsTheTrips")}</p>
      </header>
      <BrandSection />
      <ActionsSection />
      <ChipsSection />
      <InputsSection />
      <ContentSection />
      <BadgesSection />
      <FeedbackSection />
      <StatesSection />
      <GlassSection />
      <IconsSection />
    </main>
  );
}
