import { useState, type ReactNode } from "react";
import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TePagination } from "@trips-app/ui/components/te-pagination";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { AdminScreenLink } from "./admin-links";

export interface AdminStatusPresentation {
  tone: TeBadgeTone;
  icon: TeIconName;
  label: string;
}

/** Status is always a word plus an icon. Tone is only a secondary cue. */
export function AdminStatus({ status }: { status: AdminStatusPresentation }) {
  return (
    <TeBadge tone={status.tone}>
      <TeIcon name={status.icon} />
      <span>{status.label}</span>
    </TeBadge>
  );
}

export interface AdminPageProps {
  children: ReactNode;
  /** Every screen except admin home shows a link back to it. */
  backHome?: boolean;
}

export function AdminPage({ children, backHome = true }: AdminPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      {backHome ? <AdminScreenLink slug="admin-home">Back to admin home</AdminScreenLink> : null}
      {children}
    </div>
  );
}

export function AdminPanel({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <TeCard as="section" header={<h2 className="te-h3">{title}</h2>} footer={footer}>
      <div className="flex flex-col gap-4">{children}</div>
    </TeCard>
  );
}

export function AdminActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-3">{children}</div>;
}

export function AdminFilters({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3">{children}</div>;
}

export function AdminKpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export interface AdminFact {
  label: string;
  value: ReactNode;
}

export function AdminFacts({ items }: { items: readonly AdminFact[] }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="te-caption">{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminTabs({ tabs, ariaLabel }: { tabs: readonly TeTab[]; ariaLabel: string }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  return <TeTabs tabs={tabs} activeId={activeId} onSelect={setActiveId} ariaLabel={ariaLabel} />;
}

export function AdminFilterSelect({
  label,
  options,
}: {
  label: string;
  options: readonly TeSelectOption[];
}) {
  const [value, setValue] = useState(options[0]?.value ?? "");
  return <TeSelect label={label} options={options} value={value} onValueChange={setValue} />;
}

export function AdminSearch({
  label,
  placeholder,
  clearLabel,
}: {
  label: string;
  placeholder?: string;
  clearLabel: string;
}) {
  const [value, setValue] = useState("");
  return (
    <TeSearchField
      label={label}
      placeholder={placeholder}
      clearLabel={clearLabel}
      value={value}
      onValueChange={setValue}
    />
  );
}

export function AdminPagination({ pageCount }: { pageCount: number }) {
  const [page, setPage] = useState(1);
  return <TePagination page={page} pageCount={pageCount} onPageChange={setPage} />;
}

export function AdminToggle({
  label,
  initialChecked = false,
}: {
  label: string;
  initialChecked?: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  return <TeSwitch label={label} checked={checked} onCheckedChange={setChecked} />;
}

/** Stands in for a chart until a chart component exists. Names the data it will show. */
export function AdminChartPlaceholder({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label}. Chart data pending.`}
      className="flex h-48 items-center justify-center rounded-md border border-dashed p-4"
    >
      <p className="te-caption">{label}. Chart data pending.</p>
    </div>
  );
}
