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

// Inline placeholder so the gallery needs no network image.
const TRIP_IMAGE = {
  url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23fb8030'/></svg>",
  alt: "Placeholder trip image",
};

const CHIP_OPTIONS = [
  { id: "beach", label: "Beach" },
  { id: "desert", label: "Desert safari" },
  { id: "museums", label: "Museums" },
] as const;

const GLASS_TABS: readonly TeGlassTab[] = [
  { id: "trips", label: "Trips", icon: "bus" },
  { id: "track", label: "Track", icon: "clock" },
  { id: "profile", label: "Profile", icon: "user" },
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
    <Section title="Brand">
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="m-0 grid place-items-center gap-3 rounded-[20px] bg-[var(--te-brand-cream)] p-8">
          <img
            src="/brand/trips-enjoy-horizontal-fullcolor.svg"
            alt="Trips Enjoy logo, full colour, horizontal layout"
            className="h-16 w-auto"
          />
          <figcaption className="te-caption text-[color:var(--te-brand-navy)]">
            Horizontal logo on cream
          </figcaption>
        </figure>
        <figure className="m-0 grid place-items-center gap-3 rounded-[20px] bg-[var(--te-brand-navy)] p-8">
          <img
            src="/brand/trips-enjoy-horizontal-reversed.svg"
            alt="Trips Enjoy logo, reversed for dark backgrounds, horizontal layout"
            className="h-16 w-auto"
          />
          <figcaption className="te-caption text-[color:var(--te-brand-cream)]">
            Reversed logo on navy
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}

function ActionsSection() {
  return (
    <Section title="Actions">
      <div className="flex flex-wrap items-center gap-3">
        <TeButton>Book trip</TeButton>
        <TeButton variant="secondary">Add activity</TeButton>
        <TeButton variant="ghost">View itinerary</TeButton>
        <TeButton size="lg">Pay now</TeButton>
      </div>
    </Section>
  );
}

function ChipsSection() {
  const [selectedId, setSelectedId] = useState<string>("desert");
  return (
    <Section title="Chips">
      <div className="flex flex-wrap gap-2">
        {CHIP_OPTIONS.map((option) => (
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
    <Section title="Inputs">
      <TeInput label="Traveler name" defaultValue="Omar Habib" />
      <TeInput
        label="Parent phone"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={phoneError}
        supportingText="Used for live bus updates."
      />
    </Section>
  );
}

function ContentSection() {
  return (
    <Section title="Trip card and roles">
      <div className="max-w-sm">
        <TeTripCard
          title="Bus 3 · Hurghada"
          meta="Departs 07:30 from Nasr City"
          image={TRIP_IMAGE}
          status={<TeBadge tone="success">Seat confirmed</TeBadge>}
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
    <Section title="Status">
      <div className="flex flex-wrap gap-2">
        <TeBadge tone="neutral">Neutral</TeBadge>
        <TeBadge tone="accent">Accent</TeBadge>
        <TeBadge tone="highlight">New</TeBadge>
        <TeBadge tone="success">Boarded</TeBadge>
        <TeBadge tone="warning">Delayed</TeBadge>
        <TeBadge tone="danger">Not boarded</TeBadge>
        <TeBadge tone="info">Organization</TeBadge>
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
    <Section title="Feedback">
      <TeInlineAlert tone="error" title="Payment not completed">
        Your bank declined the card ending 4421. No money was taken.
      </TeInlineAlert>
      <TeInlineAlert tone="warning" title="Seats are on hold">
        Pay within 10 minutes to keep your seats.
      </TeInlineAlert>
      <TeInlineAlert tone="info" title="Trip updated">
        The departure point moved to Gate 2.
      </TeInlineAlert>
      <TeInlineAlert tone="success" title="Booking saved">
        Seat confirmed for Bus 3.
      </TeInlineAlert>
      <TeRetryBanner
        message="Connection lost. Retrying in 5 seconds."
        onRetry={() => setRetrying((value) => !value)}
        retrying={retrying}
      />
      {toastOpen ? (
        <TeToast
          message="Seat confirmed for Bus 3. Your booking is saved."
          onClose={() => setToastOpen(false)}
        />
      ) : null}
    </Section>
  );
}

function StatesSection() {
  return (
    <Section title="Error and empty states">
      <TeErrorState kind="server" referenceId="TE-4821" onAction={noop} />
      <TeErrorState kind="offline" platform="mobile" onAction={noop} />
      <TeEmptyState
        title="No trips yet"
        description="When your company adds a trip, it will appear here."
        action={<TeButton variant="secondary">Browse trips</TeButton>}
      />
    </Section>
  );
}

function GlassSection() {
  const [activeTab, setActiveTab] = useState("trips");
  return (
    <Section title="Liquid Glass">
      <TeGlassSurface className="grid gap-4 rounded-[20px] bg-[var(--te-brand-navy)] p-8">
        <TeGlassNavBar aria-label="Main">
          <span className="te-label">Trips Enjoy</span>
        </TeGlassNavBar>
        <TeGlassTabBar
          tabs={GLASS_TABS}
          activeId={activeTab}
          onSelect={setActiveTab}
          ariaLabel="Sections"
        />
        <div className="flex justify-end">
          <TeGlassButton tint>Track bus</TeGlassButton>
        </div>
      </TeGlassSurface>
    </Section>
  );
}

function IconsSection() {
  return (
    <Section title="Icons">
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
        <h1 className="te-h1">Trips Enjoy components</h1>
        <p className="te-body">
          Every component reads the Trips Enjoy tokens. One primary action per view.
        </p>
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
