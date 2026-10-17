# Moderator app (`apps/crew`)

Domain: crew.trips-enjoy.com. Progressive web app for vehicle moderators (D-86). Scoped to one vehicle at a time.

- Access: moderator sign-in with a staff code (proposed D-107). Sees traveler name, seat and check-in status only, with no contact details or booking amounts (D-334).
- Screens: SCR-MOD-01 to SCR-MOD-10 in `docs/screens/06-moderator-app.md`.
- Server modules used: `moderator`, `check-in`, `trips`, `tracking`.
- Check-in works offline and syncs later (FR-CHK-05). A missing location permission still records the event (D-118).
