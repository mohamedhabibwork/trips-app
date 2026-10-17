# Admin console (`apps/admin`)

Domain: admin.trips-enjoy.com. Responsive web app for platform staff only.

- Access: admin sign-in with a mandatory authenticator (SRS 4.1). Three roles: Super admin, Operations, Finance (D-49). Each role sees only its own screens.
- Screens: SCR-ADM-01 to SCR-ADM-33 in `docs/screens/03-admin-console.md`.
- Server modules used: `admin`, `onboarding`, `auth`, `plans`, `coupons`, `negotiation`, `payments`, `accounting`, `driver`, `employees`.
- Platform-wide reports run under the admin role and are logged (DAT-02).
- Separate route and deployment from all other surfaces (UI-07, FND-23).

See [ARCHITECTURE.md](../../../../../ARCHITECTURE.md).
