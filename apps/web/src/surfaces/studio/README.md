# Photographer studio (`apps/studio`)

Domain: studio.trips-enjoy.com. Responsive web app for platform and organization-owned photographers (D-86).

- Access: sign-in. Some features are plan-gated (Basic, Studio, Pro).
- Screens: SCR-PHO-01 to SCR-PHO-12 in `docs/screens/05-photographer-studio.md`.
- Server modules used: `photographer`, `media`, `staffing`, `accounting`, `notifications`.
- Uploads go straight to object storage through pre-signed URLs that expire after 5 minutes (FR-MED-02).

See [ARCHITECTURE.md](../../../../../ARCHITECTURE.md).
