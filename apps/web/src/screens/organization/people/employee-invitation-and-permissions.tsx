// SCR-ORG-35 Invite employee: the invitation, its permission areas and their change history.
// Opened from an employee's name in the list, the same page edits that employee's areas.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgChoice, OrgInput } from "../common/org-form";
import { useOrgNavigate } from "../common/org-link";
import { getSelectedEmployeeId } from "../common/org-shared";
import {
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";

import {
  permissionAreaLabel,
  type PermissionArea,
  type PermissionLevel,
  type PermissionMatrix,
} from "./people-parts";
import { PermissionHistory } from "./permission-history";

const FORM_ID = "employee-invitation-form";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The areas the artboard offers; live tracking follows trips and settings stay owner-only. */
const EDITABLE_AREAS = [
  "trips",
  "bookings",
  "accounting",
  "coupons",
  "employees",
  "fleet",
  "subscription",
] as const satisfies readonly PermissionArea[];

type EditableArea = (typeof EDITABLE_AREAS)[number];

interface Employee {
  id: string;
  invitedEmail: string;
  roleTitle: string;
  permissions: PermissionMatrix;
}

function toMatrix(areas: ReadonlySet<EditableArea>, base?: PermissionMatrix): PermissionMatrix {
  const level = (area: EditableArea): PermissionLevel =>
    areas.has(area) ? (base && base[area] !== "none" ? base[area] : "manage") : "none";
  return {
    trips: level("trips"),
    bookings: level("bookings"),
    accounting: level("accounting"),
    coupons: level("coupons"),
    employees: level("employees"),
    fleet: level("fleet"),
    subscription: level("subscription"),
    tracking: base?.tracking ?? (areas.has("trips") ? "manage" : "none"),
    settings: base?.settings ?? "none",
  };
}

interface InvitationFormProps {
  employee: Employee | null;
  onSubmit: (values: { email: string; roleTitle: string; permissions: PermissionMatrix }) => void;
}

function InvitationForm({ employee, onSubmit }: InvitationFormProps) {
  const [email, setEmail] = useState(employee?.invitedEmail ?? "");
  const [roleTitle, setRoleTitle] = useState(employee?.roleTitle ?? "");
  const [areas, setAreas] = useState<ReadonlySet<EditableArea>>(
    () =>
      new Set(
        employee ? EDITABLE_AREAS.filter((area) => employee.permissions[area] !== "none") : [],
      ),
  );
  const [submitted, setSubmitted] = useState(false);

  const emailError =
    submitted && !EMAIL_PATTERN.test(email.trim())
      ? t("screen.organization.people.employeeInvitationAndPermissions.emailInvalid")
      : undefined;
  const roleError =
    submitted && roleTitle.trim().length < 2
      ? t("screen.organization.people.employeeInvitationAndPermissions.roleTitleTooShort")
      : undefined;

  function toggle(area: EditableArea, checked: boolean) {
    setAreas((current) => {
      const next = new Set(current);
      if (checked) next.add(area);
      else next.delete(area);
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!EMAIL_PATTERN.test(email.trim()) || roleTitle.trim().length < 2) return;
    onSubmit({
      email: email.trim(),
      roleTitle: roleTitle.trim(),
      permissions: toMatrix(areas, employee?.permissions),
    });
  }

  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <OrgInput
        label={t("screen.organization.people.employeeInvitationAndPermissions.employeeEmail")}
        type="email"
        autoComplete="off"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        readOnly={Boolean(employee)}
        error={emailError}
      />
      <OrgInput
        label={t("screen.organization.people.employeeInvitationAndPermissions.roleTitle")}
        value={roleTitle}
        onChange={(event) => setRoleTitle(event.target.value)}
        maxLength={120}
        dir="auto"
        error={roleError}
      />
      <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
        <legend className="mb-2 p-0 text-sm leading-5 font-semibold">
          {t("screen.organization.people.employeeInvitationAndPermissions.permissionAreas")}
        </legend>
        {EDITABLE_AREAS.map((area) => (
          <OrgChoice
            key={area}
            type="checkbox"
            checked={areas.has(area)}
            onChange={(event) => toggle(area, event.target.checked)}
          >
            {permissionAreaLabel(area)}
          </OrgChoice>
        ))}
      </fieldset>
    </form>
  );
}

export function EmployeeInvitationAndPermissions() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, actor, locale } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);
  const preferredId = getSelectedEmployeeId();

  const employeesQuery = useQuery(orpc.employees.list.queryOptions({ input: {}, enabled }));
  const target =
    (preferredId
      ? employeesQuery.data?.employees.find((employee) => employee.id === preferredId)
      : undefined) ?? null;

  const detailQuery = useQuery(
    orpc.employees.getById.queryOptions({
      input: { membershipId: target?.id ?? "" },
      enabled: enabled && Boolean(target),
    }),
  );

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
    void goTo("employees-list");
  };
  const inviteMutation = useMutation(orpc.employees.invite.mutationOptions({ onSuccess }));
  const updatePermissionsMutation = useMutation(
    orpc.employees.updatePermissions.mutationOptions({ onSuccess }),
  );

  const busy = inviteMutation.isPending || updatePermissionsMutation.isPending;
  const failed = inviteMutation.isError || updatePermissionsMutation.isError;
  const resolving = Boolean(preferredId) && employeesQuery.isLoading;

  function handleSubmit(values: {
    email: string;
    roleTitle: string;
    permissions: PermissionMatrix;
  }) {
    if (!enabled) return;
    if (target) {
      updatePermissionsMutation.mutate({
        membershipId: target.id,
        roleTitle: values.roleTitle,
        permissions: values.permissions,
      });
      return;
    }
    inviteMutation.mutate({
      invitedEmail: values.email,
      roleTitle: values.roleTitle,
      permissions: values.permissions,
    });
  }

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={
          target
            ? t("screen.organization.people.employeeInvitationAndPermissions.editTitle")
            : t("screen.organization.people.employeeInvitationAndPermissions.title")
        }
        caption={t("screen.organization.people.employeeInvitationAndPermissions.caption")}
        actions={
          <OrgButton type="submit" form={FORM_ID} disabled={!enabled || busy || resolving}>
            {target
              ? t("screen.organization.people.employeeInvitationAndPermissions.savePermissions")
              : t("screen.organization.people.employeeInvitationAndPermissions.sendInvitation")}
          </OrgButton>
        }
      />
      {failed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.people.employeeInvitationAndPermissions.notSavedTitle")}
        >
          {t("screen.organization.people.employeeInvitationAndPermissions.notSavedBody")}
        </OrgAlert>
      ) : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.people.employeeInvitationAndPermissions.invitation")}
          className="flex-1"
        >
          {resolving ? (
            <OrgLoading rows={4} />
          ) : (
            <InvitationForm key={target?.id ?? "new"} employee={target} onSubmit={handleSubmit} />
          )}
        </OrgCard>
        <OrgCard
          title={t("screen.organization.people.employeeInvitationAndPermissions.changeHistory")}
          className="lg:flex-[1.4]"
        >
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.people.employeeInvitationAndPermissions.historyCaption")}
          </p>
          {detailQuery.isError ? (
            <OrgError onRetry={() => void detailQuery.refetch()} />
          ) : (
            <PermissionHistory
              entries={detailQuery.data?.recentAuditLogs ?? []}
              locale={locale}
              loading={Boolean(target) && detailQuery.isLoading}
            />
          )}
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
