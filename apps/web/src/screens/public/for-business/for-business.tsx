// SCR-PUB-22 For business (/for-business): the partner marketing page (WebBusiness.dc.html) —
// roles, how-it-works, plans & pricing with a monthly/annual toggle, ZATCA invoicing and an FAQ.
// Static marketing content; the role cards link to the three partner sign-ups
// (SCR-PUB-06 / SCR-PUB-04 / SCR-PUB-05) and the plans note links to the legal page (SCR-PUB-20).
import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { Notice, Segmented } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";

const INK = "text-[#262a67]";
const MUTED = "text-[#5b5f86]";

interface RoleCard {
  icon: TeIconName;
  signUpScreenId: string;
  titleKey: string;
  bodyKey: string;
  points: readonly string[];
  fromKey: string;
  ctaKey: string;
}

const ROLES: readonly RoleCard[] = [
  {
    icon: "users",
    signUpScreenId: "SCR-PUB-06",
    titleKey: "screen.public.forBusiness.role.org.title",
    bodyKey: "screen.public.forBusiness.role.org.body",
    points: [
      "screen.public.forBusiness.role.org.p1",
      "screen.public.forBusiness.role.org.p2",
      "screen.public.forBusiness.role.org.p3",
    ],
    fromKey: "screen.public.forBusiness.role.org.from",
    ctaKey: "screen.public.forBusiness.role.org.cta",
  },
  {
    icon: "bus",
    signUpScreenId: "SCR-PUB-04",
    titleKey: "screen.public.forBusiness.role.driver.title",
    bodyKey: "screen.public.forBusiness.role.driver.body",
    points: [
      "screen.public.forBusiness.role.driver.p1",
      "screen.public.forBusiness.role.driver.p2",
      "screen.public.forBusiness.role.driver.p3",
    ],
    fromKey: "screen.public.forBusiness.role.driver.from",
    ctaKey: "screen.public.forBusiness.role.driver.cta",
  },
  {
    icon: "camera",
    signUpScreenId: "SCR-PUB-05",
    titleKey: "screen.public.forBusiness.role.photo.title",
    bodyKey: "screen.public.forBusiness.role.photo.body",
    points: [
      "screen.public.forBusiness.role.photo.p1",
      "screen.public.forBusiness.role.photo.p2",
      "screen.public.forBusiness.role.photo.p3",
    ],
    fromKey: "screen.public.forBusiness.role.photo.from",
    ctaKey: "screen.public.forBusiness.role.photo.cta",
  },
];

interface HowStep {
  icon: TeIconName;
  titleKey: string;
  bodyKey: string;
  planKey?: string;
}

const HOW_STEPS: readonly HowStep[] = [
  {
    icon: "plus",
    titleKey: "screen.public.forBusiness.how.s1.title",
    bodyKey: "screen.public.forBusiness.how.s1.body",
  },
  {
    icon: "ticket",
    titleKey: "screen.public.forBusiness.how.s2.title",
    bodyKey: "screen.public.forBusiness.how.s2.body",
    planKey: "screen.public.forBusiness.how.s2.plan",
  },
  {
    icon: "live",
    titleKey: "screen.public.forBusiness.how.s3.title",
    bodyKey: "screen.public.forBusiness.how.s3.body",
    planKey: "screen.public.forBusiness.how.s3.plan",
  },
  {
    icon: "receipt",
    titleKey: "screen.public.forBusiness.how.s4.title",
    bodyKey: "screen.public.forBusiness.how.s4.body",
  },
  {
    icon: "chart",
    titleKey: "screen.public.forBusiness.how.s5.title",
    bodyKey: "screen.public.forBusiness.how.s5.body",
    planKey: "screen.public.forBusiness.how.s5.plan",
  },
  {
    icon: "globe",
    titleKey: "screen.public.forBusiness.how.s6.title",
    bodyKey: "screen.public.forBusiness.how.s6.body",
    planKey: "screen.public.forBusiness.how.s6.plan",
  },
];

interface PlanTier {
  nameKey: string;
  lineKey: string;
  /** Monthly price in SAR; the annual price is ten months (two months free). */
  monthly: number;
}

interface PlanFamily {
  nameKey: string;
  noteKey: string;
  trialKey: string;
  tiers: readonly [PlanTier, PlanTier, PlanTier];
}

const PLAN_FAMILIES: readonly PlanFamily[] = [
  {
    nameKey: "screen.public.forBusiness.plans.company.name",
    noteKey: "screen.public.forBusiness.plans.company.note",
    trialKey: "screen.public.forBusiness.plans.company.trial",
    tiers: [
      {
        nameKey: "screen.public.forBusiness.plans.company.starter",
        lineKey: "screen.public.forBusiness.plans.company.starterLine",
        monthly: 590,
      },
      {
        nameKey: "screen.public.forBusiness.plans.company.growth",
        lineKey: "screen.public.forBusiness.plans.company.growthLine",
        monthly: 1490,
      },
      {
        nameKey: "screen.public.forBusiness.plans.company.enterprise",
        lineKey: "screen.public.forBusiness.plans.company.enterpriseLine",
        monthly: 3990,
      },
    ],
  },
  {
    nameKey: "screen.public.forBusiness.plans.driver.name",
    noteKey: "screen.public.forBusiness.plans.driver.note",
    trialKey: "screen.public.forBusiness.plans.driver.trial",
    tiers: [
      {
        nameKey: "screen.public.forBusiness.plans.driver.basic",
        lineKey: "screen.public.forBusiness.plans.driver.basicLine",
        monthly: 49,
      },
      {
        nameKey: "screen.public.forBusiness.plans.driver.professional",
        lineKey: "screen.public.forBusiness.plans.driver.professionalLine",
        monthly: 149,
      },
      {
        nameKey: "screen.public.forBusiness.plans.driver.premium",
        lineKey: "screen.public.forBusiness.plans.driver.premiumLine",
        monthly: 299,
      },
    ],
  },
  {
    nameKey: "screen.public.forBusiness.plans.photo.name",
    noteKey: "screen.public.forBusiness.plans.photo.note",
    trialKey: "screen.public.forBusiness.plans.photo.trial",
    tiers: [
      {
        nameKey: "screen.public.forBusiness.plans.photo.basic",
        lineKey: "screen.public.forBusiness.plans.photo.basicLine",
        monthly: 49,
      },
      {
        nameKey: "screen.public.forBusiness.plans.photo.studio",
        lineKey: "screen.public.forBusiness.plans.photo.studioLine",
        monthly: 99,
      },
      {
        nameKey: "screen.public.forBusiness.plans.photo.pro",
        lineKey: "screen.public.forBusiness.plans.photo.proLine",
        monthly: 199,
      },
    ],
  },
  {
    nameKey: "screen.public.forBusiness.plans.traveler.name",
    noteKey: "screen.public.forBusiness.plans.traveler.note",
    trialKey: "screen.public.forBusiness.plans.traveler.trial",
    tiers: [
      {
        nameKey: "screen.public.forBusiness.plans.traveler.free",
        lineKey: "screen.public.forBusiness.plans.traveler.freeLine",
        monthly: 0,
      },
      {
        nameKey: "screen.public.forBusiness.plans.traveler.explorer",
        lineKey: "screen.public.forBusiness.plans.traveler.explorerLine",
        monthly: 19,
      },
      {
        nameKey: "screen.public.forBusiness.plans.traveler.vip",
        lineKey: "screen.public.forBusiness.plans.traveler.vipLine",
        monthly: 49,
      },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "screen.public.forBusiness.faq.q1", a: "screen.public.forBusiness.faq.a1" },
  { q: "screen.public.forBusiness.faq.q2", a: "screen.public.forBusiness.faq.a2" },
  { q: "screen.public.forBusiness.faq.q3", a: "screen.public.forBusiness.faq.a3" },
  { q: "screen.public.forBusiness.faq.q4", a: "screen.public.forBusiness.faq.a4" },
  { q: "screen.public.forBusiness.faq.q5", a: "screen.public.forBusiness.faq.a5" },
  { q: "screen.public.forBusiness.faq.q6", a: "screen.public.forBusiness.faq.a6" },
] as const;

const SECTION_CLASS = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

export function ForBusiness() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="flex flex-col">
      <Hero />
      <Roles />
      <HowItWorks />
      <Plans annual={annual} onToggle={setAnnual} />
      <Zatca />
      <Faq open={openFaq} onToggle={setOpenFaq} />
      <div className="h-16" />
    </div>
  );
}

/* Hero ---------------------------------------------------------------------- */

function Hero() {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="business-hero"
      className={`${SECTION_CLASS} flex flex-wrap items-center gap-10 pt-12`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-5" style={{ minWidth: "min(100%, 440px)" }}>
        <span className="self-start rounded-full bg-[#ffe7dc] px-3 py-1 text-[13px] font-bold text-[#c93a00]">
          {t("screen.public.forBusiness.badge")}
        </span>
        <h1
          id="business-hero"
          className={`m-0 text-[36px] leading-[44px] font-bold tracking-[-0.5px] md:text-[52px] md:leading-[58px] ${INK}`}
        >
          {t("screen.public.forBusiness.title")}
        </h1>
        <p className={`m-0 max-w-[540px] text-lg leading-[27px] ${MUTED}`}>
          {t("screen.public.forBusiness.lead")}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#roles"
            className="inline-flex h-[52px] items-center gap-2 rounded-xl bg-[#ff6c2e] px-6 text-base font-bold text-[#262a67] no-underline hover:bg-[#ff8655]"
          >
            {t("screen.public.forBusiness.chooseHow")}
            <TeIcon name="arrow" className="size-[18px]" flipInRtl />
          </a>
          <a
            href="#plans"
            className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-[#7b7fa6] bg-white px-6 text-base font-semibold text-[#262a67] no-underline hover:border-[#262a67]"
          >
            {t("screen.public.forBusiness.seePlans")}
          </a>
        </div>
        <div className={`flex flex-wrap gap-5 text-sm ${MUTED}`}>
          <span className="inline-flex items-center gap-1.5">
            <TeIcon name="check" className="size-[18px] text-[#1f7a4d]" />
            {t("screen.public.forBusiness.reviewFast")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TeIcon name="check" className="size-[18px] text-[#1f7a4d]" />
            {t("screen.public.forBusiness.trial")}
          </span>
        </div>
      </div>
      <div className="hidden min-w-0 flex-1 md:block">
        <img
          src="/design/traveler/cover-alula.svg"
          alt={t("screen.public.landing.hero.imageAlt")}
          className="h-[380px] w-full rounded-[20px] object-cover"
        />
      </div>
    </section>
  );
}

/* Roles ---------------------------------------------------------------------- */

function Roles() {
  const { t } = useAuth();
  return (
    <section id="roles" aria-labelledby="business-roles" className={`${SECTION_CLASS} pt-16`}>
      <h2
        id="business-roles"
        className={`m-0 text-[28px] leading-9 font-bold md:text-[32px] md:leading-10 ${INK}`}
      >
        {t("screen.public.forBusiness.rolesTitle")}
      </h2>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {ROLES.map((role) => (
          <article
            key={role.signUpScreenId}
            className="flex flex-col gap-3.5 rounded-[20px] bg-white p-6"
          >
            <span className="flex size-[52px] items-center justify-center rounded-xl bg-[#ffe7dc] text-[#c93a00]">
              <TeIcon name={role.icon} className="size-[26px]" />
            </span>
            <h3 className={`m-0 text-[22px] font-semibold ${INK}`}>{t(role.titleKey)}</h3>
            <p className={`m-0 text-[15px] leading-[22px] ${MUTED}`}>{t(role.bodyKey)}</p>
            <ul className="m-0 flex grow list-none flex-col gap-2 p-0">
              {role.points.map((pointKey) => (
                <li
                  key={pointKey}
                  className="flex items-start gap-2 text-[15px] leading-[21px] text-[#262a67]"
                >
                  <TeIcon name="check" className="mt-0.5 size-[18px] shrink-0 text-[#1f7a4d]" />
                  {t(pointKey)}
                </li>
              ))}
            </ul>
            <span className={`text-sm ${MUTED}`}>{t(role.fromKey)}</span>
            <Link
              to={pathFor(role.signUpScreenId)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#262a67] px-4 text-[15px] font-semibold text-[#f6f3e4] no-underline hover:bg-[#31367a]"
            >
              {t(role.ctaKey)}
              <TeIcon name="arrow" className="size-[18px]" flipInRtl />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

/* How it works ---------------------------------------------------------------- */
function HowItWorks() {
  const { t } = useAuth();
  return (
    <section aria-labelledby="business-how" className={`${SECTION_CLASS} pt-16`}>
      <div className="flex max-w-[680px] flex-col gap-1.5">
        <span className="text-[13px] font-bold tracking-[0.5px] text-[#c93a00]">
          {t("screen.public.forBusiness.how.eyebrow")}
        </span>
        <h2
          id="business-how"
          className={`m-0 text-[28px] leading-9 font-bold md:text-[32px] md:leading-10 ${INK}`}
        >
          {t("screen.public.forBusiness.how.title")}
        </h2>
      </div>
      <ol className="m-0 grid list-none gap-4 p-0 pt-5 md:grid-cols-2 lg:grid-cols-3">
        {HOW_STEPS.map((step, index) => (
          <li key={step.titleKey} className="flex items-start gap-3.5 rounded-[20px] bg-white p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#262a67] text-[#ff8655]">
              <TeIcon name={step.icon} className="size-[22px]" />
            </span>
            <span className="flex flex-col gap-1">
              <span className={`text-[13px] font-bold ${MUTED}`}>
                {t("screen.public.forBusiness.how.step", { n: index + 1 })}
              </span>
              <span className={`text-lg font-semibold ${INK}`}>{t(step.titleKey)}</span>
              <span className={`text-[15px] leading-[22px] ${MUTED}`}>{t(step.bodyKey)}</span>
              {step.planKey ? (
                <span className="mt-1 self-start rounded-full bg-[#e6e8f5] px-2.5 py-0.5 text-xs font-bold text-[#262a67]">
                  {t(step.planKey)}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* Plans & pricing -------------------------------------------------------------- */

function Plans({ annual, onToggle }: { annual: boolean; onToggle: (next: boolean) => void }) {
  const { t, locale } = useAuth();
  const format = new Intl.NumberFormat(locale);
  const price = (monthly: number) =>
    monthly === 0
      ? t("screen.public.forBusiness.plans.free")
      : format.format(annual ? monthly * 10 : monthly);
  const per = (monthly: number) =>
    monthly === 0
      ? t("screen.public.forBusiness.plans.forever")
      : annual
        ? t("screen.public.forBusiness.plans.perYear")
        : t("screen.public.forBusiness.plans.perMonth");
  const periodLabel = annual
    ? t("screen.public.forBusiness.plans.billedYearly")
    : t("screen.public.forBusiness.plans.billedMonthly");

  return (
    <section
      id="plans"
      aria-labelledby="business-plans"
      className={`${SECTION_CLASS} flex flex-col gap-5 pt-16`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2
            id="business-plans"
            className={`m-0 text-[28px] leading-9 font-bold md:text-[32px] md:leading-10 ${INK}`}
          >
            {t("screen.public.forBusiness.plans.title")}
          </h2>
          <p className={`m-0 text-[15px] ${MUTED}`}>
            {t("screen.public.forBusiness.plans.vatNote")}
          </p>
        </div>
        <Segmented
          label={t("screen.public.forBusiness.plans.periodLabel")}
          options={[
            { value: "monthly", label: t("screen.public.forBusiness.plans.monthly") },
            { value: "annual", label: t("screen.public.forBusiness.plans.annual") },
          ]}
          value={annual ? "annual" : "monthly"}
          onChange={(value) => onToggle(value === "annual")}
        />
      </div>

      <Notice tone="info" className="text-[15px] leading-[22px]">
        <span>
          <strong>{t("screen.public.forBusiness.plans.requiredStrong")}</strong>{" "}
          {t("screen.public.forBusiness.plans.requiredBody")}
        </span>
      </Notice>

      <div className="overflow-x-auto rounded-[20px] bg-white">
        <table className="w-full min-w-[760px] border-collapse text-[15px] text-[#262a67]">
          <caption className="px-5 pt-[18px] pb-1.5 text-start text-lg font-semibold">
            {t("screen.public.forBusiness.plans.tableCaption", { period: periodLabel })}
          </caption>
          <thead>
            <tr className={`text-[13px] ${MUTED}`}>
              <th scope="col" className="p-2.5 px-5 text-start font-semibold">
                {t("screen.public.forBusiness.plans.colWho")}
              </th>
              <th scope="col" className="p-2.5 px-3 text-start font-semibold">
                {t("screen.public.forBusiness.plans.colEntry")}
              </th>
              <th scope="col" className="p-2.5 px-3 text-start font-semibold">
                {t("screen.public.forBusiness.plans.colPopular")}
              </th>
              <th scope="col" className="p-2.5 px-3 text-start font-semibold">
                {t("screen.public.forBusiness.plans.colTop")}
              </th>
              <th scope="col" className="p-2.5 px-5 text-start font-semibold">
                {t("screen.public.forBusiness.plans.colTrial")}
              </th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FAMILIES.map((family) => (
              <tr key={family.nameKey} className="border-t border-[#e3dfc9] align-top">
                <th scope="row" className="p-3.5 px-5 text-start">
                  <span className="flex flex-col">
                    <span className="text-base font-semibold">{t(family.nameKey)}</span>
                    <span className={`text-[13px] font-normal ${MUTED}`}>{t(family.noteKey)}</span>
                  </span>
                </th>
                {family.tiers.map((tier) => (
                  <td key={tier.nameKey} className="p-3.5 px-3">
                    <span className="flex max-w-[220px] flex-col gap-0.5">
                      <span className={`text-sm font-semibold ${MUTED}`}>{t(tier.nameKey)}</span>
                      <span className="text-[22px] leading-7 font-bold">
                        {price(tier.monthly)}{" "}
                        <span className={`text-xs font-medium ${MUTED}`}>{per(tier.monthly)}</span>
                      </span>
                      <span className={`text-[13px] leading-[18px] ${MUTED}`}>
                        {t(tier.lineKey)}
                      </span>
                    </span>
                  </td>
                ))}
                <td className="p-3.5 px-5 text-sm">{t(family.trialKey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {ROLES.map((role) => (
          <Link
            key={role.signUpScreenId}
            to={pathFor(role.signUpScreenId)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border-[1.5px] border-[#7b7fa6] bg-white px-4 text-[15px] font-semibold text-[#262a67] no-underline hover:border-[#262a67]"
          >
            {t(role.ctaKey)}
            <TeIcon name="arrow" className="size-4" flipInRtl />
          </Link>
        ))}
        <Link
          to={pathFor("SCR-TRV-01")}
          className="inline-flex h-11 items-center gap-2 rounded-xl border-[1.5px] border-[#7b7fa6] bg-white px-4 text-[15px] font-semibold text-[#262a67] no-underline hover:border-[#262a67]"
        >
          {t("screen.public.forBusiness.plans.cta.traveler")}
          <TeIcon name="arrow" className="size-4" flipInRtl />
        </Link>
        <Link
          to={pathFor("SCR-PUB-20")}
          className={`inline-flex h-11 items-center px-2 text-[15px] font-semibold underline underline-offset-4 hover:text-[#c93a00] ${INK}`}
        >
          {t("screen.public.forBusiness.plans.legalLink")}
        </Link>
      </div>
    </section>
  );
}

/* ZATCA ---------------------------------------------------------------------- */

function Zatca() {
  const { t } = useAuth();
  return (
    <section aria-labelledby="business-zatca" className={`${SECTION_CLASS} pt-16`}>
      <div className="flex flex-wrap items-center gap-6 rounded-[20px] bg-[#262a67] p-8 text-[#f6f3e4] md:gap-10 md:px-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#31367a] px-2.5 py-0.5 text-[13px] font-bold text-[#ff8655]">
            <TeIcon name="check" className="size-3.5" />
            {t("screen.public.forBusiness.zatca.badge")}
          </span>
          <h2
            id="business-zatca"
            className="m-0 text-[24px] leading-8 font-bold md:text-[28px] md:text-4xl"
          >
            {t("screen.public.forBusiness.zatca.title")}
          </h2>
          <p className="m-0 max-w-[640px] text-[15px] leading-[23px] text-[#b8bad6]">
            {t("screen.public.forBusiness.zatca.body")}
          </p>
        </div>
        <div className="flex min-w-0 items-center gap-3.5 rounded-[20px] bg-[#31367a] p-[18px] md:w-[300px] md:shrink-0">
          <span className="flex size-[88px] shrink-0 items-center justify-center rounded-xl bg-white">
            <TeIcon name="receipt" className="size-10 text-[#262a67]" />
          </span>
          <span className="flex flex-col gap-0.5 text-sm leading-5">
            <strong className="text-[15px]">{t("screen.public.forBusiness.badge")}</strong>
            <span className="text-[#b8bad6]">
              {t("screen.public.forBusiness.zatca.sample.parties")}
            </span>
            <span className="text-[#b8bad6]">
              {t("screen.public.forBusiness.zatca.sample.amount")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#f6f3e4]">
              <TeIcon name="check" className="size-3.5 text-[#ff8655]" />
              {t("screen.public.forBusiness.zatca.sample.cleared")}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* FAQ ---------------------------------------------------------------------- */

function Faq({ open, onToggle }: { open: number; onToggle: (index: number) => void }) {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="business-faq"
      className={`${SECTION_CLASS} flex flex-wrap gap-6 pt-16 md:gap-12`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <h2
          id="business-faq"
          className={`m-0 text-[28px] leading-9 font-bold md:text-[32px] md:leading-10 ${INK}`}
        >
          {t("screen.public.forBusiness.faq.title")}
        </h2>
        <p className={`m-0 text-[15px] leading-[22px] ${MUTED}`}>
          {t("screen.public.forBusiness.faq.contact")}
        </p>
      </div>
      <div className="min-w-0 flex-1 overflow-hidden rounded-[20px] bg-white">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.q} className={index === 0 ? undefined : "border-t border-[#e3dfc9]"}>
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`business-faq-${index}`}
                  onClick={() => onToggle(isOpen ? -1 : index)}
                  className="flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-5 py-3.5 text-start text-base font-semibold text-[#262a67]"
                >
                  {t(item.q)}
                  <TeIcon name={isOpen ? "minus" : "plus"} className="size-5 shrink-0" />
                </button>
              </h3>
              {isOpen ? (
                <p
                  id={`business-faq-${index}`}
                  className={`m-0 px-5 pb-[18px] text-[15px] leading-[23px] ${MUTED}`}
                >
                  {t(item.a)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
