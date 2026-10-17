# `@trips-app/domain`

Pure business rules. No I/O, no framework imports, no database access.

Contents, one folder per concern (to be added as the tasks land):

- state machines for trip, booking, seat, deal, application, subscription, coupon and lab test (SRS 7),
- plan and permission gates (CON-06),
- money as amount plus currency code, with rounding per currency (DAT-06, D-157),
- retention and deletion rules (SRS 6.4).

Rule: the apps and `apps/server` depend on this package. It depends on nothing in the monorepo.
