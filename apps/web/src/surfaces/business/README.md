# Organization dashboard (`apps/business`)

Domain: business.trips-enjoy.com. Responsive web app for organization owners and employees.

- Access: staff sign-in, tenant-scoped (SRS 4.1). Employees see only the screens their permissions allow (FR-EMP-04).
- Screens: SCR-ORG-01 to SCR-ORG-42 in `docs/screens/02-organization-dashboard.md`.
- Server modules used: `organization`, `employees`, `trips`, `programs`, `fleet`, `staffing`, `negotiation`, `seats`, `booking`, `coupons`, `plans`, `tracking`, `accounting`, `notifications`.
- Separate route and deployment from the traveler app and admin console (UI-07).

See [ARCHITECTURE.md](../../../../../ARCHITECTURE.md).
