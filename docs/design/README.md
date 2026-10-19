# Trips Enjoy design: web, mobile and PDF artboards

Exported from [the Trips Enjoy design canvas](https://claude.ai/artifact/Ue2ppyu1T5M9EuPtPbDLsP) (version `1792435945-4b62`): 430 artboards and 107 assets.

## Layout

- `web/`: 205 desktop artboards (frame width >= 900px).
- `mobile/`: 215 phone artboards (frame width <= 500px).
- `pdf/`: 10 print documents (794x1123, A4).
- `assets/`: 107 images, icons and fonts, referenced as `../assets/<id>.<ext>`.
- `tokens.json`: Trips Enjoy design tokens (colors, type, spacing, radii, shadows, glass).
- `canvas.json`: the source canvas index (frame positions, pages, notes).

Each platform folder is self-contained: it has its own `support.js` and the components
its artboards import. Links to an artboard on the other platform point at `../web/` or
`../mobile/`.

Open any `.dc.html` file directly in a browser. Fonts load from Google Fonts.

## Artboards by page

### 00 · Screen map

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| Main.dc.html | Screen map | web | 1440x8000 | 00 · Screen map |

### 01 · Traveler

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| AuthWelcome.dc.html | Auth · Welcome | mobile | 390x844 | 01 · Traveler |
| MobileSignIn.dc.html | Auth · Sign in (password) | mobile | 390x844 | 01 · Traveler |
| MobileOtpLogin.dc.html | Auth · Sign in with code | mobile | 390x844 | 01 · Traveler |
| MobileLoginVerify.dc.html | Auth · Verify code → app | mobile | 390x844 | 01 · Traveler |
| MobileSocialComplete.dc.html | Auth · Apple / Google: complete profile | mobile | 390x844 | 01 · Traveler |
| MobileRole.dc.html | Sign up · 1 Choose role | mobile | 390x844 | 01 · Traveler |
| MobileSignUp.dc.html | Traveler · 2 Create account | mobile | 390x844 | 01 · Traveler |
| MobileOtp.dc.html | Traveler · 3 Verify number | mobile | 390x844 | 01 · Traveler |
| MobileReady.dc.html | Traveler · 4 Account ready | mobile | 390x844 | 01 · Traveler |
| MobileAddChild.dc.html | Parent · Add child | mobile | 390x844 | 01 · Traveler |
| TravPlan.dc.html | Traveler · Choose plan (Free / Explorer / VIP) | mobile | 390x844 | 01 · Traveler |
| MobileForgot.dc.html | Auth · Forgot password | mobile | 390x844 | 01 · Traveler |
| MobileResetCode.dc.html | Auth · Reset code (error) | mobile | 390x844 | 01 · Traveler |
| MobileNewPassword.dc.html | Auth · New password | mobile | 390x844 | 01 · Traveler |
| MobileResetDone.dc.html | Auth · Password updated | mobile | 390x844 | 01 · Traveler |
| MobileResetEmailSent.dc.html | Auth · Reset by email | mobile | 390x844 | 01 · Traveler |
| MobileAccount.dc.html | Account · Roles & security | mobile | 390x844 | 01 · Traveler |
| MobileSignOut.dc.html | Account · Sign out | mobile | 390x844 | 01 · Traveler |
| MobileDeleteAccount.dc.html | Account · Delete account | mobile | 390x844 | 01 · Traveler |
| WebSignIn.dc.html | Web · Sign in | web | 1440x900 | 01 · Traveler |
| WebLoginVerify.dc.html | Web · Sign-in code | web | 1440x900 | 01 · Traveler |
| WebRegister.dc.html | Web · /register — choose account type | web | 1440x900 | 01 · Traveler |
| WebSignUp.dc.html | Web · Traveler /register/traveler | web | 1440x900 | 01 · Traveler |
| WebVerifyTraveler.dc.html | Web · Traveler verify phone | web | 1440x900 | 01 · Traveler |
| WebReady.dc.html | Web · Traveler account ready | web | 1440x900 | 01 · Traveler |
| WebSessionExpired.dc.html | Web · Session expired | web | 1440x900 | 01 · Traveler |
| WebForgot.dc.html | Web · Forgot password | web | 1440x900 | 01 · Traveler |
| WebReset.dc.html | Web · Reset password | web | 1440x900 | 01 · Traveler |
| WebResetEmailSent.dc.html | Web · Reset link sent | web | 1440x900 | 01 · Traveler |
| TrvHome.dc.html | Traveler · Home | mobile | 390x844 | 01 · Traveler |
| TrvSearch.dc.html | Traveler · Search & filters | mobile | 390x844 | 01 · Traveler |
| TrvResults.dc.html | Traveler · Search results | mobile | 390x844 | 01 · Traveler |
| TrvTrip.dc.html | Traveler · Trip details | mobile | 390x844 | 01 · Traveler |
| TrvCompany.dc.html | Traveler · Organizer profile & reviews | mobile | 390x844 | 01 · Traveler |
| TrvBookWho.dc.html | Book · 1 Who's travelling | mobile | 390x844 | 01 · Traveler |
| TrvBookPrograms.dc.html | Book · 2 Programs | mobile | 390x844 | 01 · Traveler |
| TrvBookSeats.dc.html | Book · 3 Seats | mobile | 390x844 | 01 · Traveler |
| TrvBookSummary.dc.html | Book · 4 Summary & coupon | mobile | 390x844 | 01 · Traveler |
| TrvPay.dc.html | Book · 5 Payment | mobile | 390x844 | 01 · Traveler |
| TrvPayFailed.dc.html | Book · Payment declined | mobile | 390x844 | 01 · Traveler |
| TrvBooked.dc.html | Book · Confirmed | mobile | 390x844 | 01 · Traveler |
| TrvPayPending.dc.html | Book · Confirming payment | mobile | 390x844 | 01 · Traveler |
| TrvFawryVoucher.dc.html | Book · Pay cash at Fawry | mobile | 390x844 | 01 · Traveler |
| TrvBooking.dc.html | Traveler · Booking detail | mobile | 390x844 | 01 · Traveler |
| TrvRemedy.dc.html | Traveler · Choose a remedy | mobile | 390x844 | 01 · Traveler |
| TrvPrivacy.dc.html | Traveler · Privacy & data | mobile | 390x844 | 01 · Traveler |
| TrvProviderHandoff.dc.html | Traveler · Apply as provider | mobile | 390x844 | 01 · Traveler |
| TrvProgramDetail.dc.html | Program details & tiers | mobile | 390x844 | 01 · Traveler |
| TrvProgramVip.dc.html | VIP-only program | mobile | 390x844 | 01 · Traveler |
| TrvAddPrograms.dc.html | Add programs to booking | mobile | 390x844 | 01 · Traveler |
| TrvAddProgramsPay.dc.html | Pay for programs | mobile | 390x844 | 01 · Traveler |
| TrvAddProgramsDone.dc.html | Programs added | mobile | 390x844 | 01 · Traveler |
| TrvProgramsSchedule.dc.html | My programs schedule | mobile | 390x844 | 01 · Traveler |
| TrvTrips.dc.html | My trips | mobile | 390x844 | 01 · Traveler |
| TrvTicket.dc.html | Ticket & boarding pass | mobile | 390x844 | 01 · Traveler |
| TrvModify.dc.html | Change booking | mobile | 390x844 | 01 · Traveler |
| TrvCancel.dc.html | Cancel booking | mobile | 390x844 | 01 · Traveler |
| TrvCancelled.dc.html | Cancelled · refund status | mobile | 390x844 | 01 · Traveler |
| TrvLive.dc.html | Trip day · live | mobile | 390x844 | 01 · Traveler |
| TrvAlbums.dc.html | Trip albums | mobile | 390x844 | 01 · Traveler |
| TrvAlbum.dc.html | Album viewer | mobile | 390x844 | 01 · Traveler |
| TrvRate.dc.html | Rate the trip | mobile | 390x844 | 01 · Traveler |
| TrvNotifications.dc.html | Notifications | mobile | 390x844 | 01 · Traveler |
| TrvProfile.dc.html | Profile | mobile | 390x844 | 01 · Traveler |
| TrvFamily.dc.html | Family members | mobile | 390x844 | 01 · Traveler |
| TrvPlan.dc.html | My plan & billing | mobile | 390x844 | 01 · Traveler |
| TrvReceipts.dc.html | Receipts & history | mobile | 390x844 | 01 · Traveler |
| TrvSettings.dc.html | Settings | mobile | 390x844 | 01 · Traveler |
| TrvSupport.dc.html | Help & support | mobile | 390x844 | 01 · Traveler |
| TrvInvoice.dc.html | Tax invoice (B2C) | mobile | 390x844 | 01 · Traveler |
| TrvChat.dc.html | Chat with organizer | mobile | 390x844 | 01 · Traveler |
| TrvFamilyAdd.dc.html | Add family member | mobile | 390x844 | 01 · Traveler |
| TrvPayMethods.dc.html | Payment methods | mobile | 390x844 | 01 · Traveler |
| TrvAlbumLink.dc.html | Open album by link | mobile | 390x844 | 01 · Traveler |
| WebHome.dc.html | Web · Landing | web | 1440x2783 | 01 · Traveler |
| WebExplore.dc.html | Web · Explore trips | web | 1440x1378 | 01 · Traveler |
| WebTrip.dc.html | Web · Trip page | web | 1440x2270 | 01 · Traveler |
| WebCheckout.dc.html | Web · Checkout | web | 1440x1480 | 01 · Traveler |
| WebBookings.dc.html | Web · My bookings | web | 1440x1000 | 01 · Traveler |
| WebOrganizer.dc.html | Web · Organizer page | web | 1440x3200 | 01 · Traveler |
| WebBusiness.dc.html | Web · For organizations, drivers & photographers | web | 1440x3500 | 01 · Traveler |
| WebAlbum.dc.html | Web · Shared album link | web | 1440x1600 | 01 · Traveler |
| WebLegal.dc.html | Web · Terms & privacy | web | 1440x2460 | 01 · Traveler |
| WebSeatPicker.dc.html | Web · Choose seats | web | 1440x1000 | 01 · Traveler |
| WebPayStatus.dc.html | Web · Payment status | web | 1440x1000 | 01 · Traveler |
| WebBooked.dc.html | Web · Booking confirmed | web | 1440x1200 | 01 · Traveler |
| WebBooking.dc.html | Web · Booking detail | web | 1440x1300 | 01 · Traveler |
| WebCancel.dc.html | Web · Cancel booking | web | 1440x1180 | 01 · Traveler |
| WebTripDay.dc.html | Web · Trip day | web | 1440x1000 | 01 · Traveler |
| WebReceipts.dc.html | Web · Receipts and invoices | web | 1440x1000 | 01 · Traveler |
| WebAlbums.dc.html | Web · My albums | web | 1440x1040 | 01 · Traveler |
| WebPlans.dc.html | Web · Traveler plans | web | 1440x1220 | 01 · Traveler |
| WebProfile.dc.html | Web · Profile and notifications | web | 1440x1520 | 01 · Traveler |
| WebPrivacy.dc.html | Web · Privacy | web | 1440x1060 | 01 · Traveler |
| WebBecomeProvider.dc.html | Web · Become a provider | web | 1440x1000 | 01 · Traveler |

### 02 · Parent

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| ParHome.dc.html | Parent · Family today | mobile | 390x844 | 02 · Parent |
| ParLive.dc.html | Parent · Live bus | mobile | 390x844 | 02 · Parent |
| ParChild.dc.html | Parent · Child's trip | mobile | 390x844 | 02 · Parent |
| ParNotBoarded.dc.html | Parent · Not boarded alert | mobile | 390x844 | 02 · Parent |
| ParAlerts.dc.html | Parent · Alerts history | mobile | 390x844 | 02 · Parent |
| ParLink.dc.html | Parent · Link child to a trip | mobile | 390x844 | 02 · Parent |
| ParGate.dc.html | Parent · Tracking needs a plan | mobile | 390x844 | 02 · Parent |
| ParSafetyReport.dc.html | Parent · Child-safety report | mobile | 390x844 | 02 · Parent |

### 03 · Driver

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| DrvAccount.dc.html | Driver sign-up · 2 Create account | mobile | 390x844 | 03 · Driver |
| DrvOtp.dc.html | Driver sign-up · 3 Verify number | mobile | 390x844 | 03 · Driver |
| DrvDetails.dc.html | Driver sign-up · 4 Personal details | mobile | 390x844 | 03 · Driver |
| DrvVehicle.dc.html | Driver sign-up · 5 Licence & vehicle | mobile | 390x844 | 03 · Driver |
| MobileApply.dc.html | Driver sign-up · 6 Documents | mobile | 390x844 | 03 · Driver |
| DrvReview.dc.html | Driver sign-up · 7 Under review | mobile | 390x844 | 03 · Driver |
| DrvPlan.dc.html | Driver · Approved → choose plan | mobile | 390x844 | 03 · Driver |
| MobileCheckout.dc.html | Driver · Subscribe: payment / trial | mobile | 390x844 | 03 · Driver |
| DrvLabBlocked.dc.html | Driver · Lab test required (app blocked) | mobile | 390x844 | 03 · Driver |
| DrvLabBook.dc.html | Driver · Book lab | mobile | 390x844 | 03 · Driver |
| DrvLabUpload.dc.html | Driver · Upload result | mobile | 390x844 | 03 · Driver |
| DrvLabPending.dc.html | Driver · Booked, still paused | mobile | 390x844 | 03 · Driver |
| DrvLabApproved.dc.html | Driver · Cleared to drive | mobile | 390x844 | 03 · Driver |
| WebSignUpDriver.dc.html | Web · Driver /register/driver | web | 1440x900 | 03 · Driver |
| WebVerify.dc.html | Web · Driver verify phone | web | 1440x900 | 03 · Driver |
| WebApply.dc.html | Web · Driver 2 Personal details | web | 1440x900 | 03 · Driver |
| WebDrvVehicle.dc.html | Web · Driver 3 Licence & vehicle | web | 1440x900 | 03 · Driver |
| WebDrvDocs.dc.html | Web · Driver 4 Documents & lab consent | web | 1440x900 | 03 · Driver |
| WebReview.dc.html | Web · Driver 5 Under review | web | 1440x900 | 03 · Driver |
| WebStatus.dc.html | Web · Driver changes needed | web | 1440x900 | 03 · Driver |
| WebDrvLab.dc.html | Web · Driver lab test required | web | 1440x900 | 03 · Driver |
| DrvHome.dc.html | Driver · Home | mobile | 390x844 | 03 · Driver |
| DrvOffers.dc.html | Driver · Offers | mobile | 390x844 | 03 · Driver |
| DrvOffer.dc.html | Driver · Offer details | mobile | 390x844 | 03 · Driver |
| DrvCounter.dc.html | Driver · Counter offer | mobile | 390x844 | 03 · Driver |
| DrvDealLocked.dc.html | Driver · Deal confirmed | mobile | 390x844 | 03 · Driver |
| DrvTrips.dc.html | Driver · My schedule | mobile | 390x844 | 03 · Driver |
| DrvTrip.dc.html | Driver · Assigned trip | mobile | 390x844 | 03 · Driver |
| DrvPreTrip.dc.html | Driver · Pre-trip check | mobile | 390x844 | 03 · Driver |
| DrvOnRoute.dc.html | Driver · On route | mobile | 390x844 | 03 · Driver |
| DrvTripDone.dc.html | Driver · Trip complete | mobile | 390x844 | 03 · Driver |
| DrvEarnings.dc.html | Driver · Earnings & payouts | mobile | 390x844 | 03 · Driver |
| DrvCoupons.dc.html | Driver · My coupons | mobile | 390x844 | 03 · Driver |
| DrvCouponNew.dc.html | Driver · Create coupon | mobile | 390x844 | 03 · Driver |
| DrvPlanManage.dc.html | Driver · My plan | mobile | 390x844 | 03 · Driver |
| DrvProfile.dc.html | Driver · Profile & rates | mobile | 390x844 | 03 · Driver |
| DrvAvailability.dc.html | Driver · Availability | mobile | 390x844 | 03 · Driver |
| DrvVehicles.dc.html | Driver · My vehicles | mobile | 390x844 | 03 · Driver |
| DrvOwnHome.dc.html | Company driver · Home | mobile | 390x844 | 03 · Driver |
| DrvVehicleEdit.dc.html | Driver · Add / edit vehicle | mobile | 390x844 | 03 · Driver |
| DrvProfileEdit.dc.html | Driver · Edit profile & rates | mobile | 390x844 | 03 · Driver |
| DrvReport.dc.html | Driver · Report problem or delay | mobile | 390x844 | 03 · Driver |
| DrvPaywall.dc.html | Driver · No active plan (locked) | mobile | 390x844 | 03 · Driver |
| DrvStatements.dc.html | Driver · Statements & invoices | mobile | 390x844 | 03 · Driver |
| DrvAnalytics.dc.html | Driver · Performance analytics | mobile | 390x844 | 03 · Driver |
| DrvLabStatus.dc.html | Driver · Lab tests | mobile | 390x844 | 03 · Driver |
| DrvSupport.dc.html | Driver · Contact support | mobile | 390x844 | 03 · Driver |

### 04 · Moderator

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| MobileStaffInvite.dc.html | Company driver · Accept invite | mobile | 390x844 | 04 · Moderator |
| ModInvite.dc.html | Moderator · Accept invite | mobile | 390x844 | 04 · Moderator |
| ModAssignment.dc.html | Moderator · Scoped assignment | mobile | 390x844 | 04 · Moderator |
| ModInstall.dc.html | Moderator · Install | mobile | 390x844 | 04 · Moderator |
| ModSignIn.dc.html | Moderator · Sign in | mobile | 390x844 | 04 · Moderator |
| ModSyncQueue.dc.html | Moderator · Offline queue | mobile | 390x844 | 04 · Moderator |
| ModAccessEnded.dc.html | Moderator · Access ended | mobile | 390x844 | 04 · Moderator |
| ModToday.dc.html | Moderator · Today's bus | mobile | 390x844 | 04 · Moderator |
| ModManifest.dc.html | Moderator · Manifest | mobile | 390x844 | 04 · Moderator |
| ModScan.dc.html | Moderator · Scan ticket | mobile | 390x844 | 04 · Moderator |
| ModWrongBus.dc.html | Moderator · Wrong bus | mobile | 390x844 | 04 · Moderator |
| ModBoarded.dc.html | Moderator · Ready to depart | mobile | 390x844 | 04 · Moderator |
| ModOnTrip.dc.html | Moderator · On trip | mobile | 390x844 | 04 · Moderator |
| ModIncident.dc.html | Moderator · Report incident | mobile | 390x844 | 04 · Moderator |
| ModCheckout.dc.html | Moderator · Check-out at stop | mobile | 390x844 | 04 · Moderator |
| ModReport.dc.html | Moderator · Close trip report | mobile | 390x844 | 04 · Moderator |
| ModOpsChat.dc.html | Moderator · Chat with company ops | mobile | 390x844 | 04 · Moderator |
| StaffOrgSwitch.dc.html | Staff · Switch company | mobile | 390x844 | 04 · Moderator |

### 05 · Photographer

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| PhoAccount.dc.html | Photographer sign-up · 2 Create account | mobile | 390x844 | 05 · Photographer |
| PhoOtp.dc.html | Photographer sign-up · 3 Verify number | mobile | 390x844 | 05 · Photographer |
| PhoSignUpProfile.dc.html | Photographer sign-up · 4 Profile | mobile | 390x844 | 05 · Photographer |
| PhoSignUpPortfolio.dc.html | Photographer sign-up · 5 Portfolio & ID | mobile | 390x844 | 05 · Photographer |
| PhoReview.dc.html | Photographer sign-up · 6 Under review | mobile | 390x844 | 05 · Photographer |
| PhoPlan.dc.html | Photographer · Approved → choose plan | mobile | 390x844 | 05 · Photographer |
| WebSignUpPhotographer.dc.html | Web · Photographer /register/photographer | web | 1440x900 | 05 · Photographer |
| WebVerifyPhotographer.dc.html | Web · Photographer verify phone | web | 1440x900 | 05 · Photographer |
| WebPhoProfile.dc.html | Web · Photographer 2 Profile | web | 1440x900 | 05 · Photographer |
| WebPhoPortfolio.dc.html | Web · Photographer 3 Portfolio & ID | web | 1440x900 | 05 · Photographer |
| WebReviewPhotographer.dc.html | Web · Photographer 4 Under review | web | 1440x900 | 05 · Photographer |
| PhoHome.dc.html | Photographer · Home | mobile | 390x844 | 05 · Photographer |
| PhoOffers.dc.html | Photographer · Offers | mobile | 390x844 | 05 · Photographer |
| PhoOffer.dc.html | Photographer · Offer & counter | mobile | 390x844 | 05 · Photographer |
| PhoBookings.dc.html | Photographer · Bookings | mobile | 390x844 | 05 · Photographer |
| PhoAlbums.dc.html | Photographer · Albums | mobile | 390x844 | 05 · Photographer |
| PhoAlbumNew.dc.html | Photographer · Create & upload | mobile | 390x844 | 05 · Photographer |
| PhoAlbumPrivacy.dc.html | Photographer · Album privacy | mobile | 390x844 | 05 · Photographer |
| PhoAlbumUsers.dc.html | Photographer · Choose people | mobile | 390x844 | 05 · Photographer |
| PhoAlbumLive.dc.html | Photographer · Album published | mobile | 390x844 | 05 · Photographer |
| PhoPortfolio.dc.html | Photographer · Portfolio | mobile | 390x844 | 05 · Photographer |
| PhoEarnings.dc.html | Photographer · Earnings | mobile | 390x844 | 05 · Photographer |
| PhoCoupons.dc.html | Photographer · Coupons | mobile | 390x844 | 05 · Photographer |
| PhoPlanManage.dc.html | Photographer · My plan | mobile | 390x844 | 05 · Photographer |
| PhoProfile.dc.html | Photographer · Public profile | mobile | 390x844 | 05 · Photographer |
| PhoCouponNew.dc.html | Photographer · Create coupon | mobile | 390x844 | 05 · Photographer |
| PhoProfileEdit.dc.html | Photographer · Edit profile | mobile | 390x844 | 05 · Photographer |
| PhoPaywall.dc.html | Photographer · No active plan (locked) | mobile | 390x844 | 05 · Photographer |
| PhoStatements.dc.html | Photographer · Statements & invoices | mobile | 390x844 | 05 · Photographer |
| PhoAnalytics.dc.html | Photographer · Performance analytics | mobile | 390x844 | 05 · Photographer |
| PhoWebStudio.dc.html | Studio web · Album upload | web | 1440x1000 | 05 · Photographer |
| PhoTripBrief.dc.html | Photographer · Trip brief | mobile | 390x844 | 05 · Photographer |
| PhoAvailability.dc.html | Photographer · Rates & availability | mobile | 390x844 | 05 · Photographer |
| PhoInvite.dc.html | Photographer · Organization invite | mobile | 390x844 | 05 · Photographer |
| PhoWebHome.dc.html | Studio web · Home | web | 1440x1000 | 05 · Photographer |
| PhoWebPortfolio.dc.html | Studio web · Portfolio | web | 1440x1000 | 05 · Photographer |
| PhoWebProfile.dc.html | Studio web · Profile | web | 1440x1000 | 05 · Photographer |
| PhoWebRates.dc.html | Studio web · Rates and availability | web | 1440x1080 | 05 · Photographer |
| PhoWebDeals.dc.html | Studio web · Deal requests | web | 1440x1000 | 05 · Photographer |
| PhoWebBrief.dc.html | Studio web · Trip brief | web | 1440x1000 | 05 · Photographer |
| PhoWebAlbums.dc.html | Studio web · Trip albums | web | 1440x1080 | 05 · Photographer |
| PhoWebPrivacy.dc.html | Studio web · Album privacy | web | 1440x1000 | 05 · Photographer |
| PhoWebEarnings.dc.html | Studio web · Earnings | web | 1440x1000 | 05 · Photographer |
| PhoWebCoupons.dc.html | Studio web · Coupons | web | 1440x1000 | 05 · Photographer |

### 06 · Organization

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| OrgRegister.dc.html | Org sign-up · 1 /register/organization | web | 1440x900 | 06 · Organization |
| OrgVerify.dc.html | Org sign-up · 2 Verify phone | web | 1440x900 | 06 · Organization |
| OrgBusiness.dc.html | Org sign-up · 3 Business info | web | 1440x900 | 06 · Organization |
| OrgDocs.dc.html | Org sign-up · 4 Documents & payout | web | 1440x900 | 06 · Organization |
| OrgPending.dc.html | Org sign-up · 5 Under review | web | 1440x900 | 06 · Organization |
| OrgPlan.dc.html | Org · Choose plan | web | 1440x900 | 06 · Organization |
| OrgCheckout.dc.html | Org · Billing & trial | web | 1440x900 | 06 · Organization |
| OrgLogin.dc.html | Org · Sign in | web | 1440x900 | 06 · Organization |
| Org2fa.dc.html | Org · Sign-in code | web | 1440x900 | 06 · Organization |
| OrgWorkspace.dc.html | Org · Choose organization | web | 1440x900 | 06 · Organization |
| OrgStaffInviteAccept.dc.html | Org · Accept staff invite | web | 1440x900 | 06 · Organization |
| OrgForgot.dc.html | Org · Reset password | web | 1440x900 | 06 · Organization |
| OrgAccountState.dc.html | Org · Changes needed | web | 1440x900 | 06 · Organization |
| OrgRejected.dc.html | Org · Not approved | web | 1440x900 | 06 · Organization |
| OrgHome.dc.html | Org · Overview | web | 1440x1000 | 06 · Organization |
| OrgTrips.dc.html | Org · Trips | web | 1440x1100 | 06 · Organization |
| OrgTrip.dc.html | Org · Trip overview | web | 1440x1100 | 06 · Organization |
| OrgTripLive.dc.html | Org · Live operations | web | 1440x1100 | 06 · Organization |
| OrgTripEdit.dc.html | Org · Edit published trip | web | 1440x1260 | 06 · Organization |
| OrgTripCancel.dc.html | Org · Cancel trip & refund | web | 1440x1240 | 06 · Organization |
| OrgDispute.dc.html | Org · Respond to dispute | web | 1440x1320 | 06 · Organization |
| OrgSupport.dc.html | Org · Help & support | web | 1440x1240 | 06 · Organization |
| OrgSwitcher.dc.html | Org · Switch organization | web | 1440x1000 | 06 · Organization |
| OrgSwitched.dc.html | Org · Switched to another organization | web | 1440x1000 | 06 · Organization |
| OrgAccess.dc.html | Org · My organizations | web | 1440x1100 | 06 · Organization |
| OrgNew1.dc.html | New trip · 1 Basics | web | 1440x1120 | 06 · Organization |
| OrgNew2.dc.html | New trip · 2 Schedule & route | web | 1440x1100 | 06 · Organization |
| OrgNew3.dc.html | New trip · 3 Vehicles | web | 1440x1000 | 06 · Organization |
| OrgNew4.dc.html | New trip · 4 Driver & moderator | web | 1440x1000 | 06 · Organization |
| OrgNew5.dc.html | New trip · 5 Photographer | web | 1440x1080 | 06 · Organization |
| OrgNew6.dc.html | New trip · 6 Programs | web | 1440x1040 | 06 · Organization |
| OrgNew7.dc.html | New trip · 7 Seats | web | 1440x1000 | 06 · Organization |
| OrgNew8.dc.html | New trip · 8 Pricing & capacity | web | 1440x1260 | 06 · Organization |
| OrgNew9.dc.html | New trip · 9 Review & publish | web | 1440x1060 | 06 · Organization |
| OrgLimit.dc.html | Org · Plan limit reached | web | 1440x1000 | 06 · Organization |
| OrgBookings.dc.html | Org · Bookings | web | 1440x1140 | 06 · Organization |
| OrgBooking.dc.html | Org · Booking & refund | web | 1440x1080 | 06 · Organization |
| OrgRoster.dc.html | Org · Passenger roster | web | 1440x1100 | 06 · Organization |
| OrgSeatAssign.dc.html | Org · Assign seats | web | 1440x1180 | 06 · Organization |
| OrgPrograms.dc.html | Org · Program enrollment | web | 1440x1400 | 06 · Organization |
| OrgCustomers.dc.html | CRM · Customers | web | 1440x1000 | 06 · Organization |
| OrgCustomer.dc.html | CRM · Customer 360 | web | 1440x1300 | 06 · Organization |
| OrgSegments.dc.html | CRM · Segments | web | 1440x1000 | 06 · Organization |
| OrgLeads.dc.html | CRM · Leads pipeline | web | 1440x1000 | 06 · Organization |
| OrgLead.dc.html | CRM · Lead & quote | web | 1440x1300 | 06 · Organization |
| OrgCampaigns.dc.html | CRM · Campaigns | web | 1440x1000 | 06 · Organization |
| OrgCampaignNew.dc.html | CRM · New campaign | web | 1440x1320 | 06 · Organization |
| OrgInbox.dc.html | CRM · Inbox | web | 1440x1000 | 06 · Organization |
| OrgReviews.dc.html | CRM · Reviews | web | 1440x1340 | 06 · Organization |
| OrgMarket.dc.html | Org · Find drivers & photographers | web | 1440x1000 | 06 · Organization |
| OrgDeals.dc.html | Org · Deals | web | 1440x1000 | 06 · Organization |
| OrgDeal.dc.html | Org · Negotiation | web | 1440x1000 | 06 · Organization |
| OrgStaff.dc.html | Org · Team | web | 1440x1000 | 06 · Organization |
| OrgRoles.dc.html | Org · Roles & permissions | web | 1440x1300 | 06 · Organization |
| OrgInvite.dc.html | Org · Invite employee | web | 1440x1000 | 06 · Organization |
| OrgCrew.dc.html | Org · Own drivers, photographers, moderators | web | 1440x1000 | 06 · Organization |
| OrgFleet.dc.html | Org · Vehicles | web | 1440x1000 | 06 · Organization |
| OrgVehicleTypes.dc.html | Org · Vehicle types & seat layout | web | 1440x1000 | 06 · Organization |
| OrgCoupons.dc.html | Org · Coupons | web | 1440x1000 | 06 · Organization |
| OrgCouponNew.dc.html | Org · Create coupon | web | 1440x1240 | 06 · Organization |
| OrgAccounting.dc.html | Org · Accounting | web | 1440x1200 | 06 · Organization |
| OrgInvoices.dc.html | Org · Invoices | web | 1440x1040 | 06 · Organization |
| OrgInvoice.dc.html | Org · B2B tax invoice | web | 1440x1560 | 06 · Organization |
| OrgInvoiceNew.dc.html | Org · New invoice / credit note | web | 1440x1420 | 06 · Organization |
| OrgSettlements.dc.html | Org · Settlements | web | 1440x1200 | 06 · Organization |
| OrgSettlement.dc.html | Org · Settlement statement | web | 1440x1340 | 06 · Organization |
| OrgAnalytics.dc.html | Analytics · Company | web | 1440x1500 | 06 · Organization |
| OrgTripAnalytics.dc.html | Analytics · Trip | web | 1440x1500 | 06 · Organization |
| OrgPageAnalytics.dc.html | Analytics · Pages & funnel | web | 1440x1500 | 06 · Organization |
| OrgCustomerAnalytics.dc.html | Analytics · Customers | web | 1440x1550 | 06 · Organization |
| OrgProviderAnalytics.dc.html | Analytics · Drivers & photographers | web | 1440x1600 | 06 · Organization |
| OrgWebhooks.dc.html | Integrations · Webhooks | web | 1440x1000 | 06 · Organization |
| OrgWebhookNew.dc.html | Integrations · Add endpoint | web | 1440x1400 | 06 · Organization |
| OrgWebhook.dc.html | Integrations · Endpoint & deliveries | web | 1440x1360 | 06 · Organization |
| OrgApiKeys.dc.html | Integrations · API keys | web | 1440x1140 | 06 · Organization |
| OrgBilling.dc.html | Org · Subscription & usage | web | 1440x1600 | 06 · Organization |
| OrgPaywall.dc.html | Org · No active plan (locked) | web | 1440x1000 | 06 · Organization |
| OrgSettings.dc.html | Org · Company settings | web | 1440x1000 | 06 · Organization |
| OrgNotifications.dc.html | Org · Notifications | web | 1440x1370 | 06 · Organization |
| OrgEmployeeView.dc.html | Employee · Finance-scoped view | web | 1440x1100 | 06 · Organization |
| OrgForbidden.dc.html | Employee · No access | web | 1440x1000 | 06 · Organization |
| OrgStaffCodeSetup.dc.html | Org staff · Set up sign-in code | web | 1440x1000 | 06 · Organization |
| OrgVehicleEdit.dc.html | Org · Edit vehicle | web | 1440x1000 | 06 · Organization |
| OrgCouponStats.dc.html | Org · Coupon analytics | web | 1440x1100 | 06 · Organization |
| OrgLedger.dc.html | Org · Ledger & exports | web | 1440x1120 | 06 · Organization |
| OrgTripReports.dc.html | Org · Trip reports | web | 1440x1300 | 06 · Organization |
| OrgSafetyReports.dc.html | Org · Child-safety reports | web | 1440x1040 | 06 · Organization |

### 07 · Admin

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| DashLogin.dc.html | Admin · Sign in | web | 1440x900 | 07 · Admin |
| Dash2fa.dc.html | Admin · Two-step verification | web | 1440x900 | 07 · Admin |
| Dash2faSetup.dc.html | Admin · Set up 2-step (first sign-in) | web | 1440x900 | 07 · Admin |
| DashForgot.dc.html | Admin · Reset password | web | 1440x900 | 07 · Admin |
| DashLocked.dc.html | Admin · Account locked | web | 1440x900 | 07 · Admin |
| AdminApplications.dc.html | Admin · Applications queue | web | 1440x900 | 07 · Admin |
| AdminAppReview.dc.html | Admin · Review application | web | 1440x900 | 07 · Admin |
| AdminLabRequest.dc.html | Admin · Request lab test | web | 1440x900 | 07 · Admin |
| AdminLabReview.dc.html | Admin · Review lab result | web | 1440x900 | 07 · Admin |
| AdmHome.dc.html | Admin · Overview | web | 1440x1240 | 07 · Admin |
| AdmUsers.dc.html | Admin · All users | web | 1440x1160 | 07 · Admin |
| AdmUser.dc.html | Admin · User detail | web | 1440x1000 | 07 · Admin |
| AdmOrgs.dc.html | Admin · Organizations | web | 1440x1080 | 07 · Admin |
| AdmOrg.dc.html | Admin · Organization detail | web | 1440x1280 | 07 · Admin |
| AdmProviders.dc.html | Admin · Provider pool | web | 1440x1060 | 07 · Admin |
| AdmPlans.dc.html | Admin · Plan catalog | web | 1440x1000 | 07 · Admin |
| AdmPlanEdit.dc.html | Admin · Edit plan | web | 1440x1000 | 07 · Admin |
| AdmSubs.dc.html | Admin · Subscriptions & dunning | web | 1440x1000 | 07 · Admin |
| AdmRevenue.dc.html | Admin · Revenue | web | 1440x1220 | 07 · Admin |
| AdmPayouts.dc.html | Admin · Payouts | web | 1440x1020 | 07 · Admin |
| AdmInvoices.dc.html | Admin · All invoices | web | 1440x1240 | 07 · Admin |
| AdmInvoice.dc.html | Admin · Invoice detail | web | 1440x1260 | 07 · Admin |
| AdmSettlements.dc.html | Admin · Settlement runs | web | 1440x1300 | 07 · Admin |
| AdmSettlement.dc.html | Admin · Settlement run detail | web | 1440x1240 | 07 · Admin |
| AdmTrips.dc.html | Admin · All trips | web | 1440x1080 | 07 · Admin |
| AdmDeals.dc.html | Admin · Deal audit | web | 1440x1000 | 07 · Admin |
| AdmCoupons.dc.html | Admin · Coupons & abuse flags | web | 1440x1060 | 07 · Admin |
| AdmCouponNew.dc.html | Admin · Platform coupon | web | 1440x1260 | 07 · Admin |
| AdmDisputes.dc.html | Admin · Disputes | web | 1440x1000 | 07 · Admin |
| AdmDispute.dc.html | Admin · Dispute detail | web | 1440x1180 | 07 · Admin |
| AdmTrip.dc.html | Admin · Trip detail | web | 1440x1580 | 07 · Admin |
| AdmModeration.dc.html | Admin · Content moderation | web | 1440x1180 | 07 · Admin |
| AdmSupport.dc.html | Admin · Support inbox | web | 1440x1240 | 07 · Admin |
| AdmAnalytics.dc.html | Analytics · Platform | web | 1440x1440 | 07 · Admin |
| AdmCompanyAnalytics.dc.html | Analytics · Companies | web | 1440x1560 | 07 · Admin |
| AdmTripAnalytics.dc.html | Analytics · Trips | web | 1440x1580 | 07 · Admin |
| AdmPageAnalytics.dc.html | Analytics · Pages & app | web | 1440x1600 | 07 · Admin |
| AdmProviderAnalytics.dc.html | Analytics · Providers | web | 1440x1560 | 07 · Admin |
| AdmSettings.dc.html | Admin · Platform settings | web | 1440x1180 | 07 · Admin |
| AdmTeam.dc.html | Admin · Admin team & roles | web | 1440x1380 | 07 · Admin |
| AdmAudit.dc.html | Admin · Audit log | web | 1440x1080 | 07 · Admin |
| AdmTemplates.dc.html | Admin · Message templates | web | 1440x1000 | 07 · Admin |
| AdmAccessPolicy.dc.html | Admin · Plan-required access | web | 1440x1300 | 07 · Admin |
| AdmWebhooks.dc.html | Admin · Webhooks & events | web | 1440x1340 | 07 · Admin |
| AdmAppDecision.dc.html | Admin · Request changes or reject | web | 1440x1040 | 07 · Admin |
| AdmAppeal.dc.html | Admin · Appeal review | web | 1440x1020 | 07 · Admin |
| AdmPrivacyRequests.dc.html | Admin · Deletion and data requests | web | 1440x1040 | 07 · Admin |
| AdmLabTests.dc.html | Admin · Lab tests | web | 1440x1000 | 07 · Admin |
| AdmReconciliation.dc.html | Admin · Reconciliation exceptions | web | 1440x1000 | 07 · Admin |
| AdmOpsHealth.dc.html | Admin · Operations health | web | 1440x1040 | 07 · Admin |
| AdmCountries.dc.html | Admin · Countries and markets | web | 1440x1460 | 07 · Admin |

### 08 · العربية (RTL)

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| MainAr.dc.html | عربي · Welcome | mobile | 390x844 | 08 · العربية (RTL) |
| MobileSignInAr.dc.html | عربي · Sign in | mobile | 390x844 | 08 · العربية (RTL) |
| MobileRoleAr.dc.html | عربي · Choose role | mobile | 390x844 | 08 · العربية (RTL) |
| MobileSignUpAr.dc.html | عربي · Create account | mobile | 390x844 | 08 · العربية (RTL) |
| MobileOtpAr.dc.html | عربي · Verify number | mobile | 390x844 | 08 · العربية (RTL) |
| MobileReadyAr.dc.html | عربي · Account ready | mobile | 390x844 | 08 · العربية (RTL) |
| MobileForgotAr.dc.html | عربي · Forgot password | mobile | 390x844 | 08 · العربية (RTL) |
| MobileResetCodeAr.dc.html | عربي · Reset code | mobile | 390x844 | 08 · العربية (RTL) |
| MobileNewPasswordAr.dc.html | عربي · New password | mobile | 390x844 | 08 · العربية (RTL) |
| MobileResetDoneAr.dc.html | عربي · Password updated | mobile | 390x844 | 08 · العربية (RTL) |
| DrvAccountAr.dc.html | عربي · Driver 2 Create account | mobile | 390x844 | 08 · العربية (RTL) |
| DrvOtpAr.dc.html | عربي · Driver 3 Verify | mobile | 390x844 | 08 · العربية (RTL) |
| DrvDetailsAr.dc.html | عربي · Driver 4 Details | mobile | 390x844 | 08 · العربية (RTL) |
| DrvVehicleAr.dc.html | عربي · Driver 5 Licence & vehicle | mobile | 390x844 | 08 · العربية (RTL) |
| DrvDocsAr.dc.html | عربي · Driver 6 Documents | mobile | 390x844 | 08 · العربية (RTL) |
| DrvReviewAr.dc.html | عربي · Driver 7 Under review | mobile | 390x844 | 08 · العربية (RTL) |
| PhoAccountAr.dc.html | عربي · Photographer 2 Create account | mobile | 390x844 | 08 · العربية (RTL) |
| PhoOtpAr.dc.html | عربي · Photographer 3 Verify | mobile | 390x844 | 08 · العربية (RTL) |
| PhoProfileAr.dc.html | عربي · Photographer 4 Profile | mobile | 390x844 | 08 · العربية (RTL) |
| PhoPortfolioAr.dc.html | عربي · Photographer 5 Portfolio | mobile | 390x844 | 08 · العربية (RTL) |
| PhoReviewAr.dc.html | عربي · Photographer 6 Under review | mobile | 390x844 | 08 · العربية (RTL) |
| TrvHomeAr.dc.html | عربي · الرئيسية | mobile | 390x844 | 08 · العربية (RTL) |
| TrvTripAr.dc.html | عربي · تفاصيل الرحلة | mobile | 390x844 | 08 · العربية (RTL) |
| TrvBookSummaryAr.dc.html | عربي · ملخص الحجز | mobile | 390x844 | 08 · العربية (RTL) |
| TrvTicketAr.dc.html | عربي · التذكرة | mobile | 390x844 | 08 · العربية (RTL) |
| ParLiveAr.dc.html | عربي · تتبع الحافلة | mobile | 390x844 | 08 · العربية (RTL) |
| WebHomeAr.dc.html | عربي · الصفحة الرئيسية | web | 1440x2760 | 08 · العربية (RTL) |
| OrgHomeAr.dc.html | عربي · لوحة المنظمة | web | 1440x1000 | 08 · العربية (RTL) |

### 09 · PDF documents

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| PdfTicket.dc.html | PDF · E-ticket | pdf | 794x1123 | 09 · PDF documents |
| PdfItinerary.dc.html | PDF · Trip itinerary | pdf | 794x1123 | 09 · PDF documents |
| PdfInvoiceB2C.dc.html | PDF · Simplified tax invoice | pdf | 794x1123 | 09 · PDF documents |
| PdfInvoiceB2B.dc.html | PDF · B2B tax invoice | pdf | 794x1123 | 09 · PDF documents |
| PdfCreditNote.dc.html | PDF · Credit note | pdf | 794x1123 | 09 · PDF documents |
| PdfPlanInvoice.dc.html | PDF · Plan & commission invoice | pdf | 794x1123 | 09 · PDF documents |
| PdfSettlement.dc.html | PDF · Settlement statement | pdf | 794x1123 | 09 · PDF documents |
| PdfProviderStatement.dc.html | PDF · Driver statement | pdf | 794x1123 | 09 · PDF documents |
| PdfManifest.dc.html | PDF · Bus manifest | pdf | 794x1123 | 09 · PDF documents |
| PdfInvoiceEG.dc.html | PDF · Tax invoice (Egypt) | pdf | 794x1123 | 09 · PDF documents |

### 10 · States & components

| File | Title | Platform | Frame | Page |
|---|---|---|---|---|
| GfxLibrary.dc.html | Brand graphics library | web | 1440x4200 | 10 · States & components |
| MobileAccountState.dc.html | Account state · Changes needed | mobile | 390x844 | 10 · States & components |
| MobileRejected.dc.html | Account state · Application rejected | mobile | 390x844 | 10 · States & components |
| MobileSuspended.dc.html | Account state · Suspended | mobile | 390x844 | 10 · States & components |
| MobilePaymentFailed.dc.html | Account state · Payment failed (grace) | mobile | 390x844 | 10 · States & components |
| PhoneField.dc.html | Component · PhoneField | mobile | 358x120 | 10 · States & components |
| OtpField.dc.html | Component · OtpField | mobile | 358x100 | 10 · States & components |
| PasswordField.dc.html | Component · PasswordField | mobile | 358x120 | 10 · States & components |
| CountryField.dc.html | Component · CountryField | mobile | 358x100 | 10 · States & components |
| WebStepper.dc.html | Component · WebStepper | mobile | 240x300 | 10 · States & components |
| AdminNav.dc.html | Component · AdminNav (sign-up admin) | mobile | 248x900 | 10 · States & components |
| PlanPicker.dc.html | Template · Plan picker | mobile | 390x844 | 10 · States & components |
| MobileReview.dc.html | Template · Provider under review | mobile | 390x844 | 10 · States & components |
| MobileReviewAr.dc.html | Template · قيد المراجعة | mobile | 390x844 | 10 · States & components |
| ShMobOffline.dc.html | Mobile · Offline | mobile | 390x844 | 10 · States & components |
| ShMobServer.dc.html | Mobile · Server error | mobile | 390x844 | 10 · States & components |
| ShMobNotFound.dc.html | Mobile · Not found | mobile | 390x844 | 10 · States & components |
| ShMobEmpty.dc.html | Mobile · Empty trips | mobile | 390x844 | 10 · States & components |
| ShMobUpdate.dc.html | Mobile · Update required | mobile | 390x844 | 10 · States & components |
| ShStaffLocked.dc.html | Staff · Company plan ended | mobile | 390x844 | 10 · States & components |
| MShrCountry.dc.html | Mobile · Country and language | mobile | 390x844 | 10 · States & components |
| MShrSessionExpired.dc.html | Mobile · Session expired | mobile | 390x844 | 10 · States & components |
| MShrDeletionGrace.dc.html | Mobile · Deletion grace period | mobile | 390x844 | 10 · States & components |
| MShrAppeal.dc.html | Mobile · Appeal a rejection | mobile | 390x844 | 10 · States & components |
| MShrNoAccess.dc.html | Mobile · No access | mobile | 390x844 | 10 · States & components |
| MShrMaintenance.dc.html | Mobile · Planned maintenance | mobile | 390x844 | 10 · States & components |
| MShrPermissionPrimer.dc.html | Mobile · Permission primer | mobile | 390x844 | 10 · States & components |
| MShrLinkFallback.dc.html | Mobile · Link can't be opened | mobile | 390x844 | 10 · States & components |
| MShrConfirmSheet.dc.html | Mobile · Confirmation sheet | mobile | 390x844 | 10 · States & components |
| MShrLimitSheet.dc.html | Mobile · Plan limit reached | mobile | 390x844 | 10 · States & components |
| ShWebNotFound.dc.html | Web · 404 | web | 1440x1000 | 10 · States & components |
| ShWebServer.dc.html | Web · 500 | web | 1440x1000 | 10 · States & components |
| ShWebMaintenance.dc.html | Web · Maintenance | web | 1440x1000 | 10 · States & components |
| PubSuspended.dc.html | Web · Account suspended | web | 1440x1000 | 10 · States & components |
| PubDeletionGrace.dc.html | Web · Deletion grace period | web | 1440x1000 | 10 · States & components |
| PubAppeal.dc.html | Web · Appeal a rejection | web | 1440x1160 | 10 · States & components |
| ShWebOffline.dc.html | Web · Offline banner | web | 1440x1000 | 10 · States & components |
| ShWebConfirm.dc.html | Web · Confirmation dialog | web | 1440x1000 | 10 · States & components |
| TabBar.dc.html | Component · TabBar | mobile | 390x120 | 10 · States & components |
| OrgNav.dc.html | Component · OrgNav | mobile | 248x1000 | 10 · States & components |
| AdmNav.dc.html | Component · AdmNav | mobile | 248x1000 | 10 · States & components |
