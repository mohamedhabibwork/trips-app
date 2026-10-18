// Screen copy — the English base table for every surface outside auth.
//
// Generated from the source scan, then hand-maintained: keys are
// `<surface>.<area>.<screen>.<slug>`, and the slug comes from the English sentence so a reviewer
// can find a string without opening the component. `AppMessageKey` is derived from this table, so
// adding a key here makes the compiler demand the Arabic translation in ./ar.ts.
export const en = {
  // apps/web/src/auth/screens/pending-approval-screen.tsx
  "screen.pendingApprovalScreen.completeYourSupplierApplication":
    "Complete your supplier application",
  "screen.pendingApprovalScreen.submitYourDocumentsAndDetails":
    "Submit your documents and details so our review team can approve your account.",
  "screen.pendingApprovalScreen.openApplicationForm": "Open application form",
  "screen.pendingApprovalScreen.applicationStatus": "Application status:",
  "screen.pendingApprovalScreen.notes": "Notes:",
  "screen.pendingApprovalScreen.viewStatusRespondToChanges": "View status & respond to changes",
  "screen.pendingApprovalScreen.appealRejection": "Appeal rejection",
  "screen.pendingApprovalScreen.trackApplicationStatus": "Track application status",
  // apps/web/src/components/api-status.tsx
  "component.apiStatus.apiStatus": "API Status",
  "component.apiStatus.connected": "Connected",
  "component.apiStatus.disconnected": "Disconnected",
  // apps/web/src/components/component-gallery.tsx
  "component.componentGallery.placeholderTripImage": "Placeholder trip image",
  "component.componentGallery.beach": "Beach",
  "component.componentGallery.desertSafari": "Desert safari",
  "component.componentGallery.museums": "Museums",
  "component.componentGallery.trips": "Trips",
  "component.componentGallery.track": "Track",
  "component.componentGallery.profile": "Profile",
  "component.componentGallery.brand": "Brand",
  "component.componentGallery.tripsEnjoyLogoFullColour":
    "Trips Enjoy logo, full colour, horizontal layout",
  "component.componentGallery.horizontalLogoOnCream": "Horizontal logo on cream",
  "component.componentGallery.tripsEnjoyLogoReversedFor":
    "Trips Enjoy logo, reversed for dark backgrounds, horizontal layout",
  "component.componentGallery.reversedLogoOnNavy": "Reversed logo on navy",
  "component.componentGallery.actions": "Actions",
  "component.componentGallery.bookTrip": "Book trip",
  "component.componentGallery.addActivity": "Add activity",
  "component.componentGallery.viewItinerary": "View itinerary",
  "component.componentGallery.payNow": "Pay now",
  "component.componentGallery.chips": "Chips",
  "component.componentGallery.inputs": "Inputs",
  "component.componentGallery.travelerName": "Traveler name",
  "component.componentGallery.parentPhone": "Parent phone",
  "component.componentGallery.usedForLiveBusUpdates": "Used for live bus updates.",
  "component.componentGallery.tripCardAndRoles": "Trip card and roles",
  "component.componentGallery.bus3Hurghada": "Bus 3 · Hurghada",
  "component.componentGallery.seatConfirmed": "Seat confirmed",
  "component.componentGallery.status": "Status",
  "component.componentGallery.neutral": "Neutral",
  "component.componentGallery.accent": "Accent",
  "component.componentGallery.new": "New",
  "component.componentGallery.boarded": "Boarded",
  "component.componentGallery.delayed": "Delayed",
  "component.componentGallery.notBoarded": "Not boarded",
  "component.componentGallery.organization": "Organization",
  "component.componentGallery.feedback": "Feedback",
  "component.componentGallery.paymentNotCompleted": "Payment not completed",
  "component.componentGallery.yourBankDeclinedTheCard":
    "Your bank declined the card ending 4421. No money was taken.",
  "component.componentGallery.seatsAreOnHold": "Seats are on hold",
  "component.componentGallery.payWithin10MinutesTo": "Pay within 10 minutes to keep your seats.",
  "component.componentGallery.tripUpdated": "Trip updated",
  "component.componentGallery.theDeparturePointMovedTo": "The departure point moved to Gate 2.",
  "component.componentGallery.bookingSaved": "Booking saved",
  "component.componentGallery.seatConfirmedForBus3": "Seat confirmed for Bus 3.",
  "component.componentGallery.connectionLostRetryingIn5": "Connection lost. Retrying in 5 seconds.",
  "component.componentGallery.seatConfirmedForBus3Message":
    "Seat confirmed for Bus 3. Your booking is saved.",
  "component.componentGallery.errorAndEmptyStates": "Error and empty states",
  "component.componentGallery.noTripsYet": "No trips yet",
  "component.componentGallery.whenYourCompanyAddsA":
    "When your company adds a trip, it will appear here.",
  "component.componentGallery.browseTrips": "Browse trips",
  "component.componentGallery.liquidGlass": "Liquid Glass",
  "component.componentGallery.main": "Main",
  "component.componentGallery.tripsEnjoy": "Trips Enjoy",
  "component.componentGallery.sections": "Sections",
  "component.componentGallery.trackBus": "Track bus",
  "component.componentGallery.icons": "Icons",
  "component.componentGallery.tripsEnjoyComponents": "Trips Enjoy components",
  "component.componentGallery.everyComponentReadsTheTrips":
    "Every component reads the Trips Enjoy tokens. One primary action per view.",
  // apps/web/src/components/surface-page.tsx
  "component.surfacePage.organizationOwnedDriversAndPhotographers":
    "Organization-owned drivers and photographers",
  // apps/web/src/router.tsx
  "route.notFound": "Not Found",
  // apps/web/src/routes/__root.tsx
  "route.root.tripsEnjoy": "Trips Enjoy",
  // apps/web/src/routes/screens.$screenId.tsx
  "route.screens$screenId.noScreenMatchesThisAddress": "No screen matches this address.",
  "route.screens$screenId.allScreens": "All screens",
  // apps/web/src/routes/screens.$surface.$slug.tsx
  "route.screens$surface$slug.noScreenMatchesThisAddress": "No screen matches this address.",
  "route.screens$surface$slug.allScreens": "All screens",
  "route.screens$surface$slug.allScreens2": "All screens",
  // apps/web/src/routes/screens.index.tsx
  "route.screensIndex.screens": "Screens",
  "route.screensIndex.screensAcrossTheWebSurfaces": "screens across the web surfaces.",
  // apps/web/src/screens/admin/applications/appeal-review.tsx
  "screen.admin.applications.appealReview.appealedPending": "Appealed (pending)",
  "screen.admin.applications.appealReview.selectADecision": "Select a decision",
  "screen.admin.applications.appealReview.upholdAppealApplicationBecomesApproved":
    "Uphold appeal (application becomes Approved)",
  "screen.admin.applications.appealReview.upholdRejectionApplicationStaysRejected":
    "Uphold rejection (application stays Rejected)",
  "screen.admin.applications.appealReview.appealReview": "Appeal review",
  "screen.admin.applications.appealReview.decideAnAppealFromA":
    "Decide an appeal from a rejected applicant.",
  "screen.admin.applications.appealReview.noAppealStatement": "No appeal statement",
  "screen.admin.applications.appealReview.theApplicantHasNotAdded":
    "The applicant has not added a statement to this appeal.",
  "screen.admin.applications.appealReview.loadingTheAppeal": "Loading the appeal.",
  "screen.admin.applications.appealReview.originalApplication": "Original application",
  "screen.admin.applications.appealReview.applicantName": "Applicant name",
  "screen.admin.applications.appealReview.applicationType": "Application type",
  "screen.admin.applications.appealReview.rejectedOn": "Rejected on",
  "screen.admin.applications.appealReview.rejectionReason": "Rejection reason",
  "screen.admin.applications.appealReview.openOriginalApplication": "Open original application",
  "screen.admin.applications.appealReview.appealStatement": "Appeal statement",
  "screen.admin.applications.appealReview.appealReceived": "Appeal received",
  "screen.admin.applications.appealReview.appealWindowCloses": "Appeal window closes",
  "screen.admin.applications.appealReview.couldNotSaveDecision": "Could not save decision",
  "screen.admin.applications.appealReview.decision": "Decision",
  "screen.admin.applications.appealReview.decisionRequired": "Decision (required)",
  "screen.admin.applications.appealReview.reasonRequired": "Reason (required)",
  "screen.admin.applications.appealReview.reasonForTheDecision": "[Reason for the decision]",
  "screen.admin.applications.appealReview.recordedWithTheDecisionIn":
    "Recorded with the decision in the audit log.",
  "screen.admin.applications.appealReview.appealWindow": "Appeal window",
  "screen.admin.applications.appealReview.aDecisionCanBeSaved":
    "A decision can be saved only while the appeal window is open.",
  "screen.admin.applications.appealReview.cancel": "Cancel",
  "screen.admin.applications.appealReview.saving": "Saving...",
  "screen.admin.applications.appealReview.saveDecision": "Save decision",
  // apps/web/src/screens/admin/applications/application-queue.tsx
  "screen.admin.applications.applicationQueue.overdue": "Overdue",
  "screen.admin.applications.applicationQueue.onTime": "On time",
  "screen.admin.applications.applicationQueue.allTypes": "All types",
  "screen.admin.applications.applicationQueue.organization": "Organization",
  "screen.admin.applications.applicationQueue.platformDriver": "Platform driver",
  "screen.admin.applications.applicationQueue.platformPhotographer": "Platform photographer",
  "screen.admin.applications.applicationQueue.allCountries": "All countries",
  "screen.admin.applications.applicationQueue.egypt": "Egypt",
  "screen.admin.applications.applicationQueue.jordan": "Jordan",
  "screen.admin.applications.applicationQueue.anyAge": "Any age",
  "screen.admin.applications.applicationQueue.overdueOver2WorkingDays":
    "Overdue (over 2 working days)",
  "screen.admin.applications.applicationQueue.anyState": "Any state",
  "screen.admin.applications.applicationQueue.pendingReview": "Pending review",
  "screen.admin.applications.applicationQueue.changesRequested": "Changes requested",
  "screen.admin.applications.applicationQueue.approved": "Approved",
  "screen.admin.applications.applicationQueue.rejected": "Rejected",
  "screen.admin.applications.applicationQueue.type": "Type",
  "screen.admin.applications.applicationQueue.applicant": "Applicant",
  "screen.admin.applications.applicationQueue.country": "Country",
  "screen.admin.applications.applicationQueue.submitted": "Submitted",
  "screen.admin.applications.applicationQueue.workingDaysWaiting": "Working days waiting",
  "screen.admin.applications.applicationQueue.state": "State",
  "screen.admin.applications.applicationQueue.overdueHeader": "Overdue",
  "screen.admin.applications.applicationQueue.action": "Action",
  "screen.admin.applications.applicationQueue.openApplicationFor":
    "Open application for {applicant}",
  "screen.admin.applications.applicationQueue.openApplication": "Open application",
  "screen.admin.applications.applicationQueue.applicationQueue": "Application queue",
  "screen.admin.applications.applicationQueue.organizationsPlatformDriversAndPlatform":
    "Organizations, platform drivers and platform photographers waiting for a decision.",
  "screen.admin.applications.applicationQueue.reviewAppeals": "Review appeals",
  "screen.admin.applications.applicationQueue.openNextApplication": "Open next application",
  "screen.admin.applications.applicationQueue.noApplicationsWaiting": "No applications waiting",
  "screen.admin.applications.applicationQueue.changeTheFiltersToSee":
    "Change the filters to see other applications.",
  "screen.admin.applications.applicationQueue.loadingTheApplicationQueue":
    "Loading the application queue.",
  "screen.admin.applications.applicationQueue.typeLabel": "Type",
  "screen.admin.applications.applicationQueue.countryLabel": "Country",
  "screen.admin.applications.applicationQueue.age": "Age",
  "screen.admin.applications.applicationQueue.stateLabel": "State",
  "screen.admin.applications.applicationQueue.applications": "Applications",
  "screen.admin.applications.applicationQueue.applicationsWaitingForReview":
    "Applications waiting for review",
  "screen.admin.applications.applicationQueue.noApplicationsWaitingEmptyTitle":
    "No applications waiting",
  "screen.admin.applications.applicationQueue.changeTheFiltersToSeeEmptyDescription":
    "Change the filters to see other applications.",
  // apps/web/src/screens/admin/applications/application-review-detail.tsx
  "screen.admin.applications.applicationReviewDetail.identityDocument": "Identity document",
  "screen.admin.applications.applicationReviewDetail.insuranceCertificate": "Insurance certificate",
  "screen.admin.applications.applicationReviewDetail.initialLabResult": "Initial lab result",
  "screen.admin.applications.applicationReviewDetail.verified": "Verified",
  "screen.admin.applications.applicationReviewDetail.notVerified": "Not verified",
  "screen.admin.applications.applicationReviewDetail.submitted": "Submitted",
  "screen.admin.applications.applicationReviewDetail.documents": "Documents",
  "screen.admin.applications.applicationReviewDetail.checks": "Checks",
  "screen.admin.applications.applicationReviewDetail.decision": "Decision",
  "screen.admin.applications.applicationReviewDetail.backgroundCheckConsentSigned":
    "Background check consent signed",
  "screen.admin.applications.applicationReviewDetail.labConsentSigned": "Lab consent signed",
  "screen.admin.applications.applicationReviewDetail.initialLabResultDatedWithin":
    "Initial lab result dated within 30 days",
  "screen.admin.applications.applicationReviewDetail.insuranceValidFor3Months":
    "Insurance valid for 3 months or more",
  "screen.admin.applications.applicationReviewDetail.document": "Document",
  "screen.admin.applications.applicationReviewDetail.status": "Status",
  "screen.admin.applications.applicationReviewDetail.restrictedView": "Restricted view",
  "screen.admin.applications.applicationReviewDetail.view": "View {label}",
  "screen.admin.applications.applicationReviewDetail.view2": "View",
  "screen.admin.applications.applicationReviewDetail.unverify": "Unverify",
  "screen.admin.applications.applicationReviewDetail.verify": "Verify",
  "screen.admin.applications.applicationReviewDetail.applicationReviewDetail":
    "Application review detail",
  "screen.admin.applications.applicationReviewDetail.checkTheSubmittedDataAnd":
    "Check the submitted data and documents, then decide.",
  "screen.admin.applications.applicationReviewDetail.noDocuments": "No documents",
  "screen.admin.applications.applicationReviewDetail.theApplicantHasNotUploaded":
    "The applicant has not uploaded documents.",
  "screen.admin.applications.applicationReviewDetail.loadingTheApplication":
    "Loading the application.",
  "screen.admin.applications.applicationReviewDetail.reviewSteps": "Review steps",
  "screen.admin.applications.applicationReviewDetail.duplicateRegistrationHold":
    "Duplicate registration hold",
  "screen.admin.applications.applicationReviewDetail.anotherOrganizationAlreadyUsesThis":
    "Another organization already uses this commercial registration number or tax number. Approval is blocked while this duplicate hold is active.",
  "screen.admin.applications.applicationReviewDetail.restrictedDocumentOpenedAuditLogged":
    "Restricted document opened (audit logged)",
  "screen.admin.applications.applicationReviewDetail.viewing": "Viewing:",
  "screen.admin.applications.applicationReviewDetail.actionFailed": "Action failed",
  "screen.admin.applications.applicationReviewDetail.applicantData": "Applicant data",
  "screen.admin.applications.applicationReviewDetail.applicantName": "Applicant name",
  "screen.admin.applications.applicationReviewDetail.email": "Email",
  "screen.admin.applications.applicationReviewDetail.phone": "Phone",
  "screen.admin.applications.applicationReviewDetail.country": "Country",
  "screen.admin.applications.applicationReviewDetail.documentsTitle": "Documents",
  "screen.admin.applications.applicationReviewDetail.submittedDocuments": "Submitted documents",
  "screen.admin.applications.applicationReviewDetail.noDocumentsEmptyTitle": "No documents",
  "screen.admin.applications.applicationReviewDetail.theApplicantHasNotUploadedEmptyDescription":
    "The applicant has not uploaded documents.",
  "screen.admin.applications.applicationReviewDetail.checksDriver": "Checks (driver)",
  "screen.admin.applications.applicationReviewDetail.driverChecks": "Driver checks",
  "screen.admin.applications.applicationReviewDetail.approveIsBlocked": "Approve is blocked",
  "screen.admin.applications.applicationReviewDetail.approveStaysOffUntilEvery":
    "Approve stays off until every check passes and every document is verified. Approval assigns the Starter plan (D-24).",
  "screen.admin.applications.applicationReviewDetail.decisionTitle": "Decision",
  "screen.admin.applications.applicationReviewDetail.backToQueue": "Back to queue",
  "screen.admin.applications.applicationReviewDetail.reject": "Reject",
  "screen.admin.applications.applicationReviewDetail.requestChanges": "Request changes",
  "screen.admin.applications.applicationReviewDetail.approving": "Approving...",
  "screen.admin.applications.applicationReviewDetail.approveApplication": "Approve application",
  "screen.admin.applications.applicationReviewDetail.chooseOneDecisionEachDecision":
    "Choose one decision. Each decision is written to the audit log.",
  // apps/web/src/screens/admin/applications/reject-with-reason-decision.tsx
  "screen.admin.applications.rejectWithReasonDecision.rejectWithReasonDecision":
    "Reject with reason (decision)",
  "screen.admin.applications.rejectWithReasonDecision.rejectThisApplicationTheApplicant":
    "Reject this application. The applicant is told the reason.",
  "screen.admin.applications.rejectWithReasonDecision.noReasonEntered": "No reason entered",
  "screen.admin.applications.rejectWithReasonDecision.enterAReasonBeforeYou":
    "Enter a reason before you reject the application.",
  "screen.admin.applications.rejectWithReasonDecision.loadingTheApplication":
    "Loading the application.",
  "screen.admin.applications.rejectWithReasonDecision.applicant": "Applicant",
  "screen.admin.applications.rejectWithReasonDecision.applicantName": "Applicant name",
  "screen.admin.applications.rejectWithReasonDecision.applicationType": "Application type",
  "screen.admin.applications.rejectWithReasonDecision.couldNotRejectApplication":
    "Could not reject application",
  "screen.admin.applications.rejectWithReasonDecision.reason": "Reason",
  "screen.admin.applications.rejectWithReasonDecision.reasonForRejectionRequired":
    "Reason for rejection (required)",
  "screen.admin.applications.rejectWithReasonDecision.reasonCodesAreProposedD":
    "Reason codes are proposed (D-234). This text is sent to the applicant.",
  "screen.admin.applications.rejectWithReasonDecision.rejectApplication": "Reject application",
  "screen.admin.applications.rejectWithReasonDecision.rejectThisApplication":
    "Reject this application?",
  "screen.admin.applications.rejectWithReasonDecision.theApplicantIsToldThe":
    "The applicant is told the reason. They can re-apply after 30 days, or appeal.",
  "screen.admin.applications.rejectWithReasonDecision.rejectApplicationConfirmLabel":
    "Reject application",
  "screen.admin.applications.rejectWithReasonDecision.cancel": "Cancel",
  "screen.admin.applications.rejectWithReasonDecision.whatTheApplicantCanDo":
    "What the applicant can do next",
  "screen.admin.applications.rejectWithReasonDecision.theApplicantCanReApply":
    "The applicant can re-apply after 30 days. The applicant can also appeal this decision.",
  // apps/web/src/screens/admin/applications/request-changes-decision.tsx
  "screen.admin.applications.requestChangesDecision.deadlineNotice":
    "The applicant has 14 days to respond. Deadline: {date}. If the deadline passes, the application closes.",
  "screen.admin.applications.requestChangesDecision.readableIdentityDocument":
    "Readable identity document",
  "screen.admin.applications.requestChangesDecision.validInsuranceCertificate":
    "Valid insurance certificate",
  "screen.admin.applications.requestChangesDecision.signedLabConsent": "Signed lab consent",
  "screen.admin.applications.requestChangesDecision.signedBackgroundCheckConsent":
    "Signed background check consent",
  "screen.admin.applications.requestChangesDecision.atLeast8PortfolioPhotos":
    "At least 8 portfolio photos (photographers)",
  "screen.admin.applications.requestChangesDecision.english": "English",
  "screen.admin.applications.requestChangesDecision.arabic": "Arabic",
  "screen.admin.applications.requestChangesDecision.requestChangesDecision":
    "Request changes (decision)",
  "screen.admin.applications.requestChangesDecision.askTheApplicantForSpecific":
    "Ask the applicant for specific fixes within 14 days.",
  "screen.admin.applications.requestChangesDecision.noItemsToFix": "No items to fix",
  "screen.admin.applications.requestChangesDecision.selectAtLeastOneItem":
    "Select at least one item before you send the request.",
  "screen.admin.applications.requestChangesDecision.loadingTheApplication":
    "Loading the application.",
  "screen.admin.applications.requestChangesDecision.applicant": "Applicant",
  "screen.admin.applications.requestChangesDecision.applicantName": "Applicant name",
  "screen.admin.applications.requestChangesDecision.applicationState": "Application state",
  "screen.admin.applications.requestChangesDecision.itemsToFix": "Items to fix",
  "screen.admin.applications.requestChangesDecision.selectAtLeastOneItem2":
    "Select at least one item. Send stays off until then.",
  "screen.admin.applications.requestChangesDecision.couldNotSendRequest": "Could not send request",
  "screen.admin.applications.requestChangesDecision.messageToApplicant": "Message to applicant",
  "screen.admin.applications.requestChangesDecision.messageLanguage": "Message language",
  "screen.admin.applications.requestChangesDecision.useTheApplicantSLanguage":
    "Use the applicant's language.",
  "screen.admin.applications.requestChangesDecision.messageToApplicantRequired":
    "Message to applicant (required)",
  "screen.admin.applications.requestChangesDecision.sayExactlyWhatToFix":
    "Say exactly what to fix. The 14-day deadline is added for you.",
  "screen.admin.applications.requestChangesDecision.sendRequest": "Send request",
  "screen.admin.applications.requestChangesDecision.sendThisRequestToThe":
    "Send this request to the applicant?",
  "screen.admin.applications.requestChangesDecision.theApplicantGets14Days":
    "The applicant gets 14 days to fix the items. If they do not, the application closes.",
  "screen.admin.applications.requestChangesDecision.sendRequestConfirmLabel": "Send request",
  "screen.admin.applications.requestChangesDecision.applicationStateBecomesChangesRequested":
    "Application state becomes Changes Requested.",
  "screen.admin.applications.requestChangesDecision.cancel": "Cancel",
  "screen.admin.applications.requestChangesDecision.responseDeadline": "Response deadline",
  // apps/web/src/screens/admin/common/admin-decision-form.tsx
  "screen.admin.common.adminDecisionForm.keepEditing": "Keep editing",
  // apps/web/src/screens/admin/common/admin-nav.tsx
  "screen.admin.nav.adminHome": "Home",
  "screen.admin.nav.applicationQueue": "Applications",
  "screen.admin.nav.usersAndEntitiesDirectory": "Users",
  "screen.admin.nav.labTestsQueue": "Lab tests",
  "screen.admin.nav.plansCatalog": "Plans",
  "screen.admin.nav.platformCoupons": "Coupons",
  "screen.admin.nav.dealAuditList": "Deals",
  "screen.admin.nav.disputesQueue": "Disputes",
  "screen.admin.nav.platformFinancialView": "Finance",
  "screen.admin.nav.tripOversight": "Trips",
  "screen.admin.nav.auditLog": "Audit",
  "screen.admin.nav.featureFlagsAndPlatformConfiguration": "Configuration",
  "screen.admin.nav.operationsHealthDashboard": "Operations",
  "screen.admin.common.adminNav.adminAreas": "Admin areas",
  // apps/web/src/screens/admin/common/admin-shared.tsx
  "screen.admin.common.adminShared.backToAdminHome": "Back to admin home",
  "screen.admin.common.adminShared.chartDataPending": "{label}. Chart data pending.",
  "screen.admin.common.adminShared.chartDataPending2": ". Chart data pending.",
  // apps/web/src/screens/admin/common/admin-state-preview.tsx
  "screen.admin.common.adminStatePreview.main": "Main",
  "screen.admin.common.adminStatePreview.loading": "Loading",
  "screen.admin.common.adminStatePreview.empty": "Empty",
  "screen.admin.common.adminStatePreview.error": "Error",
  "screen.admin.common.adminStatePreview.screenStates": "Screen states",
  "screen.admin.common.adminStatePreview.chooseAScreenStateTo": "Choose a screen state to preview",
  "screen.admin.common.adminStatePreview.loading2": "Loading",
  // apps/web/src/screens/admin/coupons/platform-coupon-editor.tsx
  "screen.admin.coupons.platformCouponEditor.percentage": "Percentage",
  "screen.admin.coupons.platformCouponEditor.fixedAmount": "Fixed amount",
  "screen.admin.coupons.platformCouponEditor.platformCouponEditor": "Platform coupon editor",
  "screen.admin.coupons.platformCouponEditor.createACouponThatApplies":
    "Create a coupon that applies across the whole platform.",
  "screen.admin.coupons.platformCouponEditor.noCouponYet": "No coupon yet",
  "screen.admin.coupons.platformCouponEditor.fillInTheCouponDetails":
    "Fill in the coupon details to create one.",
  "screen.admin.coupons.platformCouponEditor.loadingTheCoupon": "Loading the coupon.",
  "screen.admin.coupons.platformCouponEditor.coupon": "Coupon",
  "screen.admin.coupons.platformCouponEditor.code": "Code",
  "screen.admin.coupons.platformCouponEditor.couponCode": "[Coupon code]",
  "screen.admin.coupons.platformCouponEditor.type": "Type",
  "screen.admin.coupons.platformCouponEditor.value": "Value",
  "screen.admin.coupons.platformCouponEditor.valuePlaceholder": "[Value]",
  "screen.admin.coupons.platformCouponEditor.usageLimit": "Usage limit",
  "screen.admin.coupons.platformCouponEditor.limit": "[Limit]",
  "screen.admin.coupons.platformCouponEditor.validFrom": "Valid from",
  "screen.admin.coupons.platformCouponEditor.yyyyMmDd": "YYYY-MM-DD",
  "screen.admin.coupons.platformCouponEditor.validUntil": "Valid until",
  "screen.admin.coupons.platformCouponEditor.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.admin.coupons.platformCouponEditor.programs": "Programs",
  "screen.admin.coupons.platformCouponEditor.programsThisCouponAppliesTo":
    "[Programs this coupon applies to]",
  "screen.admin.coupons.platformCouponEditor.audience": "Audience",
  "screen.admin.coupons.platformCouponEditor.audiencePlaceholder": "[Audience]",
  "screen.admin.coupons.platformCouponEditor.scope": "Scope",
  "screen.admin.coupons.platformCouponEditor.scopeIsFixedAtPlatform":
    "Scope is fixed at platform-wide.",
  "screen.admin.coupons.platformCouponEditor.stackableWithOtherCoupons":
    "Stackable with other coupons",
  "screen.admin.coupons.platformCouponEditor.cancel": "Cancel",
  "screen.admin.coupons.platformCouponEditor.saveCoupon": "Save coupon",
  // apps/web/src/screens/admin/coupons/platform-coupons.tsx
  "screen.admin.coupons.platformCoupons.active": "Active",
  "screen.admin.coupons.platformCoupons.revoked": "Revoked",
  "screen.admin.coupons.platformCoupons.expired": "Expired",
  "screen.admin.coupons.platformCoupons.abuseFlag": "Abuse flag",
  "screen.admin.coupons.platformCoupons.anyStatus": "Any status",
  "screen.admin.coupons.platformCoupons.activeLabel": "Active",
  "screen.admin.coupons.platformCoupons.revokedLabel": "Revoked",
  "screen.admin.coupons.platformCoupons.expiredLabel": "Expired",
  "screen.admin.coupons.platformCoupons.creatorType": "Creator type",
  "screen.admin.coupons.platformCoupons.code": "Code",
  "screen.admin.coupons.platformCoupons.status": "Status",
  "screen.admin.coupons.platformCoupons.redemptions": "Redemptions",
  "screen.admin.coupons.platformCoupons.abuseFlagHeader": "Abuse flag",
  "screen.admin.coupons.platformCoupons.none": "None",
  "screen.admin.coupons.platformCoupons.actions": "Actions",
  "screen.admin.coupons.platformCoupons.revoke": "Revoke {code}",
  "screen.admin.coupons.platformCoupons.revoke2": "Revoke",
  "screen.admin.coupons.platformCoupons.openAnalyticsFor": "Open analytics for {code}",
  "screen.admin.coupons.platformCoupons.analytics": "Analytics",
  "screen.admin.coupons.platformCoupons.platformCoupons": "Platform coupons",
  "screen.admin.coupons.platformCoupons.couponsFromAllCreatorsRevoke":
    "Coupons from all creators. Revoke any coupon.",
  "screen.admin.coupons.platformCoupons.createPlatformCoupon": "Create platform coupon",
  "screen.admin.coupons.platformCoupons.noCoupons": "No coupons",
  "screen.admin.coupons.platformCoupons.noCouponsMatchThisFilter": "No coupons match this filter.",
  "screen.admin.coupons.platformCoupons.loadingTheCoupons": "Loading the coupons.",
  "screen.admin.coupons.platformCoupons.abuseThresholds": "Abuse thresholds",
  "screen.admin.coupons.platformCoupons.thresholdsAreNotYetSet":
    "Thresholds are not yet set (D-216). A flag shows the rule that raised it.",
  "screen.admin.coupons.platformCoupons.statusLabel": "Status",
  "screen.admin.coupons.platformCoupons.coupons": "Coupons",
  "screen.admin.coupons.platformCoupons.platformCouponsCaption": "Platform coupons",
  "screen.admin.coupons.platformCoupons.noCouponsEmptyTitle": "No coupons",
  "screen.admin.coupons.platformCoupons.noCouponsMatchThisFilterEmptyDescription":
    "No coupons match this filter.",
  // apps/web/src/screens/admin/deals-and-disputes/deal-audit-detail.tsx
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealOpened": "Deal opened",
  "screen.admin.dealsAndDisputes.dealAuditDetail.counterOfferMade": "Counter offer made",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealFinalizedOrRejected":
    "Deal finalized or rejected",
  "screen.admin.dealsAndDisputes.dealAuditDetail.open": "Open",
  "screen.admin.dealsAndDisputes.dealAuditDetail.step": "Step",
  "screen.admin.dealsAndDisputes.dealAuditDetail.amount": "Amount",
  "screen.admin.dealsAndDisputes.dealAuditDetail.actor": "Actor",
  "screen.admin.dealsAndDisputes.dealAuditDetail.time": "Time",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealAuditDetail": "Deal audit detail",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealReferenceEveryOfferAnd":
    "[Deal reference]. Every offer and state change, in order.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.flagForReview": "Flag for review",
  "screen.admin.dealsAndDisputes.dealAuditDetail.noOffers": "No offers",
  "screen.admin.dealsAndDisputes.dealAuditDetail.thisDealHasNoOffers":
    "This deal has no offers yet.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.loadingTheDeal": "Loading the deal.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.partiesAndVehicleOrTrip":
    "Parties and vehicle or trip",
  "screen.admin.dealsAndDisputes.dealAuditDetail.organization": "Organization",
  "screen.admin.dealsAndDisputes.dealAuditDetail.supplier": "Supplier",
  "screen.admin.dealsAndDisputes.dealAuditDetail.vehicleOrTrip": "Vehicle or trip",
  "screen.admin.dealsAndDisputes.dealAuditDetail.finalAmount": "Final amount",
  "screen.admin.dealsAndDisputes.dealAuditDetail.offersInOrder": "Offers, in order",
  "screen.admin.dealsAndDisputes.dealAuditDetail.offersInOrderCaption": "Offers in order",
  "screen.admin.dealsAndDisputes.dealAuditDetail.noOffersEmptyTitle": "No offers",
  "screen.admin.dealsAndDisputes.dealAuditDetail.thisDealHasNoOffersEmptyDescription":
    "This deal has no offers yet.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.stateHistory": "State history",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealStateHistory": "Deal state history",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCostAndCommission": "Deal cost and commission",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCost": "Deal cost",
  "screen.admin.dealsAndDisputes.dealAuditDetail.commission": "Commission",
  "screen.admin.dealsAndDisputes.dealAuditDetail.placeholderRate": "Placeholder rate",
  "screen.admin.dealsAndDisputes.dealAuditDetail.theDealCostIs10":
    "The deal cost is 10% of the base trip price. This rate is a placeholder and stays open until Finance confirms it (D-15).",
  "screen.admin.dealsAndDisputes.dealAuditDetail.viewLedgerEntries": "View ledger entries",
  "screen.admin.dealsAndDisputes.dealAuditDetail.backToDealList": "Back to deal list",
  // apps/web/src/screens/admin/deals-and-disputes/deal-audit-list.tsx
  "screen.admin.dealsAndDisputes.dealAuditList.open": "Open",
  "screen.admin.dealsAndDisputes.dealAuditList.finalized": "Finalized",
  "screen.admin.dealsAndDisputes.dealAuditList.rejected": "Rejected",
  "screen.admin.dealsAndDisputes.dealAuditList.anyState": "Any state",
  "screen.admin.dealsAndDisputes.dealAuditList.openLabel": "Open",
  "screen.admin.dealsAndDisputes.dealAuditList.finalizedLabel": "Finalized",
  "screen.admin.dealsAndDisputes.dealAuditList.rejectedLabel": "Rejected",
  "screen.admin.dealsAndDisputes.dealAuditList.organization": "Organization",
  "screen.admin.dealsAndDisputes.dealAuditList.supplier": "Supplier",
  "screen.admin.dealsAndDisputes.dealAuditList.vehicleOrTrip": "Vehicle or trip",
  "screen.admin.dealsAndDisputes.dealAuditList.state": "State",
  "screen.admin.dealsAndDisputes.dealAuditList.counterOffers": "Counter offers",
  "screen.admin.dealsAndDisputes.dealAuditList.finalAmount": "Final amount",
  "screen.admin.dealsAndDisputes.dealAuditList.action": "Action",
  "screen.admin.dealsAndDisputes.dealAuditList.openDealFor": "Open deal for {supplier}",
  "screen.admin.dealsAndDisputes.dealAuditList.openDeal": "Open deal",
  "screen.admin.dealsAndDisputes.dealAuditList.flagDealForForReview":
    "Flag deal for {supplier} for review",
  "screen.admin.dealsAndDisputes.dealAuditList.flagForReview": "Flag for review",
  "screen.admin.dealsAndDisputes.dealAuditList.dealAuditList": "Deal audit list",
  "screen.admin.dealsAndDisputes.dealAuditList.findDealsAndSeeTheir":
    "Find deals and see their state.",
  "screen.admin.dealsAndDisputes.dealAuditList.noDeals": "No deals",
  "screen.admin.dealsAndDisputes.dealAuditList.noDealsMatchTheseFilters":
    "No deals match these filters.",
  "screen.admin.dealsAndDisputes.dealAuditList.loadingTheDeals": "Loading the deals.",
  "screen.admin.dealsAndDisputes.dealAuditList.organizationOrSupplier": "Organization or supplier",
  "screen.admin.dealsAndDisputes.dealAuditList.nameOrDealReference": "Name or deal reference",
  "screen.admin.dealsAndDisputes.dealAuditList.clearSearch": "Clear search",
  "screen.admin.dealsAndDisputes.dealAuditList.stateLabel": "State",
  "screen.admin.dealsAndDisputes.dealAuditList.deals": "Deals",
  "screen.admin.dealsAndDisputes.dealAuditList.dealAuditListCaption": "Deal audit list",
  "screen.admin.dealsAndDisputes.dealAuditList.noDealsEmptyTitle": "No deals",
  "screen.admin.dealsAndDisputes.dealAuditList.noDealsMatchTheseFiltersEmptyDescription":
    "No deals match these filters.",
  // apps/web/src/screens/admin/deals-and-disputes/dispute-detail-and-refund-decision.tsx
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.noRefundIsQueued":
    "No refund is queued when you save.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.theRefundIsLinked":
    "The refund is linked to this dispute and booking and is queued when you save.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.aRefundOutsidePolicy":
    "A refund outside policy needs a reason. Your identity is recorded in the audit log.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.open": "Open",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.noRefund": "No refund",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundWithinPolicy":
    "Refund within policy",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundOutsidePolicy":
    "Refund outside policy",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.disputeDetailAndRefundDecision":
    "Dispute detail and refund decision",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.recordTheOutcomeAndAny":
    "Record the outcome and any refund linked to this dispute.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.noOutcomeYet": "No outcome yet",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.recordTheOutcomeOnceBoth":
    "Record the outcome once both parties have been heard.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.loadingTheDispute":
    "Loading the dispute.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.partiesAndBooking":
    "Parties and booking",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.traveler": "Traveler",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.organization": "Organization",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.booking": "Booking",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.payment": "Payment",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.amountPaid": "Amount paid",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeAndRefund":
    "Outcome and refund",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeSummaryRequired":
    "Outcome summary (required)",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeOfTheDispute":
    "[Outcome of the dispute]",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refund": "Refund",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.aRefundStaysPendingUntil":
    "A refund stays pending until the gateway confirms it.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundTitle": "Refund",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonForThisOutcomeRequired":
    "Reason for this outcome (required)",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.requiredForEveryOutcomeA":
    "Required for every outcome. A refund outside policy is audited with this reason.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcome": "Save outcome",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveThisOutcomeAndRefund":
    "Save this outcome and refund?",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.aRefundIsQueuedThrough":
    "A refund is queued through the original gateway. The decision is audited.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcomeConfirmLabel":
    "Save outcome",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.cancel": "Cancel",
  // apps/web/src/screens/admin/deals-and-disputes/disputes-queue.tsx
  "screen.admin.dealsAndDisputes.disputesQueue.awaitingAcknowledgement": "Awaiting acknowledgement",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledged": "Acknowledged",
  "screen.admin.dealsAndDisputes.disputesQueue.resolved": "Resolved",
  "screen.admin.dealsAndDisputes.disputesQueue.allTypes": "All types",
  "screen.admin.dealsAndDisputes.disputesQueue.disputeTypesPendingD251":
    "[Dispute types, pending D-251]",
  "screen.admin.dealsAndDisputes.disputesQueue.anyState": "Any state",
  "screen.admin.dealsAndDisputes.disputesQueue.awaitingAcknowledgementLabel":
    "Awaiting acknowledgement",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledgedLabel": "Acknowledged",
  "screen.admin.dealsAndDisputes.disputesQueue.resolvedLabel": "Resolved",
  "screen.admin.dealsAndDisputes.disputesQueue.parties": "Parties",
  "screen.admin.dealsAndDisputes.disputesQueue.bookingOrTrip": "Booking or trip",
  "screen.admin.dealsAndDisputes.disputesQueue.type": "Type",
  "screen.admin.dealsAndDisputes.disputesQueue.age": "Age",
  "screen.admin.dealsAndDisputes.disputesQueue.state": "State",
  "screen.admin.dealsAndDisputes.disputesQueue.action": "Action",
  "screen.admin.dealsAndDisputes.disputesQueue.openDispute": "Open dispute {reference}",
  "screen.admin.dealsAndDisputes.disputesQueue.openDispute2": "Open dispute",
  "screen.admin.dealsAndDisputes.disputesQueue.disputesQueue": "Disputes queue",
  "screen.admin.dealsAndDisputes.disputesQueue.workDisputesBetweenParties":
    "Work disputes between parties.",
  "screen.admin.dealsAndDisputes.disputesQueue.noOpenDisputes": "No open disputes",
  "screen.admin.dealsAndDisputes.disputesQueue.noDisputesMatchTheseFilters":
    "No disputes match these filters.",
  "screen.admin.dealsAndDisputes.disputesQueue.loadingTheDisputes": "Loading the disputes.",
  "screen.admin.dealsAndDisputes.disputesQueue.deadlines": "Deadlines",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledgeADisputeWithin2":
    "Acknowledge a dispute within 2 working days. Resolve it within 10 working days (D-32).",
  "screen.admin.dealsAndDisputes.disputesQueue.typeLabel": "Type",
  "screen.admin.dealsAndDisputes.disputesQueue.stateLabel": "State",
  "screen.admin.dealsAndDisputes.disputesQueue.disputes": "Disputes",
  "screen.admin.dealsAndDisputes.disputesQueue.disputesQueueCaption": "Disputes queue",
  "screen.admin.dealsAndDisputes.disputesQueue.noOpenDisputesEmptyTitle": "No open disputes",
  "screen.admin.dealsAndDisputes.disputesQueue.noDisputesMatchTheseFiltersEmptyDescription":
    "No disputes match these filters.",
  // apps/web/src/screens/admin/directory/admin-staff-accounts.tsx
  "screen.admin.directory.adminStaffAccounts.active": "Active",
  "screen.admin.directory.adminStaffAccounts.setUpRequired": "Set-up required",
  "screen.admin.directory.adminStaffAccounts.name": "Name",
  "screen.admin.directory.adminStaffAccounts.email": "Email",
  "screen.admin.directory.adminStaffAccounts.status": "Status",
  "screen.admin.directory.adminStaffAccounts.authenticator": "Authenticator",
  "screen.admin.directory.adminStaffAccounts.action": "Action",
  "screen.admin.directory.adminStaffAccounts.resetAuthenticatorFor":
    "Reset authenticator for {name}",
  "screen.admin.directory.adminStaffAccounts.resetAuthenticator": "Reset authenticator",
  "screen.admin.directory.adminStaffAccounts.adminStaffAccounts": "Admin staff accounts",
  "screen.admin.directory.adminStaffAccounts.createAdminAccountsAndSee":
    "Create admin accounts and see their set-up state.",
  "screen.admin.directory.adminStaffAccounts.noAdminAccounts": "No admin accounts",
  "screen.admin.directory.adminStaffAccounts.createTheFirstAdminAccount":
    "Create the first admin account above.",
  "screen.admin.directory.adminStaffAccounts.loadingTheAdminAccounts":
    "Loading the admin accounts.",
  "screen.admin.directory.adminStaffAccounts.createAdminAccount": "Create admin account",
  "screen.admin.directory.adminStaffAccounts.fullName": "Full name",
  "screen.admin.directory.adminStaffAccounts.fullNamePlaceholder": "[Full name]",
  "screen.admin.directory.adminStaffAccounts.emailLabel": "Email",
  "screen.admin.directory.adminStaffAccounts.emailPlaceholder": "[Email]",
  "screen.admin.directory.adminStaffAccounts.country": "Country",
  "screen.admin.directory.adminStaffAccounts.countryPlaceholder": "[Country]",
  "screen.admin.directory.adminStaffAccounts.countryIsProposedInD": "Country is proposed in D-49.",
  "screen.admin.directory.adminStaffAccounts.createAdminAccount2": "Create admin account",
  "screen.admin.directory.adminStaffAccounts.howAdminAccountsStart": "How admin accounts start",
  "screen.admin.directory.adminStaffAccounts.aNewAdminMustSet":
    "A new admin must set up an authenticator at first sign-in. Only an existing admin can create an admin account. There is no self-registration.",
  "screen.admin.directory.adminStaffAccounts.adminAccounts": "Admin accounts",
  "screen.admin.directory.adminStaffAccounts.adminStaffAccountsCaption": "Admin staff accounts",
  "screen.admin.directory.adminStaffAccounts.noAdminAccountsEmptyTitle": "No admin accounts",
  "screen.admin.directory.adminStaffAccounts.createTheFirstAdminAccountEmptyDescription":
    "Create the first admin account above.",
  // apps/web/src/screens/admin/directory/deletion-and-data-requests.tsx
  "screen.admin.directory.deletionAndDataRequests.gracePeriod": "Grace period",
  "screen.admin.directory.deletionAndDataRequests.overdue": "Overdue",
  "screen.admin.directory.deletionAndDataRequests.allTypes": "All types",
  "screen.admin.directory.deletionAndDataRequests.accountDeletion": "Account deletion",
  "screen.admin.directory.deletionAndDataRequests.dataCopy": "Data copy",
  "screen.admin.directory.deletionAndDataRequests.anyStatus": "Any status",
  "screen.admin.directory.deletionAndDataRequests.gracePeriodLabel": "Grace period",
  "screen.admin.directory.deletionAndDataRequests.overdueLabel": "Overdue",
  "screen.admin.directory.deletionAndDataRequests.requestType": "Request type",
  "screen.admin.directory.deletionAndDataRequests.account": "Account",
  "screen.admin.directory.deletionAndDataRequests.requested": "Requested",
  "screen.admin.directory.deletionAndDataRequests.graceEndOrDueDate": "Grace end or due date",
  "screen.admin.directory.deletionAndDataRequests.status": "Status",
  "screen.admin.directory.deletionAndDataRequests.action": "Action",
  "screen.admin.directory.deletionAndDataRequests.openAccountFor": "Open account for {account}",
  "screen.admin.directory.deletionAndDataRequests.openAccount": "Open account",
  "screen.admin.directory.deletionAndDataRequests.deletionAndDataRequests":
    "Deletion and data requests",
  "screen.admin.directory.deletionAndDataRequests.workAccountDeletionAndData":
    "Work account deletion and data copy requests.",
  "screen.admin.directory.deletionAndDataRequests.noRequests": "No requests",
  "screen.admin.directory.deletionAndDataRequests.noDeletionOrDataCopy":
    "No deletion or data copy requests are open.",
  "screen.admin.directory.deletionAndDataRequests.loadingTheRequests": "Loading the requests.",
  "screen.admin.directory.deletionAndDataRequests.retentionRules": "Retention rules",
  "screen.admin.directory.deletionAndDataRequests.accountsArePurgedOnDay":
    "Accounts are purged on day 31 after the deletion request (D-38). A data copy past its due date is flagged overdue (D-162).",
  "screen.admin.directory.deletionAndDataRequests.requestTypeLabel": "Request type",
  "screen.admin.directory.deletionAndDataRequests.statusLabel": "Status",
  "screen.admin.directory.deletionAndDataRequests.requests": "Requests",
  "screen.admin.directory.deletionAndDataRequests.deletionAndDataRequestsCaption":
    "Deletion and data requests",
  "screen.admin.directory.deletionAndDataRequests.noRequestsEmptyTitle": "No requests",
  "screen.admin.directory.deletionAndDataRequests.noDeletionOrDataCopyEmptyDescription":
    "No deletion or data copy requests are open.",
  // apps/web/src/screens/admin/directory/entity-detail.tsx
  "screen.admin.directory.entityDetail.adminActionFromTheAudit":
    "[Admin action from the audit log]",
  "screen.admin.directory.entityDetail.adminActionFromTheAuditLabel":
    "[Admin action from the audit log]",
  "screen.admin.directory.entityDetail.active": "Active",
  "screen.admin.directory.entityDetail.trip": "Trip",
  "screen.admin.directory.entityDetail.state": "State",
  "screen.admin.directory.entityDetail.dates": "Dates",
  "screen.admin.directory.entityDetail.entityDetail": "Entity detail",
  "screen.admin.directory.entityDetail.entityNameProfilePlanTrips":
    "[Entity name]. Profile, plan, trips, bookings and history.",
  "screen.admin.directory.entityDetail.handleDeletion": "Handle deletion",
  "screen.admin.directory.entityDetail.grantOrOverridePlan": "Grant or override plan",
  "screen.admin.directory.entityDetail.requestLabTest": "Request lab test",
  "screen.admin.directory.entityDetail.suspendOrReinstate": "Suspend or reinstate",
  "screen.admin.directory.entityDetail.noTripsOrBookings": "No trips or bookings",
  "screen.admin.directory.entityDetail.thisAccountHasNoTrips":
    "This account has no trips or bookings yet.",
  "screen.admin.directory.entityDetail.loadingTheAccount": "Loading the account.",
  "screen.admin.directory.entityDetail.suspended": "Suspended",
  "screen.admin.directory.entityDetail.signInIsRefusedWhile":
    "Sign-in is refused while the account is suspended. Data is kept.",
  "screen.admin.directory.entityDetail.profile": "Profile",
  "screen.admin.directory.entityDetail.name": "Name",
  "screen.admin.directory.entityDetail.email": "Email",
  "screen.admin.directory.entityDetail.phone": "Phone",
  "screen.admin.directory.entityDetail.country": "Country",
  "screen.admin.directory.entityDetail.entityType": "Entity type",
  "screen.admin.directory.entityDetail.deletionRequest": "Deletion request",
  "screen.admin.directory.entityDetail.backToDirectory": "Back to directory",
  "screen.admin.directory.entityDetail.roleAssignments": "Role assignments",
  "screen.admin.directory.entityDetail.roleAssignments2": "[Role assignments]",
  "screen.admin.directory.entityDetail.planAndSubscription": "Plan and subscription",
  "screen.admin.directory.entityDetail.plan": "Plan",
  "screen.admin.directory.entityDetail.billingStatus": "Billing status",
  "screen.admin.directory.entityDetail.renewalDate": "Renewal date",
  "screen.admin.directory.entityDetail.tripsAndBookings": "Trips and bookings",
  "screen.admin.directory.entityDetail.tripsAndBookingsCaption": "Trips and bookings",
  "screen.admin.directory.entityDetail.noTripsOrBookingsEmptyTitle": "No trips or bookings",
  "screen.admin.directory.entityDetail.thisAccountHasNoTripsEmptyDescription":
    "This account has no trips or bookings yet.",
  "screen.admin.directory.entityDetail.auditHistory": "Audit history",
  "screen.admin.directory.entityDetail.auditHistoryForThisAccount":
    "Audit history for this account",
  // apps/web/src/screens/admin/directory/suspend-or-reinstate-decision.tsx
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccount": "Suspend account",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccount": "Reinstate account",
  "screen.admin.directory.suspendOrReinstateDecision.active": "Active",
  "screen.admin.directory.suspendOrReinstateDecision.suspendOrReinstateDecision":
    "Suspend or reinstate (decision)",
  "screen.admin.directory.suspendOrReinstateDecision.stopOrRestoreAccessWithout":
    "Stop or restore access without deleting data.",
  "screen.admin.directory.suspendOrReinstateDecision.noAccountSelected": "No account selected",
  "screen.admin.directory.suspendOrReinstateDecision.openAnAccountFromThe":
    "Open an account from the directory before you suspend or reinstate it.",
  "screen.admin.directory.suspendOrReinstateDecision.loadingTheAccount": "Loading the account.",
  "screen.admin.directory.suspendOrReinstateDecision.account": "Account",
  "screen.admin.directory.suspendOrReinstateDecision.accountName": "Account name",
  "screen.admin.directory.suspendOrReinstateDecision.entityType": "Entity type",
  "screen.admin.directory.suspendOrReinstateDecision.decision": "Decision",
  "screen.admin.directory.suspendOrReinstateDecision.action": "Action",
  "screen.admin.directory.suspendOrReinstateDecision.reasonRequired": "Reason (required)",
  "screen.admin.directory.suspendOrReinstateDecision.reasonRulesAreNotYet":
    "Reason rules are not yet defined (D-234).",
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccount2": "Suspend account",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccount2": "Reinstate account",
  "screen.admin.directory.suspendOrReinstateDecision.suspendThisAccount": "Suspend this account?",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateThisAccount":
    "Reinstate this account?",
  "screen.admin.directory.suspendOrReinstateDecision.accessStopsAtOnceData":
    "Access stops at once. Data is kept. The action is written to the audit log.",
  "screen.admin.directory.suspendOrReinstateDecision.accessIsRestoredAtOnce":
    "Access is restored at once. Data is unchanged. The action is written to the audit log.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccount3": "Suspend account",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccount3": "Reinstate account",
  "screen.admin.directory.suspendOrReinstateDecision.cancel": "Cancel",
  "screen.admin.directory.suspendOrReinstateDecision.effectOfSuspending": "Effect of suspending",
  "screen.admin.directory.suspendOrReinstateDecision.effectOfReinstating": "Effect of reinstating",
  "screen.admin.directory.suspendOrReinstateDecision.accessStopsAtOnceData2":
    "Access stops at once. Data is kept.",
  "screen.admin.directory.suspendOrReinstateDecision.accessIsRestoredAtOnce2":
    "Access is restored at once. Data is unchanged.",
  // apps/web/src/screens/admin/directory/users-and-entities-directory.tsx
  "screen.admin.directory.usersAndEntitiesDirectory.active": "Active",
  "screen.admin.directory.usersAndEntitiesDirectory.suspended": "Suspended",
  "screen.admin.directory.usersAndEntitiesDirectory.allRoles": "All roles",
  "screen.admin.directory.usersAndEntitiesDirectory.allStatuses": "All statuses",
  "screen.admin.directory.usersAndEntitiesDirectory.activeLabel": "Active",
  "screen.admin.directory.usersAndEntitiesDirectory.suspendedLabel": "Suspended",
  "screen.admin.directory.usersAndEntitiesDirectory.deletionRequested": "Deletion requested",
  "screen.admin.directory.usersAndEntitiesDirectory.name": "Name",
  "screen.admin.directory.usersAndEntitiesDirectory.role": "Role",
  "screen.admin.directory.usersAndEntitiesDirectory.organization": "Organization",
  "screen.admin.directory.usersAndEntitiesDirectory.status": "Status",
  "screen.admin.directory.usersAndEntitiesDirectory.action": "Action",
  "screen.admin.directory.usersAndEntitiesDirectory.open": "Open {name}",
  "screen.admin.directory.usersAndEntitiesDirectory.open2": "Open",
  "screen.admin.directory.usersAndEntitiesDirectory.usersAndEntitiesDirectory":
    "Users and entities directory",
  "screen.admin.directory.usersAndEntitiesDirectory.findAnyUserOrganizationDriver":
    "Find any user, organization, driver, photographer or moderator.",
  "screen.admin.directory.usersAndEntitiesDirectory.deletionRequests": "Deletion requests",
  "screen.admin.directory.usersAndEntitiesDirectory.adminStaffAccounts": "Admin staff accounts",
  "screen.admin.directory.usersAndEntitiesDirectory.noResults": "No results",
  "screen.admin.directory.usersAndEntitiesDirectory.changeTheSearchOrThe":
    "Change the search or the filters.",
  "screen.admin.directory.usersAndEntitiesDirectory.loadingTheDirectory": "Loading the directory.",
  "screen.admin.directory.usersAndEntitiesDirectory.search": "Search",
  "screen.admin.directory.usersAndEntitiesDirectory.nameEmailPhoneOrganizationOr":
    "Name, email, phone, organization or reference",
  "screen.admin.directory.usersAndEntitiesDirectory.clearSearch": "Clear search",
  "screen.admin.directory.usersAndEntitiesDirectory.roleLabel": "Role",
  "screen.admin.directory.usersAndEntitiesDirectory.statusLabel": "Status",
  "screen.admin.directory.usersAndEntitiesDirectory.results": "Results",
  "screen.admin.directory.usersAndEntitiesDirectory.usersAndEntities": "Users and entities",
  "screen.admin.directory.usersAndEntitiesDirectory.noResultsEmptyTitle": "No results",
  "screen.admin.directory.usersAndEntitiesDirectory.changeTheSearchOrTheEmptyDescription":
    "Change the search or the filters.",
  // apps/web/src/screens/admin/entries-part-1.ts
  "screen.registry.admin.adminHome.title": "Admin home",
  "screen.registry.admin.applicationQueue.title": "Application queue",
  "screen.registry.admin.applicationReviewDetail.title": "Application review detail",
  "screen.registry.admin.requestChangesDecision.title": "Request changes (decision)",
  "screen.registry.admin.rejectWithReasonDecision.title": "Reject with reason (decision)",
  "screen.registry.admin.appealReview.title": "Appeal review",
  "screen.registry.admin.usersAndEntitiesDirectory.title": "Users and entities directory",
  "screen.registry.admin.entityDetail.title": "Entity detail",
  "screen.registry.admin.suspendOrReinstateDecision.title": "Suspend or reinstate (decision)",
  "screen.registry.admin.deletionAndDataRequests.title": "Deletion and data requests",
  "screen.registry.admin.adminStaffAccounts.title": "Admin staff accounts",
  "screen.registry.admin.labTestsQueue.title": "Lab tests queue",
  "screen.registry.admin.labTestDetailAndDecision.title": "Lab test detail and decision",
  "screen.registry.admin.requestLabTestDecision.title": "Request lab test (decision)",
  "screen.registry.admin.plansCatalog.title": "Plans catalog",
  "screen.registry.admin.planEditor.title": "Plan editor",
  // apps/web/src/screens/admin/entries-part-2.ts
  "screen.registry.admin.subscriptionsAndOverrides.title": "Subscriptions and overrides",
  "screen.registry.admin.revenueDashboard.title": "Revenue dashboard",
  "screen.registry.admin.platformCoupons.title": "Platform coupons",
  "screen.registry.admin.platformCouponEditor.title": "Platform coupon editor",
  "screen.registry.admin.dealAuditList.title": "Deal audit list",
  "screen.registry.admin.dealAuditDetail.title": "Deal audit detail",
  "screen.registry.admin.disputesQueue.title": "Disputes queue",
  "screen.registry.admin.disputeDetailAndRefundDecision.title":
    "Dispute detail and refund decision",
  "screen.registry.admin.platformFinancialView.title": "Platform financial view",
  "screen.registry.admin.payoutRuns.title": "Payout runs",
  "screen.registry.admin.reconciliationExceptions.title": "Reconciliation exceptions",
  "screen.registry.admin.settlementsTracker.title": "Settlements tracker",
  "screen.registry.admin.tripOversight.title": "Trip oversight",
  "screen.registry.admin.auditLog.title": "Audit log",
  "screen.registry.admin.notificationTemplates.title": "Notification templates",
  "screen.registry.admin.featureFlagsAndPlatformConfiguration.title":
    "Feature flags and platform configuration",
  "screen.registry.admin.operationsHealthDashboard.title": "Operations health dashboard",
  // apps/web/src/screens/admin/finance/payout-runs.tsx
  "screen.admin.finance.payoutRuns.completed": "Completed",
  "screen.admin.finance.payoutRuns.failed": "Failed",
  "screen.admin.finance.payoutRuns.week": "Week",
  "screen.admin.finance.payoutRuns.suppliers": "Suppliers",
  "screen.admin.finance.payoutRuns.total": "Total",
  "screen.admin.finance.payoutRuns.state": "State",
  "screen.admin.finance.payoutRuns.action": "Action",
  "screen.admin.finance.payoutRuns.openPayoutRunFor": "Open payout run for {week}",
  "screen.admin.finance.payoutRuns.openRun": "Open run",
  "screen.admin.finance.payoutRuns.supplier": "Supplier",
  "screen.admin.finance.payoutRuns.amount": "Amount",
  "screen.admin.finance.payoutRuns.stateHeader": "State",
  "screen.admin.finance.payoutRuns.payoutRuns": "Payout runs",
  "screen.admin.finance.payoutRuns.createAndTrackWeeklyPayout":
    "Create and track weekly payout runs for suppliers.",
  "screen.admin.finance.payoutRuns.createPayoutRun": "Create payout run",
  "screen.admin.finance.payoutRuns.noPayoutRuns": "No payout runs",
  "screen.admin.finance.payoutRuns.createTheFirstPayoutRun":
    "Create the first payout run for this week.",
  "screen.admin.finance.payoutRuns.loadingThePayoutRuns": "Loading the payout runs.",
  "screen.admin.finance.payoutRuns.schedule": "Schedule",
  "screen.admin.finance.payoutRuns.payoutRunsAreCreatedWeekly":
    "Payout runs are created weekly, on Monday at 06:00 (D-28). Each supplier sees only their own amount.",
  "screen.admin.finance.payoutRuns.runs": "Runs",
  "screen.admin.finance.payoutRuns.payoutRunsCaption": "Payout runs",
  "screen.admin.finance.payoutRuns.noPayoutRunsEmptyTitle": "No payout runs",
  "screen.admin.finance.payoutRuns.createTheFirstPayoutRunEmptyDescription":
    "Create the first payout run for this week.",
  "screen.admin.finance.payoutRuns.runDetailWeekOfDate": "Run detail: [Week of date]",
  "screen.admin.finance.payoutRuns.amountPerSupplierInThis": "Amount per supplier in this run",
  "screen.admin.finance.payoutRuns.noSuppliersInThisRun": "No suppliers in this run",
  "screen.admin.finance.payoutRuns.thisRunHasNoSupplier": "This run has no supplier amounts.",
  "screen.admin.finance.payoutRuns.backToFinancialView": "Back to financial view",
  // apps/web/src/screens/admin/finance/platform-financial-view.tsx
  "screen.admin.finance.platformFinancialView.thisMonth": "This month",
  "screen.admin.finance.platformFinancialView.thisQuarter": "This quarter",
  "screen.admin.finance.platformFinancialView.thisYear": "This year",
  "screen.admin.finance.platformFinancialView.platformFinancialView": "Platform financial view",
  "screen.admin.finance.platformFinancialView.theSystemWideFinancialPicture":
    "The system-wide financial picture for the selected period.",
  "screen.admin.finance.platformFinancialView.noActivityInThisPeriod": "No activity in this period",
  "screen.admin.finance.platformFinancialView.chooseAnotherPeriodToSee":
    "Choose another period to see totals.",
  "screen.admin.finance.platformFinancialView.loadingTheFinancialTotals":
    "Loading the financial totals.",
  "screen.admin.finance.platformFinancialView.period": "Period",
  "screen.admin.finance.platformFinancialView.subscriptionRevenue": "Subscription revenue",
  "screen.admin.finance.platformFinancialView.periodTotal": "Period total",
  "screen.admin.finance.platformFinancialView.commission": "Commission",
  "screen.admin.finance.platformFinancialView.periodTotalHint": "Period total",
  "screen.admin.finance.platformFinancialView.dealAuditSummary": "Deal audit summary",
  "screen.admin.finance.platformFinancialView.periodTotal2": "Period total",
  "screen.admin.finance.platformFinancialView.couponRedemptions": "Coupon redemptions",
  "screen.admin.finance.platformFinancialView.periodTotal3": "Period total",
  "screen.admin.finance.platformFinancialView.disputes": "Disputes",
  "screen.admin.finance.platformFinancialView.openedInThePeriod": "Opened in the period",
  "screen.admin.finance.platformFinancialView.payouts": "Payouts",
  "screen.admin.finance.platformFinancialView.periodTotal4": "Period total",
  "screen.admin.finance.platformFinancialView.detailViews": "Detail views",
  "screen.admin.finance.platformFinancialView.payoutRuns": "Payout runs",
  "screen.admin.finance.platformFinancialView.reconciliationExceptions":
    "Reconciliation exceptions",
  "screen.admin.finance.platformFinancialView.settlementsTracker": "Settlements tracker",
  "screen.admin.finance.platformFinancialView.amounts": "Amounts",
  "screen.admin.finance.platformFinancialView.everyAmountShowsItsIso":
    "Every amount shows its ISO currency code. Rounding follows D-157.",
  // apps/web/src/screens/admin/finance/reconciliation-exceptions.tsx
  "screen.admin.finance.reconciliationExceptions.missingFromLedger": "Missing from ledger",
  "screen.admin.finance.reconciliationExceptions.amountMismatch": "Amount mismatch",
  "screen.admin.finance.reconciliationExceptions.open": "Open",
  "screen.admin.finance.reconciliationExceptions.resolved": "Resolved",
  "screen.admin.finance.reconciliationExceptions.anyState": "Any state",
  "screen.admin.finance.reconciliationExceptions.openLabel": "Open",
  "screen.admin.finance.reconciliationExceptions.resolvedLabel": "Resolved",
  "screen.admin.finance.reconciliationExceptions.gatewayReference": "Gateway reference",
  "screen.admin.finance.reconciliationExceptions.amount": "Amount",
  "screen.admin.finance.reconciliationExceptions.type": "Type",
  "screen.admin.finance.reconciliationExceptions.state": "State",
  "screen.admin.finance.reconciliationExceptions.action": "Action",
  "screen.admin.finance.reconciliationExceptions.resolveException": "Resolve exception {reference}",
  "screen.admin.finance.reconciliationExceptions.resolve": "Resolve",
  "screen.admin.finance.reconciliationExceptions.reconciliationExceptions":
    "Reconciliation exceptions",
  "screen.admin.finance.reconciliationExceptions.gatewayRecordsThatDoNot":
    "Gateway records that do not match the ledger.",
  "screen.admin.finance.reconciliationExceptions.noExceptions": "No exceptions",
  "screen.admin.finance.reconciliationExceptions.gatewayRecordsMatchTheLedger":
    "Gateway records match the ledger.",
  "screen.admin.finance.reconciliationExceptions.loadingTheExceptions": "Loading the exceptions.",
  "screen.admin.finance.reconciliationExceptions.schedule": "Schedule",
  "screen.admin.finance.reconciliationExceptions.reconciliationRunsDailyD29":
    "Reconciliation runs daily (D-29).",
  "screen.admin.finance.reconciliationExceptions.stateLabel": "State",
  "screen.admin.finance.reconciliationExceptions.exceptions": "Exceptions",
  "screen.admin.finance.reconciliationExceptions.reconciliationExceptionsCaption":
    "Reconciliation exceptions",
  "screen.admin.finance.reconciliationExceptions.noExceptionsEmptyTitle": "No exceptions",
  "screen.admin.finance.reconciliationExceptions.gatewayRecordsMatchTheLedgerEmptyDescription":
    "Gateway records match the ledger.",
  "screen.admin.finance.reconciliationExceptions.resolveSelectedException":
    "Resolve selected exception",
  "screen.admin.finance.reconciliationExceptions.resolutionNoteRequired":
    "Resolution note (required)",
  "screen.admin.finance.reconciliationExceptions.whatWasCheckedAndWhy":
    "[What was checked and why this is resolved]",
  "screen.admin.finance.reconciliationExceptions.backToFinancialView": "Back to financial view",
  "screen.admin.finance.reconciliationExceptions.resolveException2": "Resolve exception",
  // apps/web/src/screens/admin/finance/revenue-dashboard.tsx
  "screen.admin.finance.revenueDashboard.thisMonth": "This month",
  "screen.admin.finance.revenueDashboard.thisQuarter": "This quarter",
  "screen.admin.finance.revenueDashboard.thisYear": "This year",
  "screen.admin.finance.revenueDashboard.allRoles": "All roles",
  "screen.admin.finance.revenueDashboard.plan": "Plan",
  "screen.admin.finance.revenueDashboard.subscriptions": "Subscriptions",
  "screen.admin.finance.revenueDashboard.share": "Share",
  "screen.admin.finance.revenueDashboard.revenueDashboard": "Revenue dashboard",
  "screen.admin.finance.revenueDashboard.mrrChurnUpgradesAndDowngrades":
    "MRR, churn, upgrades and downgrades for the selected period.",
  "screen.admin.finance.revenueDashboard.openFinancialView": "Open financial view",
  "screen.admin.finance.revenueDashboard.noDataForThisPeriod": "No data for this period",
  "screen.admin.finance.revenueDashboard.noSubscriptionsWereActiveIn":
    "No subscriptions were active in the selected period.",
  "screen.admin.finance.revenueDashboard.loadingTheRevenueFigures": "Loading the revenue figures.",
  "screen.admin.finance.revenueDashboard.period": "Period",
  "screen.admin.finance.revenueDashboard.role": "Role",
  "screen.admin.finance.revenueDashboard.monthlyRecurringRevenueInThe":
    "Monthly recurring revenue, in the ISO currency code",
  "screen.admin.finance.revenueDashboard.churn": "Churn",
  "screen.admin.finance.revenueDashboard.subscriptionsCancelledInThePeriod":
    "Subscriptions cancelled in the period",
  "screen.admin.finance.revenueDashboard.upgrades": "Upgrades",
  "screen.admin.finance.revenueDashboard.planChangesToAHigher": "Plan changes to a higher tier",
  "screen.admin.finance.revenueDashboard.downgrades": "Downgrades",
  "screen.admin.finance.revenueDashboard.planChangesToALower": "Plan changes to a lower tier",
  "screen.admin.finance.revenueDashboard.planDistribution": "Plan distribution",
  "screen.admin.finance.revenueDashboard.planDistributionCaption": "Plan distribution",
  "screen.admin.finance.revenueDashboard.noDataForThisPeriodEmptyTitle": "No data for this period",
  "screen.admin.finance.revenueDashboard.noSubscriptionsWereActiveInEmptyDescription":
    "No subscriptions were active in the selected period.",
  // apps/web/src/screens/admin/finance/settlements-tracker.tsx
  "screen.admin.finance.settlementsTracker.open": "Open",
  "screen.admin.finance.settlementsTracker.settled": "Settled",
  "screen.admin.finance.settlementsTracker.anyState": "Any state",
  "screen.admin.finance.settlementsTracker.openLabel": "Open",
  "screen.admin.finance.settlementsTracker.settledLabel": "Settled",
  "screen.admin.finance.settlementsTracker.from": "From",
  "screen.admin.finance.settlementsTracker.to": "To",
  "screen.admin.finance.settlementsTracker.amount": "Amount",
  "screen.admin.finance.settlementsTracker.date": "Date",
  "screen.admin.finance.settlementsTracker.state": "State",
  "screen.admin.finance.settlementsTracker.action": "Action",
  "screen.admin.finance.settlementsTracker.markSettlementFromToAs":
    "Mark settlement from {from} to {to} as settled",
  "screen.admin.finance.settlementsTracker.markSettled": "Mark settled",
  "screen.admin.finance.settlementsTracker.settlementsTracker": "Settlements tracker",
  "screen.admin.finance.settlementsTracker.amountsOwedBetweenOrganizationsSuppliers":
    "Amounts owed between organizations, suppliers and the platform, until settled.",
  "screen.admin.finance.settlementsTracker.backToFinancialView": "Back to financial view",
  "screen.admin.finance.settlementsTracker.noSettlements": "No settlements",
  "screen.admin.finance.settlementsTracker.noAmountsAreOwedRight": "No amounts are owed right now.",
  "screen.admin.finance.settlementsTracker.loadingTheSettlements": "Loading the settlements.",
  "screen.admin.finance.settlementsTracker.stateLabel": "State",
  "screen.admin.finance.settlementsTracker.settlements": "Settlements",
  "screen.admin.finance.settlementsTracker.settlementsCaption": "Settlements",
  "screen.admin.finance.settlementsTracker.noSettlementsEmptyTitle": "No settlements",
  "screen.admin.finance.settlementsTracker.noAmountsAreOwedRightEmptyDescription":
    "No amounts are owed right now.",
  "screen.admin.finance.settlementsTracker.markSettledTitle": "Mark settled",
  "screen.admin.finance.settlementsTracker.recordedPaymentReferenceRequired":
    "Recorded payment reference (required)",
  "screen.admin.finance.settlementsTracker.paymentReference": "[Payment reference]",
  "screen.admin.finance.settlementsTracker.paymentDate": "Payment date",
  "screen.admin.finance.settlementsTracker.yyyyMmDd": "YYYY-MM-DD",
  "screen.admin.finance.settlementsTracker.cancel": "Cancel",
  "screen.admin.finance.settlementsTracker.markAsSettled": "Mark as settled",
  // apps/web/src/screens/admin/home/admin-home.tsx
  "screen.admin.home.adminHome.queue": "Queue",
  "screen.admin.home.adminHome.items": "Items",
  "screen.admin.home.adminHome.oldestItem": "Oldest item",
  "screen.admin.home.adminHome.action": "Action",
  "screen.admin.home.adminHome.open": "Open {queue}",
  "screen.admin.home.adminHome.openQueue": "Open queue",
  "screen.admin.home.adminHome.adminStaffAccounts": "Admin staff accounts",
  "screen.admin.home.adminHome.subscriptionsAndOverrides": "Subscriptions and overrides",
  "screen.admin.home.adminHome.revenueDashboard": "Revenue dashboard",
  "screen.admin.home.adminHome.notificationTemplates": "Notification templates",
  "screen.admin.home.adminHome.adminHome": "Admin home",
  "screen.admin.home.adminHome.queuesThatNeedActionNow":
    "Queues that need action now. Applications are flagged overdue after 2 working days.",
  "screen.admin.home.adminHome.allClear": "All clear",
  "screen.admin.home.adminHome.noQueueHasItemsThat": "No queue has items that need action.",
  "screen.admin.home.adminHome.loadingTheQueues": "Loading the queues.",
  "screen.admin.home.adminHome.theLabTestsQueueCould":
    "The lab tests queue could not load. The other queues are shown.",
  "screen.admin.home.adminHome.retryLabTests": "Retry lab tests",
  "screen.admin.home.adminHome.queues": "Queues",
  "screen.admin.home.adminHome.queuesThatNeedAction": "Queues that need action",
  "screen.admin.home.adminHome.allClearEmptyTitle": "All clear",
  "screen.admin.home.adminHome.noQueueHasItemsThatEmptyDescription":
    "No queue has items that need action.",
  "screen.admin.home.adminHome.moreAreas": "More areas",
  // apps/web/src/screens/admin/lab-tests/lab-test-detail-and-decision.tsx
  "screen.admin.labTests.labTestDetailAndDecision.resultUploaded": "Result uploaded",
  "screen.admin.labTests.labTestDetailAndDecision.testRequested": "Test requested",
  "screen.admin.labTests.labTestDetailAndDecision.resultUploadedByTheLab":
    "Result uploaded by the lab partner",
  "screen.admin.labTests.labTestDetailAndDecision.decisionPassedOrFailed":
    "Decision: passed or failed",
  "screen.admin.labTests.labTestDetailAndDecision.labTestDetailAndDecision":
    "Lab test detail and decision",
  "screen.admin.labTests.labTestDetailAndDecision.reviewTheResultAndDecide":
    "Review the result and decide. Both decisions are audited.",
  "screen.admin.labTests.labTestDetailAndDecision.noResultYet": "No result yet",
  "screen.admin.labTests.labTestDetailAndDecision.theLabPartnerHasNot":
    "The lab partner has not sent a result for this test.",
  "screen.admin.labTests.labTestDetailAndDecision.loadingTheLabTest": "Loading the lab test.",
  "screen.admin.labTests.labTestDetailAndDecision.test": "Test",
  "screen.admin.labTests.labTestDetailAndDecision.driver": "Driver",
  "screen.admin.labTests.labTestDetailAndDecision.track": "Track",
  "screen.admin.labTests.labTestDetailAndDecision.requested": "Requested",
  "screen.admin.labTests.labTestDetailAndDecision.deadline": "Deadline",
  "screen.admin.labTests.labTestDetailAndDecision.labResultReference": "Lab result reference",
  "screen.admin.labTests.labTestDetailAndDecision.consentRecord": "Consent record",
  "screen.admin.labTests.labTestDetailAndDecision.openResultFile": "Open result file",
  "screen.admin.labTests.labTestDetailAndDecision.openDriverAccount": "Open driver account",
  "screen.admin.labTests.labTestDetailAndDecision.timeline": "Timeline",
  "screen.admin.labTests.labTestDetailAndDecision.labTestTimeline": "Lab test timeline",
  "screen.admin.labTests.labTestDetailAndDecision.whatEachDecisionDoes": "What each decision does",
  "screen.admin.labTests.labTestDetailAndDecision.markPassedUnpausesTheDriver":
    "Mark passed unpauses the driver. Mark failed keeps the driver paused and opens a case.",
  "screen.admin.labTests.labTestDetailAndDecision.backToLabTests": "Back to lab tests",
  "screen.admin.labTests.labTestDetailAndDecision.markFailed": "Mark failed",
  "screen.admin.labTests.labTestDetailAndDecision.markPassed": "Mark passed",
  // apps/web/src/screens/admin/lab-tests/lab-tests-queue.tsx
  "screen.admin.labTests.labTestsQueue.requested": "Requested",
  "screen.admin.labTests.labTestsQueue.pending": "Pending",
  "screen.admin.labTests.labTestsQueue.resultUploaded": "Result uploaded",
  "screen.admin.labTests.labTestsQueue.passed": "Passed",
  "screen.admin.labTests.labTestsQueue.failed": "Failed",
  "screen.admin.labTests.labTestsQueue.missed": "Missed",
  "screen.admin.labTests.labTestsQueue.overdue": "Overdue",
  "screen.admin.labTests.labTestsQueue.anyState": "Any state",
  "screen.admin.labTests.labTestsQueue.requestedLabel": "Requested",
  "screen.admin.labTests.labTestsQueue.pendingLabel": "Pending",
  "screen.admin.labTests.labTestsQueue.resultUploadedLabel": "Result uploaded",
  "screen.admin.labTests.labTestsQueue.passedLabel": "Passed",
  "screen.admin.labTests.labTestsQueue.failedLabel": "Failed",
  "screen.admin.labTests.labTestsQueue.missedLabel": "Missed",
  "screen.admin.labTests.labTestsQueue.driver": "Driver",
  "screen.admin.labTests.labTestsQueue.track": "Track",
  "screen.admin.labTests.labTestsQueue.requestedHeader": "Requested",
  "screen.admin.labTests.labTestsQueue.deadline": "Deadline",
  "screen.admin.labTests.labTestsQueue.state": "State",
  "screen.admin.labTests.labTestsQueue.overdueHeader": "Overdue",
  "screen.admin.labTests.labTestsQueue.notOverdue": "Not overdue",
  "screen.admin.labTests.labTestsQueue.action": "Action",
  "screen.admin.labTests.labTestsQueue.openLabTestFor": "Open lab test for {driver}",
  "screen.admin.labTests.labTestsQueue.openTest": "Open test",
  "screen.admin.labTests.labTestsQueue.labTestsQueue": "Lab tests queue",
  "screen.admin.labTests.labTestsQueue.trackLabTestsByState":
    "Track lab tests by state and deadline.",
  "screen.admin.labTests.labTestsQueue.requestLabTest": "Request lab test",
  "screen.admin.labTests.labTestsQueue.openNextDueTest": "Open next due test",
  "screen.admin.labTests.labTestsQueue.noLabTests": "No lab tests",
  "screen.admin.labTests.labTestsQueue.noLabTestsMatchThese": "No lab tests match these filters.",
  "screen.admin.labTests.labTestsQueue.loadingTheLabTests": "Loading the lab tests.",
  "screen.admin.labTests.labTestsQueue.overdueOnly": "Overdue only",
  "screen.admin.labTests.labTestsQueue.stateLabel": "State",
  "screen.admin.labTests.labTestsQueue.labTests": "Lab tests",
  "screen.admin.labTests.labTestsQueue.labTestsCaption": "Lab tests",
  "screen.admin.labTests.labTestsQueue.noLabTestsEmptyTitle": "No lab tests",
  "screen.admin.labTests.labTestsQueue.noLabTestsMatchTheseEmptyDescription":
    "No lab tests match these filters.",
  // apps/web/src/screens/admin/lab-tests/request-lab-test-decision.tsx
  "screen.admin.labTests.requestLabTestDecision.drugScreening": "Drug screening",
  "screen.admin.labTests.requestLabTestDecision.medicalFitness": "Medical fitness",
  "screen.admin.labTests.requestLabTestDecision.both": "Both",
  "screen.admin.labTests.requestLabTestDecision.active": "Active",
  "screen.admin.labTests.requestLabTestDecision.requestLabTestDecision":
    "Request lab test (decision)",
  "screen.admin.labTests.requestLabTestDecision.requestALabTestFor":
    "Request a lab test for a driver. This pauses the driver at once.",
  "screen.admin.labTests.requestLabTestDecision.noDriverSelected": "No driver selected",
  "screen.admin.labTests.requestLabTestDecision.openADriverFromThe":
    "Open a driver from the directory before you request a lab test.",
  "screen.admin.labTests.requestLabTestDecision.loadingTheDriver": "Loading the driver.",
  "screen.admin.labTests.requestLabTestDecision.driver": "Driver",
  "screen.admin.labTests.requestLabTestDecision.driverLabel": "Driver",
  "screen.admin.labTests.requestLabTestDecision.testRequest": "Test request",
  "screen.admin.labTests.requestLabTestDecision.testType": "Test type",
  "screen.admin.labTests.requestLabTestDecision.deadline": "Deadline",
  "screen.admin.labTests.requestLabTestDecision.between1And7Days":
    "Between 1 and 7 days. The default is 3 days (D-21).",
  "screen.admin.labTests.requestLabTestDecision.reasonForTheLabTest":
    "Reason for the lab test (required)",
  "screen.admin.labTests.requestLabTestDecision.recordedWithTheRequestIn":
    "Recorded with the request in the audit log.",
  "screen.admin.labTests.requestLabTestDecision.requestTestAndPauseDriver":
    "Request test and pause driver",
  "screen.admin.labTests.requestLabTestDecision.pauseThisDriverNow": "Pause this driver now?",
  "screen.admin.labTests.requestLabTestDecision.theDriverIsPausedAt":
    "The driver is paused at once and cannot take trips until the result passes.",
  "screen.admin.labTests.requestLabTestDecision.requestTestAndPause": "Request test and pause",
  "screen.admin.labTests.requestLabTestDecision.upcomingTripsReturnToOrganizers":
    "Upcoming trips return to organizers. Four actions stay open to the driver: book lab, upload result, support and sign out.",
  "screen.admin.labTests.requestLabTestDecision.cancel": "Cancel",
  "screen.admin.labTests.requestLabTestDecision.effectOnTheDriver": "Effect on the driver",
  "screen.admin.labTests.requestLabTestDecision.theDriverIsPausedAt2":
    "The driver is paused at once. Only the four allowed actions stay available. Upcoming trips return to organizers. Per-market legal review applies (NFR-COM-05).",
  // apps/web/src/screens/admin/operations/operations-health-dashboard.tsx
  "screen.admin.operations.operationsHealthDashboard.lastHour": "Last hour",
  "screen.admin.operations.operationsHealthDashboard.last24Hours": "Last 24 hours",
  "screen.admin.operations.operationsHealthDashboard.last7Days": "Last 7 days",
  "screen.admin.operations.operationsHealthDashboard.channel": "Channel",
  "screen.admin.operations.operationsHealthDashboard.delivered": "Delivered",
  "screen.admin.operations.operationsHealthDashboard.failed": "Failed",
  "screen.admin.operations.operationsHealthDashboard.deliveryRate": "Delivery rate",
  "screen.admin.operations.operationsHealthDashboard.operationsHealthDashboard":
    "Operations health dashboard",
  "screen.admin.operations.operationsHealthDashboard.tripOperationsPaymentSuccessAnd":
    "Trip operations, payment success and failure rates, and notification delivery by channel.",
  "screen.admin.operations.operationsHealthDashboard.noData": "No data",
  "screen.admin.operations.operationsHealthDashboard.noOperationsDataIsAvailable":
    "No operations data is available for the selected range.",
  "screen.admin.operations.operationsHealthDashboard.loadingTheOperationsData":
    "Loading the operations data.",
  "screen.admin.operations.operationsHealthDashboard.timeRange": "Time range",
  "screen.admin.operations.operationsHealthDashboard.paymentSuccessRate": "Payment success rate",
  "screen.admin.operations.operationsHealthDashboard.paymentFailureRate": "Payment failure rate",
  "screen.admin.operations.operationsHealthDashboard.liveTrips": "Live trips",
  "screen.admin.operations.operationsHealthDashboard.checkInEvents": "Check-in events",
  "screen.admin.operations.operationsHealthDashboard.notificationsDelivered":
    "Notifications delivered",
  "screen.admin.operations.operationsHealthDashboard.allChannels": "All channels",
  "screen.admin.operations.operationsHealthDashboard.paymentSuccessAndFailure":
    "Payment success and failure",
  "screen.admin.operations.operationsHealthDashboard.paymentSuccessAndFailureOver":
    "Payment success and failure over the selected range",
  "screen.admin.operations.operationsHealthDashboard.notificationDeliveryByChannel":
    "Notification delivery by channel",
  "screen.admin.operations.operationsHealthDashboard.notificationDeliveryByChannelCaption":
    "Notification delivery by channel",
  "screen.admin.operations.operationsHealthDashboard.noDeliveryData": "No delivery data",
  "screen.admin.operations.operationsHealthDashboard.noNotificationsWereSentIn":
    "No notifications were sent in the selected range.",
  "screen.admin.operations.operationsHealthDashboard.criticalAlertsGoToOn":
    "Critical alerts go to on-call (NFR-OBS-04). This dashboard does not replace alerting.",
  // apps/web/src/screens/admin/plans/plan-editor.tsx
  "screen.admin.plans.planEditor.planEditor": "Plan editor",
  "screen.admin.plans.planEditor.editOnePlanSLimits":
    "Edit one plan's limits, features, prices and trial.",
  "screen.admin.plans.planEditor.noPlanLoaded": "No plan loaded",
  "screen.admin.plans.planEditor.chooseARoleAndA":
    "Choose a role and a tier to edit from the catalog.",
  "screen.admin.plans.planEditor.loadingThePlan": "Loading the plan.",
  "screen.admin.plans.planEditor.plan": "Plan",
  "screen.admin.plans.planEditor.role": "Role",
  "screen.admin.plans.planEditor.tierName": "Tier name",
  "screen.admin.plans.planEditor.tierNamePlaceholder": "[Tier name]",
  "screen.admin.plans.planEditor.limitsAndFeatures": "Limits and features",
  "screen.admin.plans.planEditor.limits": "Limits",
  "screen.admin.plans.planEditor.limitValues": "[Limit values]",
  "screen.admin.plans.planEditor.valuesComeFromTheBrd": "Values come from the BRD 5.1 tables.",
  "screen.admin.plans.planEditor.featureFlag1": "[Feature flag 1]",
  "screen.admin.plans.planEditor.featureFlag2": "[Feature flag 2]",
  "screen.admin.plans.planEditor.pricesAndTrial": "Prices and trial",
  "screen.admin.plans.planEditor.monthlyPrice": "Monthly price",
  "screen.admin.plans.planEditor.amount": "[Amount]",
  "screen.admin.plans.planEditor.currency": "Currency",
  "screen.admin.plans.planEditor.currencyCode": "[Currency code]",
  "screen.admin.plans.planEditor.annualPrice": "Annual price",
  "screen.admin.plans.planEditor.amountPlaceholder": "[Amount]",
  "screen.admin.plans.planEditor.annualDiscount": "Annual discount (%)",
  "screen.admin.plans.planEditor.placeholderFinanceSetsThisValue":
    "Placeholder. Finance sets this value (D-16).",
  "screen.admin.plans.planEditor.trialLengthDays": "Trial length (days)",
  "screen.admin.plans.planEditor.days": "[Days]",
  "screen.admin.plans.planEditor.gracePeriodDays": "Grace period (days)",
  "screen.admin.plans.planEditor.setTo7DaysD": "Set to 7 days (D-08).",
  "screen.admin.plans.planEditor.whenChangesApply": "When changes apply",
  "screen.admin.plans.planEditor.savedChangesApplyToNew":
    "Saved changes apply to new actions at once. The effect on existing items is set in D-144. Prices come from the plan catalog.",
  "screen.admin.plans.planEditor.save": "Save",
  "screen.admin.plans.planEditor.cancel": "Cancel",
  "screen.admin.plans.planEditor.savePlan": "Save plan",
  "screen.admin.plans.planEditor.validationErrorsAppearNextTo":
    "Validation errors appear next to the field that needs fixing.",
  // apps/web/src/screens/admin/plans/plans-catalog.tsx
  "screen.admin.plans.plansCatalog.active": "Active",
  "screen.admin.plans.plansCatalog.draft": "Draft",
  "screen.admin.plans.plansCatalog.organization": "Organization",
  "screen.admin.plans.plansCatalog.platformDriver": "Platform driver",
  "screen.admin.plans.plansCatalog.platformPhotographer": "Platform photographer",
  "screen.admin.plans.plansCatalog.traveler": "Traveler",
  "screen.admin.plans.plansCatalog.tier": "Tier",
  "screen.admin.plans.plansCatalog.status": "Status",
  "screen.admin.plans.plansCatalog.activeSubscriptions": "Active subscriptions",
  "screen.admin.plans.plansCatalog.action": "Action",
  "screen.admin.plans.plansCatalog.editPlan": "Edit plan {tier}",
  "screen.admin.plans.plansCatalog.editPlan2": "Edit plan",
  "screen.admin.plans.plansCatalog.plansCatalog": "Plans catalog",
  "screen.admin.plans.plansCatalog.plansForEachRoleBy": "Plans for each role, by tier.",
  "screen.admin.plans.plansCatalog.subscriptionsAndOverrides": "Subscriptions and overrides",
  "screen.admin.plans.plansCatalog.createTier": "Create tier",
  "screen.admin.plans.plansCatalog.noPlansForThisRole": "No plans for this role",
  "screen.admin.plans.plansCatalog.createTheFirstTierFor": "Create the first tier for this role.",
  "screen.admin.plans.plansCatalog.loadingThePlans": "Loading the plans.",
  "screen.admin.plans.plansCatalog.role": "Role",
  "screen.admin.plans.plansCatalog.tiers": "Tiers",
  "screen.admin.plans.plansCatalog.plansForThisRole": "Plans for this role",
  "screen.admin.plans.plansCatalog.noPlansForThisRoleEmptyTitle": "No plans for this role",
  "screen.admin.plans.plansCatalog.createTheFirstTierForEmptyDescription":
    "Create the first tier for this role.",
  // apps/web/src/screens/admin/plans/subscriptions-and-overrides.tsx
  "screen.admin.plans.subscriptionsAndOverrides.active": "Active",
  "screen.admin.plans.subscriptionsAndOverrides.pastDueGraceShown": "Past due (grace shown)",
  "screen.admin.plans.subscriptionsAndOverrides.cancelled": "Cancelled",
  "screen.admin.plans.subscriptionsAndOverrides.allRoles": "All roles",
  "screen.admin.plans.subscriptionsAndOverrides.allPlans": "All plans",
  "screen.admin.plans.subscriptionsAndOverrides.anyBillingStatus": "Any billing status",
  "screen.admin.plans.subscriptionsAndOverrides.activeLabel": "Active",
  "screen.admin.plans.subscriptionsAndOverrides.pastDue": "Past due",
  "screen.admin.plans.subscriptionsAndOverrides.cancelledLabel": "Cancelled",
  "screen.admin.plans.subscriptionsAndOverrides.selectAPlan": "Select a plan",
  "screen.admin.plans.subscriptionsAndOverrides.planName": "[Plan name]",
  "screen.admin.plans.subscriptionsAndOverrides.account": "Account",
  "screen.admin.plans.subscriptionsAndOverrides.role": "Role",
  "screen.admin.plans.subscriptionsAndOverrides.plan": "Plan",
  "screen.admin.plans.subscriptionsAndOverrides.billingStatus": "Billing status",
  "screen.admin.plans.subscriptionsAndOverrides.renewalDate": "Renewal date",
  "screen.admin.plans.subscriptionsAndOverrides.action": "Action",
  "screen.admin.plans.subscriptionsAndOverrides.open": "Open {account}",
  "screen.admin.plans.subscriptionsAndOverrides.openAccount": "Open account",
  "screen.admin.plans.subscriptionsAndOverrides.subscriptionsAndOverrides":
    "Subscriptions and overrides",
  "screen.admin.plans.subscriptionsAndOverrides.findSubscriptionsAndGrantRevoke":
    "Find subscriptions and grant, revoke or change a plan for one account.",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptions": "No subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsMatchTheseFilters":
    "No subscriptions match these filters.",
  "screen.admin.plans.subscriptionsAndOverrides.loadingTheSubscriptions":
    "Loading the subscriptions.",
  "screen.admin.plans.subscriptionsAndOverrides.roleLabel": "Role",
  "screen.admin.plans.subscriptionsAndOverrides.planLabel": "Plan",
  "screen.admin.plans.subscriptionsAndOverrides.billingStatusLabel": "Billing status",
  "screen.admin.plans.subscriptionsAndOverrides.renewalBefore": "Renewal before",
  "screen.admin.plans.subscriptionsAndOverrides.yyyyMmDd": "YYYY-MM-DD",
  "screen.admin.plans.subscriptionsAndOverrides.subscriptions": "Subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.subscriptionsCaption": "Subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsEmptyTitle": "No subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsMatchTheseFiltersEmptyDescription":
    "No subscriptions match these filters.",
  "screen.admin.plans.subscriptionsAndOverrides.overridePlanForOneAccount":
    "Override plan for one account",
  "screen.admin.plans.subscriptionsAndOverrides.accountLabel": "Account",
  "screen.admin.plans.subscriptionsAndOverrides.accountNameOrReference":
    "[Account name or reference]",
  "screen.admin.plans.subscriptionsAndOverrides.plan2": "Plan",
  "screen.admin.plans.subscriptionsAndOverrides.reasonRequired": "Reason (required)",
  "screen.admin.plans.subscriptionsAndOverrides.reasonForTheOverride": "[Reason for the override]",
  "screen.admin.plans.subscriptionsAndOverrides.endDate": "End date",
  "screen.admin.plans.subscriptionsAndOverrides.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.admin.plans.subscriptionsAndOverrides.beforeYouSave": "Before you save",
  "screen.admin.plans.subscriptionsAndOverrides.anOverrideAppliesAtOnce":
    "An override applies at once and is audited. Conflicts with billing are shown before you save (D-227).",
  "screen.admin.plans.subscriptionsAndOverrides.cancel": "Cancel",
  "screen.admin.plans.subscriptionsAndOverrides.saveOverride": "Save override",
  // apps/web/src/screens/admin/platform/audit-log.tsx
  "screen.admin.platform.auditLog.last24Hours": "Last 24 hours",
  "screen.admin.platform.auditLog.last7Days": "Last 7 days",
  "screen.admin.platform.auditLog.last30Days": "Last 30 days",
  "screen.admin.platform.auditLog.customRange": "Custom range",
  "screen.admin.platform.auditLog.anyAction": "Any action",
  "screen.admin.platform.auditLog.time": "Time",
  "screen.admin.platform.auditLog.actor": "Actor",
  "screen.admin.platform.auditLog.action": "Action",
  "screen.admin.platform.auditLog.target": "Target",
  "screen.admin.platform.auditLog.before": "Before",
  "screen.admin.platform.auditLog.after": "After",
  "screen.admin.platform.auditLog.requestId": "Request ID",
  "screen.admin.platform.auditLog.auditLog": "Audit log",
  "screen.admin.platform.auditLog.everyAdminActionAndPermission":
    "Every admin action and permission change. Read only.",
  "screen.admin.platform.auditLog.noEntries": "No entries",
  "screen.admin.platform.auditLog.noAuditEntriesMatchThese":
    "No audit entries match these filters.",
  "screen.admin.platform.auditLog.loadingTheAuditEntries": "Loading the audit entries.",
  "screen.admin.platform.auditLog.readOnly": "Read only",
  "screen.admin.platform.auditLog.entriesCannotBeEditedOr":
    "Entries cannot be edited or deleted. The log is kept for 7 years (D-04).",
  "screen.admin.platform.auditLog.actorLabel": "Actor",
  "screen.admin.platform.auditLog.nameOrEmail": "Name or email",
  "screen.admin.platform.auditLog.clearActor": "Clear actor",
  "screen.admin.platform.auditLog.actionLabel": "Action",
  "screen.admin.platform.auditLog.targetLabel": "Target",
  "screen.admin.platform.auditLog.nameOrReference": "Name or reference",
  "screen.admin.platform.auditLog.clearTarget": "Clear target",
  "screen.admin.platform.auditLog.timeRange": "Time range",
  "screen.admin.platform.auditLog.entries": "Entries",
  "screen.admin.platform.auditLog.auditLogEntries": "Audit log entries",
  "screen.admin.platform.auditLog.noEntriesEmptyTitle": "No entries",
  "screen.admin.platform.auditLog.noAuditEntriesMatchTheseEmptyDescription":
    "No audit entries match these filters.",
  // apps/web/src/screens/admin/platform/feature-flags-and-platform-configuration.tsx
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.stripeInternational":
    "Stripe (international)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.paymobLocalMena":
    "Paymob (local MENA)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.tapLocalMena": "Tap (local MENA)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.fawryCashInEgypt":
    "Fawry (cash in Egypt)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagsAndPlatformConfiguration":
    "Feature flags and platform configuration",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.turnFeaturesOnOrOff":
    "Turn features on or off by phase, and set platform configuration.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.saveConfiguration":
    "Save configuration",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.noFeatureFlags": "No feature flags",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.noFeatureFlagsAreDefined":
    "No feature flags are defined for this phase.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.loadingTheConfiguration":
    "Loading the configuration.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlags": "Feature flags",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.aFlagChangeAppliesTo":
    "A flag change applies to all users at once and is audited.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagName":
    "[Feature flag name]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.phasePhase": "Phase: [Phase]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagNameLabel":
    "[Feature flag name]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.phasePhase2": "Phase: [Phase]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.paymentGatewayByMarket":
    "Payment gateway by market",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.market": "Market",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.marketCode": "[Market code]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.gateway": "Gateway",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.stripeForInternationalPaymentsPaymob":
    "Stripe for international payments. Paymob or Tap for local MENA. Fawry for cash in Egypt. The choice for each market is confirmed at launch (D-12).",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.otpAndSessionPolicy":
    "OTP and session policy",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.otpPolicy": "OTP policy",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.editabilityIsUnderReviewD":
    "Editability is under review (D-288).",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.sessionPolicy": "Session policy",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.editabilityIsUnderReviewDSupportingText":
    "Editability is under review (D-288).",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.quietHours": "Quiet hours",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentCategories":
    "Urgent categories",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentNotificationCategories":
    "[Urgent notification categories]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.setByD288": "Set by D-288.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.audit": "Audit",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.everyChangeOnThisPage":
    "Every change on this page is written to the audit log.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.cancel": "Cancel",
  // apps/web/src/screens/admin/platform/notification-templates.tsx
  "screen.admin.platform.notificationTemplates.published": "Published",
  "screen.admin.platform.notificationTemplates.translationMissing": "Translation missing",
  "screen.admin.platform.notificationTemplates.allLanguages": "All languages",
  "screen.admin.platform.notificationTemplates.english": "English",
  "screen.admin.platform.notificationTemplates.arabic": "Arabic",
  "screen.admin.platform.notificationTemplates.englishLabel": "English",
  "screen.admin.platform.notificationTemplates.arabicLabel": "Arabic",
  "screen.admin.platform.notificationTemplates.category": "Category",
  "screen.admin.platform.notificationTemplates.language": "Language",
  "screen.admin.platform.notificationTemplates.version": "Version",
  "screen.admin.platform.notificationTemplates.status": "Status",
  "screen.admin.platform.notificationTemplates.action": "Action",
  "screen.admin.platform.notificationTemplates.editIn": "Edit {category} in {language}",
  "screen.admin.platform.notificationTemplates.edit": "Edit",
  "screen.admin.platform.notificationTemplates.notificationTemplates": "Notification templates",
  "screen.admin.platform.notificationTemplates.editNotificationTextByCategory":
    "Edit notification text by category and language. Each save makes a new version.",
  "screen.admin.platform.notificationTemplates.noTemplates": "No templates",
  "screen.admin.platform.notificationTemplates.noTemplatesMatchTheseFilters":
    "No templates match these filters.",
  "screen.admin.platform.notificationTemplates.loadingTheTemplates": "Loading the templates.",
  "screen.admin.platform.notificationTemplates.categoryLabel": "Category",
  "screen.admin.platform.notificationTemplates.categoryName": "Category name",
  "screen.admin.platform.notificationTemplates.clearCategory": "Clear category",
  "screen.admin.platform.notificationTemplates.languageLabel": "Language",
  "screen.admin.platform.notificationTemplates.templates": "Templates",
  "screen.admin.platform.notificationTemplates.notificationTemplatesCaption":
    "Notification templates",
  "screen.admin.platform.notificationTemplates.noTemplatesEmptyTitle": "No templates",
  "screen.admin.platform.notificationTemplates.noTemplatesMatchTheseFiltersEmptyDescription":
    "No templates match these filters.",
  "screen.admin.platform.notificationTemplates.editTemplate": "Edit template",
  "screen.admin.platform.notificationTemplates.language2": "Language",
  "screen.admin.platform.notificationTemplates.messageText": "Message text",
  "screen.admin.platform.notificationTemplates.messageTextPlaceholder": "[Message text]",
  "screen.admin.platform.notificationTemplates.useThePlaceholdersFromThe":
    "Use the {variable} placeholders from the template catalogue.",
  "screen.admin.platform.notificationTemplates.preview": "Preview",
  "screen.admin.platform.notificationTemplates.englishPreview": "English preview",
  "screen.admin.platform.notificationTemplates.englishPreviewOfTheMessage":
    "[English preview of the message]",
  "screen.admin.platform.notificationTemplates.arabicPreview": "Arabic preview",
  "screen.admin.platform.notificationTemplates.arabicPreviewOfTheMessage":
    "[Arabic preview of the message]",
  "screen.admin.platform.notificationTemplates.saveAsNewVersion": "Save as new version",
  "screen.admin.platform.notificationTemplates.publish": "Publish",
  "screen.admin.platform.notificationTemplates.earlierMessagesKeepTheVersion":
    "Earlier messages keep the version they were sent with.",
  // apps/web/src/screens/admin/trips/trip-oversight.tsx
  "screen.admin.trips.tripOversight.planned": "Planned",
  "screen.admin.trips.tripOversight.inProgress": "In progress",
  "screen.admin.trips.tripOversight.allStates": "All states",
  "screen.admin.trips.tripOversight.plannedLabel": "Planned",
  "screen.admin.trips.tripOversight.inProgressLabel": "In progress",
  "screen.admin.trips.tripOversight.completed": "Completed",
  "screen.admin.trips.tripOversight.cancelled": "Cancelled",
  "screen.admin.trips.tripOversight.organization": "Organization",
  "screen.admin.trips.tripOversight.trip": "Trip",
  "screen.admin.trips.tripOversight.state": "State",
  "screen.admin.trips.tripOversight.dates": "Dates",
  "screen.admin.trips.tripOversight.staffingGaps": "Staffing gaps",
  "screen.admin.trips.tripOversight.actions": "Actions",
  "screen.admin.trips.tripOversight.openTrip": "Open trip {trip}",
  "screen.admin.trips.tripOversight.openTrip2": "Open trip",
  "screen.admin.trips.tripOversight.cancelTrip": "Cancel trip {trip}",
  "screen.admin.trips.tripOversight.cancelTrip2": "Cancel trip",
  "screen.admin.trips.tripOversight.tripOversight": "Trip oversight",
  "screen.admin.trips.tripOversight.seeAnyTripAcrossOrganizations":
    "See any trip across organizations and act on it when needed.",
  "screen.admin.trips.tripOversight.noTrips": "No trips",
  "screen.admin.trips.tripOversight.noTripsMatchTheseFilters": "No trips match these filters.",
  "screen.admin.trips.tripOversight.loadingTheTrips": "Loading the trips.",
  "screen.admin.trips.tripOversight.tripsInProgress": "Trips in progress",
  "screen.admin.trips.tripOversight.aTripInProgressCannot":
    "A trip in progress cannot be cancelled here. Use incident handling only (D-25).",
  "screen.admin.trips.tripOversight.tripOrOrganization": "Trip or organization",
  "screen.admin.trips.tripOversight.tripOrOrganizationPlaceholder": "Trip or organization",
  "screen.admin.trips.tripOversight.clearSearch": "Clear search",
  "screen.admin.trips.tripOversight.stateLabel": "State",
  "screen.admin.trips.tripOversight.trips": "Trips",
  "screen.admin.trips.tripOversight.tripOversightCaption": "Trip oversight",
  "screen.admin.trips.tripOversight.noTripsEmptyTitle": "No trips",
  "screen.admin.trips.tripOversight.noTripsMatchTheseFiltersEmptyDescription":
    "No trips match these filters.",
  "screen.admin.trips.tripOversight.cancelTripDecision": "Cancel trip (decision)",
  "screen.admin.trips.tripOversight.tripReferenceRequired": "Trip reference (required)",
  "screen.admin.trips.tripOversight.tripReference": "[Trip reference]",
  "screen.admin.trips.tripOversight.reasonForCancellingRequired":
    "Reason for cancelling (required)",
  "screen.admin.trips.tripOversight.recordedInTheAuditLog":
    "Recorded in the audit log. Refunds for paid bookings follow the cancellation.",
  "screen.admin.trips.tripOversight.cancelTripSubmitLabel": "Cancel trip",
  "screen.admin.trips.tripOversight.cancelThisTrip": "Cancel this trip?",
  "screen.admin.trips.tripOversight.refundsForPaidBookingsAre":
    "Refunds for paid bookings are queued. The cancellation is audited.",
  "screen.admin.trips.tripOversight.cancelTripConfirmLabel": "Cancel trip",
  "screen.admin.trips.tripOversight.keepTrip": "Keep trip",
  // apps/web/src/screens/organization/accounting/ledger-and-exports.tsx
  "screen.organization.accounting.ledgerAndExports.title": "Ledger",
  "screen.organization.accounting.ledgerAndExports.caption":
    "Every financial event, with its booking or deal and gateway reference",
  "screen.organization.accounting.ledgerAndExports.exportCsv": "Export CSV",
  "screen.organization.accounting.ledgerAndExports.exportPdf": "Export PDF",
  "screen.organization.accounting.ledgerAndExports.pdfExportIsOnEnterprise":
    "PDF export is on Enterprise. Your plan can export CSV.",
  "screen.organization.accounting.ledgerAndExports.period": "Period",
  "screen.organization.accounting.ledgerAndExports.allTime": "All time",
  "screen.organization.accounting.ledgerAndExports.thisMonth": "This month",
  "screen.organization.accounting.ledgerAndExports.last30Days": "Last 30 days",
  "screen.organization.accounting.ledgerAndExports.thisYear": "This year",
  "screen.organization.accounting.ledgerAndExports.eventTypeFilter": "Event type",
  "screen.organization.accounting.ledgerAndExports.allEvents": "All events",
  "screen.organization.accounting.ledgerAndExports.bookingOrDealReference":
    "Booking or deal reference",
  "screen.organization.accounting.ledgerAndExports.date": "Date",
  "screen.organization.accounting.ledgerAndExports.eventType": "Event type",
  "screen.organization.accounting.ledgerAndExports.amount": "Amount",
  "screen.organization.accounting.ledgerAndExports.currency": "Currency",
  "screen.organization.accounting.ledgerAndExports.linkedBookingOrDeal": "Linked booking or deal",
  "screen.organization.accounting.ledgerAndExports.gatewayReference": "Gateway reference",
  "screen.organization.accounting.ledgerAndExports.notApplicable": "Not applicable",
  "screen.organization.accounting.ledgerAndExports.bookingPaid": "Booking paid",
  "screen.organization.accounting.ledgerAndExports.refundIssued": "Refund issued",
  "screen.organization.accounting.ledgerAndExports.supplierCost": "Supplier cost",
  "screen.organization.accounting.ledgerAndExports.platformCommission": "Platform commission",
  "screen.organization.accounting.ledgerAndExports.payoutSettlement": "Payout settlement",
  "screen.organization.accounting.ledgerAndExports.noLedgerLines": "No ledger lines yet",
  "screen.organization.accounting.ledgerAndExports.noMatchingLines": "No lines match these filters",
  "screen.organization.accounting.ledgerAndExports.eachEventsEntriesBalance":
    "Each event's entries balance. An export for the same filters totals the same as this list.",
  // apps/web/src/screens/organization/accounting/settlements.tsx
  "screen.organization.accounting.settlements.title": "Settlements",
  "screen.organization.accounting.settlements.caption":
    "Amounts owed between your organization, suppliers and the platform until settled",
  "screen.organization.accounting.settlements.providerPayoutsRunWeekly":
    "Provider payouts run weekly",
  "screen.organization.accounting.settlements.payoutsAreMadeEveryMonday":
    "Payouts are made every Monday at 06:00.",
  "screen.organization.accounting.settlements.openAmountsOwed": "Open amounts owed",
  "screen.organization.accounting.settlements.openItems": "Open items",
  "screen.organization.accounting.settlements.filterByState": "Filter settlements by state",
  "screen.organization.accounting.settlements.open": "Open",
  "screen.organization.accounting.settlements.settled": "Settled",
  "screen.organization.accounting.settlements.all": "All",
  "screen.organization.accounting.settlements.counterparty": "Counterparty",
  "screen.organization.accounting.settlements.amount": "Amount",
  "screen.organization.accounting.settlements.state": "State",
  "screen.organization.accounting.settlements.date": "Date",
  "screen.organization.accounting.settlements.platform": "Platform",
  "screen.organization.accounting.settlements.noSettlements": "No settlements in this view",
  // apps/web/src/screens/organization/accounting/trip-accounting.tsx
  "screen.organization.accounting.tripAccounting.title": "Trip accounting",
  "screen.organization.accounting.tripAccounting.caption":
    "Five accounting lines for one trip · {trip}",
  "screen.organization.accounting.tripAccounting.trip": "Trip",
  "screen.organization.accounting.tripAccounting.noTrips": "No trips yet",
  "screen.organization.accounting.tripAccounting.openLedger": "Open ledger",
  "screen.organization.accounting.tripAccounting.baseRevenue": "Base revenue",
  "screen.organization.accounting.tripAccounting.programRevenue": "Program revenue",
  "screen.organization.accounting.tripAccounting.couponImpact": "Coupon impact",
  "screen.organization.accounting.tripAccounting.supplierCosts": "Supplier costs",
  "screen.organization.accounting.tripAccounting.gatewayFees": "Gateway fees",
  "screen.organization.accounting.tripAccounting.reconciliationWithTheLedger":
    "Reconciliation with the ledger",
  "screen.organization.accounting.tripAccounting.reconciled": "Reconciled",
  "screen.organization.accounting.tripAccounting.differencesFound": "Differences found",
  "screen.organization.accounting.tripAccounting.line": "Line",
  "screen.organization.accounting.tripAccounting.tripTotal": "Trip total",
  "screen.organization.accounting.tripAccounting.ledgerTotal": "Ledger total",
  "screen.organization.accounting.tripAccounting.difference": "Difference",
  "screen.organization.accounting.tripAccounting.growthShowsAdvancedAccounting":
    "Growth shows advanced accounting",
  "screen.organization.accounting.tripAccounting.enterpriseShowsTheFullDetail":
    "Enterprise shows the full detail for every line.",
  // apps/web/src/screens/organization/billing/billing-parts.tsx
  "screen.organization.billing.billingParts.nOfLimit": "{n} of {limit}",
  "screen.organization.billing.billingParts.unlimited": "Unlimited",
  // apps/web/src/screens/organization/billing/invoices-list.tsx
  "screen.organization.billing.invoicesList.title": "Invoices",
  "screen.organization.billing.invoicesList.caption": "Invoices your organization has issued",
  "screen.organization.billing.invoicesList.issueInvoice": "Issue invoice",
  "screen.organization.billing.invoicesList.filterByBuyerType": "Filter invoices by buyer type",
  "screen.organization.billing.invoicesList.all": "All",
  "screen.organization.billing.invoicesList.businessB2b": "Business (B2B)",
  "screen.organization.billing.invoicesList.consumerB2c": "Consumer (B2C)",
  "screen.organization.billing.invoicesList.number": "Number",
  "screen.organization.billing.invoicesList.type": "Type",
  "screen.organization.billing.invoicesList.buyer": "Buyer",
  "screen.organization.billing.invoicesList.amount": "Amount",
  "screen.organization.billing.invoicesList.status": "Status",
  "screen.organization.billing.invoicesList.action": "Action",
  "screen.organization.billing.invoicesList.b2b": "B2B",
  "screen.organization.billing.invoicesList.b2c": "B2C",
  "screen.organization.billing.invoicesList.issued": "Issued",
  "screen.organization.billing.invoicesList.openInvoice": "Open invoice",
  "screen.organization.billing.invoicesList.noInvoicesYet": "No invoices yet",
  "screen.organization.billing.invoicesList.noMatchingInvoices": "No invoices of this type",
  "screen.organization.billing.invoicesList.issueAnInvoiceForA":
    "Issue an invoice for a trip or booking.",
  // apps/web/src/screens/organization/billing/issue-invoice-b2b-or-b2c.tsx
  "screen.organization.billing.issueInvoiceB2bOrB2c.title": "Issue invoice",
  "screen.organization.billing.issueInvoiceB2bOrB2c.caption": "For a trip or booking · {trip}",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoice": "Issue invoice",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addTheBuyerName":
    "Add the buyer name to issue the invoice.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addTheBuyerTaxNumber":
    "Add the buyer tax number. It is required for business buyers.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addLinesFromABooking":
    "The invoice needs lines from a paid booking before it can be issued.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueFailed": "The invoice was not issued",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueFailedBody":
    "Check the details and try again. Nothing was saved.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyer": "Buyer",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceType": "Invoice type",
  "screen.organization.billing.issueInvoiceB2bOrB2c.businessB2b": "Business (B2B)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.consumerB2c": "Consumer (B2C)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerName": "Buyer name",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerTaxNumber": "Buyer tax number",
  "screen.organization.billing.issueInvoiceB2bOrB2c.requiredForBusinessBuyers":
    "Required for business buyers.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerAddress": "Buyer address",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerEmail": "Buyer email",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines": "Invoice lines",
  "screen.organization.billing.issueInvoiceB2bOrB2c.line": "Line",
  "screen.organization.billing.issueInvoiceB2bOrB2c.qty": "Qty",
  "screen.organization.billing.issueInvoiceB2bOrB2c.unitPrice": "Unit price",
  "screen.organization.billing.issueInvoiceB2bOrB2c.tax": "Tax",
  "screen.organization.billing.issueInvoiceB2bOrB2c.total": "Total",
  "screen.organization.billing.issueInvoiceB2bOrB2c.subtotal": "Subtotal",
  "screen.organization.billing.issueInvoiceB2bOrB2c.programsOf": "Programs · {reference}",
  "screen.organization.billing.issueInvoiceB2bOrB2c.noLines": "No booking lines for this trip yet",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceNumber": "Invoice number",
  "screen.organization.billing.issueInvoiceB2bOrB2c.assignedWhenIssued":
    "Assigned when the invoice is issued",
  "screen.organization.billing.issueInvoiceB2bOrB2c.saudiEInvoicingScope":
    "Saudi e-invoicing scope is still open",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issuingInSaudiArabiaWaits":
    "Issuing in Saudi Arabia waits for the scope decision (D-11). An issued invoice creates a ledger entry.",
  // apps/web/src/screens/organization/billing/subscription-and-billing.tsx
  "screen.organization.billing.subscriptionAndBilling.title": "Subscription and billing",
  "screen.organization.billing.subscriptionAndBilling.caption":
    "Your plan, usage against limits and billing",
  "screen.organization.billing.subscriptionAndBilling.changePlan": "Change plan",
  "screen.organization.billing.subscriptionAndBilling.choosePlan": "Choose a plan",
  "screen.organization.billing.subscriptionAndBilling.planWithPrice": "{plan} · {price}",
  "screen.organization.billing.subscriptionAndBilling.changeFailed":
    "The plan could not be changed. Try again.",
  "screen.organization.billing.subscriptionAndBilling.cancel": "Cancel",
  "screen.organization.billing.subscriptionAndBilling.confirmPlanChange": "Confirm plan change",
  "screen.organization.billing.subscriptionAndBilling.currentPlan": "Current plan",
  "screen.organization.billing.subscriptionAndBilling.active": "Active",
  "screen.organization.billing.subscriptionAndBilling.trial": "Trial",
  "screen.organization.billing.subscriptionAndBilling.pastDue": "Past due",
  "screen.organization.billing.subscriptionAndBilling.cancelled": "Cancelled",
  "screen.organization.billing.subscriptionAndBilling.renewsOn": "Renews on {date}",
  "screen.organization.billing.subscriptionAndBilling.billingCycle": "Billing cycle",
  "screen.organization.billing.subscriptionAndBilling.monthly": "Monthly",
  "screen.organization.billing.subscriptionAndBilling.annual": "Annual",
  "screen.organization.billing.subscriptionAndBilling.annualBillingSaves":
    "Annual billing saves {discount} off the monthly total.",
  "screen.organization.billing.subscriptionAndBilling.paymentMethod": "Payment method",
  "screen.organization.billing.subscriptionAndBilling.noPaymentMethodOnFile":
    "No payment method on file",
  "screen.organization.billing.subscriptionAndBilling.update": "Update",
  "screen.organization.billing.subscriptionAndBilling.usageAgainstLimits": "Usage against limits",
  "screen.organization.billing.subscriptionAndBilling.activeTripsThisMonth":
    "Active trips this month",
  "screen.organization.billing.subscriptionAndBilling.employees": "Employees",
  "screen.organization.billing.subscriptionAndBilling.vehiclesPerTrip": "Vehicles per trip",
  "screen.organization.billing.subscriptionAndBilling.programsPerTrip": "Programs per trip",
  "screen.organization.billing.subscriptionAndBilling.coupons": "Coupons",
  "screen.organization.billing.subscriptionAndBilling.upgradesApplyAtOnce":
    "Upgrades apply at once, prorated",
  "screen.organization.billing.subscriptionAndBilling.downgradesTakeEffect":
    "Downgrades take effect at the end of your billing cycle, on {date}.",
  // apps/web/src/screens/organization/bookings/booking-detail.tsx
  "screen.organization.bookings.bookingDetail.traveler": "Traveler",
  "screen.organization.bookings.bookingDetail.seat": "Seat",
  "screen.organization.bookings.bookingDetail.newSeatFor": "New seat for {name}",
  "screen.organization.bookings.bookingDetail.notAssigned": "Not assigned",
  "screen.organization.bookings.bookingDetail.checkIn": "Check-in",
  "screen.organization.bookings.bookingDetail.checkedIn": "Checked in",
  "screen.organization.bookings.bookingDetail.notCheckedIn": "Not checked in",
  "screen.organization.bookings.bookingDetail.action": "Action",
  "screen.organization.bookings.bookingDetail.cancel": "Cancel",
  "screen.organization.bookings.bookingDetail.reassignSeat": "Reassign seat",
  "screen.organization.bookings.bookingDetail.program": "Program",
  "screen.organization.bookings.bookingDetail.quantity": "Quantity",
  "screen.organization.bookings.bookingDetail.amount": "Amount",
  "screen.organization.bookings.bookingDetail.title": "Booking {reference}",
  "screen.organization.bookings.bookingDetail.caption": "{trip} · Booked by {booker}",
  "screen.organization.bookings.bookingDetail.issueRefund": "Issue refund",
  "screen.organization.bookings.bookingDetail.saveChange": "Save change",
  "screen.organization.bookings.bookingDetail.saveHint":
    "Choose Reassign seat on a traveler and enter the new seat first.",
  "screen.organization.bookings.bookingDetail.emptyTitle": "No booking to show",
  "screen.organization.bookings.bookingDetail.emptyBody":
    "Open a booking from Bookings and travelers.",
  "screen.organization.bookings.bookingDetail.actionFailed": "The change was not saved. Try again.",
  "screen.organization.bookings.bookingDetail.travelersAndSeats": "Travelers and seats",
  "screen.organization.bookings.bookingDetail.noTravelers": "No travelers on this booking",
  "screen.organization.bookings.bookingDetail.programsAndQuantities": "Programs and quantities",
  "screen.organization.bookings.bookingDetail.noPrograms": "No programs selected",
  "screen.organization.bookings.bookingDetail.paymentAndCoupon": "Payment and coupon",
  "screen.organization.bookings.bookingDetail.paymentStatus": "Payment status",
  "screen.organization.bookings.bookingDetail.totalPaid": "Total paid",
  "screen.organization.bookings.bookingDetail.coupon": "Coupon",
  "screen.organization.bookings.bookingDetail.couponApplied": "{code} applied",
  "screen.organization.bookings.bookingDetail.none": "None",
  "screen.organization.bookings.bookingDetail.refundUnderPolicy": "Refund under policy",
  "screen.organization.bookings.bookingDetail.refundNote":
    'No revenue is reversed until the gateway confirms the refund. Travelers see "refund in progress" meanwhile.',
  "screen.organization.bookings.bookingDetail.confirmRefundTitle":
    "Issue a refund for this booking?",
  "screen.organization.bookings.bookingDetail.keepBooking": "Keep booking",
  // apps/web/src/screens/organization/bookings/booking-parts.tsx
  "screen.organization.bookings.bookingParts.refundPending": "Refund Pending",
  "screen.organization.bookings.bookingParts.confirmed": "Confirmed",
  "screen.organization.bookings.bookingParts.checkedIn": "Checked in",
  "screen.organization.bookings.bookingParts.completed": "Completed",
  "screen.organization.bookings.bookingParts.pendingPayment": "Pending payment",
  "screen.organization.bookings.bookingParts.refunded": "Refunded",
  "screen.organization.bookings.bookingParts.cancelled": "Cancelled",
  "screen.organization.bookings.bookingParts.refundInProgress": "Refund in progress",
  "screen.organization.bookings.bookingParts.unpaid": "Unpaid",
  "screen.organization.bookings.bookingParts.paid": "Paid",
  // apps/web/src/screens/organization/bookings/bookings-and-travelers.tsx
  "screen.organization.bookings.bookingsAndTravelers.notAssigned": "Not assigned",
  "screen.organization.bookings.bookingsAndTravelers.booking": "Booking",
  "screen.organization.bookings.bookingsAndTravelers.travelers": "Travelers",
  "screen.organization.bookings.bookingsAndTravelers.programs": "Programs",
  "screen.organization.bookings.bookingsAndTravelers.none": "None",
  "screen.organization.bookings.bookingsAndTravelers.seat": "Seat",
  "screen.organization.bookings.bookingsAndTravelers.payment": "Payment",
  "screen.organization.bookings.bookingsAndTravelers.state": "State",
  "screen.organization.bookings.bookingsAndTravelers.traveler": "Traveler",
  "screen.organization.bookings.bookingsAndTravelers.allTrips": "All trips",
  "screen.organization.bookings.bookingsAndTravelers.bookings": "Bookings",
  "screen.organization.bookings.bookingsAndTravelers.cancellationRequests": "Cancellation requests",
  "screen.organization.bookings.bookingsAndTravelers.emptyTitle": "No bookings yet",
  "screen.organization.bookings.bookingsAndTravelers.noMatchTitle": "No bookings match",
  "screen.organization.bookings.bookingsAndTravelers.emptyBody":
    "Bookings appear here when travelers book this trip.",
  "screen.organization.bookings.bookingsAndTravelers.noMatchBody":
    "Try another traveler name or booking reference.",
  "screen.organization.bookings.bookingsAndTravelers.title": "Bookings and travelers",
  "screen.organization.bookings.bookingsAndTravelers.caption": "{trip} · {n} bookings",
  "screen.organization.bookings.bookingsAndTravelers.searchTravelers": "Search travelers",
  "screen.organization.bookings.bookingsAndTravelers.searchPlaceholder":
    "Traveler name or booking reference",
  "screen.organization.bookings.bookingsAndTravelers.bookingViews": "Booking views",
  "screen.organization.bookings.bookingsAndTravelers.noCancellationRequests":
    "No cancellation requests",
  "screen.organization.bookings.bookingsAndTravelers.refundNote":
    'Refunds show to travelers as "refund in progress" until the gateway confirms them.',
  // apps/web/src/screens/organization/bookings/program-enrollment-report.tsx
  "screen.organization.bookings.programEnrollmentReport.bookingReference": "Booking reference",
  "screen.organization.bookings.programEnrollmentReport.quantity": "Quantity",
  "screen.organization.bookings.programEnrollmentReport.revenue": "Revenue",
  "screen.organization.bookings.programEnrollmentReport.total": "Total",
  "screen.organization.bookings.programEnrollmentReport.noPrograms": "No programs on this trip",
  "screen.organization.bookings.programEnrollmentReport.title": "Program enrollment",
  "screen.organization.bookings.programEnrollmentReport.caption":
    "Who selected each program, the quantities and the revenue · {trip}",
  "screen.organization.bookings.programEnrollmentReport.program": "Program",
  "screen.organization.bookings.programEnrollmentReport.export": "Export",
  "screen.organization.bookings.programEnrollmentReport.travelersEnrolled": "Travelers enrolled",
  "screen.organization.bookings.programEnrollmentReport.totalQuantity": "Total quantity",
  "screen.organization.bookings.programEnrollmentReport.programRevenue": "Program revenue",
  "screen.organization.bookings.programEnrollmentReport.emptyTitle": "No enrollments yet",
  "screen.organization.bookings.programEnrollmentReport.emptyBody":
    "Travelers who select this program appear here.",
  "screen.organization.bookings.programEnrollmentReport.planNote":
    "Depth of this report depends on your plan. Export uses the same totals as this table.",
  // apps/web/src/screens/organization/bookings/seat-grid.tsx
  "screen.organization.bookings.seatGrid.held": "Held",
  "screen.organization.bookings.seatGrid.reserved": "Reserved",
  "screen.organization.bookings.seatGrid.blocked": "Blocked",
  "screen.organization.bookings.seatGrid.available": "Available",
  "screen.organization.bookings.seatGrid.seatAria": "Seat {label}, {state}",
  "screen.organization.bookings.seatGrid.picked": "Picked",
  "screen.organization.bookings.seatGrid.legend": "Legend",
  // apps/web/src/screens/organization/bookings/seat-map-and-seat-assignment.tsx
  "screen.organization.bookings.seatMapAndSeatAssignment.seat": "Seat",
  "screen.organization.bookings.seatMapAndSeatAssignment.state": "State",
  "screen.organization.bookings.seatMapAndSeatAssignment.traveler": "Traveler",
  "screen.organization.bookings.seatMapAndSeatAssignment.none": "None",
  "screen.organization.bookings.seatMapAndSeatAssignment.travelerChoice": "traveler choice",
  "screen.organization.bookings.seatMapAndSeatAssignment.organizationAssigned":
    "organization-assigned",
  "screen.organization.bookings.seatMapAndSeatAssignment.map": "Map",
  "screen.organization.bookings.seatMapAndSeatAssignment.list": "List",
  "screen.organization.bookings.seatMapAndSeatAssignment.title": "Seat map",
  "screen.organization.bookings.seatMapAndSeatAssignment.caption":
    "{trip} · Seat mode: {mode} · Updates live",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatViews": "Seat views",
  "screen.organization.bookings.seatMapAndSeatAssignment.assignFailed":
    "The seat was not assigned. It may have been taken; try another seat.",
  "screen.organization.bookings.seatMapAndSeatAssignment.vehicleFrontAtTop":
    "Vehicle {plate} · front of bus at top",
  "screen.organization.bookings.seatMapAndSeatAssignment.noSeats": "No seats to show",
  "screen.organization.bookings.seatMapAndSeatAssignment.noSeatsBody":
    "Add a vehicle with a seat layout to this trip.",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatMap": "Seat map",
  "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelers":
    "Unassigned travelers",
  "screen.organization.bookings.seatMapAndSeatAssignment.everyoneHasASeat":
    "Every traveler has a seat",
  "screen.organization.bookings.seatMapAndSeatAssignment.programLine": "Program {programs}",
  "screen.organization.bookings.seatMapAndSeatAssignment.selected": "Selected",
  "screen.organization.bookings.seatMapAndSeatAssignment.waiting": "Waiting",
  "screen.organization.bookings.seatMapAndSeatAssignment.assignToSeat": "Assign to seat {label}",
  "screen.organization.bookings.seatMapAndSeatAssignment.moveSeat": "Move seat",
  "screen.organization.bookings.seatMapAndSeatAssignment.lockedRule":
    "Checked-in seats are locked. A seat already reserved cannot be assigned.",
  "screen.organization.bookings.seatMapAndSeatAssignment.moveHint":
    "To move a traveler, pick their reserved seat, then a free seat.",
  // apps/web/src/screens/organization/common/org-shared.tsx
  "screen.organization.common.orgShared.step.basics": "Basics",
  "screen.organization.common.orgShared.step.schedule": "Schedule and route",
  "screen.organization.common.orgShared.step.vehicles": "Vehicles",
  "screen.organization.common.orgShared.step.staffing": "Staffing",
  "screen.organization.common.orgShared.step.programs": "Programs",
  "screen.organization.common.orgShared.step.seating": "Seating",
  "screen.organization.common.orgShared.step.pricing": "Pricing",
  "screen.organization.common.orgShared.step.publish": "Publish",
  "screen.organization.common.orgShared.stepCaption": "Step {n} of 8: {step}",
  "screen.organization.common.orgShared.stepCaption.basics": "basics",
  "screen.organization.common.orgShared.stepCaption.schedule": "schedule and route",
  "screen.organization.common.orgShared.stepCaption.vehicles": "vehicles",
  "screen.organization.common.orgShared.stepCaption.staffing": "staffing",
  "screen.organization.common.orgShared.stepCaption.programs": "programs",
  "screen.organization.common.orgShared.stepCaption.seating": "seating",
  "screen.organization.common.orgShared.stepCaption.pricing": "pricing and capacity",
  "screen.organization.common.orgShared.stepCaption.publish": "publish",
  "screen.organization.common.orgShared.stepDone": "(done)",
  "screen.organization.common.orgShared.tripWizardProgress": "Trip wizard steps",
  "screen.organization.common.orgShared.createTrip": "Create trip",
  "screen.organization.common.orgShared.back": "Back",
  "screen.organization.common.orgShared.next": "Next",
  "screen.organization.common.orgShared.saveAsDraft": "Save as draft",
  "screen.organization.common.orgShared.tripState.draft": "Draft",
  "screen.organization.common.orgShared.tripState.published": "Published",
  "screen.organization.common.orgShared.tripState.negotiating": "Negotiating",
  "screen.organization.common.orgShared.tripState.ready": "Ready",
  "screen.organization.common.orgShared.tripState.fillingUp": "Filling Up",
  "screen.organization.common.orgShared.tripState.soldOut": "Sold Out",
  "screen.organization.common.orgShared.tripState.inProgress": "In Progress",
  "screen.organization.common.orgShared.tripState.partiallyCompleted": "Partially Completed",
  "screen.organization.common.orgShared.tripState.completed": "Completed",
  "screen.organization.common.orgShared.tripState.postProcessing": "Post-Processing",
  "screen.organization.common.orgShared.tripState.archived": "Archived",
  "screen.organization.common.orgShared.tripState.cancelled": "Cancelled",
  "screen.organization.common.orgShared.tripState.refundsIssued": "Refunds Issued",
  // apps/web/src/screens/organization/common/org-ui.tsx
  "screen.organization.common.orgUi.loading": "Loading",
  "screen.organization.common.orgUi.loadFailedTitle": "This page could not load",
  "screen.organization.common.orgUi.loadFailedBody":
    "Check your connection and try again. Nothing you entered was lost.",
  "screen.organization.common.orgUi.tryAgain": "Try again",
  // apps/web/src/screens/organization/coupons/coupon-analytics.tsx
  "screen.organization.coupons.couponAnalytics.unlimited": "Unlimited",
  "screen.organization.coupons.couponAnalytics.coupon": "Coupon",
  "screen.organization.coupons.couponAnalytics.redemptions": "Redemptions",
  "screen.organization.coupons.couponAnalytics.discountTotal": "Discount total",
  "screen.organization.coupons.couponAnalytics.remainingUses": "Remaining uses",
  "screen.organization.coupons.couponAnalytics.status": "Status",
  "screen.organization.coupons.couponAnalytics.allTime": "All time",
  "screen.organization.coupons.couponAnalytics.last30Days": "Last 30 days",
  "screen.organization.coupons.couponAnalytics.last90Days": "Last 90 days",
  "screen.organization.coupons.couponAnalytics.last12Months": "Last 12 months",
  "screen.organization.coupons.couponAnalytics.title": "Coupon analytics",
  "screen.organization.coupons.couponAnalytics.caption":
    "Redemptions, discount total and remaining uses for each coupon",
  "screen.organization.coupons.couponAnalytics.dateRange": "Date range",
  "screen.organization.coupons.couponAnalytics.export": "Export",
  "screen.organization.coupons.couponAnalytics.growthBasicView": "Growth shows the basic view",
  "screen.organization.coupons.couponAnalytics.enterpriseFullSet":
    "Enterprise shows the full set of coupon metrics.",
  "screen.organization.coupons.couponAnalytics.totalRedemptions": "Total redemptions",
  "screen.organization.coupons.couponAnalytics.emptyTitle": "No coupons yet",
  "screen.organization.coupons.couponAnalytics.emptyBody":
    "Redemptions appear here once travelers use your coupons.",
  // apps/web/src/screens/organization/coupons/coupon-editor-form.tsx
  "screen.organization.coupons.couponEditorForm.fixedAmount": "Fixed amount",
  "screen.organization.coupons.couponEditorForm.percentage": "Percentage",
  "screen.organization.coupons.couponEditorForm.programSpecific": "Program-specific",
  "screen.organization.coupons.couponEditorForm.freeProgram": "Free program",
  "screen.organization.coupons.couponEditorForm.firstBooking": "First booking",
  "screen.organization.coupons.couponEditorForm.minimumSpend": "Minimum spend",
  "screen.organization.coupons.couponEditorForm.codeAndValue": "Code and value",
  "screen.organization.coupons.couponEditorForm.code": "Code",
  "screen.organization.coupons.couponEditorForm.generate": "Generate",
  "screen.organization.coupons.couponEditorForm.couponType": "Coupon type",
  "screen.organization.coupons.couponEditorForm.value": "Value",
  "screen.organization.coupons.couponEditorForm.valuePercentHint": "Percent off the booking",
  "screen.organization.coupons.couponEditorForm.valueAmountHint": "Amount off the booking",
  "screen.organization.coupons.couponEditorForm.scope": "Scope",
  "screen.organization.coupons.couponEditorForm.thisOrganizationsTrips":
    "This organization's trips",
  "screen.organization.coupons.couponEditorForm.limitsAndValidity": "Limits and validity",
  "screen.organization.coupons.couponEditorForm.totalLimit": "Total limit",
  "screen.organization.coupons.couponEditorForm.usesHint":
    "Number of uses; leave empty for no limit",
  "screen.organization.coupons.couponEditorForm.perUserLimit": "Per-user limit",
  "screen.organization.coupons.couponEditorForm.validFrom": "Valid from",
  "screen.organization.coupons.couponEditorForm.validUntil": "Valid until",
  "screen.organization.coupons.couponEditorForm.minimumBookingValue": "Minimum booking value",
  "screen.organization.coupons.couponEditorForm.programs": "Programs",
  "screen.organization.coupons.couponEditorForm.audienceAndStacking": "Audience and stacking",
  "screen.organization.coupons.couponEditorForm.audience": "Audience",
  "screen.organization.coupons.couponEditorForm.public": "Public",
  "screen.organization.coupons.couponEditorForm.targetedAudienceList": "Targeted audience list",
  "screen.organization.coupons.couponEditorForm.canBeCombined":
    "Can be combined with other coupons",
  // apps/web/src/screens/organization/coupons/coupon-editor.tsx
  "screen.organization.coupons.couponEditor.allPrograms": "All programs",
  "screen.organization.coupons.couponEditor.codeTooShort": "Enter a code of at least 3 characters.",
  "screen.organization.coupons.couponEditor.couponTitle": "Coupon {code}",
  "screen.organization.coupons.couponEditor.createCoupon": "Create coupon",
  "screen.organization.coupons.couponEditor.caption":
    "Scope: this organization's trips only · {counted} coupons counted",
  "screen.organization.coupons.couponEditor.viewAnalytics": "View analytics",
  "screen.organization.coupons.couponEditor.saveAsDraft": "Save as draft",
  "screen.organization.coupons.couponEditor.saveCoupon": "Save coupon",
  "screen.organization.coupons.couponEditor.notFoundTitle": "This coupon was not found",
  "screen.organization.coupons.couponEditor.notFoundBody":
    "It may belong to another organization or have been removed.",
  "screen.organization.coupons.couponEditor.savedTitle": "This coupon is saved",
  "screen.organization.coupons.couponEditor.savedBody":
    "Its code and value cannot change. Pause, resume or revoke it from Coupons.",
  "screen.organization.coupons.couponEditor.saveFailed": "The coupon was not saved",
  "screen.organization.coupons.couponEditor.saveFailedBody":
    "The code may already be in use, or your plan limit is reached.",
  "screen.organization.coupons.couponEditor.draftNote":
    "A coupon saved as Draft is not shown to travelers. Activate it when you are ready.",
  // apps/web/src/screens/organization/coupons/coupon-parts.tsx
  "screen.organization.coupons.couponParts.nOfLimit": "{n} of {limit}",
  "screen.organization.coupons.couponParts.unlimited": "Unlimited",
  "screen.organization.coupons.couponParts.percentage": "Percentage",
  "screen.organization.coupons.couponParts.fixedAmount": "Fixed amount",
  "screen.organization.coupons.couponParts.active": "Active",
  "screen.organization.coupons.couponParts.paused": "Paused",
  "screen.organization.coupons.couponParts.revoked": "Revoked",
  "screen.organization.coupons.couponParts.expired": "Expired",
  // apps/web/src/screens/organization/coupons/coupons-list.tsx
  "screen.organization.coupons.couponsList.code": "Code",
  "screen.organization.coupons.couponsList.type": "Type",
  "screen.organization.coupons.couponsList.value": "Value",
  "screen.organization.coupons.couponsList.status": "Status",
  "screen.organization.coupons.couponsList.redemptions": "Redemptions",
  "screen.organization.coupons.couponsList.remainingUses": "Remaining uses",
  "screen.organization.coupons.couponsList.action": "Action",
  "screen.organization.coupons.couponsList.none": "None",
  "screen.organization.coupons.couponsList.pause": "Pause",
  "screen.organization.coupons.couponsList.resume": "Resume",
  "screen.organization.coupons.couponsList.revoke": "Revoke",
  "screen.organization.coupons.couponsList.all": "All",
  "screen.organization.coupons.couponsList.active": "Active",
  "screen.organization.coupons.couponsList.paused": "Paused",
  "screen.organization.coupons.couponsList.revoked": "Revoked",
  "screen.organization.coupons.couponsList.createCoupon": "Create coupon",
  "screen.organization.coupons.couponsList.title": "Coupons",
  "screen.organization.coupons.couponsList.caption":
    "Your organization's coupons · {counted} counted",
  "screen.organization.coupons.couponsList.couponsCountedAgainstPlan":
    "Coupons counted against plan",
  "screen.organization.coupons.couponsList.redemptionsThisMonth": "Redemptions this month",
  "screen.organization.coupons.couponsList.filterByStatus": "Filter coupons by status",
  "screen.organization.coupons.couponsList.emptyTitle": "No coupons yet",
  "screen.organization.coupons.couponsList.noMatchTitle": "No coupons match",
  "screen.organization.coupons.couponsList.emptyBody":
    "Create a coupon to offer travelers a discount on your trips.",
  "screen.organization.coupons.couponsList.noMatchBody": "Choose another status.",
  "screen.organization.coupons.couponsList.revokeThisCoupon": "Revoke this coupon?",
  "screen.organization.coupons.couponsList.revokeBody":
    "Travelers can no longer use it. Bookings that already used it keep their discount.",
  "screen.organization.coupons.couponsList.keepCoupon": "Keep coupon",
  // apps/web/src/screens/organization/entries-part-1.ts
  "screen.registry.organization.workspaceHome.title": "Workspace home",
  "screen.registry.organization.employeeInvitationAcceptance.title":
    "Employee invitation acceptance",
  "screen.registry.organization.organizationProfileSettingsAndBranding.title":
    "Organization profile, settings and branding",
  "screen.registry.organization.tripsList.title": "Trips list",
  "screen.registry.organization.tripWizardStep1Basics.title": "Trip wizard step 1: basics",
  "screen.registry.organization.tripWizardStep2ScheduleAndRoute.title":
    "Trip wizard step 2: schedule and route",
  "screen.registry.organization.tripWizardStep3Vehicles.title": "Trip wizard step 3: vehicles",
  "screen.registry.organization.tripWizardStep4Staffing.title": "Trip wizard step 4: staffing",
  "screen.registry.organization.tripWizardStep5Programs.title": "Trip wizard step 5: programs",
  "screen.registry.organization.tripWizardStep6Seating.title": "Trip wizard step 6: seating",
  "screen.registry.organization.tripWizardStep7PricingAndCapacity.title":
    "Trip wizard step 7: pricing and capacity",
  "screen.registry.organization.tripWizardStep8Publish.title": "Trip wizard step 8: publish",
  "screen.registry.organization.programEditor.title": "Program editor",
  "screen.registry.organization.tripCommandView.title": "Trip command view",
  "screen.registry.organization.cancelTripDecision.title": "Cancel trip (decision)",
  "screen.registry.organization.vehicleRegistry.title": "Vehicle registry",
  "screen.registry.organization.vehicleEditor.title": "Vehicle editor",
  "screen.registry.organization.vehicleTypesAndSeatLayout.title": "Vehicle types and seat layout",
  "screen.registry.organization.staffingBoard.title": "Staffing board",
  "screen.registry.organization.organizationOwnedDriversAndPhotographers.title":
    "Organization-owned drivers and photographers",
  "screen.registry.organization.platformSupplierSearchAndDealStart.title":
    "Platform supplier search and deal start",
  // apps/web/src/screens/organization/entries-part-2.ts
  "screen.registry.organization.dealDetailAndNegotiation.title": "Deal detail and negotiation",
  "screen.registry.organization.bookingsAndTravelers.title": "Bookings and travelers",
  "screen.registry.organization.bookingDetail.title": "Booking detail",
  "screen.registry.organization.seatMapAndSeatAssignment.title": "Seat map and seat assignment",
  "screen.registry.organization.programEnrollmentReport.title": "Program enrollment report",
  "screen.registry.organization.couponsList.title": "Coupons list",
  "screen.registry.organization.couponEditor.title": "Coupon editor",
  "screen.registry.organization.couponAnalytics.title": "Coupon analytics",
  "screen.registry.organization.tripAccounting.title": "Trip accounting",
  "screen.registry.organization.ledgerAndExports.title": "Ledger and exports",
  "screen.registry.organization.settlements.title": "Settlements",
  "screen.registry.organization.subscriptionAndBilling.title": "Subscription and billing",
  "screen.registry.organization.employeesList.title": "Employees list",
  "screen.registry.organization.employeeInvitationAndPermissions.title":
    "Employee invitation and permissions",
  "screen.registry.organization.crmAndWebhooks.title": "CRM and webhooks",
  "screen.registry.organization.invoicesList.title": "Invoices list",
  "screen.registry.organization.issueInvoiceB2bOrB2c.title": "Issue invoice (B2B or B2C)",
  "screen.registry.organization.analyticsAndReports.title": "Analytics and reports",
  "screen.registry.organization.liveOperations.title": "Live operations",
  "screen.registry.organization.tripReportReview.title": "Trip report review",
  "screen.registry.organization.childSafetyReports.title": "Child-safety reports",
  // apps/web/src/screens/organization/operations/analytics-and-reports.tsx
  "screen.organization.operations.analyticsAndReports.title": "Analytics and reports",
  "screen.organization.operations.analyticsAndReports.caption":
    "Trips, programs, coupons and revenue",
  "screen.organization.operations.analyticsAndReports.starterLockedPreview":
    "Starter: locked preview",
  "screen.organization.operations.analyticsAndReports.growthBasicView": "Growth: basic view",
  "screen.organization.operations.analyticsAndReports.enterpriseFullView": "Enterprise: full view",
  "screen.organization.operations.analyticsAndReports.dateRange": "Date range",
  "screen.organization.operations.analyticsAndReports.allTime": "All time",
  "screen.organization.operations.analyticsAndReports.thisMonth": "This month",
  "screen.organization.operations.analyticsAndReports.last30Days": "Last 30 days",
  "screen.organization.operations.analyticsAndReports.thisYear": "This year",
  "screen.organization.operations.analyticsAndReports.export": "Export",
  "screen.organization.operations.analyticsAndReports.programEnrollment": "Program enrollment",
  "screen.organization.operations.analyticsAndReports.nTravelers": "{n} travelers",
  "screen.organization.operations.analyticsAndReports.acrossNTrips":
    "Enrolled in programs across {trips} trips.",
  "screen.organization.operations.analyticsAndReports.couponRedemption": "Coupon redemption",
  "screen.organization.operations.analyticsAndReports.nRedemptions": "{n} redemptions",
  "screen.organization.operations.analyticsAndReports.nActiveCoupons":
    "{n} active coupons. Full analytics on Enterprise.",
  "screen.organization.operations.analyticsAndReports.revenue": "Revenue",
  "screen.organization.operations.analyticsAndReports.netOfCoupons":
    "Net of coupons and gateway fees.",
  "screen.organization.operations.analyticsAndReports.openReport": "Open report",
  "screen.organization.operations.analyticsAndReports.planViewsDiffer": "Plan views differ",
  "screen.organization.operations.analyticsAndReports.starterShowsALockedPreview":
    "Starter shows a locked preview with an upgrade prompt. Growth shows the basic view and Enterprise shows the full view.",
  // apps/web/src/screens/organization/operations/child-safety-reports.tsx
  "screen.organization.operations.childSafetyReports.title": "Child-safety reports",
  "screen.organization.operations.childSafetyReports.caption":
    "Concerns about trips your organization runs, with their status",
  "screen.organization.operations.childSafetyReports.everyCaseIsRouted": "Every case is routed",
  "screen.organization.operations.childSafetyReports.escalationContactBody":
    "Escalation contact: {contact}. A case with no contact configured is blocked until one is set.",
  "screen.organization.operations.childSafetyReports.contactToBeConfirmed": "to be confirmed",
  "screen.organization.operations.childSafetyReports.yourCases": "Your cases",
  "screen.organization.operations.childSafetyReports.case": "Case",
  "screen.organization.operations.childSafetyReports.status": "Status",
  "screen.organization.operations.childSafetyReports.time": "Time",
  "screen.organization.operations.childSafetyReports.trip": "Trip",
  "screen.organization.operations.childSafetyReports.vehicle": "Vehicle",
  "screen.organization.operations.childSafetyReports.routedToEscalationContact":
    "Routed to escalation contact",
  "screen.organization.operations.childSafetyReports.caseOpen": "Case open",
  "screen.organization.operations.childSafetyReports.noCases": "No cases for this trip",
  "screen.organization.operations.childSafetyReports.newReport": "New report",
  "screen.organization.operations.childSafetyReports.noTrips": "No trips yet",
  "screen.organization.operations.childSafetyReports.noVehicle": "No specific vehicle",
  "screen.organization.operations.childSafetyReports.description": "Description",
  "screen.organization.operations.childSafetyReports.submitFailed":
    "The report was not submitted. Try again.",
  "screen.organization.operations.childSafetyReports.reportSubmitted": "Report submitted",
  "screen.organization.operations.childSafetyReports.submitReport": "Submit report",
  // apps/web/src/screens/organization/operations/live-operations.tsx
  "screen.organization.operations.liveOperations.title": "Live operations",
  "screen.organization.operations.liveOperations.tripInState": "{trip} · {state}",
  "screen.organization.operations.liveOperations.lastUpdate":
    "Last update {time} · Positions update within 500 ms",
  "screen.organization.operations.liveOperations.childTrackingOn": "Child tracking on",
  "screen.organization.operations.liveOperations.childTrackingOff": "Child tracking off",
  "screen.organization.operations.liveOperations.noTripInProgress": "No trip to follow yet",
  "screen.organization.operations.liveOperations.occupancyAppearsWhenATrip":
    "Vehicles, occupancy and incidents appear here when a trip is running.",
  "screen.organization.operations.liveOperations.liveMap": "Live map",
  "screen.organization.operations.liveOperations.liveVehiclePositions": "Live vehicle positions",
  "screen.organization.operations.liveOperations.vehiclePositionUpdated":
    "Latest vehicle position shown, updated {time}.",
  "screen.organization.operations.liveOperations.noPositionYet":
    "No vehicle position received yet.",
  "screen.organization.operations.liveOperations.vehiclesInProgress": "Vehicles in progress",
  "screen.organization.operations.liveOperations.noVehiclesInProgress": "No vehicles on this trip",
  "screen.organization.operations.liveOperations.occupancyNOfSeats":
    "Occupancy {n} of {seats} checked in",
  "screen.organization.operations.liveOperations.moving": "Moving",
  "screen.organization.operations.liveOperations.stopped": "Stopped",
  "screen.organization.operations.liveOperations.noSignal": "No signal",
  "screen.organization.operations.liveOperations.incidentFeed": "Incident feed",
  "screen.organization.operations.liveOperations.noIncidents": "No incidents reported.",
  "screen.organization.operations.liveOperations.incidentLine": "{time} · {plate} · {description}",
  "screen.organization.operations.liveOperations.travelerLookup": "Traveler lookup",
  "screen.organization.operations.liveOperations.showsTheVehicleOnly":
    "Shows the vehicle only, never a location.",
  "screen.organization.operations.liveOperations.noTravelerFound":
    "No traveler with that name on this trip.",
  // apps/web/src/screens/organization/operations/trip-report-review.tsx
  "screen.organization.operations.tripReportReview.title": "Trip report review",
  "screen.organization.operations.tripReportReview.caption":
    "{trip} · End-of-trip reports from each moderator",
  "screen.organization.operations.tripReportReview.moderatorReportsPerVehicle":
    "Moderator reports per vehicle",
  "screen.organization.operations.tripReportReview.vehicle": "Vehicle",
  "screen.organization.operations.tripReportReview.finalHeadcount": "Final headcount",
  "screen.organization.operations.tripReportReview.checkedIn": "Checked in",
  "screen.organization.operations.tripReportReview.submittedAt": "Submitted",
  "screen.organization.operations.tripReportReview.status": "Status",
  "screen.organization.operations.tripReportReview.incidents": "Incidents",
  "screen.organization.operations.tripReportReview.notYet": "Not yet",
  "screen.organization.operations.tripReportReview.submitted": "Submitted",
  "screen.organization.operations.tripReportReview.headcountDiffers": "Headcount differs",
  "screen.organization.operations.tripReportReview.reportPending": "Report pending",
  "screen.organization.operations.tripReportReview.noReportsYet": "No vehicles on this trip yet",
  "screen.organization.operations.tripReportReview.reportsAppearHereAfterEach":
    "Each moderator's report appears here after the trip ends.",
  "screen.organization.operations.tripReportReview.headcountMismatch": "Headcount mismatch",
  "screen.organization.operations.tripReportReview.nCountedNCheckedIn":
    "{counted} counted, {checkedIn} checked in",
  "screen.organization.operations.tripReportReview.moderatorsReason":
    "Moderator's reason: {reason}.",
  "screen.organization.operations.tripReportReview.submittedAtReadOnly":
    "Submitted at {time} for {plate}. Read only for the moderator.",
  "screen.organization.operations.tripReportReview.noMismatch":
    "Every submitted headcount matches check-in.",
  "screen.organization.operations.tripReportReview.organizationNote": "Organization note",
  "screen.organization.operations.tripReportReview.addANote":
    "Add a note (notes can be added, not edited)",
  "screen.organization.operations.tripReportReview.savingNotesIsNotAvailable":
    "Saving notes is not available yet.",
  "screen.organization.operations.tripReportReview.addNote": "Add note",
  // apps/web/src/screens/organization/people/crm-and-webhooks.tsx
  "screen.organization.people.crmAndWebhooks.title": "CRM and webhooks",
  "screen.organization.people.crmAndWebhooks.caption":
    "Connect a CRM and send signed events to your own system",
  "screen.organization.people.crmAndWebhooks.saveEndpoint": "Save endpoint",
  "screen.organization.people.crmAndWebhooks.addEndpoint": "Add endpoint",
  "screen.organization.people.crmAndWebhooks.notSavedTitle": "Not saved",
  "screen.organization.people.crmAndWebhooks.notSavedBody":
    "Check the endpoint address and the events, then try again.",
  "screen.organization.people.crmAndWebhooks.newSecretTitle": "New signing secret",
  "screen.organization.people.crmAndWebhooks.newSecretBody": "Copy it now. It is shown only once.",
  "screen.organization.people.crmAndWebhooks.crmConnection": "CRM connection",
  "screen.organization.people.crmAndWebhooks.connected": "Connected",
  "screen.organization.people.crmAndWebhooks.notConnected": "Not connected",
  "screen.organization.people.crmAndWebhooks.crmBody":
    "Send bookings and travelers to your CRM. Sync runs when you connect.",
  "screen.organization.people.crmAndWebhooks.disconnectCrm": "Disconnect CRM",
  "screen.organization.people.crmAndWebhooks.connectCrm": "Connect CRM",
  "screen.organization.people.crmAndWebhooks.deliveryLog": "Delivery log",
  "screen.organization.people.crmAndWebhooks.time": "Time",
  "screen.organization.people.crmAndWebhooks.event": "Event",
  "screen.organization.people.crmAndWebhooks.outcome": "Outcome",
  "screen.organization.people.crmAndWebhooks.attempts": "Attempts",
  "screen.organization.people.crmAndWebhooks.noDeliveriesTitle": "No deliveries yet",
  "screen.organization.people.crmAndWebhooks.noDeliveriesBody":
    "Each event sent to your endpoint will be listed here with its outcome.",
  // apps/web/src/screens/organization/people/employee-invitation-acceptance.tsx
  "screen.organization.people.employeeInvitationAcceptance.title": "Join the organization",
  "screen.organization.people.employeeInvitationAcceptance.invitationSentTo":
    "Invitation sent to {email}",
  "screen.organization.people.employeeInvitationAcceptance.caption":
    "You were invited to work in this organization's dashboard",
  "screen.organization.people.employeeInvitationAcceptance.joinedTitle":
    "You joined the organization",
  "screen.organization.people.employeeInvitationAcceptance.joinedBody":
    "You can now open the areas listed below.",
  "screen.organization.people.employeeInvitationAcceptance.checkYourEmail": "Check your email",
  "screen.organization.people.employeeInvitationAcceptance.checkYourEmailBody":
    "Accept with the account that uses the invited email address.",
  "screen.organization.people.employeeInvitationAcceptance.notAcceptedTitle":
    "Invitation not accepted",
  "screen.organization.people.employeeInvitationAcceptance.notAcceptedBody":
    "The invitation may have expired or been used. Ask the organization owner for a new one.",
  "screen.organization.people.employeeInvitationAcceptance.permissionAreasGranted":
    "Permission areas granted",
  "screen.organization.people.employeeInvitationAcceptance.permissionAreasIntro":
    "You can open these areas of the dashboard. Other areas stay hidden.",
  "screen.organization.people.employeeInvitationAcceptance.areasAfterAccept":
    "Your permission areas appear here after you accept.",
  "screen.organization.people.employeeInvitationAcceptance.areasSetByOwner":
    "Permission areas are set by the organization owner and can change later.",
  "screen.organization.people.employeeInvitationAcceptance.invitationCode": "Invitation code",
  "screen.organization.people.employeeInvitationAcceptance.invitationCodeHint":
    "Paste the code from your invitation email.",
  "screen.organization.people.employeeInvitationAcceptance.signInToAccept":
    "Sign in with the invited account to accept.",
  "screen.organization.people.employeeInvitationAcceptance.openWorkspace": "Open workspace",
  "screen.organization.people.employeeInvitationAcceptance.decline": "Decline",
  "screen.organization.people.employeeInvitationAcceptance.acceptInvitation": "Accept invitation",
  // apps/web/src/screens/organization/people/employee-invitation-and-permissions.tsx
  "screen.organization.people.employeeInvitationAndPermissions.emailInvalid":
    "Enter an email address such as name@example.com.",
  "screen.organization.people.employeeInvitationAndPermissions.roleTitleTooShort":
    "Enter a role title of at least 2 characters.",
  "screen.organization.people.employeeInvitationAndPermissions.employeeEmail": "Employee email",
  "screen.organization.people.employeeInvitationAndPermissions.roleTitle": "Role title",
  "screen.organization.people.employeeInvitationAndPermissions.permissionAreas": "Permission areas",
  "screen.organization.people.employeeInvitationAndPermissions.editTitle": "Employee permissions",
  "screen.organization.people.employeeInvitationAndPermissions.title": "Invite employee",
  "screen.organization.people.employeeInvitationAndPermissions.caption":
    "Set the permission areas for this employee. Every change is recorded.",
  "screen.organization.people.employeeInvitationAndPermissions.savePermissions": "Save permissions",
  "screen.organization.people.employeeInvitationAndPermissions.sendInvitation": "Send invitation",
  "screen.organization.people.employeeInvitationAndPermissions.notSavedTitle": "Not saved",
  "screen.organization.people.employeeInvitationAndPermissions.notSavedBody":
    "Check the email address and your plan's employee limit, then try again.",
  "screen.organization.people.employeeInvitationAndPermissions.invitation": "Invitation",
  "screen.organization.people.employeeInvitationAndPermissions.changeHistory": "Change history",
  "screen.organization.people.employeeInvitationAndPermissions.historyCaption":
    "Read only. Each entry shows who changed what, and when.",
  // apps/web/src/screens/organization/people/employees-list.tsx
  "screen.organization.people.employeesList.active": "Active",
  "screen.organization.people.employeesList.invitationSent": "Invitation sent",
  "screen.organization.people.employeesList.suspended": "Suspended",
  "screen.organization.people.employeesList.removed": "Removed",
  "screen.organization.people.employeesList.name": "Name",
  "screen.organization.people.employeesList.email": "Email",
  "screen.organization.people.employeesList.status": "Status",
  "screen.organization.people.employeesList.permissionAreas": "Permission areas",
  "screen.organization.people.employeesList.none": "None",
  "screen.organization.people.employeesList.action": "Action",
  "screen.organization.people.employeesList.removeName": "Remove {name}",
  "screen.organization.people.employeesList.remove": "Remove",
  "screen.organization.people.employeesList.nOfLimit": "{n} of {limit}",
  "screen.organization.people.employeesList.inviteEmployee": "Invite employee",
  "screen.organization.people.employeesList.title": "Employees",
  "screen.organization.people.employeesList.caption":
    "Who can open this dashboard, their status and their permission areas",
  "screen.organization.people.employeesList.employeesOnYourPlan": "Employees on your plan",
  "screen.organization.people.employeesList.invitationsWaiting": "Invitations waiting",
  "screen.organization.people.employeesList.notRemovedTitle": "Employee not removed",
  "screen.organization.people.employeesList.notRemovedBody":
    "Try again. If it keeps failing, reload the page.",
  "screen.organization.people.employeesList.emptyTitle": "No employees yet",
  "screen.organization.people.employeesList.emptyBody":
    "Invite employees and choose the areas each one can open.",
  "screen.organization.people.employeesList.removalNote":
    "Removing an employee ends their access at once. Past audit entries are kept.",
  "screen.organization.people.employeesList.removeThisEmployee": "Remove this employee?",
  "screen.organization.people.employeesList.removeEmployee": "Remove employee",
  "screen.organization.people.employeesList.keepEmployee": "Keep employee",
  // apps/web/src/screens/organization/people/people-parts.tsx
  "screen.organization.people.peopleParts.areaTrips": "Trips",
  "screen.organization.people.peopleParts.areaBookings": "Bookings",
  "screen.organization.people.peopleParts.areaAccounting": "Accounting",
  "screen.organization.people.peopleParts.areaCoupons": "Coupons",
  "screen.organization.people.peopleParts.areaEmployees": "Employees",
  "screen.organization.people.peopleParts.areaFleet": "Fleet",
  "screen.organization.people.peopleParts.areaSubscription": "Subscription",
  "screen.organization.people.peopleParts.areaTracking": "Live tracking",
  "screen.organization.people.peopleParts.areaSettings": "Settings",
  // apps/web/src/screens/organization/people/permission-history.tsx
  "screen.organization.people.permissionHistory.owner": "Owner",
  "screen.organization.people.permissionHistory.employee": "Employee",
  "screen.organization.people.permissionHistory.platformAdmin": "Platform admin",
  "screen.organization.people.permissionHistory.invitationSent": "Invitation sent",
  "screen.organization.people.permissionHistory.invitationResent": "Invitation sent again",
  "screen.organization.people.permissionHistory.invitationAccepted": "Invitation accepted",
  "screen.organization.people.permissionHistory.permissionsChanged": "Permissions changed",
  "screen.organization.people.permissionHistory.statusChanged": "Status changed",
  "screen.organization.people.permissionHistory.statusActive": "Active",
  "screen.organization.people.permissionHistory.statusInvited": "Invited",
  "screen.organization.people.permissionHistory.statusSuspended": "Suspended",
  "screen.organization.people.permissionHistory.statusRemoved": "Removed",
  "screen.organization.people.permissionHistory.none": "None",
  "screen.organization.people.permissionHistory.when": "When",
  "screen.organization.people.permissionHistory.who": "Who",
  "screen.organization.people.permissionHistory.change": "Change",
  "screen.organization.people.permissionHistory.before": "Before",
  "screen.organization.people.permissionHistory.after": "After",
  "screen.organization.people.permissionHistory.caption": "Change history",
  "screen.organization.people.permissionHistory.emptyTitle": "No changes yet",
  "screen.organization.people.permissionHistory.emptyBody":
    "Changes appear here once the invitation is sent.",
  // apps/web/src/screens/organization/people/webhook-form.tsx
  "screen.organization.people.webhookForm.bookingConfirmed": "Booking confirmed",
  "screen.organization.people.webhookForm.bookingCancelled": "Booking cancelled",
  "screen.organization.people.webhookForm.tripPublished": "Trip published",
  "screen.organization.people.webhookForm.checkIn": "Check-in",
  "screen.organization.people.webhookForm.checkOut": "Check-out",
  "screen.organization.people.webhookForm.signingStatus": "Signing status",
  "screen.organization.people.webhookForm.urlInvalid":
    "Enter an address that starts with https://.",
  "screen.organization.people.webhookForm.webhookEndpoint": "Webhook endpoint",
  "screen.organization.people.webhookForm.endpointUrl": "Endpoint URL",
  "screen.organization.people.webhookForm.signingSecretHidden": "Signing secret: ••••••••••••",
  "screen.organization.people.webhookForm.signingSecretAfterSave":
    "A signing secret is created when you save the endpoint.",
  "screen.organization.people.webhookForm.rotateSecret": "Rotate secret",
  "screen.organization.people.webhookForm.sendTest": "Send test",
  "screen.organization.people.webhookForm.sendTestUnavailable":
    "Test deliveries are not available yet.",
  "screen.organization.people.webhookForm.events": "Events",
  "screen.organization.people.webhookForm.eventsRequired": "Choose at least one event.",
  // apps/web/src/screens/organization/staffing/deal-detail-and-negotiation.tsx
  "screen.organization.staffing.dealDetailAndNegotiation.dealWith": "Deal with {name}",
  "screen.organization.staffing.dealDetailAndNegotiation.vehicleLastUpdate":
    "Vehicle {plate} · Last update {time}",
  "screen.organization.staffing.dealDetailAndNegotiation.emptyTitle": "No deal to show",
  "screen.organization.staffing.dealDetailAndNegotiation.emptyBody":
    "Start a deal from the platform supplier search.",
  "screen.organization.staffing.dealDetailAndNegotiation.expiresInHours":
    "Expires in {hours} hours",
  "screen.organization.staffing.dealDetailAndNegotiation.expiryRule":
    "A deal with no answer 72 hours after the last counter-offer is rejected as expired.",
  "screen.organization.staffing.dealDetailAndNegotiation.respondFailed":
    "Your response was not sent. Try again.",
  "screen.organization.staffing.dealDetailAndNegotiation.dealDetails": "Deal details",
  "screen.organization.staffing.dealDetailAndNegotiation.trip": "Trip",
  "screen.organization.staffing.dealDetailAndNegotiation.date": "Date",
  "screen.organization.staffing.dealDetailAndNegotiation.route": "Route",
  "screen.organization.staffing.dealDetailAndNegotiation.currentPay": "Current pay",
  "screen.organization.staffing.dealDetailAndNegotiation.offerHistory": "Offer history",
  "screen.organization.staffing.dealDetailAndNegotiation.proposed": "Proposed",
  "screen.organization.staffing.dealDetailAndNegotiation.organizationProposed":
    "Organization proposed {amount} on {date}",
  "screen.organization.staffing.dealDetailAndNegotiation.counteredByProvider":
    "Countered by Provider",
  "screen.organization.staffing.dealDetailAndNegotiation.counteredByOrganization":
    "Countered by Organization",
  "screen.organization.staffing.dealDetailAndNegotiation.providerCountered":
    "Provider countered at {amount} on {date}",
  "screen.organization.staffing.dealDetailAndNegotiation.organizationCountered":
    "Organization countered at {amount} on {date}",
  "screen.organization.staffing.dealDetailAndNegotiation.yourResponse": "Your response",
  "screen.organization.staffing.dealDetailAndNegotiation.counterAmount": "Counter amount",
  "screen.organization.staffing.dealDetailAndNegotiation.counterVoidsAcceptance":
    "Countering voids any acceptance on this deal until both sides agree again.",
  "screen.organization.staffing.dealDetailAndNegotiation.rejectDeal": "Reject deal",
  "screen.organization.staffing.dealDetailAndNegotiation.acceptOffer": "Accept offer",
  "screen.organization.staffing.dealDetailAndNegotiation.sendCounter": "Send counter",
  // apps/web/src/screens/organization/staffing/organization-owned-drivers-and-photographers.tsx
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.driver": "Driver",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.photographer":
    "Photographer",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.name": "Name",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.type": "Type",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.status": "Status",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.active": "Active",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.inactive": "Inactive",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.vehicleAssignments":
    "Vehicle assignments",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.action": "Action",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove": "Remove",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer":
    "Add driver or photographer",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.fullName": "Full name",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.phone": "Phone",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emailOptional":
    "Email (optional)",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.licenseNumber":
    "License number",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cameraBody": "Camera body",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saving": "Saving…",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saveStaffMember":
    "Save staff member",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cancel": "Cancel",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.title":
    "Organization-owned staff",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.caption":
    "Drivers and photographers your organization employs. Other organizations never see them.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailed":
    "That did not work",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailedBody":
    "The change was not saved. Check the details and try again.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDrivers":
    "Organization-owned drivers",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedPhotographers":
    "Organization-owned photographers",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.tableCaption":
    "Organization-owned drivers and photographers",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emptyTitle":
    "No organization-owned staff yet",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emptyBody":
    "Add a driver or photographer your organization employs.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.assignmentsAcceptedAutomatically":
    "Assignments are accepted automatically",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removingChangesFutureOnly":
    "Removing a person changes future assignments only. Trips already staffed keep their current assignment until you change it.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removeThisStaffMember":
    "Remove this staff member?",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.keep": "Keep",
  // apps/web/src/screens/organization/staffing/platform-supplier-search-and-deal-start.tsx
  "screen.organization.staffing.platformSupplierSearchAndDealStart.verified": "Verified",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.unavailableOnDate":
    "Unavailable on {date}",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.availableOnDate":
    "Available on {date}",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.availabilityUnknown":
    "Availability not checked",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.selected": "Selected",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.selectSupplier":
    "Select supplier",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.title":
    "Find a platform supplier",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.caption":
    "{trip} · Vehicle {plate}",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.searchSuppliers":
    "Search suppliers",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierType": "Supplier type",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.date": "Date",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.emptyTitle":
    "No suppliers match",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.emptyBody":
    "Try another name or supplier type.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.startADeal": "Start a deal",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.trip": "Trip",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.route": "Route",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplier": "Supplier",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.proposedPay": "Proposed pay",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.currency": "Currency",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierSeesDetails":
    "The supplier sees the trip, route, date and pay before they answer.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.sendFailed":
    "The proposal was not sent. Try again.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.selectSupplierFirst":
    "Select a supplier first.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal": "Send proposal",
  // apps/web/src/screens/organization/staffing/staffing-board.tsx
  "screen.organization.staffing.staffingBoard.platformFinalized": "Platform finalized",
  "screen.organization.staffing.staffingBoard.platformNegotiating": "Platform negotiating",
  "screen.organization.staffing.staffingBoard.assigned": "Assigned",
  "screen.organization.staffing.staffingBoard.ownStaff": "Own staff",
  "screen.organization.staffing.staffingBoard.acceptedOwnStaff": "Accepted, own staff",
  "screen.organization.staffing.staffingBoard.notAssigned": "Not assigned",
  "screen.organization.staffing.staffingBoard.missing": "Missing",
  "screen.organization.staffing.staffingBoard.vehicle": "Vehicle",
  "screen.organization.staffing.staffingBoard.driver": "Driver",
  "screen.organization.staffing.staffingBoard.moderator": "Moderator",
  "screen.organization.staffing.staffingBoard.photographer": "Photographer",
  "screen.organization.staffing.staffingBoard.action": "Action",
  "screen.organization.staffing.staffingBoard.openDeal": "Open deal",
  "screen.organization.staffing.staffingBoard.openStaff": "Open staff",
  "screen.organization.staffing.staffingBoard.missingDriverOn": "Missing driver on {plate}.",
  "screen.organization.staffing.staffingBoard.missingModeratorOn": "Missing moderator on {plate}.",
  "screen.organization.staffing.staffingBoard.noTrips": "No trips yet",
  "screen.organization.staffing.staffingBoard.title": "Staffing board",
  "screen.organization.staffing.staffingBoard.caption": "One row per vehicle for the selected trip",
  "screen.organization.staffing.staffingBoard.trip": "Trip",
  "screen.organization.staffing.staffingBoard.readyBlockedByGaps": "Ready is blocked by {n} gaps",
  "screen.organization.staffing.staffingBoard.eachGapHighlighted":
    "Each gap is highlighted in the table.",
  "screen.organization.staffing.staffingBoard.tableCaption": "Staffing for each vehicle",
  "screen.organization.staffing.staffingBoard.emptyTitle": "No vehicles on this trip",
  "screen.organization.staffing.staffingBoard.emptyBody":
    "Add vehicles to the trip to plan its staff.",
  "screen.organization.staffing.staffingBoard.readyNeedsDriverAndModerator":
    "Ready needs a driver and a moderator on every vehicle.",
  "screen.organization.staffing.staffingBoard.openOrganizationOwnedStaff":
    "Open organization-owned staff",
  // apps/web/src/screens/organization/staffing/staffing-parts.tsx
  "screen.organization.staffing.staffingParts.routeFromTo": "{from} to {to}",
  "screen.organization.staffing.staffingParts.driver": "Driver",
  "screen.organization.staffing.staffingParts.photographer": "Photographer",
  "screen.organization.staffing.staffingParts.proposed": "Proposed",
  "screen.organization.staffing.staffingParts.counteredByProvider": "Countered by Provider",
  "screen.organization.staffing.staffingParts.counteredByOrganization": "Countered by Organization",
  "screen.organization.staffing.staffingParts.accepted": "Accepted",
  "screen.organization.staffing.staffingParts.rejected": "Rejected",
  "screen.organization.staffing.staffingParts.expired": "Expired",
  "screen.organization.staffing.staffingParts.cancelled": "Cancelled",
  // apps/web/src/screens/organization/trips/cancel-trip-decision.tsx
  "screen.organization.trips.cancelTripDecision.dateRange": "{start} to {end}",
  "screen.organization.trips.cancelTripDecision.reasonRequired":
    "Enter a reason of at least 3 characters.",
  "screen.organization.trips.cancelTripDecision.cancelTrip": "Cancel trip",
  "screen.organization.trips.cancelTripDecision.cannotBeUndoneTitle": "This cannot be undone",
  "screen.organization.trips.cancelTripDecision.cannotBeUndoneBody":
    "Cancelling notifies every traveler on this trip and queues their refunds.",
  "screen.organization.trips.cancelTripDecision.cancelFailedTitle": "The trip was not cancelled",
  "screen.organization.trips.cancelTripDecision.cancelFailedBody":
    "Nothing changed. Try again in a moment.",
  "screen.organization.trips.cancelTripDecision.reason": "Reason",
  "screen.organization.trips.cancelTripDecision.reasonLabel": "Reason for cancelling (required)",
  "screen.organization.trips.cancelTripDecision.auditNote":
    "The reason is kept in the audit log and shared with the organization owner.",
  "screen.organization.trips.cancelTripDecision.whatHappensNext": "What happens next",
  "screen.organization.trips.cancelTripDecision.affectedBookings": "Affected bookings",
  "screen.organization.trips.cancelTripDecision.nConfirmed": "{n} confirmed",
  "screen.organization.trips.cancelTripDecision.refundPolicy": "Refund policy",
  "screen.organization.trips.cancelTripDecision.refundPolicySummary":
    "A trip cancelled by the organization refunds 100% of every confirmed booking.",
  "screen.organization.trips.cancelTripDecision.bookingsMoveToCancelled":
    "Every confirmed booking moves to Cancelled, then Refunded",
  "screen.organization.trips.cancelTripDecision.travelersNotified":
    "Travelers are notified by email and in the app",
  "screen.organization.trips.cancelTripDecision.refundsQueued":
    "Refunds are queued through the payment gateway",
  "screen.organization.trips.cancelTripDecision.keepTrip": "Keep trip",
  "screen.organization.trips.cancelTripDecision.blockedWhileInProgress":
    "Cancel is blocked while the trip is In Progress.",
  // apps/web/src/screens/organization/trips/program-editor.tsx
  "screen.organization.trips.programEditor.perPerson": "Per person",
  "screen.organization.trips.programEditor.free": "Free",
  "screen.organization.trips.programEditor.byQuantity": "By quantity",
  "screen.organization.trips.programEditor.perGroup": "Per group",
  "screen.organization.trips.programEditor.tiered": "Tiered",
  "screen.organization.trips.programEditor.optional": "Optional",
  "screen.organization.trips.programEditor.preRequired": "Pre-required",
  "screen.organization.trips.programEditor.capacityLimited": "Capacity-limited",
  "screen.organization.trips.programEditor.vipOnly": "VIP-only",
  "screen.organization.trips.programEditor.nameRequired": "Enter a program name to save.",
  "screen.organization.trips.programEditor.programCaption": "Program {name}",
  "screen.organization.trips.programEditor.newProgram": "New program",
  "screen.organization.trips.programEditor.editProgram": "Edit program",
  "screen.organization.trips.programEditor.saveProgram": "Save program",
  "screen.organization.trips.programEditor.bookingsAffectedTitle":
    "Confirmed bookings are affected",
  "screen.organization.trips.programEditor.bookingsAffectedBody":
    "Travelers are notified and offered a remedy before this change takes effect.",
  "screen.organization.trips.programEditor.saveFailedTitle": "The program was not saved",
  "screen.organization.trips.programEditor.saveFailedBody": "Check the fields and try again.",
  "screen.organization.trips.programEditor.programDetails": "Program details",
  "screen.organization.trips.programEditor.programName": "Program name",
  "screen.organization.trips.programEditor.pricingModelChooseOne": "Pricing model (choose one)",
  "screen.organization.trips.programEditor.typeFlags": "Type flags",
  "screen.organization.trips.programEditor.cap": "Cap",
  "screen.organization.trips.programEditor.capHint": "Number of places.",
  "screen.organization.trips.programEditor.prices": "Prices",
  "screen.organization.trips.programEditor.pricePerPerson": "Price per person",
  "screen.organization.trips.programEditor.currency": "Currency",
  // apps/web/src/screens/organization/trips/trip-command-parts.tsx
  "screen.organization.trips.tripCommandParts.tripStateFlow": "Trip state flow",
  "screen.organization.trips.tripCommandParts.currentState": "{state} (current)",
  "screen.organization.trips.tripCommandParts.open": "Open",
  "screen.organization.trips.tripCommandParts.none": "None",
  "screen.organization.trips.tripCommandParts.assigned": "Assigned",
  "screen.organization.trips.tripCommandParts.missing": "Missing",
  // apps/web/src/screens/organization/trips/trip-command-view.tsx
  "screen.organization.trips.tripCommandView.overview": "Overview",
  "screen.organization.trips.tripCommandView.staffing": "Staffing",
  "screen.organization.trips.tripCommandView.seats": "Seats",
  "screen.organization.trips.tripCommandView.bookings": "Bookings",
  "screen.organization.trips.tripCommandView.programs": "Programs",
  "screen.organization.trips.tripCommandView.liveOperations": "Live operations",
  "screen.organization.trips.tripCommandView.accounting": "Accounting",
  "screen.organization.trips.tripCommandView.vehicle": "Vehicle",
  "screen.organization.trips.tripCommandView.driver": "Driver",
  "screen.organization.trips.tripCommandView.moderator": "Moderator",
  "screen.organization.trips.tripCommandView.openDeal": "Open deal",
  "screen.organization.trips.tripCommandView.dateRange": "{start} to {end}",
  "screen.organization.trips.tripCommandView.departsFrom": "Departs {time} from {origin}",
  "screen.organization.trips.tripCommandView.percent": "{n}%",
  "screen.organization.trips.tripCommandView.cancelTrip": "Cancel trip",
  "screen.organization.trips.tripCommandView.trip": "Trip",
  "screen.organization.trips.tripCommandView.tripSections": "Trip sections",
  "screen.organization.trips.tripCommandView.seatsSold": "Seats sold",
  "screen.organization.trips.tripCommandView.nOfCapacity": "{n} of {capacity}",
  "screen.organization.trips.tripCommandView.seatsHeld": "Seats held",
  "screen.organization.trips.tripCommandView.seatsReserved": "Seats reserved",
  "screen.organization.trips.tripCommandView.occupancy": "Occupancy",
  "screen.organization.trips.tripCommandView.tripState": "Trip state",
  "screen.organization.trips.tripCommandView.cancelBlockedTitle":
    "Cancel is blocked while In Progress",
  "screen.organization.trips.tripCommandView.cancelBlockedBody":
    "A trip that has started cannot be cancelled. Its state moves on when the trip ends.",
  "screen.organization.trips.tripCommandView.readyGaps": "Ready gaps",
  "screen.organization.trips.tripCommandView.noVehicles": "No vehicles on this trip yet.",
  "screen.organization.trips.tripCommandView.goTo": "Go to",
  // apps/web/src/screens/organization/trips/trip-parts.tsx
  "screen.organization.trips.tripParts.money": "{amount} {currency}",
  "screen.organization.trips.tripParts.unlimited": "Unlimited",
  "screen.organization.trips.tripParts.seatLayoutPreviewLabel":
    "Seat layout preview with {n} seats",
  // apps/web/src/screens/organization/trips/trip-wizard-step-1-basics.tsx
  "screen.organization.trips.tripWizardStep1Basics.nameRequired": "Enter a trip name to continue.",
  "screen.organization.trips.tripWizardStep1Basics.chooseTripType": "Choose a trip type",
  "screen.organization.trips.tripWizardStep1Basics.arabic": "Arabic",
  "screen.organization.trips.tripWizardStep1Basics.english": "English",
  "screen.organization.trips.tripWizardStep1Basics.tripBasics": "Trip basics",
  "screen.organization.trips.tripWizardStep1Basics.tripName": "Trip name",
  "screen.organization.trips.tripWizardStep1Basics.description": "Description",
  "screen.organization.trips.tripWizardStep1Basics.descriptionPlaceholder":
    "Short description of the trip for travelers",
  "screen.organization.trips.tripWizardStep1Basics.tripType": "Trip type",
  "screen.organization.trips.tripWizardStep1Basics.language": "Language",
  "screen.organization.trips.tripWizardStep1Basics.saveFailedTitle": "The draft was not saved",
  "screen.organization.trips.tripWizardStep1Basics.saveFailedBody":
    "Check the fields and try again.",
  "screen.organization.trips.tripWizardStep1Basics.draftSavedNote":
    "Your draft is saved as you type. You can leave and come back to it.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-2-schedule-and-route.tsx
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.mapPickerNote":
    "Map picker from the maps service",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.stop": "Stop",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.order": "Order",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.action": "Action",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.removeStop": "Remove {name}",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.remove": "Remove",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.saveFailedTitle":
    "The schedule was not saved",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.saveFailedBody":
    "Check the dates, times and stops, then try again.",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.datesAndTimes": "Dates and times",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startDate": "Start date",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startTime": "Start time",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endDate": "End date",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endTime": "End time",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripTimeZone": "Trip time zone",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.origin": "Origin",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops":
    "Destinations and stops",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.noStops": "Add at least one stop.",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.newStop": "New stop",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.addStop": "Add stop",
  // apps/web/src/screens/organization/trips/trip-wizard-step-3-vehicles.tsx
  "screen.organization.trips.tripWizardStep3Vehicles.plate": "Plate",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicleType": "Vehicle type",
  "screen.organization.trips.tripWizardStep3Vehicles.seats": "Seats",
  "screen.organization.trips.tripWizardStep3Vehicles.nSeats": "{n} seats",
  "screen.organization.trips.tripWizardStep3Vehicles.action": "Action",
  "screen.organization.trips.tripWizardStep3Vehicles.removeVehicle": "Remove {plate}",
  "screen.organization.trips.tripWizardStep3Vehicles.remove": "Remove",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicleLimitNote":
    "Vehicles on this trip: {n} of {limit}. Need more vehicles?",
  "screen.organization.trips.tripWizardStep3Vehicles.upgradeYourPlan": "Upgrade your plan.",
  "screen.organization.trips.tripWizardStep3Vehicles.saveFailedTitle":
    "The vehicles were not saved",
  "screen.organization.trips.tripWizardStep3Vehicles.saveFailedBody":
    "Try again. If it keeps failing, check the vehicles are active.",
  "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip": "Vehicles on this trip",
  "screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet":
    "No vehicles on this trip yet.",
  "screen.organization.trips.tripWizardStep3Vehicles.addVehicle": "Add vehicle",
  "screen.organization.trips.tripWizardStep3Vehicles.atLimitNote":
    "This trip has the most vehicles your plan allows.",
  "screen.organization.trips.tripWizardStep3Vehicles.noMoreVehiclesNote":
    "Every vehicle in your fleet is already on this trip.",
  "screen.organization.trips.tripWizardStep3Vehicles.seatLayoutPreview": "Seat layout preview",
  "screen.organization.trips.tripWizardStep3Vehicles.layoutOfVehicle": "Layout of {type}",
  "screen.organization.trips.tripWizardStep3Vehicles.layoutCaption":
    "Layout of the selected vehicle type",
  // apps/web/src/screens/organization/trips/trip-wizard-step-4-staffing.tsx
  "screen.organization.trips.tripWizardStep4Staffing.missingDriver": "Missing driver",
  "screen.organization.trips.tripWizardStep4Staffing.missingModerator": "Missing moderator",
  "screen.organization.trips.tripWizardStep4Staffing.notAssigned": "Not assigned",
  "screen.organization.trips.tripWizardStep4Staffing.assigned": "Assigned",
  "screen.organization.trips.tripWizardStep4Staffing.nameOwnStaff": "{name}, own staff",
  "screen.organization.trips.tripWizardStep4Staffing.namePlatform": "{name}, platform",
  "screen.organization.trips.tripWizardStep4Staffing.vehicle": "Vehicle",
  "screen.organization.trips.tripWizardStep4Staffing.driver": "Driver",
  "screen.organization.trips.tripWizardStep4Staffing.moderator": "Moderator",
  "screen.organization.trips.tripWizardStep4Staffing.photographer": "Photographer",
  "screen.organization.trips.tripWizardStep4Staffing.platformStaffTitle":
    "Platform staff are on Growth and Enterprise",
  "screen.organization.trips.tripWizardStep4Staffing.platformStaffBody":
    "Your plan uses your own drivers and photographers. Platform options open when you upgrade.",
  "screen.organization.trips.tripWizardStep4Staffing.saveFailedTitle": "The staffing was not saved",
  "screen.organization.trips.tripWizardStep4Staffing.saveFailedBody": "Try again in a moment.",
  "screen.organization.trips.tripWizardStep4Staffing.staffForEachVehicle": "Staff for each vehicle",
  "screen.organization.trips.tripWizardStep4Staffing.noVehicles": "Add vehicles in step 3 first.",
  "screen.organization.trips.tripWizardStep4Staffing.readyNeedsNote":
    "Ready needs a driver and a moderator on every vehicle. Each gap is listed above.",
  "screen.organization.trips.tripWizardStep4Staffing.assignOwnStaff": "Assign own staff",
  // apps/web/src/screens/organization/trips/trip-wizard-step-5-programs.tsx
  "screen.organization.trips.tripWizardStep5Programs.program": "Program",
  "screen.organization.trips.tripWizardStep5Programs.pricingModel": "Pricing model",
  "screen.organization.trips.tripWizardStep5Programs.typeFlags": "Type flags",
  "screen.organization.trips.tripWizardStep5Programs.cap": "Cap",
  "screen.organization.trips.tripWizardStep5Programs.price": "Price",
  "screen.organization.trips.tripWizardStep5Programs.preRequired": "Pre-required",
  "screen.organization.trips.tripWizardStep5Programs.optional": "Optional",
  "screen.organization.trips.tripWizardStep5Programs.capacityLimited": "Capacity-limited",
  "screen.organization.trips.tripWizardStep5Programs.free": "Free",
  "screen.organization.trips.tripWizardStep5Programs.perPerson": "Per person",
  "screen.organization.trips.tripWizardStep5Programs.listSeparator": ", ",
  "screen.organization.trips.tripWizardStep5Programs.none": "None",
  "screen.organization.trips.tripWizardStep5Programs.nOfLimitPrograms": "{n} of {limit} programs",
  "screen.organization.trips.tripWizardStep5Programs.addProgram": "Add program",
  "screen.organization.trips.tripWizardStep5Programs.saveFailedTitle":
    "The programs step was not saved",
  "screen.organization.trips.tripWizardStep5Programs.saveFailedBody": "Try again in a moment.",
  "screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip": "Programs on this trip",
  "screen.organization.trips.tripWizardStep5Programs.noProgramsYet": "No programs yet",
  "screen.organization.trips.tripWizardStep5Programs.noProgramsBody":
    "Add a program, or continue without one.",
  "screen.organization.trips.tripWizardStep5Programs.atLimitNote":
    "This trip has the most programs your plan allows.",
  "screen.organization.trips.tripWizardStep5Programs.onePricingModelNote":
    "Each program has exactly one pricing model. Edit a program to change its price or flags before the trip starts.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-6-seating.tsx
  "screen.organization.trips.tripWizardStep6Seating.saveFailedTitle": "The seating was not saved",
  "screen.organization.trips.tripWizardStep6Seating.saveFailedBody": "Try again in a moment.",
  "screen.organization.trips.tripWizardStep6Seating.seatMode": "Seat mode",
  "screen.organization.trips.tripWizardStep6Seating.chooseHowTravelersGetSeats":
    "Choose how travelers get seats",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssigned": "Organization-assigned",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssignedBody":
    "Default. Your team assigns each traveler a seat from the seat map.",
  "screen.organization.trips.tripWizardStep6Seating.travelerSelfSelect": "Traveler self-select",
  "screen.organization.trips.tripWizardStep6Seating.growthOrEnterprise": "Growth or Enterprise",
  "screen.organization.trips.tripWizardStep6Seating.travelerSelfSelectLocked":
    "Travelers pick their own seat. Locked on your plan.",
  "screen.organization.trips.tripWizardStep6Seating.travelerSelfSelectBody":
    "Travelers pick their own seat.",
  "screen.organization.trips.tripWizardStep6Seating.priorityWindow": "Priority window",
  "screen.organization.trips.tripWizardStep6Seating.priorityWindowLabel":
    "Priority window for Explorer and VIP travelers",
  "screen.organization.trips.tripWizardStep6Seating.windowHoursHint": "In hours.",
  "screen.organization.trips.tripWizardStep6Seating.windowTbc":
    "The window length is still to be confirmed.",
  "screen.organization.trips.tripWizardStep6Seating.changeRulesNote":
    "Changing the seat mode after bookings exist follows the trip change rules and notifies travelers first.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-7-pricing-and-capacity.tsx
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.perVehicleValue":
    "{n} seats, from the vehicle type",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.nSeats": "{n} seats",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.saveFailedTitle":
    "The pricing was not saved",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.saveFailedBody":
    "Check the price and try again.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePriceAndCapacity":
    "Base price and capacity",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePricePerPerson":
    "Base price per person",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.currency": "Currency",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityPerVehicle":
    "Capacity per vehicle",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.totalCapacity":
    "Total capacity on this trip",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTracking": "Child tracking",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.growthOrEnterprise":
    "Growth or Enterprise",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.turnOnChildTracking":
    "Turn on child tracking for this trip",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingLocked":
    "Locked on Starter. Growth and Enterprise can enable it. Parents need an Explorer or VIP booking.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingBody":
    "Parents need an Explorer or VIP booking.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityNote":
    "Capacity cannot be above the seat count of the vehicles on this trip.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-8-publish.tsx
  "screen.organization.trips.tripWizardStep8Publish.basics": "Basics",
  "screen.organization.trips.tripWizardStep8Publish.scheduleAndRoute": "Schedule and route",
  "screen.organization.trips.tripWizardStep8Publish.vehicles": "Vehicles",
  "screen.organization.trips.tripWizardStep8Publish.staffing": "Staffing",
  "screen.organization.trips.tripWizardStep8Publish.programs": "Programs",
  "screen.organization.trips.tripWizardStep8Publish.seating": "Seating",
  "screen.organization.trips.tripWizardStep8Publish.pricingAndCapacity": "Pricing and capacity",
  "screen.organization.trips.tripWizardStep8Publish.missingDriver": "Missing driver",
  "screen.organization.trips.tripWizardStep8Publish.missingModerator": "Missing moderator",
  "screen.organization.trips.tripWizardStep8Publish.blockedMissingDriver":
    "Staffing is incomplete. Add a driver for {plate} to continue.",
  "screen.organization.trips.tripWizardStep8Publish.blockedMissingModerator":
    "Staffing is incomplete. Add a moderator for {plate} to continue.",
  "screen.organization.trips.tripWizardStep8Publish.blockedIncompleteStep":
    "{step} is incomplete. Finish it to continue.",
  "screen.organization.trips.tripWizardStep8Publish.requiredStep": "Required step",
  "screen.organization.trips.tripWizardStep8Publish.status": "Status",
  "screen.organization.trips.tripWizardStep8Publish.complete": "Complete",
  "screen.organization.trips.tripWizardStep8Publish.incomplete": "Incomplete",
  "screen.organization.trips.tripWizardStep8Publish.action": "Action",
  "screen.organization.trips.tripWizardStep8Publish.open": "Open",
  "screen.organization.trips.tripWizardStep8Publish.openStepN": "Open step {n}",
  "screen.organization.trips.tripWizardStep8Publish.public": "Public",
  "screen.organization.trips.tripWizardStep8Publish.draft": "Draft",
  "screen.organization.trips.tripWizardStep8Publish.targetedAudienceList": "Targeted audience list",
  "screen.organization.trips.tripWizardStep8Publish.publishTrip": "Publish trip",
  "screen.organization.trips.tripWizardStep8Publish.publish": "Publish",
  "screen.organization.trips.tripWizardStep8Publish.saveDraft": "Save draft",
  "screen.organization.trips.tripWizardStep8Publish.publishUnlocksNote":
    "Publish unlocks when every required step is complete.",
  "screen.organization.trips.tripWizardStep8Publish.publishBlocked": "Publish is blocked",
  "screen.organization.trips.tripWizardStep8Publish.actionFailedTitle": "That did not go through",
  "screen.organization.trips.tripWizardStep8Publish.actionFailedBody": "Try again in a moment.",
  "screen.organization.trips.tripWizardStep8Publish.readinessChecklist": "Readiness checklist",
  "screen.organization.trips.tripWizardStep8Publish.publishMode": "Publish mode",
  "screen.organization.trips.tripWizardStep8Publish.audienceList": "Audience list",
  "screen.organization.trips.tripWizardStep8Publish.audienceListHint":
    "Audience ids, separated by commas.",
  "screen.organization.trips.tripWizardStep8Publish.tripsPublishedThisMonth":
    "Trips published this month",
  "screen.organization.trips.tripWizardStep8Publish.nOfLimit": "{n} of {limit}",
  // apps/web/src/screens/organization/trips/trips-list.tsx
  "screen.organization.trips.tripsList.title": "Trips",
  "screen.organization.trips.tripsList.caption": "Every trip with its state and next action",
  "screen.organization.trips.tripsList.createTrip": "Create trip",
  "screen.organization.trips.tripsList.activeTripsThisMonth": "Active trips this month",
  "screen.organization.trips.tripsList.tripsNeedingStaffing": "Trips needing staffing",
  "screen.organization.trips.tripsList.filterByState": "Filter trips by state",
  "screen.organization.trips.tripsList.all": "All",
  "screen.organization.trips.tripsList.trip": "Trip",
  "screen.organization.trips.tripsList.state": "State",
  "screen.organization.trips.tripsList.dates": "Dates",
  "screen.organization.trips.tripsList.vehicles": "Vehicles",
  "screen.organization.trips.tripsList.seatsSold": "Seats sold",
  "screen.organization.trips.tripsList.staffing": "Staffing",
  "screen.organization.trips.tripsList.dateRange": "{start} to {end}",
  "screen.organization.trips.tripsList.nOfCapacity": "{n} of {capacity}",
  "screen.organization.trips.tripsList.notStarted": "Not started",
  "screen.organization.trips.tripsList.staffingGap": "Staffing gap",
  "screen.organization.trips.tripsList.staffed": "Staffed",
  "screen.organization.trips.tripsList.emptyTitle": "No trips yet",
  "screen.organization.trips.tripsList.emptyBody":
    "Create your first trip. The wizard saves a draft as you go.",
  "screen.organization.trips.tripsList.noMatchTitle": "No trips in this state",
  "screen.organization.trips.tripsList.noMatchBody":
    "Choose another state, or All to see every trip.",
  // apps/web/src/screens/organization/vehicles/seat-layout.tsx
  "screen.organization.vehicles.seatLayout.gridLabel": "Seat layout grid",
  // apps/web/src/screens/organization/vehicles/vehicle-editor-form.tsx
  "screen.organization.vehicles.vehicleEditorForm.plateRequired": "Enter the plate number.",
  "screen.organization.vehicles.vehicleEditorForm.modelRequired": "Enter the model.",
  "screen.organization.vehicles.vehicleEditorForm.yearInvalid": "Enter a year from {min} to {max}.",
  "screen.organization.vehicles.vehicleEditorForm.typeRequired": "Choose a vehicle type.",
  "screen.organization.vehicles.vehicleEditorForm.seatCountMismatch":
    "Seat count must match the vehicle type. The type has {n} seats; you entered {m}.",
  "screen.organization.vehicles.vehicleEditorForm.chooseType": "Choose a vehicle type",
  "screen.organization.vehicles.vehicleEditorForm.notSavedTitle": "Vehicle not saved",
  "screen.organization.vehicles.vehicleEditorForm.fixSeatCount":
    "Fix the seat count, then save again.",
  "screen.organization.vehicles.vehicleEditorForm.notSavedBody":
    "Fix the marked fields, then save again.",
  "screen.organization.vehicles.vehicleEditorForm.notRemovedTitle": "Vehicle not removed",
  "screen.organization.vehicles.vehicleEditorForm.notRemovedBody":
    "It may be assigned to a trip. Try again later.",
  "screen.organization.vehicles.vehicleEditorForm.photoNotUploaded":
    "Photo not uploaded. Use a PNG, JPEG or WebP image and try again.",
  "screen.organization.vehicles.vehicleEditorForm.vehicleDetails": "Vehicle details",
  "screen.organization.vehicles.vehicleEditorForm.plateNumber": "Plate number",
  "screen.organization.vehicles.vehicleEditorForm.model": "Model",
  "screen.organization.vehicles.vehicleEditorForm.year": "Year",
  "screen.organization.vehicles.vehicleEditorForm.vehicleType": "Vehicle type",
  "screen.organization.vehicles.vehicleEditorForm.seatCount": "Seat count",
  "screen.organization.vehicles.vehicleEditorForm.registrationStatus": "Registration status",
  "screen.organization.vehicles.vehicleEditorForm.vehiclePhoto": "Vehicle photo",
  "screen.organization.vehicles.vehicleEditorForm.photosAttached": "Photos attached: {n}",
  "screen.organization.vehicles.vehicleEditorForm.removeVehicle": "Remove vehicle",
  "screen.organization.vehicles.vehicleEditorForm.removalBlocked":
    "Removal is blocked while this vehicle has {n} confirmed bookings.",
  "screen.organization.vehicles.vehicleEditorForm.cancel": "Cancel",
  "screen.organization.vehicles.vehicleEditorForm.saveVehicle": "Save vehicle",
  // apps/web/src/screens/organization/vehicles/vehicle-editor.tsx
  "screen.organization.vehicles.vehicleEditor.addTitle": "Add vehicle",
  "screen.organization.vehicles.vehicleEditor.editTitle": "Edit vehicle",
  "screen.organization.vehicles.vehicleEditor.plateAndModel": "{plate} · {model}",
  "screen.organization.vehicles.vehicleEditor.addCaption": "A new vehicle in your registry",
  "screen.organization.vehicles.vehicleEditor.notFoundTitle": "Vehicle not found",
  "screen.organization.vehicles.vehicleEditor.backToVehicles": "Back to vehicles",
  "screen.organization.vehicles.vehicleEditor.notFoundBody":
    "It may have been removed from the registry.",
  "screen.organization.vehicles.vehicleEditor.removeThisVehicle": "Remove this vehicle?",
  "screen.organization.vehicles.vehicleEditor.removeDialogBody":
    "The vehicle leaves the registry and can no longer be added to trips.",
  "screen.organization.vehicles.vehicleEditor.removeVehicle": "Remove vehicle",
  "screen.organization.vehicles.vehicleEditor.keepVehicle": "Keep vehicle",
  // apps/web/src/screens/organization/vehicles/vehicle-parts.tsx
  "screen.organization.vehicles.vehicleParts.registered": "Registered",
  "screen.organization.vehicles.vehicleParts.pendingReview": "Pending review",
  "screen.organization.vehicles.vehicleParts.expired": "Registration expired",
  // apps/web/src/screens/organization/vehicles/vehicle-registry.tsx
  "screen.organization.vehicles.vehicleRegistry.plate": "Plate",
  "screen.organization.vehicles.vehicleRegistry.model": "Model",
  "screen.organization.vehicles.vehicleRegistry.year": "Year",
  "screen.organization.vehicles.vehicleRegistry.vehicleType": "Vehicle type",
  "screen.organization.vehicles.vehicleRegistry.seats": "Seats",
  "screen.organization.vehicles.vehicleRegistry.registration": "Registration",
  "screen.organization.vehicles.vehicleRegistry.addVehicle": "Add vehicle",
  "screen.organization.vehicles.vehicleRegistry.title": "Vehicles",
  "screen.organization.vehicles.vehicleRegistry.caption":
    "Your organization's vehicles and their seat counts",
  "screen.organization.vehicles.vehicleRegistry.vehicleTypes": "Vehicle types",
  "screen.organization.vehicles.vehicleRegistry.filterByRegistration":
    "Filter vehicles by registration",
  "screen.organization.vehicles.vehicleRegistry.all": "All",
  "screen.organization.vehicles.vehicleRegistry.registered": "Registered",
  "screen.organization.vehicles.vehicleRegistry.pendingReview": "Pending review",
  "screen.organization.vehicles.vehicleRegistry.emptyTitle": "No vehicles yet",
  "screen.organization.vehicles.vehicleRegistry.noMatchTitle": "No vehicles match this filter",
  "screen.organization.vehicles.vehicleRegistry.emptyBody": "Add a vehicle to use it on trips.",
  // apps/web/src/screens/organization/vehicles/vehicle-types-and-seat-layout.tsx
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.typeDetails": "Type details",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.typeName": "Type name",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.nameRequired": "Enter the type name.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCount": "Seat count",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCountInvalid":
    "Enter a seat count from 1 to {max}.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.status": "Status",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.active": "Active",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archived": "Archived",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archiveType": "Archive type",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayout": "Seat layout",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayoutCaption":
    "Each seat has a label. Labels appear on the seat map.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.title": "Vehicle type",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.caption": "Reusable seat layout · {name}",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.saveType": "Save type",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archivedNote":
    "Archived types are not offered for new trips. Trips that already use this type keep their layout.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.notSavedTitle": "Vehicle type not saved",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.notSavedBody":
    "Check the name and seat count, then try again.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.saved": "Vehicle type saved",
  // apps/web/src/screens/organization/workspace/organization-profile-parts.tsx
  "screen.organization.workspace.organizationProfileParts.logoUrlInvalid":
    "Enter a web address that starts with https://.",
  "screen.organization.workspace.organizationProfileParts.brandColorInvalid":
    "Enter a color as # and six characters, for example #1A2B3C.",
  // apps/web/src/screens/organization/workspace/organization-profile-settings-and-branding.tsx
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameTooShort":
    "Enter a trade name of at least 2 characters.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.lockedOnYourPlan":
    "Locked on your plan",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalAndInvoiceDetails":
    "Legal and invoice details",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalName": "Legal name",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.setAtVerification":
    "Set when the organization was verified. Contact support to change it.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeName": "Trade name",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.country": "Country",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZone": "Time zone",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumber":
    "Registration number",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxReference":
    "Tax reference",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddress":
    "Invoice address",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.branding": "Branding",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.enterpriseOnly":
    "Enterprise only",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.brandingCaption":
    "Logo and colors appear on trip pages and invoices on Enterprise. Your plan shows the Trips Enjoy mark.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.logo": "Logo",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.brandColor": "Brand color",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.title":
    "Organization profile",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.caption":
    "Legal details, invoice details and branding",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.saveChanges":
    "Save changes",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.notSavedTitle":
    "Changes not saved",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.notSavedBody":
    "Check the details, then save again.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.saved": "Changes saved",
  // apps/web/src/screens/organization/workspace/workspace-home-parts.tsx
  "screen.organization.workspace.workspaceHomeParts.done": "Done",
  "screen.organization.workspace.workspaceHomeParts.toDo": "To do",
  "screen.organization.workspace.workspaceHomeParts.profile": "Profile",
  "screen.organization.workspace.workspaceHomeParts.accountingAndInvoiceDetails":
    "Accounting and invoice details",
  "screen.organization.workspace.workspaceHomeParts.crmAndWebhooks": "CRM and webhooks",
  "screen.organization.workspace.workspaceHomeParts.optional": "Optional",
  "screen.organization.workspace.workspaceHomeParts.departsFrom": "{date}, {time} from {place}",
  "screen.organization.workspace.workspaceHomeParts.departsAt": "{date}, {time}",
  "screen.organization.workspace.workspaceHomeParts.trip": "Trip",
  "screen.organization.workspace.workspaceHomeParts.departs": "Departs",
  "screen.organization.workspace.workspaceHomeParts.vehicles": "Vehicles",
  "screen.organization.workspace.workspaceHomeParts.readiness": "Readiness",
  "screen.organization.workspace.workspaceHomeParts.staffingGap": "Staffing gap",
  "screen.organization.workspace.workspaceHomeParts.ready": "Ready",
  "screen.organization.workspace.workspaceHomeParts.upcomingTripsCaption": "Upcoming trips",
  "screen.organization.workspace.workspaceHomeParts.noUpcomingTrips": "No upcoming trips",
  "screen.organization.workspace.workspaceHomeParts.createTrip": "Create trip",
  "screen.organization.workspace.workspaceHomeParts.noUpcomingTripsBody":
    "Trips with a departure date appear here.",
  // apps/web/src/screens/organization/workspace/workspace-home.tsx
  "screen.organization.workspace.workspaceHome.nOfLimit": "{n} of {limit}",
  "screen.organization.workspace.workspaceHome.captionEmployee": "{name} · Employee view",
  "screen.organization.workspace.workspaceHome.captionOwner": "{name} · Owner view",
  "screen.organization.workspace.workspaceHome.title": "Workspace home",
  "screen.organization.workspace.workspaceHome.createTrip": "Create trip",
  "screen.organization.workspace.workspaceHome.gracePeriod": "Grace period",
  "screen.organization.workspace.workspaceHome.gracePeriodBody":
    "Your features stay on until {date}. Update the payment method to avoid a downgrade.",
  "screen.organization.workspace.workspaceHome.activeTripsThisMonth": "Active trips this month",
  "screen.organization.workspace.workspaceHome.upcomingTripsWithReadyGaps":
    "Upcoming trips with Ready gaps",
  "screen.organization.workspace.workspaceHome.dealRequestsPending": "Deal requests pending",
  "screen.organization.workspace.workspaceHome.setupChecklist": "Setup checklist",
  "screen.organization.workspace.workspaceHome.upcomingTrips": "Upcoming trips",
  // apps/web/src/screens/public/account-recovery/account-suspended.tsx
  "screen.public.accountRecovery.accountSuspended.accountSuspended": "Account suspended",
  "screen.public.accountRecovery.accountSuspended.accessToThisAccountIs":
    "Access to this account is stopped. No data has been deleted.",
  "screen.public.accountRecovery.accountSuspended.reason": "Reason",
  "screen.public.accountRecovery.accountSuspended.theReasonFromTheSuspension":
    "The reason from the suspension notice is shown here.",
  "screen.public.accountRecovery.accountSuspended.toAskForAReview":
    "To ask for a review, contact support. Sign-in stays refused while the suspension is active.",
  // apps/web/src/screens/public/account-recovery/appeal-a-rejection.tsx
  "screen.public.accountRecovery.appealARejection.appealStatement": "Appeal statement",
  "screen.public.accountRecovery.appealARejection.explainWhyTheDecisionShould":
    "Explain why the decision should be reviewed (at least 10 characters).",
  "screen.public.accountRecovery.appealARejection.supportingFiles": "Supporting files",
  "screen.public.accountRecovery.appealARejection.addAnyDocumentThatSupports":
    "Add any document that supports your appeal.",
  "screen.public.accountRecovery.appealARejection.appealSubmitted": "Appeal submitted",
  "screen.public.accountRecovery.appealARejection.yourAppealHasBeenSent":
    "Your appeal has been sent to the review team.",
  "screen.public.accountRecovery.appealARejection.appealCouldNotBeSubmitted":
    "Appeal could not be submitted",
  "screen.public.accountRecovery.appealARejection.submitting": "Submitting...",
  "screen.public.accountRecovery.appealARejection.submitAppeal": "Submit appeal",
  "screen.public.accountRecovery.appealARejection.backToStatus": "Back to status",
  "screen.public.accountRecovery.appealARejection.appealARejection": "Appeal a rejection",
  "screen.public.accountRecovery.appealARejection.askForAReviewOf":
    "Ask for a review of the decision while the appeal window is open.",
  "screen.public.accountRecovery.appealARejection.rejected": "Rejected",
  "screen.public.accountRecovery.appealARejection.reasonOnRecord": "Reason on record:",
  "screen.public.accountRecovery.appealARejection.theReasonFromTheReview":
    "the reason from the review team is shown here.",
  // apps/web/src/screens/public/account-recovery/application-status-and-changes-response.tsx
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.submitted": "Submitted",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.pendingReview":
    "Pending review",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.decision": "Decision",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.uploadAClearerInsuranceDocument":
    "Upload a clearer insurance document",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.confirmTheVehicleSeatCount":
    "Confirm the vehicle seat count",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.approved": "Approved",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.changesRequested":
    "Changes requested",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.appealed": "Appealed",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.pendingReviewLabel":
    "Pending review",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.targetReviewWithin2Working":
    "Target: review within 2 working days.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.applicationProgress":
    "Application progress",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.respondWithin14Days":
    "Respond within 14 days",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChangesMustBeAnswered":
    "Requested changes must be answered before the deadline",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.orTheApplicationCloses":
    ", or the application closes.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.reviewerNotes":
    "Reviewer notes",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.updateSaved": "Update saved",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.actionFailed": "Action failed",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChanges":
    "Requested changes",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChangesAriaLabel":
    "Requested changes",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.updatedDocumentsOptional":
    "Updated documents (optional)",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.attachReplacementOrSupportingDocuments":
    "Attach replacement or supporting documents before resubmitting.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.submitting": "Submitting...",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.resubmit": "Resubmit",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.request7DayExtension":
    "Request 7-day extension",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.appealARejection":
    "Appeal a rejection",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.applicationStatusAndChangesResponse":
    "Application status and changes response",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.trackYourApplicationAndRespond":
    "Track your application and respond to any requested changes.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.statusCouldNotLoad":
    "Status could not load",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.tryAgainInAFew":
    "Try again in a few minutes.",
  // apps/web/src/screens/public/account-recovery/deletion-grace-period.tsx
  "screen.public.accountRecovery.deletionGracePeriod.deletionGracePeriod": "Deletion grace period",
  "screen.public.accountRecovery.deletionGracePeriod.yourAccountIsInThe":
    "Your account is in the 30-day grace period after a deletion request.",
  "screen.public.accountRecovery.deletionGracePeriod.gracePeriodEnds": "Grace period ends",
  "screen.public.accountRecovery.deletionGracePeriod.30DaysAfterTheDeletion":
    "30 days after the deletion request",
  "screen.public.accountRecovery.deletionGracePeriod.signInToRestore": "Sign in to restore",
  "screen.public.accountRecovery.deletionGracePeriod.signingInRestoresYourAccount":
    "Signing in restores your account and cancels the deletion request.",
  "screen.public.accountRecovery.deletionGracePeriod.ifTheDeletionBecomesPermanent":
    "If the deletion becomes permanent, future bookings are cancelled and refunded.",
  "screen.public.accountRecovery.deletionGracePeriod.continueToAppHome": "Continue to app home",
  // apps/web/src/screens/public/account-recovery/password-reset.tsx
  "screen.public.accountRecovery.passwordReset.emailOrPhone": "Email or phone",
  "screen.public.accountRecovery.passwordReset.newPassword": "New password",
  "screen.public.accountRecovery.passwordReset.atLeastCharactersPasswordsFound":
    "At least {min} characters. Passwords found in breached lists are refused.",
  "screen.public.accountRecovery.passwordReset.setPassword": "Set password",
  "screen.public.accountRecovery.passwordReset.rememberedIt": "Remembered it?",
  "screen.public.accountRecovery.passwordReset.backToSignIn": "Back to sign in",
  "screen.public.accountRecovery.passwordReset.passwordReset": "Password reset",
  "screen.public.accountRecovery.passwordReset.weSendACodeTo":
    "We send a code to your verified email or phone. Then set a new password.",
  "screen.public.accountRecovery.passwordReset.passwordRefused": "Password refused",
  "screen.public.accountRecovery.passwordReset.theNewPasswordIsShorter":
    "The new password is shorter than",
  "screen.public.accountRecovery.passwordReset.charactersOrWasFoundIn":
    "characters or was found in a breached list.",
  // apps/web/src/screens/public/account-recovery/session-expired.tsx
  "screen.public.accountRecovery.sessionExpired.sessionExpired": "Session expired",
  "screen.public.accountRecovery.sessionExpired.forYourSecurityYouWere":
    "For your security you were signed out. Your unsaved drafts are kept.",
  "screen.public.accountRecovery.sessionExpired.draftsKept": "Drafts kept",
  "screen.public.accountRecovery.sessionExpired.signInToContinueWhere":
    "Sign in to continue where you left off, in the same app.",
  "screen.public.accountRecovery.sessionExpired.signIn": "Sign in",
  // apps/web/src/screens/public/common/auth-frame.tsx
  "screen.public.common.authFrame.backToTheStart": "Back to the start",
  // apps/web/src/screens/public/common/country-options.ts
  "screen.public.common.countryOptions.selectACountry": "Select a country",
  "screen.public.common.countryOptions.saudiArabia": "Saudi Arabia",
  // apps/web/src/screens/public/common/language-select.tsx
  "screen.public.common.languageSelect.language": "Language",
  // apps/web/src/screens/public/common/public-nav.tsx
  "screen.public.common.publicNav.start": "Start",
  "screen.public.common.publicNav.signUp": "Sign up",
  "screen.public.common.publicNav.signIn": "Sign in",
  "screen.public.common.publicNav.applicationStatus": "Application status",
  "screen.public.common.publicNav.public": "Public",
  // apps/web/src/screens/public/common/sign-up-footer.tsx
  "screen.public.common.signUpFooter.nextConfirmYourDetailsWith":
    "Next, confirm your details with a code:",
  "screen.public.common.signUpFooter.verificationByCode": "Verification by code",
  "screen.public.common.signUpFooter.alreadyHaveAnAccount": "Already have an account?",
  "screen.public.common.signUpFooter.signIn": "Sign in",
  // apps/web/src/screens/public/common/staff-code-panel.tsx
  "screen.public.common.staffCodePanel.authenticatorApp": "Authenticator app",
  "screen.public.common.staffCodePanel.secondFactorMethod": "Second factor method",
  "screen.public.common.staffCodePanel.staffCode": "Staff code",
  // apps/web/src/screens/public/index.ts
  "screen.registry.public.landing.title": "Landing",
  "screen.registry.public.signUpChooser.title": "Sign-up chooser (/register)",
  "screen.registry.public.travelerSignUp.title": "Traveler sign-up",
  "screen.registry.public.platformDriverSignUp.title": "Platform driver sign-up",
  "screen.registry.public.photographerSignUp.title": "Photographer sign-up",
  "screen.registry.public.organizationSignUp.title": "Organization sign-up (web only)",
  "screen.registry.public.verificationByCode.title": "Verification by code",
  "screen.registry.public.signIn.title": "Sign-in (traveler and supplier)",
  "screen.registry.public.adminSignIn.title": "Admin sign-in",
  "screen.registry.public.adminAuthenticatorSetUpAndCode.title":
    "Admin authenticator set-up and code",
  "screen.registry.public.organizationStaffSignInWithCode.title":
    "Organization staff sign-in with code",
  "screen.registry.public.staffCodeSetUp.title": "Staff code set-up (first sign-in)",
  "screen.registry.public.passwordReset.title": "Password reset",
  "screen.registry.public.sessionExpired.title": "Session expired",
  "screen.registry.public.accountSuspended.title": "Account suspended",
  "screen.registry.public.deletionGracePeriod.title": "Deletion grace period",
  "screen.registry.public.applicationStatusAndChangesResponse.title":
    "Application status and changes response",
  "screen.registry.public.appealARejection.title": "Appeal a rejection",
  "screen.registry.public.moderatorSignInWithStaffCode.title": "Moderator sign-in with staff code",
  // apps/web/src/screens/public/landing/landing.tsx
  "screen.public.landing.landing.traveler": "Traveler",
  "screen.public.landing.landing.createATravelerAccountAnd":
    "Create a traveler account and book trips.",
  "screen.public.landing.landing.platformDriver": "Platform driver",
  "screen.public.landing.landing.applyToJoinThePlatform": "Apply to join the platform driver pool.",
  "screen.public.landing.landing.photographer": "Photographer",
  "screen.public.landing.landing.applyToJoinThePlatformDescription":
    "Apply to join the platform photographer pool.",
  "screen.public.landing.landing.organization": "Organization",
  "screen.public.landing.landing.registerYourOrganizationWebOnly":
    "Register your organization. Web only.",
  "screen.public.landing.landing.permissionDenied": "Permission denied",
  "screen.public.landing.landing.notFound": "Not found",
  "screen.public.landing.landing.unauthorized": "Unauthorized",
  "screen.public.landing.landing.serverError": "Server error",
  "screen.public.landing.landing.serviceUnavailable": "Service unavailable",
  "screen.public.landing.landing.maintenancePage": "Maintenance page",
  "screen.public.landing.landing.sharedStates": "Shared states",
  "screen.public.landing.landing.tripsEnjoyHome": "Trips Enjoy home",
  "screen.public.landing.landing.tripsEnjoy": "Trips Enjoy",
  "screen.public.landing.landing.publicTrips": "Public trips",
  "screen.public.landing.landing.browseTheTripsThatAre":
    "Browse the trips that are published to the public.",
  "screen.public.landing.landing.browseTrips": "Browse trips",
  "screen.public.landing.landing.noPublicTripsRightNow": "No public trips right now",
  "screen.public.landing.landing.tripsAppearHereOnceThey":
    "Trips appear here once they are published. You can still sign up for a role below.",
  "screen.public.landing.landing.tripsCouldNotLoad": "Trips could not load",
  "screen.public.landing.landing.tryAgainInAFew": "Try again in a few minutes.",
  "screen.public.landing.landing.signUpAs": "Sign up as",
  "screen.public.landing.landing.signUpAs2": "Sign up as",
  // apps/web/src/screens/public/sign-in/admin-authenticator-set-up-and-code.tsx
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpAuthenticator": "Set up authenticator",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.enterCode": "Enter code",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpSteps": "Set-up steps",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpRequired": "Set-up required",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.theAdminConsoleDoesNot":
    "The admin console does not open until the authenticator is set up.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.scanTheQrCodeShown":
    "Scan the QR code shown on screen with your authenticator app, then enter the six-digit code it displays.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.authenticatorCode": "Authenticator code",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.verify": "Verify",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.afterVerificationTheAdminConsole":
    "After verification, the admin console opens.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.adminHome": "Admin home",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.adminAuthenticatorSetUpAnd":
    "Admin authenticator set-up and code",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.adminSignInNeedsAn":
    "Admin sign-in needs an authenticator code. The admin console opens after this step.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.wrongCode": "Wrong code",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.tryAgainFiveFailuresLock":
    "Try again. Five failures lock admin sign-in for 15 minutes.",
  // apps/web/src/screens/public/sign-in/admin-sign-in.tsx
  "screen.public.signIn.adminSignIn.email": "Email",
  "screen.public.signIn.adminSignIn.password": "Password",
  "screen.public.signIn.adminSignIn.atLeast12CharactersPasswords":
    "At least 12 characters. Passwords found in breached lists are refused.",
  "screen.public.signIn.adminSignIn.continue": "Continue",
  "screen.public.signIn.adminSignIn.authenticatorNotSetUpYet": "Authenticator not set up yet?",
  "screen.public.signIn.adminSignIn.setItUp": "Set it up",
  "screen.public.signIn.adminSignIn.adminSignIn": "Admin sign-in",
  "screen.public.signIn.adminSignIn.staffOnlyThereIsNo":
    "Staff only. There is no public sign-up for administrators.",
  "screen.public.signIn.adminSignIn.signInRefused": "Sign-in refused",
  "screen.public.signIn.adminSignIn.theEmailOrPasswordIs":
    "The email or password is wrong. Five failed attempts lock sign-in for 15 minutes.",
  // apps/web/src/screens/public/sign-in/moderator-sign-in-with-staff-code.tsx
  "screen.public.signIn.moderatorSignInWithStaffCode.emailOrPhone": "Email or phone",
  "screen.public.signIn.moderatorSignInWithStaffCode.signIn": "Sign in",
  "screen.public.signIn.moderatorSignInWithStaffCode.moderatorSignInWithStaff":
    "Moderator sign-in with staff code",
  "screen.public.signIn.moderatorSignInWithStaffCode.afterSignInYouSee":
    "After sign-in you see only your assigned vehicle.",
  // apps/web/src/screens/public/sign-in/organization-staff-sign-in-with-code.tsx
  "screen.public.signIn.organizationStaffSignInWithCode.email": "Email",
  "screen.public.signIn.organizationStaffSignInWithCode.password": "Password",
  "screen.public.signIn.organizationStaffSignInWithCode.secondFactor": "Second factor",
  "screen.public.signIn.organizationStaffSignInWithCode.signIn": "Sign in",
  "screen.public.signIn.organizationStaffSignInWithCode.firstSignIn": "First sign-in?",
  "screen.public.signIn.organizationStaffSignInWithCode.setUpYourStaffCode":
    "Set up your staff code",
  "screen.public.signIn.organizationStaffSignInWithCode.organizationStaffSignInWith":
    "Organization staff sign-in with code",
  "screen.public.signIn.organizationStaffSignInWithCode.enterYourEmailYourPassword":
    "Enter your email, your password, and the code from your second factor. If your email is linked to several organizations, you choose one after the code.",
  "screen.public.signIn.organizationStaffSignInWithCode.signInRefused": "Sign-in refused",
  "screen.public.signIn.organizationStaffSignInWithCode.theCodeIsWrongOr":
    "The code is wrong, or this email is not linked to any organization.",
  // apps/web/src/screens/public/sign-in/sign-in.tsx
  "screen.public.signIn.signIn.oneTimeCode": "One-time code",
  "screen.public.signIn.signIn.password": "Password",
  "screen.public.signIn.signIn.sessionExpired": "Session expired",
  "screen.public.signIn.signIn.accountSuspended": "Account suspended",
  "screen.public.signIn.signIn.deletionRequested": "Deletion requested",
  "screen.public.signIn.signIn.applicationPending": "Application pending",
  "screen.public.signIn.signIn.emailOrPhone": "Email or phone",
  "screen.public.signIn.signIn.signInMethod": "Sign-in method",
  "screen.public.signIn.signIn.passwordLabel": "Password",
  "screen.public.signIn.signIn.weSendAOneTime":
    "We send a one-time code to the email or phone you enter.",
  "screen.public.signIn.signIn.signIn": "Sign in",
  "screen.public.signIn.signIn.createAnAccount": "Create an account",
  "screen.public.signIn.signIn.forgotPassword": "Forgot password?",
  "screen.public.signIn.signIn.otherSignInOutcomes": "Other sign-in outcomes",
  "screen.public.signIn.signIn.otherOutcomes": "Other outcomes",
  "screen.public.signIn.signIn.signInTravelerAndSupplier": "Sign-in (traveler and supplier)",
  "screen.public.signIn.signIn.travelersAndApprovedSuppliersSign":
    "Travelers and approved suppliers sign in here.",
  "screen.public.signIn.signIn.detailsDoNotMatch": "Details do not match",
  "screen.public.signIn.signIn.checkYourDetailsAndTry":
    "Check your details and try again. Repeated failures pause sign-in for a short time.",
  // apps/web/src/screens/public/sign-in/staff-code-set-up.tsx
  "screen.public.signIn.staffCodeSetUp.confirm": "Confirm",
  "screen.public.signIn.staffCodeSetUp.afterConfirmationTheWorkspaceOpens":
    "After confirmation, the workspace opens.",
  "screen.public.signIn.staffCodeSetUp.openTheWorkspace": "Open the workspace",
  "screen.public.signIn.staffCodeSetUp.staffCodeSetUpFirst": "Staff code set-up (first sign-in)",
  "screen.public.signIn.staffCodeSetUp.chooseSmsOrAnAuthenticator":
    "Choose SMS or an authenticator app, then confirm a code. The workspace opens after this step.",
  "screen.public.signIn.staffCodeSetUp.codeExpired": "Code expired",
  "screen.public.signIn.staffCodeSetUp.theCodeIsWrongOr":
    "The code is wrong or expired. Request a new code and try again.",
  // apps/web/src/screens/public/sign-up/organization-sign-up.tsx
  "screen.public.signUp.organizationSignUp.owner": "Owner",
  "screen.public.signUp.organizationSignUp.ownerName": "Owner name",
  "screen.public.signUp.organizationSignUp.ownerEmail": "Owner email",
  "screen.public.signUp.organizationSignUp.ownerPhone": "Owner phone",
  "screen.public.signUp.organizationSignUp.organization": "Organization",
  "screen.public.signUp.organizationSignUp.legalName": "Legal name",
  "screen.public.signUp.organizationSignUp.country": "Country",
  "screen.public.signUp.organizationSignUp.required": "Required.",
  "screen.public.signUp.organizationSignUp.commercialRegistrationNumber":
    "Commercial registration number",
  "screen.public.signUp.organizationSignUp.taxNumber": "Tax number",
  "screen.public.signUp.organizationSignUp.commercialRegistrationDocument":
    "Commercial registration document",
  "screen.public.signUp.organizationSignUp.aClearPhotoOrScan": "A clear photo or scan.",
  "screen.public.signUp.organizationSignUp.billingContact": "Billing contact",
  "screen.public.signUp.organizationSignUp.billingContactName": "Billing contact name",
  "screen.public.signUp.organizationSignUp.billingContactEmail": "Billing contact email",
  "screen.public.signUp.organizationSignUp.submissionFailed": "Submission failed",
  "screen.public.signUp.organizationSignUp.planAndReview": "Plan and review",
  "screen.public.signUp.organizationSignUp.theStarterPlanIsAssigned":
    "The Starter plan is assigned when your organization is approved. The registry check is manual. No staff access is granted before approval.",
  "screen.public.signUp.organizationSignUp.submitting": "Submitting...",
  "screen.public.signUp.organizationSignUp.submitForReview": "Submit for review",
  "screen.public.signUp.organizationSignUp.organizationSignUpWebOnly":
    "Organization sign-up (web only)",
  "screen.public.signUp.organizationSignUp.registerYourOrganizationForAdmin":
    "Register your organization for admin review. Owners verify both email and phone.",
  "screen.public.signUp.organizationSignUp.countryIsMissing": "Country is missing",
  "screen.public.signUp.organizationSignUp.selectACountrySubmitIs":
    "Select a country. Submit is refused until it is set.",
  // apps/web/src/screens/public/sign-up/photographer-sign-up.tsx
  "screen.public.signUp.photographerSignUp.uploadProgress":
    "Upload at least {min} photos. Uploaded: {uploaded} of {min}.",
  "screen.public.signUp.photographerSignUp.nameOrStudioName": "Name or studio name",
  "screen.public.signUp.photographerSignUp.email": "Email",
  "screen.public.signUp.photographerSignUp.phone": "Phone",
  "screen.public.signUp.photographerSignUp.country": "Country",
  "screen.public.signUp.photographerSignUp.required": "Required.",
  "screen.public.signUp.photographerSignUp.portfolioPhotosNeeded": "Portfolio photos needed",
  "screen.public.signUp.photographerSignUp.portfolioPhotos": "Portfolio photos",
  "screen.public.signUp.photographerSignUp.minimumPhotosSubmitStaysBlocked":
    "Minimum {min} photos. Submit stays blocked until the minimum is met.",
  "screen.public.signUp.photographerSignUp.submissionFailed": "Submission failed",
  "screen.public.signUp.photographerSignUp.submitting": "Submitting...",
  "screen.public.signUp.photographerSignUp.submitApplication": "Submit application",
  "screen.public.signUp.photographerSignUp.photographerSignUp": "Photographer sign-up",
  "screen.public.signUp.photographerSignUp.applyToJoinThePlatform":
    "Apply to join the platform photographer pool. Photographers verify both email and phone.",
  "screen.public.signUp.photographerSignUp.addMorePhotos": "Add more photos",
  "screen.public.signUp.photographerSignUp.yourPortfolioHasFewerThan":
    "Your portfolio has fewer than",
  "screen.public.signUp.photographerSignUp.photosAddMoreToSubmit": "photos. Add more to submit.",
  // apps/web/src/screens/public/sign-up/platform-driver-sign-up.tsx
  "screen.public.signUp.platformDriverSignUp.registrationDocument": "Registration document",
  "screen.public.signUp.platformDriverSignUp.insuranceDocument": "Insurance document",
  "screen.public.signUp.platformDriverSignUp.labResult": "Lab result",
  "screen.public.signUp.platformDriverSignUp.aClearPhotoOrScan": "A clear photo or scan.",
  "screen.public.signUp.platformDriverSignUp.identity": "Identity",
  "screen.public.signUp.platformDriverSignUp.fullName": "Full name",
  "screen.public.signUp.platformDriverSignUp.email": "Email",
  "screen.public.signUp.platformDriverSignUp.phone": "Phone",
  "screen.public.signUp.platformDriverSignUp.country": "Country",
  "screen.public.signUp.platformDriverSignUp.required": "Required.",
  "screen.public.signUp.platformDriverSignUp.vehicle": "Vehicle",
  "screen.public.signUp.platformDriverSignUp.iDriveMyOwnVehicle": "I drive my own vehicle",
  "screen.public.signUp.platformDriverSignUp.plateNumber": "Plate number",
  "screen.public.signUp.platformDriverSignUp.model": "Model",
  "screen.public.signUp.platformDriverSignUp.year": "Year",
  "screen.public.signUp.platformDriverSignUp.seats": "Seats",
  "screen.public.signUp.platformDriverSignUp.documents": "Documents",
  "screen.public.signUp.platformDriverSignUp.insuranceValidUntil": "Insurance valid until",
  "screen.public.signUp.platformDriverSignUp.yyyyMmDd": "YYYY-MM-DD",
  "screen.public.signUp.platformDriverSignUp.insuranceMustBeValidFor":
    "Insurance must be valid for at least 3 more months.",
  "screen.public.signUp.platformDriverSignUp.labTestDate": "Lab test date",
  "screen.public.signUp.platformDriverSignUp.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.public.signUp.platformDriverSignUp.theLabResultMustBe":
    "The lab result must be less than 30 days old.",
  "screen.public.signUp.platformDriverSignUp.consent": "Consent",
  "screen.public.signUp.platformDriverSignUp.iConsentToABackground":
    "I consent to a background check",
  "screen.public.signUp.platformDriverSignUp.requiredToJoinTheDriver":
    "Required to join the driver pool.",
  "screen.public.signUp.platformDriverSignUp.iConsentToALab": "I consent to a lab test",
  "screen.public.signUp.platformDriverSignUp.requiredToJoinTheDriverDescription":
    "Required to join the driver pool.",
  "screen.public.signUp.platformDriverSignUp.applicationBlocked": "Application blocked",
  "screen.public.signUp.platformDriverSignUp.submitting": "Submitting...",
  "screen.public.signUp.platformDriverSignUp.submitApplication": "Submit application",
  "screen.public.signUp.platformDriverSignUp.platformDriverSignUp": "Platform driver sign-up",
  "screen.public.signUp.platformDriverSignUp.applyToJoinThePlatform":
    "Apply to join the platform driver pool. Drivers verify both email and phone.",
  "screen.public.signUp.platformDriverSignUp.applicationBlockedTitle": "Application blocked",
  "screen.public.signUp.platformDriverSignUp.insuranceMustBeValidFor2":
    "Insurance must be valid for at least 3 more months, and the lab result must be less than 30 days old.",
  // apps/web/src/screens/public/sign-up/sign-up-chooser.tsx
  "screen.public.signUp.signUpChooser.traveler": "Traveler",
  "screen.public.signUp.signUpChooser.createATravelerAccountOn":
    "Create a traveler account on the Free plan.",
  "screen.public.signUp.signUpChooser.platformDriver": "Platform driver",
  "screen.public.signUp.signUpChooser.applyToJoinThePlatform":
    "Apply to join the platform driver pool.",
  "screen.public.signUp.signUpChooser.photographer": "Photographer",
  "screen.public.signUp.signUpChooser.applyToJoinThePlatformDescription":
    "Apply to join the platform photographer pool.",
  "screen.public.signUp.signUpChooser.organization": "Organization",
  "screen.public.signUp.signUpChooser.registerAnOrganizationForAdmin":
    "Register an organization for admin review.",
  "screen.public.signUp.signUpChooser.webOnly": "Web only",
  "screen.public.signUp.signUpChooser.continueAs": "Continue as",
  "screen.public.signUp.signUpChooser.signUpChooserRegister": "Sign-up chooser (/register)",
  "screen.public.signUp.signUpChooser.pickTheRoleThatFits": "Pick the role that fits you.",
  "screen.public.signUp.signUpChooser.rolesCouldNotLoad": "Roles could not load",
  "screen.public.signUp.signUpChooser.refreshThePageToTry": "Refresh the page to try again.",
  "screen.public.signUp.signUpChooser.alreadyHaveAnAccount": "Already have an account?",
  "screen.public.signUp.signUpChooser.signIn": "Sign in",
  // apps/web/src/screens/public/sign-up/traveler-sign-up.tsx
  "screen.public.signUp.travelerSignUp.fullName": "Full name",
  "screen.public.signUp.travelerSignUp.email": "Email",
  "screen.public.signUp.travelerSignUp.enterAnEmailAPhone":
    "Enter an email, a phone number, or both. At least one is required.",
  "screen.public.signUp.travelerSignUp.phone": "Phone",
  "screen.public.signUp.travelerSignUp.country": "Country",
  "screen.public.signUp.travelerSignUp.required": "Required.",
  "screen.public.signUp.travelerSignUp.language": "Language",
  "screen.public.signUp.travelerSignUp.passwordOptional": "Password (optional)",
  "screen.public.signUp.travelerSignUp.leaveEmptyToSignIn":
    "Leave empty to sign in with a one-time code.",
  "screen.public.signUp.travelerSignUp.createAccount": "Create account",
  "screen.public.signUp.travelerSignUp.travelerSignUp": "Traveler sign-up",
  "screen.public.signUp.travelerSignUp.createATravelerAccountOn":
    "Create a traveler account on the Free plan.",
  "screen.public.signUp.travelerSignUp.accountAlreadyExists": "Account already exists",
  "screen.public.signUp.travelerSignUp.anAccountAlreadyUsesThis":
    "An account already uses this email or phone. Sign in instead.",
  // apps/web/src/screens/public/sign-up/verification-by-code.tsx
  "screen.public.signUp.verificationByCode.verify": "Verify",
  "screen.public.signUp.verificationByCode.afterVerification": "After verification",
  "screen.public.signUp.verificationByCode.signIn": "Sign in",
  "screen.public.signUp.verificationByCode.applicationStatus": "Application status",
  "screen.public.signUp.verificationByCode.verificationByCode": "Verification by code",
  "screen.public.signUp.verificationByCode.confirmYourEmailOrPhone":
    "Confirm your email or phone before your account can act.",
  "screen.public.signUp.verificationByCode.wrongCode": "Wrong code",
  "screen.public.signUp.verificationByCode.thatCodeDoesNotMatch":
    "That code does not match. Five wrong codes pause verification for 15 minutes.",
  // apps/web/src/screens/registry.ts
  "screen.registry.surface.publicAndSignIn": "Public and sign-in",
  "screen.registry.surface.sharedStates": "Shared states",
  "screen.registry.surface.organizationDashboard": "Organization dashboard",
  "screen.registry.surface.adminConsole": "Admin console",
  // apps/web/src/screens/shared/index.ts
  "screen.registry.shared.planLimitUpgradePrompt.title": "Plan-limit upgrade prompt",
  "screen.registry.shared.permissionDenied.title": "Permission denied (403)",
  "screen.registry.shared.notFound.title": "Not found (404)",
  "screen.registry.shared.unauthorized.title": "Unauthorized (401)",
  "screen.registry.shared.serverError.title": "Server error (500)",
  "screen.registry.shared.serviceUnavailable.title": "Service unavailable (503)",
  "screen.registry.shared.maintenancePage.title": "Maintenance page",
  "screen.registry.shared.offlineBanner.title": "Offline banner",
  "screen.registry.shared.confirmationDialog.title": "Confirmation dialog",
  "screen.registry.shared.languageSwitchAndRtl.title": "Language switch and RTL",
  "screen.registry.shared.notificationCentre.title": "Notification centre",
  "screen.registry.shared.receiptAndInvoiceView.title": "Receipt and invoice view",
  "screen.registry.shared.roleAndOrganizationSwitcher.title": "Role and organization switcher",
  "screen.registry.shared.otpEntry.title": "OTP entry",
  "screen.registry.shared.seatMap.title": "Seat map",
  "screen.registry.shared.documentAndPhotoUpload.title": "Document and photo upload",
  // apps/web/src/screens/shared/otp-entry-panel.tsx
  "screen.shared.otpEntryPanel.enterDigitCode": "Enter the {length}-digit code sent to",
  "screen.shared.otpEntryPanel.codeExpiry": ". The code expires in {minutes} minutes.",
  "screen.shared.otpEntryPanel.resendIn": "Resend code in {seconds}s",
  "screen.shared.otpEntryPanel.verificationCode": "Verification code",
  "screen.shared.otpEntryPanel.digitOf": "Digit {position} of {length}",
  "screen.shared.otpEntryPanel.changeEmailOrPhone": "Change email or phone",
  // apps/web/src/screens/shared/scr-shr-01-plan-limit-upgrade-prompt.tsx
  "screen.shared.scrShr01PlanLimitUpgradePrompt.planLimitUpgradePrompt":
    "Plan-limit upgrade prompt",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.aPlanLimitBlocksThis":
    "A plan limit blocks this action. Upgrading lifts the limit.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.thisActionIsLockedOn":
    "This action is locked on your current plan.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.paymentFailed": "Payment failed",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.theUpgradeDidNotGo":
    "The upgrade did not go through, so the action stays blocked. Try another payment method.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.planLimitReached": "Plan limit reached",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.yourCurrentPlanDoesNot":
    "Your current plan does not allow this action. Upgrading takes effect immediately and is prorated.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.upgradeTo": "Upgrade to {plan}",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.cancel": "Cancel",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.limit": "Limit",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.limitNameFromTheBlocked":
    "Limit name from the blocked action",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.liftedBy": "Lifted by",
  // apps/web/src/screens/shared/scr-shr-02-permission-denied.tsx
  "screen.shared.scrShr02PermissionDenied.youDonTHavePermission":
    "You don't have permission for this",
  "screen.shared.scrShr02PermissionDenied.yourRoleDoesNotInclude":
    "Your role does not include this action. Go back to the screen you came from.",
  "screen.shared.scrShr02PermissionDenied.goBack": "Go back",
  // apps/web/src/screens/shared/scr-shr-03-not-found.tsx
  "screen.shared.scrShr03NotFound.theLinkMayBeOut":
    "The link may be out of date or the item was removed. Check the address, or go to home.",
  "screen.shared.scrShr03NotFound.goToHome": "Go to home",
  // apps/web/src/screens/shared/scr-shr-04-unauthorized.tsx
  "screen.shared.scrShr04Unauthorized.signInToContinue": "Sign in to continue",
  "screen.shared.scrShr04Unauthorized.yourSessionIsNoLonger":
    "Your session is no longer valid. Sign in again and you return to this page.",
  "screen.shared.scrShr04Unauthorized.signIn": "Sign in",
  // apps/web/src/screens/shared/scr-shr-05-server-error.tsx
  "screen.shared.scrShr05ServerError.requestId": "Request ID",
  "screen.shared.scrShr05ServerError.tryAgain": "Try again",
  "screen.shared.scrShr05ServerError.goToHome": "Go to home",
  // apps/web/src/screens/shared/scr-shr-06-service-unavailable.tsx
  "screen.shared.scrShr06ServiceUnavailable.serviceIsTemporarilyUnavailable":
    "Service is temporarily unavailable",
  "screen.shared.scrShr06ServiceUnavailable.weAreRestoringTheService":
    "We are restoring the service. Booking payments are not lost: callbacks are queued and processed when the service returns.",
  "screen.shared.scrShr06ServiceUnavailable.retry": "Retry",
  "screen.shared.scrShr06ServiceUnavailable.updatesArePostedOnThe":
    "Updates are posted on the status page.",
  // apps/web/src/screens/shared/scr-shr-07-maintenance-page.tsx
  "screen.shared.scrShr07MaintenancePage.plannedMaintenance": "Planned maintenance",
  "screen.shared.scrShr07MaintenancePage.tripsEnjoyIsUnavailableDuring":
    "Trips Enjoy is unavailable during a planned maintenance window. Payment callbacks keep queueing and are processed after the window.",
  "screen.shared.scrShr07MaintenancePage.startAndEndTimesIn":
    "Start and end times, in your time zone",
  "screen.shared.scrShr07MaintenancePage.plannedWindow": "Planned window",
  "screen.shared.scrShr07MaintenancePage.tryAgainAfterTheWindow": "Try again after the window ends",
  // apps/web/src/screens/shared/scr-shr-08-offline-banner.tsx
  "screen.shared.scrShr08OfflineBanner.youAreOfflineViewingSaved":
    "You are offline. Viewing saved trips still works. Booking and payment actions are paused until the connection returns.",
  "screen.shared.scrShr08OfflineBanner.retry": "Retry",
  "screen.shared.scrShr08OfflineBanner.offlineBanner": "Offline banner",
  "screen.shared.scrShr08OfflineBanner.theBannerSitsAboveThe":
    "The banner sits above the current screen and clears when the connection returns.",
  "screen.shared.scrShr08OfflineBanner.contentAlreadyOnScreenStays":
    "Content already on screen stays visible. Actions that need a connection are disabled until the app is back online.",
  // apps/web/src/screens/shared/scr-shr-09-confirmation-dialog.tsx
  "screen.shared.scrShr09ConfirmationDialog.confirmationDialog": "Confirmation dialog",
  "screen.shared.scrShr09ConfirmationDialog.aDecisionScreenAsksFor":
    "A decision screen asks for confirmation before the change is saved.",
  "screen.shared.scrShr09ConfirmationDialog.reviewChange": "Review change",
  "screen.shared.scrShr09ConfirmationDialog.back": "Back",
  "screen.shared.scrShr09ConfirmationDialog.confirmThisChange": "Confirm this change",
  "screen.shared.scrShr09ConfirmationDialog.theChangeTakesEffectWhen":
    "The change takes effect when you confirm. Affected travelers are notified before it applies. This action is recorded.",
  "screen.shared.scrShr09ConfirmationDialog.confirmChange": "Confirm change",
  "screen.shared.scrShr09ConfirmationDialog.cancel": "Cancel",
  "screen.shared.scrShr09ConfirmationDialog.reason": "Reason",
  "screen.shared.scrShr09ConfirmationDialog.requiredForThisChangeConfirm":
    "Required for this change. Confirm stays disabled until it is filled.",
  // apps/web/src/screens/shared/scr-shr-10-language-switch-and-rtl.tsx
  "screen.shared.scrShr10LanguageSwitchAndRtl.languageSwitchAndRtl": "Language switch and RTL",
  "screen.shared.scrShr10LanguageSwitchAndRtl.layoutRightToLeft": "Layout: right to left",
  "screen.shared.scrShr10LanguageSwitchAndRtl.layoutLeftToRight": "Layout: left to right",
  "screen.shared.scrShr10LanguageSwitchAndRtl.back": "Back",
  "screen.shared.scrShr10LanguageSwitchAndRtl.fullName": "Full name",
  "screen.shared.scrShr10LanguageSwitchAndRtl.country": "Country",
  "screen.shared.scrShr10LanguageSwitchAndRtl.continue": "Continue",
  // apps/web/src/screens/shared/scr-shr-11-notification-centre.tsx
  "screen.shared.scrShr11NotificationCentre.applicationStatusChanged": "Application status changed",
  "screen.shared.scrShr11NotificationCentre.yourApplicationIsNowPending":
    "Your application is now pending review.",
  "screen.shared.scrShr11NotificationCentre.verificationCodeSent": "Verification code sent",
  "screen.shared.scrShr11NotificationCentre.checkYourEmailForThe":
    "Check your email for the code. Codes expire after 5 minutes.",
  "screen.shared.scrShr11NotificationCentre.tripTimeChanged": "Trip time changed",
  "screen.shared.scrShr11NotificationCentre.emailDeliveryFailedDeliveryStatus":
    "Email delivery failed. Delivery status: retry scheduled.",
  "screen.shared.scrShr11NotificationCentre.all": "All",
  "screen.shared.scrShr11NotificationCentre.unread": "Unread",
  "screen.shared.scrShr11NotificationCentre.filterNotifications": "Filter notifications",
  "screen.shared.scrShr11NotificationCentre.markAllAsRead": "Mark all as read",
  "screen.shared.scrShr11NotificationCentre.noUnreadNotifications": "No unread notifications",
  "screen.shared.scrShr11NotificationCentre.youAreAllCaughtUp": "You are all caught up.",
  "screen.shared.scrShr11NotificationCentre.notificationCentre": "Notification centre",
  "screen.shared.scrShr11NotificationCentre.yourNotificationsWithDeliveryStatus":
    "Your notifications, with delivery status for each one.",
  "screen.shared.scrShr11NotificationCentre.back": "Back",
  "screen.shared.scrShr11NotificationCentre.noNotificationsYet": "No notifications yet",
  "screen.shared.scrShr11NotificationCentre.notificationsAboutYourBookingsAnd":
    "Notifications about your bookings and applications appear here.",
  "screen.shared.scrShr11NotificationCentre.notificationsCouldNotLoad":
    "Notifications could not load",
  "screen.shared.scrShr11NotificationCentre.tryAgainInAFew": "Try again in a few minutes.",
  // apps/web/src/screens/shared/scr-shr-12-receipt-and-invoice-view.tsx
  "screen.shared.scrShr12ReceiptAndInvoiceView.lineDescription": "Line description",
  "screen.shared.scrShr12ReceiptAndInvoiceView.description": "Description",
  "screen.shared.scrShr12ReceiptAndInvoiceView.amount": "Amount",
  "screen.shared.scrShr12ReceiptAndInvoiceView.issued": "Issued",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptNumberIssueDateAnd":
    "Receipt number, issue date and buyer details appear here.",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptLines": "Receipt lines",
  "screen.shared.scrShr12ReceiptAndInvoiceView.noLines": "No lines",
  "screen.shared.scrShr12ReceiptAndInvoiceView.tax": "Tax",
  "screen.shared.scrShr12ReceiptAndInvoiceView.total": "Total",
  "screen.shared.scrShr12ReceiptAndInvoiceView.exportIsLockedOnThe":
    "Export is locked on the Free plan.",
  "screen.shared.scrShr12ReceiptAndInvoiceView.upgradeToExport": "Upgrade to export",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptAndInvoiceView": "Receipt and invoice view",
  "screen.shared.scrShr12ReceiptAndInvoiceView.numberDateBuyerLinesTax":
    "Number, date, buyer, lines, tax and totals.",
  "screen.shared.scrShr12ReceiptAndInvoiceView.back": "Back",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptCouldNotLoad": "Receipt could not load",
  "screen.shared.scrShr12ReceiptAndInvoiceView.tryAgainLaterTheReceipt":
    "Try again later. The receipt stays available from your bookings.",
  // apps/web/src/screens/shared/scr-shr-13-role-and-organization-switcher.tsx
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.showingRole":
    "Showing: {role}. Data from other roles is not shown.",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.traveler": "Traveler",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.driver": "Driver",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.organization1": "Organization 1",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.organization2": "Organization 2",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.roleAndOrganizationSwitcher":
    "Role and organization switcher",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.onlyRolesYouHoldAnd":
    "Only roles you hold and organizations linked to your email are listed. Switching never shows another role's data.",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.back": "Back",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.roles": "Roles",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.organizations": "Organizations",
  // apps/web/src/screens/shared/scr-shr-14-otp-entry.tsx
  "screen.shared.scrShr14OtpEntry.verify": "Verify",
  "screen.shared.scrShr14OtpEntry.otpEntry": "OTP entry",
  "screen.shared.scrShr14OtpEntry.enterTheOneTimeCode":
    "Enter the one-time code. Codes are not shown or logged.",
  "screen.shared.scrShr14OtpEntry.back": "Back",
  "screen.shared.scrShr14OtpEntry.wrongCode": "Wrong code",
  "screen.shared.scrShr14OtpEntry.thatCodeDoesNotMatch":
    "That code does not match. After five wrong codes, verification pauses for 15 minutes.",
  // apps/web/src/screens/shared/scr-shr-15-seat-map.tsx
  "screen.shared.scrShr15SeatMap.vehicleSeatMap": "Vehicle seat map",
  "screen.shared.scrShr15SeatMap.seatsAsAList": "Seats as a list",
  "screen.shared.scrShr15SeatMap.seat": "Seat",
  "screen.shared.scrShr15SeatMap.selectedSeat": "Selected seat:",
  "screen.shared.scrShr15SeatMap.confirmSeat": "Confirm seat",
  "screen.shared.scrShr15SeatMap.seatMap": "Seat map",
  "screen.shared.scrShr15SeatMap.selectAnAvailableSeatSeat":
    "Select an available seat. Seat states are shown as words and icons.",
  "screen.shared.scrShr15SeatMap.back": "Back",
  "screen.shared.scrShr15SeatMap.seatTaken": "Seat taken",
  "screen.shared.scrShr15SeatMap.thisSeatWasTakenWhile":
    "This seat was taken while you were choosing. Choose another seat.",
  // apps/web/src/screens/shared/scr-shr-16-document-and-photo-upload.tsx
  "screen.shared.scrShr16DocumentAndPhotoUpload.uploadProgress":
    "Upload at least {min} photos. Uploaded: {uploaded} of {min}.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.fileTypeNotAllowed": "File type not allowed",
  "screen.shared.scrShr16DocumentAndPhotoUpload.documents": "Documents",
  "screen.shared.scrShr16DocumentAndPhotoUpload.chooseAFileOrTake":
    "Choose a file or take a photo.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.portfolioPhotos": "Portfolio photos",
  "screen.shared.scrShr16DocumentAndPhotoUpload.minimumCount": "Minimum count",
  "screen.shared.scrShr16DocumentAndPhotoUpload.portfolioPhotosLabel": "Portfolio photos",
  "screen.shared.scrShr16DocumentAndPhotoUpload.photosAreStrippedOfLocation":
    "Photos are stripped of location data before they are stored.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.documentAndPhotoUpload":
    "Document and photo upload",
  "screen.shared.scrShr16DocumentAndPhotoUpload.filesAreCheckedForType":
    "Files are checked for type, size and count. An interrupted upload resumes without starting again.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.back": "Back",
  "screen.shared.scrShr16DocumentAndPhotoUpload.fileRefused": "File refused",
  "screen.shared.scrShr16DocumentAndPhotoUpload.thisFileTypeIsNot":
    "This file type is not allowed. Choose a PDF or an image.",
  // apps/web/src/screens/shared/state-preview.tsx
  "screen.shared.statePreview.labels.main": "Main",
  "screen.shared.statePreview.labels.loading": "Loading",
  "screen.shared.statePreview.labels.empty": "Empty",
  "screen.shared.statePreview.labels.error": "Error",
  "screen.shared.statePreview.previewState": "Preview state",
  "screen.shared.statePreview.loading": "Loading",
  // packages/ui/src/components/message-scroller.tsx
  "ui.messageScroller.scrollToEnd": "Scroll to end",
  "ui.messageScroller.scrollToStart": "Scroll to start",
  // packages/ui/src/components/te-application-card.tsx
  "ui.teApplicationCard.labels.pendingReview": "Pending review",
  "ui.teApplicationCard.labels.changesRequested": "Changes requested",
  "ui.teApplicationCard.labels.approved": "Approved",
  "ui.teApplicationCard.labels.rejected": "Rejected",
  // packages/ui/src/components/te-assignment-card.tsx
  "ui.teAssignmentCard.labels.route": "Route",
  "ui.teAssignmentCard.labels.departure": "Departure",
  "ui.teAssignmentCard.labels.vehicle": "Vehicle",
  // packages/ui/src/components/te-bar-chart.tsx
  "ui.teBarChart.item": "Item",
  "ui.teBarChart.value": "Value",
  // packages/ui/src/components/te-calendar.tsx
  "ui.teCalendar.dateSelected": "{date}, selected",
  "ui.teCalendar.previousMonth": "Previous month",
  "ui.teCalendar.nextMonth": "Next month",
  // packages/ui/src/components/te-checklist.tsx
  "ui.teChecklist.labels.checked": "Checked",
  "ui.teChecklist.labels.notYet": "Not yet",
  // packages/ui/src/components/te-error-state.tsx
  "ui.teErrorState.weCanTFindThis": "We can't find this page",
  "ui.teErrorState.theLinkMayBeOut":
    "The link may be out of date or the page may have moved. Check the address, or go back to your trips.",
  "ui.teErrorState.goToMyTrips": "Go to my trips",
  "ui.teErrorState.somethingWentWrongOnOur": "Something went wrong on our side",
  "ui.teErrorState.yourBookingAndPaymentsAre":
    "Your booking and payments are safe. Please try again in a few minutes.",
  "ui.teErrorState.tryAgain": "Try again",
  "ui.teErrorState.youReOffline": "You're offline",
  "ui.teErrorState.checkYourInternetConnectionThen":
    "Check your internet connection, then try again.",
  "ui.teErrorState.tryAgainActionLabel": "Try again",
  "ui.teErrorState.youDonTHaveAccess": "You don't have access to this page",
  "ui.teErrorState.askTheTripOrganizerFor":
    "Ask the trip organizer for access, or sign in with the account that has it.",
  "ui.teErrorState.signIn": "Sign in",
  "ui.teErrorState.signInToContinue": "Sign in to continue",
  "ui.teErrorState.yourSessionHasEndedSign":
    "Your session has ended. Sign in again to see this page.",
  "ui.teErrorState.signInActionLabel": "Sign in",
  "ui.teErrorState.serviceTemporarilyUnavailable": "Service temporarily unavailable",
  "ui.teErrorState.weAreWorkingOnIt": "We are working on it. Try again in a few minutes.",
  "ui.teErrorState.tryAgain2": "Try again",
  // packages/ui/src/components/te-file-upload.tsx
  "ui.teFileUpload.labels.waiting": "Waiting",
  "ui.teFileUpload.labels.uploading": "Uploading",
  "ui.teFileUpload.labels.uploaded": "Uploaded",
  "ui.teFileUpload.labels.failed": "Failed",
  // packages/ui/src/components/te-inline-alert.tsx
  "ui.teInlineAlert.error": "Error",
  "ui.teInlineAlert.warning": "Warning",
  "ui.teInlineAlert.info": "Info",
  "ui.teInlineAlert.success": "Success",
  // packages/ui/src/components/te-link.tsx
  "ui.teLink.opensInANewTab": "(opens in a new tab)",
  // packages/ui/src/components/te-offer-card.tsx
  "ui.teOfferCard.labels.open": "Open",
  "ui.teOfferCard.labels.accepted": "Accepted",
  "ui.teOfferCard.labels.declined": "Declined",
  "ui.teOfferCard.labels.countered": "Countered",
  // packages/ui/src/components/te-pagination.tsx
  "ui.tePagination.labels.previousPage": "Previous page",
  "ui.tePagination.labels.nextPage": "Next page",
  "ui.tePagination.labels.pageOf": "Page {page} of {pageCount}",
  // packages/ui/src/components/te-role-badge.tsx
  "ui.teRoleBadge.labels.traveler": "Traveler",
  "ui.teRoleBadge.labels.parent": "Parent",
  "ui.teRoleBadge.labels.driver": "Driver",
  "ui.teRoleBadge.labels.photographer": "Photographer",
  "ui.teRoleBadge.labels.organization": "Organization",
  "ui.teRoleBadge.labels.admin": "Admin",
  // packages/ui/src/components/te-seat-map.tsx
  "ui.teSeatMap.labels.available": "Available",
  "ui.teSeatMap.labels.selected": "Selected",
  "ui.teSeatMap.labels.held": "Held",
  "ui.teSeatMap.labels.reserved": "Reserved",
  "ui.teSeatMap.labels.checkedIn": "Checked in",
  "ui.teSeatMap.labels.checkedOut": "Checked out",
  "ui.teSeatMap.labels.cancelled": "Cancelled",
  "ui.teSeatMap.labels.taken": "Taken",
  "ui.teSeatMap.labels.blocked": "Blocked",
  // packages/ui/src/components/te-stepper.tsx
  "ui.teStepper.labels.done": "Done",
  "ui.teStepper.labels.current": "Current",
  "ui.teStepper.labels.upcoming": "Upcoming",
  // packages/ui/src/components/te-timeline.tsx
  "ui.teTimeline.labels.done": "Done",
  "ui.teTimeline.labels.current": "Current",
  "ui.teTimeline.labels.upcoming": "Upcoming",
  "ui.teTimeline.labels.missed": "Missed",
  // packages/ui/src/components/te-tracking-status.tsx
  "ui.teTrackingStatus.onTime": "On time",
  "ui.teTrackingStatus.delayed": "Delayed",
  "ui.teTrackingStatus.boarded": "Boarded",
  "ui.teTrackingStatus.notBoarded": "Not boarded",
  "ui.teTrackingStatus.arrived": "Arrived",
  // apps/web/src/components/shells
  "component.shell.brand.name": "Trips Enjoy",
  "component.shell.skipToContent": "Skip to content",
  "component.shell.language.arabic": "العربية",
  "component.shell.language.english": "English",
  "component.shell.public.signIn": "Sign in",
  "component.shell.public.signUp": "Sign up",
  "component.shell.public.primaryNav": "Site",
  "component.shell.screenNotBuilt": "This page is not built yet.",
  "component.shell.org.navLabel": "Organization",
  "component.shell.org.nav.home": "Workspace home",
  "component.shell.org.nav.trips": "Trips",
  "component.shell.org.nav.vehicles": "Vehicles",
  "component.shell.org.nav.staffing": "Staffing",
  "component.shell.org.nav.bookings": "Bookings",
  "component.shell.org.nav.coupons": "Coupons",
  "component.shell.org.nav.accounting": "Accounting",
  "component.shell.org.nav.employees": "Employees",
  "component.shell.org.nav.invoices": "Invoices",
  "component.shell.org.nav.reports": "Reports",
  "component.shell.org.nav.live": "Live operations",
  "component.shell.org.nav.subscription": "Subscription",
  "component.shell.org.nav.settings": "Settings and CRM",
  "component.shell.admin.consoleName": "Admin console",
  "component.shell.admin.navLabel": "Admin sections",
  "component.shell.admin.nav.home": "Home",
  "component.shell.admin.nav.applications": "Applications",
  "component.shell.admin.nav.directory": "Users and entities",
  "component.shell.admin.nav.labTests": "Lab tests",
  "component.shell.admin.nav.plans": "Plans and revenue",
  "component.shell.admin.nav.coupons": "Coupons and deals",
  "component.shell.admin.nav.disputes": "Disputes",
  "component.shell.admin.nav.money": "Money",
  "component.shell.admin.nav.trips": "Trips",
  "component.shell.admin.nav.audit": "Audit log",
  "component.shell.admin.nav.notifications": "Notifications",
  "component.shell.admin.nav.platform": "Platform",
} as const;

/** Every screen message key, derived from the English table. */
export type AppMessageKey = keyof typeof en;

/** A complete locale table: one string per key, no gaps. */
export type AppMessages = Readonly<Record<AppMessageKey, string>>;
