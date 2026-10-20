// SCR-PUB-20 Terms & Privacy: the five policy sections with an on-page contents list, the child
// data article (WebLegal.dc.html). Static content — the loader prefetches nothing. The public
// shell draws the header and footer; this page is the article and its navigation.
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { TextButton } from "@/components/kit/controls";

const INK = "text-[#262a67]";
const MUTED = "text-[#5b5f86]";

/** Key of a section whose body is heading + paragraph pairs. */
interface LegalBodyBlock {
  headingKey: string;
  bodyKey: string;
}

/** The child section renders its own article layout; the rest are heading/paragraph lists. */
type LegalSection =
  | { kind: "child"; titleKey: string }
  | { kind: "plain"; titleKey: string; blocks: readonly LegalBodyBlock[] };

/** The artboard order: terms, privacy, child data (special layout), refunds, cookies. */
const SECTIONS: readonly LegalSection[] = [
  {
    kind: "plain",
    titleKey: "screen.public.legal.termsOfUse.title",
    blocks: [
      {
        headingKey: "screen.public.legal.termsOfUse.whoWeAre.h",
        bodyKey: "screen.public.legal.termsOfUse.whoWeAre.p",
      },
      {
        headingKey: "screen.public.legal.termsOfUse.yourAccount.h",
        bodyKey: "screen.public.legal.termsOfUse.yourAccount.p",
      },
      {
        headingKey: "screen.public.legal.termsOfUse.bookings.h",
        bodyKey: "screen.public.legal.termsOfUse.bookings.p",
      },
    ],
  },
  {
    kind: "plain",
    titleKey: "screen.public.legal.privacy.title",
    blocks: [
      {
        headingKey: "screen.public.legal.privacy.whatWeCollect.h",
        bodyKey: "screen.public.legal.privacy.whatWeCollect.p",
      },
      {
        headingKey: "screen.public.legal.privacy.sharing.h",
        bodyKey: "screen.public.legal.privacy.sharing.p",
      },
      {
        headingKey: "screen.public.legal.privacy.marketing.h",
        bodyKey: "screen.public.legal.privacy.marketing.p",
      },
    ],
  },
  { kind: "child", titleKey: "screen.public.legal.child.title" },
  {
    kind: "plain",
    titleKey: "screen.public.legal.refunds.title",
    blocks: [
      {
        headingKey: "screen.public.legal.refunds.youCancel.h",
        bodyKey: "screen.public.legal.refunds.youCancel.p",
      },
      {
        headingKey: "screen.public.legal.refunds.organizerCancels.h",
        bodyKey: "screen.public.legal.refunds.organizerCancels.p",
      },
      {
        headingKey: "screen.public.legal.refunds.coupons.h",
        bodyKey: "screen.public.legal.refunds.coupons.p",
      },
    ],
  },
  {
    kind: "plain",
    titleKey: "screen.public.legal.cookies.title",
    blocks: [
      {
        headingKey: "screen.public.legal.cookies.essential.h",
        bodyKey: "screen.public.legal.cookies.essential.p",
      },
      {
        headingKey: "screen.public.legal.cookies.analytics.h",
        bodyKey: "screen.public.legal.cookies.analytics.p",
      },
    ],
  },
];

interface AccessRow {
  whoKey: string;
  whatKey: string;
  whenKey: string;
}

/** The "who can see what" table of the child section. */
const ACCESS_ROWS: readonly AccessRow[] = [
  {
    whoKey: "screen.public.legal.child.access.parent.who",
    whatKey: "screen.public.legal.child.access.parent.what",
    whenKey: "screen.public.legal.child.access.parent.when",
  },
  {
    whoKey: "screen.public.legal.child.access.moderator.who",
    whatKey: "screen.public.legal.child.access.moderator.what",
    whenKey: "screen.public.legal.child.access.moderator.when",
  },
  {
    whoKey: "screen.public.legal.child.access.organizer.who",
    whatKey: "screen.public.legal.child.access.organizer.what",
    whenKey: "screen.public.legal.child.access.organizer.when",
  },
  {
    whoKey: "screen.public.legal.child.access.driver.who",
    whatKey: "screen.public.legal.child.access.driver.what",
    whenKey: "screen.public.legal.child.access.driver.when",
  },
  {
    whoKey: "screen.public.legal.child.access.photographer.who",
    whatKey: "screen.public.legal.child.access.photographer.what",
    whenKey: "screen.public.legal.child.access.photographer.when",
  },
  {
    whoKey: "screen.public.legal.child.access.support.who",
    whatKey: "screen.public.legal.child.access.support.what",
    whenKey: "screen.public.legal.child.access.support.when",
  },
];

const RETENTION_KEYS = [
  "screen.public.legal.child.retention.location",
  "screen.public.legal.child.retention.boardingLog",
  "screen.public.legal.child.retention.profile",
  "screen.public.legal.child.retention.albums",
] as const;

const CHILD_COLLECT_KEYS = [
  "screen.public.legal.child.collect.b1",
  "screen.public.legal.child.collect.b2",
  "screen.public.legal.child.collect.b3",
  "screen.public.legal.child.collect.b4",
] as const;

export function Legal() {
  const { t } = useAuth();
  const [section, setSection] = useState(0);
  const total = SECTIONS.length;
  const current = SECTIONS[section] as LegalSection;
  const next = section + 1 < total ? (SECTIONS[section + 1] as LegalSection) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-7 md:px-6 md:py-8">
      <div className="flex flex-col gap-1.5">
        <h1
          className={`m-0 text-[28px] leading-9 font-bold md:text-[40px] md:leading-[48px] ${INK}`}
        >
          {t("screen.public.legal.title")}
        </h1>
        <p className={`m-0 text-[15px] ${MUTED}`}>{t("screen.public.legal.updated")}</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        {/* Contents + DPO contact, sticky next to the article on desktop. */}
        <nav
          aria-label={t("screen.public.legal.tocLabel")}
          className="flex shrink-0 flex-col gap-2.5 md:sticky md:top-6 md:w-[280px]"
        >
          <span className={`text-[13px] font-bold tracking-[0.5px] ${MUTED}`}>
            {t("screen.public.legal.tocLabel")}
          </span>
          <div className="flex flex-col gap-1.5">
            {SECTIONS.map((entry, index) => {
              const on = index === section;
              return (
                <button
                  key={entry.titleKey}
                  type="button"
                  aria-current={on ? "true" : undefined}
                  onClick={() => setSection(index)}
                  className={`min-h-11 cursor-pointer rounded-xl border px-3.5 py-2 text-start text-[15px] ${
                    on
                      ? "border-[#262a67] bg-[#262a67] font-bold text-[#f6f3e4]"
                      : "border-[#e3dfc9] bg-white font-semibold text-[#262a67] hover:border-[#7b7fa6]"
                  }`}
                >
                  {t(entry.titleKey)}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-col gap-1.5 rounded-[20px] bg-white p-4 text-sm leading-5">
            <strong className={`text-[15px] ${INK}`}>{t("screen.public.legal.dpo.title")}</strong>
            <span className={MUTED}>{t("screen.public.legal.dpo.body")}</span>
            <a
              href={`mailto:${t("screen.public.legal.dpo.email")}`}
              className={`font-semibold ${INK} hover:text-[#c93a00]`}
            >
              {t("screen.public.legal.dpo.email")}
            </a>
          </div>
        </nav>

        {/* The article card. */}
        <article
          aria-labelledby="legal-section-title"
          className="flex min-w-0 flex-1 flex-col gap-5 rounded-[20px] bg-white p-6 text-[17px] leading-7 md:p-10"
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-[#c93a00]">
              {t("screen.public.legal.sectionOf", { current: section + 1, total })}
            </span>
            <h2
              id="legal-section-title"
              className={`m-0 text-[24px] leading-8 font-bold md:text-[30px] md:leading-[38px] ${INK}`}
            >
              {t(current.titleKey)}
            </h2>
          </div>

          {current.kind === "child" ? (
            <ChildArticle />
          ) : (
            <div className="flex max-w-[720px] flex-col gap-4">
              {current.blocks.map((block) => (
                <div key={block.headingKey} className="flex flex-col gap-1.5">
                  <h3 className={`m-0 text-[20px] leading-7 font-semibold ${INK}`}>
                    {t(block.headingKey)}
                  </h3>
                  <p className="m-0">{t(block.bodyKey)}</p>
                </div>
              ))}
            </div>
          )}

          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-t border-[#e3dfc9] pt-5 text-[15px] ${MUTED}`}
          >
            <span>
              {t("screen.public.legal.signature", { email: t("screen.public.legal.dpo.email") })}
            </span>
            {next ? (
              <TextButton tone="brand" onClick={() => setSection(Math.min(section + 1, total - 1))}>
                {t("screen.public.legal.nextSection", { title: t(next.titleKey) })}
              </TextButton>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}

/** Section 3: the child data & live tracking article with its access table. */
function ChildArticle() {
  const { t } = useAuth();
  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <div className="flex gap-3 rounded-xl bg-[#e6e8f5] px-4 py-4 text-base leading-6 text-[#262a67]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mt-0.5 size-[22px] shrink-0"
        >
          <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6zM9 12l2 2 4-4" />
        </svg>
        <span>
          <strong>{t("screen.public.legal.child.inShort")}</strong>
        </span>
      </div>

      <p className="m-0">{t("screen.public.legal.child.intro")}</p>

      <h3 className="mb-0 mt-2 text-[22px] leading-[30px] font-semibold text-[#262a67]">
        {t("screen.public.legal.child.collect.title")}
      </h3>
      <ul className="m-0 flex list-disc flex-col gap-2 ps-[22px]">
        {CHILD_COLLECT_KEYS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
      <p className="m-0">{t("screen.public.legal.child.collect.note")}</p>

      <h3 className="mb-0 mt-2 text-[22px] leading-[30px] font-semibold text-[#262a67]">
        {t("screen.public.legal.child.access.title")}
      </h3>
      <div className="overflow-x-auto rounded-xl border border-[#e3dfc9]">
        <table className="w-full min-w-[560px] border-collapse text-[15px] leading-[21px] text-[#262a67]">
          <thead>
            <tr className="bg-[#f6f3e4] text-[13px]">
              <th scope="col" className="p-2.5 ps-3.5 text-start font-bold">
                {t("screen.public.legal.child.access.colWho")}
              </th>
              <th scope="col" className="p-2.5 ps-3.5 text-start font-bold">
                {t("screen.public.legal.child.access.colWhat")}
              </th>
              <th scope="col" className="p-2.5 ps-3.5 text-start font-bold">
                {t("screen.public.legal.child.access.colWhen")}
              </th>
            </tr>
          </thead>
          <tbody>
            {ACCESS_ROWS.map((row) => (
              <tr key={row.whoKey} className="border-t border-[#e3dfc9] align-top">
                <th scope="row" className="p-3 ps-3.5 text-start font-semibold">
                  {t(row.whoKey)}
                </th>
                <td className="p-3 ps-3.5">{t(row.whatKey)}</td>
                <td className="p-3 ps-3.5 text-[#5b5f86]">{t(row.whenKey)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0">{t("screen.public.legal.child.access.note")}</p>

      <h3 className="mb-0 mt-2 text-[22px] leading-[30px] font-semibold text-[#262a67]">
        {t("screen.public.legal.child.retention.title")}
      </h3>
      <ul className="m-0 flex list-disc flex-col gap-2 ps-[22px]">
        {RETENTION_KEYS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>

      <h3 className="mb-0 mt-2 text-[22px] leading-[30px] font-semibold text-[#262a67]">
        {t("screen.public.legal.child.consent.title")}
      </h3>
      <p className="m-0">{t("screen.public.legal.child.consent.p1")}</p>
      <p className="m-0">{t("screen.public.legal.child.consent.p2")}</p>

      <h3 className="mb-0 mt-2 text-[22px] leading-[30px] font-semibold text-[#262a67]">
        {t("screen.public.legal.child.rights.title")}
      </h3>
      <p className="m-0">
        {t("screen.public.legal.child.rights.p", { email: t("screen.public.legal.dpo.email") })}
      </p>
    </div>
  );
}
