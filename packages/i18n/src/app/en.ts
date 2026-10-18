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
  "screen.admin.applications.appealReview.title": "Appeal review",
  "screen.admin.applications.appealReview.description":
    "Decide an appeal from a rejected applicant.",
  "screen.admin.applications.appealReview.appealedPending": "Appealed, decision pending",
  "screen.admin.applications.appealReview.decidedApproved": "Appeal upheld, approved",
  "screen.admin.applications.appealReview.decidedRejected": "Rejection upheld",
  "screen.admin.applications.appealReview.originalApplication": "Original application",
  "screen.admin.applications.appealReview.applicant": "Applicant",
  "screen.admin.applications.appealReview.type": "Type",
  "screen.admin.applications.appealReview.driver": "Driver",
  "screen.admin.applications.appealReview.organization": "Organization",
  "screen.admin.applications.appealReview.photographer": "Photographer",
  "screen.admin.applications.appealReview.rejectedOn": "Rejected on",
  "screen.admin.applications.appealReview.originalReason": "Original reason",
  "screen.admin.applications.appealReview.noMessage": "No message was sent with the rejection.",
  "screen.admin.applications.appealReview.appealStatement": "Appeal statement",
  "screen.admin.applications.appealReview.noStatement": "The applicant did not write a statement.",
  "screen.admin.applications.appealReview.appealWindow": "Appeal window: {days} days remaining",
  "screen.admin.applications.appealReview.decision": "Decision",
  "screen.admin.applications.appealReview.upholdAppeal": "Uphold appeal",
  "screen.admin.applications.appealReview.upholdAppealBody": "Set the application to Approved.",
  "screen.admin.applications.appealReview.upholdRejection": "Uphold rejection",
  "screen.admin.applications.appealReview.upholdRejectionBody": "Keep the application Rejected.",
  "screen.admin.applications.appealReview.reasonRequired": "Reason (required)",
  "screen.admin.applications.appealReview.reasonPlaceholder":
    "The appeal does not add the missing document.",
  "screen.admin.applications.appealReview.reasonTooShort": "Write at least 5 characters.",
  "screen.admin.applications.appealReview.cancel": "Cancel",
  "screen.admin.applications.appealReview.saveDecision": "Save decision",
  "screen.admin.applications.appealReview.saving": "Saving…",
  "screen.admin.applications.appealReview.saveFailed": "The decision was not saved",
  "screen.admin.applications.appealReview.saveFailedBody":
    "Try again. If it keeps failing, reload the page.",
  "screen.admin.applications.appealReview.loading": "Loading the appeal…",
  "screen.admin.applications.appealReview.emptyTitle": "No appeals to review",
  "screen.admin.applications.appealReview.emptyBody":
    "Appeals from rejected applicants appear here.",
  // apps/web/src/screens/admin/applications/application-queue.tsx
  "screen.admin.applications.applicationQueue.title": "Application queue",
  "screen.admin.applications.applicationQueue.description":
    "Work one queue for organizations, platform drivers and platform photographers.",
  "screen.admin.applications.applicationQueue.openApplication": "Open application",
  "screen.admin.applications.applicationQueue.openApplicationFor":
    "Open application for {applicant}",
  "screen.admin.applications.applicationQueue.filters": "Filters",
  "screen.admin.applications.applicationQueue.type": "Type",
  "screen.admin.applications.applicationQueue.allTypes": "All types",
  "screen.admin.applications.applicationQueue.organization": "Organization",
  "screen.admin.applications.applicationQueue.driver": "Driver",
  "screen.admin.applications.applicationQueue.photographer": "Photographer",
  "screen.admin.applications.applicationQueue.country": "Country",
  "screen.admin.applications.applicationQueue.allCountries": "All countries",
  "screen.admin.applications.applicationQueue.ageWorkingDays": "Age (working days)",
  "screen.admin.applications.applicationQueue.anyAge": "Any age",
  "screen.admin.applications.applicationQueue.overdueOnly": "Overdue (more than 2 working days)",
  "screen.admin.applications.applicationQueue.state": "State",
  "screen.admin.applications.applicationQueue.allStates": "All states",
  "screen.admin.applications.applicationQueue.submittedState": "Submitted",
  "screen.admin.applications.applicationQueue.underReview": "Under review",
  "screen.admin.applications.applicationQueue.changesRequested": "Changes requested",
  "screen.admin.applications.applicationQueue.approved": "Approved",
  "screen.admin.applications.applicationQueue.rejected": "Rejected",
  "screen.admin.applications.applicationQueue.appealed": "Appealed",
  "screen.admin.applications.applicationQueue.closed": "Closed",
  "screen.admin.applications.applicationQueue.applicant": "Applicant",
  "screen.admin.applications.applicationQueue.submitted": "Submitted",
  "screen.admin.applications.applicationQueue.workingDaysWaiting": "Working days waiting",
  "screen.admin.applications.applicationQueue.overdue": "Overdue",
  "screen.admin.applications.applicationQueue.notOverdue": "Not overdue",
  "screen.admin.applications.applicationQueue.action": "Action",
  "screen.admin.applications.applicationQueue.tableCaption": "Applications waiting for review",
  "screen.admin.applications.applicationQueue.loading": "Loading the application queue.",
  "screen.admin.applications.applicationQueue.emptyTitle": "No applications match these filters",
  "screen.admin.applications.applicationQueue.emptyBody":
    "Change the filters to see more applications.",
  // apps/web/src/screens/admin/applications/application-review-detail.tsx
  "screen.admin.applications.applicationReviewDetail.title": "Application review",
  "screen.admin.applications.applicationReviewDetail.description":
    "Check the submitted data and documents, then decide.",
  "screen.admin.applications.applicationReviewDetail.reject": "Reject",
  "screen.admin.applications.applicationReviewDetail.requestChanges": "Request changes",
  "screen.admin.applications.applicationReviewDetail.approve": "Approve",
  "screen.admin.applications.applicationReviewDetail.approving": "Approving…",
  "screen.admin.applications.applicationReviewDetail.applicantData": "Applicant data",
  "screen.admin.applications.applicationReviewDetail.applicant": "Applicant",
  "screen.admin.applications.applicationReviewDetail.type": "Type",
  "screen.admin.applications.applicationReviewDetail.country": "Country",
  "screen.admin.applications.applicationReviewDetail.submitted": "Submitted",
  "screen.admin.applications.applicationReviewDetail.driver": "Driver",
  "screen.admin.applications.applicationReviewDetail.organization": "Organization",
  "screen.admin.applications.applicationReviewDetail.photographer": "Photographer",
  "screen.admin.applications.applicationReviewDetail.driverChecks": "Driver checks",
  "screen.admin.applications.applicationReviewDetail.noChecksForType":
    "No automatic checks apply to this application type.",
  "screen.admin.applications.applicationReviewDetail.backgroundConsent": "Background consent",
  "screen.admin.applications.applicationReviewDetail.labConsent": "Lab consent",
  "screen.admin.applications.applicationReviewDetail.initialLabResult":
    "Initial lab result within 30 days",
  "screen.admin.applications.applicationReviewDetail.insuranceValid":
    "Insurance valid 3 months or more",
  "screen.admin.applications.applicationReviewDetail.decision": "Decision",
  "screen.admin.applications.applicationReviewDetail.readyToApprove":
    "All checks passed and every document is on file. Approving assigns the Starter plan and sends the applicant a notice.",
  "screen.admin.applications.applicationReviewDetail.approveBlocked":
    "Approve stays off until every check passes and every document is verified.",
  "screen.admin.applications.applicationReviewDetail.restrictedTitle":
    "Identity documents are in a restricted view",
  "screen.admin.applications.applicationReviewDetail.auditRecorded":
    "Every view is recorded in the audit log.",
  "screen.admin.applications.applicationReviewDetail.documentOpened":
    "Opened {document} in the restricted view",
  "screen.admin.applications.applicationReviewDetail.duplicateHold": "Duplicate registration hold",
  "screen.admin.applications.applicationReviewDetail.duplicateHoldBody":
    "Another organization already uses this registration. Resolve the duplicate before approving.",
  "screen.admin.applications.applicationReviewDetail.actionFailed": "The action did not complete",
  "screen.admin.applications.applicationReviewDetail.actionFailedBody":
    "Try again. If it keeps failing, reload the page.",
  "screen.admin.applications.applicationReviewDetail.unverifiedNote":
    "Marked unverified during review",
  "screen.admin.applications.applicationReviewDetail.loading": "Loading the application…",
  "screen.admin.applications.applicationReviewDetail.emptyTitle": "No application to review",
  "screen.admin.applications.applicationReviewDetail.emptyBody":
    "Open an application from the queue to review it.",
  // apps/web/src/screens/admin/applications/application-review-sections.tsx
  "screen.admin.applications.applicationReviewSections.documents": "Documents",
  "screen.admin.applications.applicationReviewSections.checks": "Checks",
  "screen.admin.applications.applicationReviewSections.restrictedView": "Restricted view",
  "screen.admin.applications.applicationReviewSections.openRestricted":
    "Open {document} in the restricted view",
  "screen.admin.applications.applicationReviewSections.received": "Received",
  "screen.admin.applications.applicationReviewSections.verified": "Verified",
  "screen.admin.applications.applicationReviewSections.rejected": "Rejected",
  "screen.admin.applications.applicationReviewSections.verify": "Verify",
  "screen.admin.applications.applicationReviewSections.unverify": "Unverify",
  "screen.admin.applications.applicationReviewSections.verifyDocument": "Verify {document}",
  "screen.admin.applications.applicationReviewSections.unverifyDocument": "Unverify {document}",
  "screen.admin.applications.applicationReviewSections.noDocuments": "No documents",
  "screen.admin.applications.applicationReviewSections.noDocumentsBody":
    "The applicant has not uploaded any documents yet.",
  "screen.admin.applications.applicationReviewSections.passed": "Passed",
  "screen.admin.applications.applicationReviewSections.notConfirmed": "Not confirmed",
  "screen.admin.applications.applicationReviewSections.missing": "Missing",
  "screen.admin.applications.applicationReviewSections.markPassed": "Mark passed",
  "screen.admin.applications.applicationReviewSections.undo": "Undo",
  "screen.admin.applications.applicationReviewSections.toggleCheck": "Change the result of {check}",
  // apps/web/src/screens/admin/applications/reject-with-reason-decision.tsx
  "screen.admin.applications.rejectWithReasonDecision.title": "Reject application",
  "screen.admin.applications.rejectWithReasonDecision.description":
    "Give one reason. The applicant sees it.",
  "screen.admin.applications.rejectWithReasonDecision.cancel": "Cancel",
  "screen.admin.applications.rejectWithReasonDecision.rejectApplication": "Reject application",
  "screen.admin.applications.rejectWithReasonDecision.rejecting": "Rejecting…",
  "screen.admin.applications.rejectWithReasonDecision.reason": "Reason",
  "screen.admin.applications.rejectWithReasonDecision.reasonCode": "Reason code (required)",
  "screen.admin.applications.rejectWithReasonDecision.chooseReason": "Choose a reason code",
  "screen.admin.applications.rejectWithReasonDecision.reasonDocuments":
    "Documents incomplete or unreadable",
  "screen.admin.applications.rejectWithReasonDecision.reasonChecks": "Required checks not passed",
  "screen.admin.applications.rejectWithReasonDecision.reasonEligibility":
    "Does not meet the eligibility rules",
  "screen.admin.applications.rejectWithReasonDecision.reasonDuplicate": "Duplicate registration",
  "screen.admin.applications.rejectWithReasonDecision.message": "Message to applicant",
  "screen.admin.applications.rejectWithReasonDecision.defaultMessage":
    "Your application cannot be approved yet. The reason is shown above.",
  "screen.admin.applications.rejectWithReasonDecision.messageTooShort":
    "Write at least 5 characters.",
  "screen.admin.applications.rejectWithReasonDecision.applicantIsTold": "The applicant is told",
  "screen.admin.applications.rejectWithReasonDecision.reapplyAfter":
    "They can re-apply after 30 days.",
  "screen.admin.applications.rejectWithReasonDecision.canAppeal":
    "They can also appeal this decision.",
  "screen.admin.applications.rejectWithReasonDecision.currentState": "Current state",
  "screen.admin.applications.rejectWithReasonDecision.savedAsRejected":
    "Saved as Rejected once you confirm.",
  "screen.admin.applications.rejectWithReasonDecision.submitted": "Submitted",
  "screen.admin.applications.rejectWithReasonDecision.underReview": "Under review",
  "screen.admin.applications.rejectWithReasonDecision.changesRequested": "Changes requested",
  "screen.admin.applications.rejectWithReasonDecision.approved": "Approved",
  "screen.admin.applications.rejectWithReasonDecision.rejected": "Rejected",
  "screen.admin.applications.rejectWithReasonDecision.appealed": "Appealed",
  "screen.admin.applications.rejectWithReasonDecision.closed": "Closed",
  "screen.admin.applications.rejectWithReasonDecision.rejectFailed":
    "The application was not rejected",
  "screen.admin.applications.rejectWithReasonDecision.rejectFailedBody":
    "Try again. If it keeps failing, reload the page.",
  "screen.admin.applications.rejectWithReasonDecision.loading": "Loading the application…",
  "screen.admin.applications.rejectWithReasonDecision.noApplication": "No application selected",
  "screen.admin.applications.rejectWithReasonDecision.noApplicationBody":
    "Open an application from the queue first.",
  // apps/web/src/screens/admin/applications/request-changes-decision.tsx
  "screen.admin.applications.requestChangesDecision.title": "Request changes",
  "screen.admin.applications.requestChangesDecision.description":
    "Ask the applicant for specific fixes within 14 days.",
  "screen.admin.applications.requestChangesDecision.cancel": "Cancel",
  "screen.admin.applications.requestChangesDecision.sendRequest": "Send request",
  "screen.admin.applications.requestChangesDecision.sending": "Sending…",
  "screen.admin.applications.requestChangesDecision.itemsToFix": "Items to fix",
  "screen.admin.applications.requestChangesDecision.itemsToFixCaption":
    "Select at least one item. The applicant sees each item as written.",
  "screen.admin.applications.requestChangesDecision.fixIdentity":
    "Identity document: send a clear, complete copy",
  "screen.admin.applications.requestChangesDecision.fixInsurance":
    "Insurance certificate: send a policy valid for 3 months or more",
  "screen.admin.applications.requestChangesDecision.fixPortfolio":
    "Portfolio: add at least 8 photos",
  "screen.admin.applications.requestChangesDecision.messageTitle": "Message to applicant",
  "screen.admin.applications.requestChangesDecision.language": "Language",
  "screen.admin.applications.requestChangesDecision.english": "English",
  "screen.admin.applications.requestChangesDecision.arabic": "Arabic",
  "screen.admin.applications.requestChangesDecision.message": "Message",
  "screen.admin.applications.requestChangesDecision.defaultMessage":
    "Please send the items listed above so we can finish reviewing your application.",
  "screen.admin.applications.requestChangesDecision.messageTooShort":
    "Write at least 5 characters.",
  "screen.admin.applications.requestChangesDecision.deadline": "Deadline",
  "screen.admin.applications.requestChangesDecision.deadlineDays": "14 days from sending",
  "screen.admin.applications.requestChangesDecision.deadlineDate": "Deadline date: {date}",
  "screen.admin.applications.requestChangesDecision.afterSending": "After sending",
  "screen.admin.applications.requestChangesDecision.changesRequested": "Changes requested",
  "screen.admin.applications.requestChangesDecision.staysOpen":
    "The application stays open until the deadline.",
  "screen.admin.applications.requestChangesDecision.closesAutomatically":
    "If the deadline passes with no reply, the application closes automatically.",
  "screen.admin.applications.requestChangesDecision.sendFailed": "The request was not sent",
  "screen.admin.applications.requestChangesDecision.sendFailedBody":
    "Try again. If it keeps failing, reload the page.",
  "screen.admin.applications.requestChangesDecision.loading": "Loading the application…",
  "screen.admin.applications.requestChangesDecision.noApplication": "No application selected",
  "screen.admin.applications.requestChangesDecision.noApplicationBody":
    "Open an application from the queue first.",
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
  // apps/web/src/screens/admin/common/admin-states.tsx
  "screen.admin.common.adminStates.loading": "Loading. This can take a few seconds.",
  "screen.admin.common.adminStates.didNotLoad": "This section did not load",
  "screen.admin.common.adminStates.retry": "Retry",
  "screen.admin.common.adminStates.retryHelp":
    "The rest of the page is current. Retry to load this section.",
  // apps/web/src/screens/admin/coupons/platform-coupon-editor.tsx
  "screen.admin.coupons.platformCouponEditor.title": "Create platform coupon",
  "screen.admin.coupons.platformCouponEditor.description":
    "A platform-wide coupon applies across the whole platform.",
  "screen.admin.coupons.platformCouponEditor.cancel": "Cancel",
  "screen.admin.coupons.platformCouponEditor.saveCoupon": "Save coupon",
  "screen.admin.coupons.platformCouponEditor.discount": "Discount",
  "screen.admin.coupons.platformCouponEditor.code": "Code",
  "screen.admin.coupons.platformCouponEditor.codeError": "Enter a code of 3 to 40 characters.",
  "screen.admin.coupons.platformCouponEditor.type": "Type",
  "screen.admin.coupons.platformCouponEditor.percentage": "Percentage",
  "screen.admin.coupons.platformCouponEditor.fixedAmount": "Fixed amount",
  "screen.admin.coupons.platformCouponEditor.value": "Value",
  "screen.admin.coupons.platformCouponEditor.valueError": "Enter a value greater than zero.",
  "screen.admin.coupons.platformCouponEditor.percentError":
    "Enter a whole percentage from 1 to 100.",
  "screen.admin.coupons.platformCouponEditor.maximumRedemptions": "Maximum redemptions",
  "screen.admin.coupons.platformCouponEditor.maxRedemptionsError":
    "Enter a whole number greater than zero, or leave it empty.",
  "screen.admin.coupons.platformCouponEditor.validityAndPrograms": "Validity and programs",
  "screen.admin.coupons.platformCouponEditor.validFrom": "Valid from",
  "screen.admin.coupons.platformCouponEditor.validTo": "Valid to",
  "screen.admin.coupons.platformCouponEditor.validToError":
    "The end date must be on or after the start date.",
  "screen.admin.coupons.platformCouponEditor.programs": "Programs",
  "screen.admin.coupons.platformCouponEditor.programsUnavailable":
    "Program selection is not available yet. The coupon applies to all programs.",
  "screen.admin.coupons.platformCouponEditor.audienceAndStacking": "Audience and stacking",
  "screen.admin.coupons.platformCouponEditor.audience": "Audience",
  "screen.admin.coupons.platformCouponEditor.allAudiences": "All audiences",
  "screen.admin.coupons.platformCouponEditor.stackable": "Stackable with other coupons",
  "screen.admin.coupons.platformCouponEditor.audienceUnavailable":
    "Audience and stacking cannot be set yet.",
  "screen.admin.coupons.platformCouponEditor.scope": "Scope",
  "screen.admin.coupons.platformCouponEditor.platformWideFixed": "Platform-wide, fixed",
  "screen.admin.coupons.platformCouponEditor.scopeCannotChange":
    "The scope cannot be changed on a platform coupon.",
  "screen.admin.coupons.platformCouponEditor.validationHint":
    "Validation errors appear next to the field that needs a fix.",
  "screen.admin.coupons.platformCouponEditor.saveFailed": "The coupon was not saved",
  "screen.admin.coupons.platformCouponEditor.saveFailedBody":
    "Check the code is not already in use, then try again.",
  // apps/web/src/screens/admin/coupons/platform-coupons.tsx
  "screen.admin.coupons.platformCoupons.title": "Platform coupons",
  "screen.admin.coupons.platformCoupons.description":
    "Coupons from all creators. Revoke any coupon, and see abuse flags.",
  "screen.admin.coupons.platformCoupons.createCoupon": "Create coupon",
  "screen.admin.coupons.platformCoupons.abuseThresholdsNotSet": "Abuse thresholds are not set",
  "screen.admin.coupons.platformCoupons.abuseThresholdsBody":
    "Flags show the rule that raised them. The threshold values are still open.",
  "screen.admin.coupons.platformCoupons.tableCaption": "Platform coupons",
  "screen.admin.coupons.platformCoupons.creatorType": "Creator type",
  "screen.admin.coupons.platformCoupons.code": "Code",
  "screen.admin.coupons.platformCoupons.status": "Status",
  "screen.admin.coupons.platformCoupons.redemptions": "Redemptions",
  "screen.admin.coupons.platformCoupons.abuseFlag": "Abuse flag",
  "screen.admin.coupons.platformCoupons.actions": "Actions",
  "screen.admin.coupons.platformCoupons.organization": "Organization",
  "screen.admin.coupons.platformCoupons.platform": "Platform",
  "screen.admin.coupons.platformCoupons.active": "Active",
  "screen.admin.coupons.platformCoupons.revoked": "Revoked",
  "screen.admin.coupons.platformCoupons.expired": "Expired",
  "screen.admin.coupons.platformCoupons.none": "None",
  "screen.admin.coupons.platformCoupons.flaggedBy": "Flagged by {rule}",
  "screen.admin.coupons.platformCoupons.usageLimitRule": "usage limit reached",
  "screen.admin.coupons.platformCoupons.revoke": "Revoke",
  "screen.admin.coupons.platformCoupons.revokeCode": "Revoke {code}",
  "screen.admin.coupons.platformCoupons.analytics": "Analytics",
  "screen.admin.coupons.platformCoupons.revokeFailed": "The coupon was not revoked",
  "screen.admin.coupons.platformCoupons.revokeFailedBody":
    "Try again. The coupon stays active until the revoke is saved.",
  "screen.admin.coupons.platformCoupons.loading": "Loading the coupons…",
  "screen.admin.coupons.platformCoupons.emptyTitle": "No coupons",
  "screen.admin.coupons.platformCoupons.emptyBody": "No coupons have been created yet.",
  // apps/web/src/screens/admin/deals-and-disputes/deal-audit-detail.tsx
  "screen.admin.dealsAndDisputes.dealAuditDetail.title": "Deal audit detail",
  "screen.admin.dealsAndDisputes.dealAuditDetail.description":
    "Every offer and state change of this deal, in order.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.parties": "Parties",
  "screen.admin.dealsAndDisputes.dealAuditDetail.organization": "Organization",
  "screen.admin.dealsAndDisputes.dealAuditDetail.supplier": "Supplier",
  "screen.admin.dealsAndDisputes.dealAuditDetail.vehicleOrTrip": "Vehicle or trip",
  "screen.admin.dealsAndDisputes.dealAuditDetail.vehicleRef": "Vehicle {reference}",
  "screen.admin.dealsAndDisputes.dealAuditDetail.tripRef": "Trip {reference}",
  "screen.admin.dealsAndDisputes.dealAuditDetail.offersAndStateHistory": "Offers and state history",
  "screen.admin.dealsAndDisputes.dealAuditDetail.step": "Step",
  "screen.admin.dealsAndDisputes.dealAuditDetail.event": "Event",
  "screen.admin.dealsAndDisputes.dealAuditDetail.amount": "Amount",
  "screen.admin.dealsAndDisputes.dealAuditDetail.actor": "Actor",
  "screen.admin.dealsAndDisputes.dealAuditDetail.time": "Time",
  "screen.admin.dealsAndDisputes.dealAuditDetail.offer": "Offer",
  "screen.admin.dealsAndDisputes.dealAuditDetail.counterOffer": "Counter offer",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCostAndCommission": "Deal cost and commission",
  "screen.admin.dealsAndDisputes.dealAuditDetail.baseTripPrice": "Base trip price",
  "screen.admin.dealsAndDisputes.dealAuditDetail.commission": "Commission",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCost": "Deal cost",
  "screen.admin.dealsAndDisputes.dealAuditDetail.placeholderRate":
    "Placeholder: 10% of base trip price [OPEN]",
  "screen.admin.dealsAndDisputes.dealAuditDetail.ledger": "Ledger",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCostEntryLinked":
    "Deal cost entry linked: {reference}",
  "screen.admin.dealsAndDisputes.dealAuditDetail.viewLedgerEntries": "View ledger entries",
  "screen.admin.dealsAndDisputes.dealAuditDetail.loading": "Loading the deal…",
  "screen.admin.dealsAndDisputes.dealAuditDetail.notFoundTitle": "Deal not found",
  "screen.admin.dealsAndDisputes.dealAuditDetail.notFoundBody":
    "Open a deal from the deal audit list.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.backToDeals": "Back to deal audit",
  // apps/web/src/screens/admin/deals-and-disputes/deal-audit-list.tsx
  "screen.admin.dealsAndDisputes.dealAuditList.title": "Deal audit",
  "screen.admin.dealsAndDisputes.dealAuditList.description": "Find deals and see their state.",
  "screen.admin.dealsAndDisputes.dealAuditList.filters": "Filters",
  "screen.admin.dealsAndDisputes.dealAuditList.organizationOrSupplier": "Organization or supplier",
  "screen.admin.dealsAndDisputes.dealAuditList.searchPlaceholder": "Search by name or reference",
  "screen.admin.dealsAndDisputes.dealAuditList.state": "State",
  "screen.admin.dealsAndDisputes.dealAuditList.allStates": "All states",
  "screen.admin.dealsAndDisputes.dealAuditList.open": "Open",
  "screen.admin.dealsAndDisputes.dealAuditList.finalized": "Finalized",
  "screen.admin.dealsAndDisputes.dealAuditList.rejected": "Rejected",
  "screen.admin.dealsAndDisputes.dealAuditList.date": "Date",
  "screen.admin.dealsAndDisputes.dealAuditList.tableCaption": "Deals",
  "screen.admin.dealsAndDisputes.dealAuditList.organization": "Organization",
  "screen.admin.dealsAndDisputes.dealAuditList.supplier": "Supplier",
  "screen.admin.dealsAndDisputes.dealAuditList.vehicleOrTrip": "Vehicle or trip",
  "screen.admin.dealsAndDisputes.dealAuditList.vehicleRef": "Vehicle {reference}",
  "screen.admin.dealsAndDisputes.dealAuditList.tripRef": "Trip {reference}",
  "screen.admin.dealsAndDisputes.dealAuditList.counterCount": "Counter count",
  "screen.admin.dealsAndDisputes.dealAuditList.finalAmount": "Final amount",
  "screen.admin.dealsAndDisputes.dealAuditList.notApplicable": "Not applicable",
  "screen.admin.dealsAndDisputes.dealAuditList.actions": "Actions",
  "screen.admin.dealsAndDisputes.dealAuditList.openDeal": "Open deal",
  "screen.admin.dealsAndDisputes.dealAuditList.openDealFor": "Open deal {reference}",
  "screen.admin.dealsAndDisputes.dealAuditList.flagForReview": "Flag for review",
  "screen.admin.dealsAndDisputes.dealAuditList.flagReason":
    "Deal {reference} flagged for review from the deal audit",
  "screen.admin.dealsAndDisputes.dealAuditList.flagged": "The deal is flagged for review.",
  "screen.admin.dealsAndDisputes.dealAuditList.flagFailed": "The deal was not flagged",
  "screen.admin.dealsAndDisputes.dealAuditList.flagFailedBody": "Try again in a moment.",
  "screen.admin.dealsAndDisputes.dealAuditList.loading": "Loading the deals…",
  "screen.admin.dealsAndDisputes.dealAuditList.emptyTitle": "No deals",
  "screen.admin.dealsAndDisputes.dealAuditList.emptyBody": "No deals match these filters.",
  // apps/web/src/screens/admin/deals-and-disputes/deal-state.tsx
  "screen.admin.dealsAndDisputes.dealState.open": "Open",
  "screen.admin.dealsAndDisputes.dealState.finalized": "Finalized",
  "screen.admin.dealsAndDisputes.dealState.rejected": "Rejected",
  // apps/web/src/screens/admin/deals-and-disputes/dispute-detail-and-refund-decision.tsx
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.title": "Dispute detail",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.description":
    "Record the outcome and any refund linked to this dispute.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.cancel": "Cancel",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcome": "Save outcome",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.parties":
    "Parties, booking and payment",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.traveler": "Traveler",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.organization": "Organization",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.booking": "Booking",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.payment": "Payment",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.paymentValue":
    "{reference}, {amount}",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcome": "Outcome",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.withinPolicy":
    "Resolved within policy",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.withinPolicyBody":
    "A refund is queued and linked to this dispute and booking.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outsidePolicy":
    "Resolved outside policy",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outsidePolicyBody":
    "A reason is required and is audited with your admin identity.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.stillOpen": "Still open",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.stillOpenBody":
    "No refund is queued.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refund": "Refund",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundAmount": "Refund amount",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.amountError":
    "Enter a refund amount greater than zero.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.linkedTo":
    "Linked to dispute {dispute} and booking {booking}",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundPending":
    "Refund pending gateway confirmation",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reason": "Reason",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonPlaceholder":
    "Required for an outside-policy outcome",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonError":
    "Enter a reason for an outside-policy outcome.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.auditNote":
    "Your admin identity and the time are recorded in the audit log.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outsidePolicyRule":
    "An outside-policy outcome cannot be saved without a reason.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveFailed":
    "The outcome was not saved",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveFailedBody":
    "The refund could not be queued. Check the payment, then try again.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.loading": "Loading the dispute…",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.notFoundTitle": "Dispute not found",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.notFoundBody":
    "Open a dispute from the disputes queue.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.backToDisputes":
    "Back to disputes queue",
  // apps/web/src/screens/admin/deals-and-disputes/disputes-queue.tsx
  "screen.admin.dealsAndDisputes.disputesQueue.title": "Disputes queue",
  "screen.admin.dealsAndDisputes.disputesQueue.description": "Work disputes between parties.",
  "screen.admin.dealsAndDisputes.disputesQueue.deadlines":
    "Acknowledge each dispute within {acknowledge} working days. Resolve it within {resolve} working days.",
  "screen.admin.dealsAndDisputes.disputesQueue.filters": "Filters",
  "screen.admin.dealsAndDisputes.disputesQueue.type": "Type",
  "screen.admin.dealsAndDisputes.disputesQueue.allTypes": "All types",
  "screen.admin.dealsAndDisputes.disputesQueue.state": "State",
  "screen.admin.dealsAndDisputes.disputesQueue.allStates": "All states",
  "screen.admin.dealsAndDisputes.disputesQueue.open": "Open",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledged": "Acknowledged",
  "screen.admin.dealsAndDisputes.disputesQueue.resolved": "Resolved",
  "screen.admin.dealsAndDisputes.disputesQueue.openAcknowledgementOverdue":
    "Open, acknowledgement overdue",
  "screen.admin.dealsAndDisputes.disputesQueue.age": "Age",
  "screen.admin.dealsAndDisputes.disputesQueue.anyAge": "Any age",
  "screen.admin.dealsAndDisputes.disputesQueue.moreThanDays": "More than {days} working days",
  "screen.admin.dealsAndDisputes.disputesQueue.tableCaption": "Disputes",
  "screen.admin.dealsAndDisputes.disputesQueue.parties": "Parties",
  "screen.admin.dealsAndDisputes.disputesQueue.organizationRef": "Organization {reference}",
  "screen.admin.dealsAndDisputes.disputesQueue.bookingOrTrip": "Booking or trip",
  "screen.admin.dealsAndDisputes.disputesQueue.bookingRef": "Booking {reference}",
  "screen.admin.dealsAndDisputes.disputesQueue.tripRef": "Trip {reference}",
  "screen.admin.dealsAndDisputes.disputesQueue.workingDays": "{days} working days",
  "screen.admin.dealsAndDisputes.disputesQueue.action": "Action",
  "screen.admin.dealsAndDisputes.disputesQueue.openDispute": "Open dispute",
  "screen.admin.dealsAndDisputes.disputesQueue.openDisputeFor": "Open dispute for {reference}",
  "screen.admin.dealsAndDisputes.disputesQueue.loading": "Loading the disputes…",
  "screen.admin.dealsAndDisputes.disputesQueue.emptyTitle": "No disputes",
  "screen.admin.dealsAndDisputes.disputesQueue.emptyBody": "No disputes match these filters.",
  // apps/web/src/screens/admin/directory/admin-staff-accounts.tsx
  "screen.admin.directory.adminStaffAccounts.title": "Admin staff accounts",
  "screen.admin.directory.adminStaffAccounts.description":
    "Create admin accounts and see their set-up state.",
  "screen.admin.directory.adminStaffAccounts.createAdmin": "Create admin",
  "screen.admin.directory.adminStaffAccounts.setupNotice":
    "New admins set up their authenticator at first sign-in. Only an existing admin can create an account.",
  "screen.admin.directory.adminStaffAccounts.invitationSent": "Invitation sent to {email}.",
  "screen.admin.directory.adminStaffAccounts.notSaved": "The change was not saved",
  "screen.admin.directory.adminStaffAccounts.notSavedBody": "Check the details and try again.",
  "screen.admin.directory.adminStaffAccounts.resetDone":
    "The authenticator was reset. The admin sets it up again at next sign-in.",
  "screen.admin.directory.adminStaffAccounts.fullName": "Full name",
  "screen.admin.directory.adminStaffAccounts.email": "Email",
  "screen.admin.directory.adminStaffAccounts.subRole": "Sub-role",
  "screen.admin.directory.adminStaffAccounts.operations": "Operations",
  "screen.admin.directory.adminStaffAccounts.finance": "Finance",
  "screen.admin.directory.adminStaffAccounts.superAdmin": "Super admin",
  "screen.admin.directory.adminStaffAccounts.cancel": "Cancel",
  "screen.admin.directory.adminStaffAccounts.sendInvitation": "Send invitation",
  "screen.admin.directory.adminStaffAccounts.name": "Name",
  "screen.admin.directory.adminStaffAccounts.country": "Country",
  "screen.admin.directory.adminStaffAccounts.authenticator": "Authenticator",
  "screen.admin.directory.adminStaffAccounts.notSetUp": "Not set up",
  "screen.admin.directory.adminStaffAccounts.status": "Status",
  "screen.admin.directory.adminStaffAccounts.setUpRequired": "Set-up required",
  "screen.admin.directory.adminStaffAccounts.action": "Action",
  "screen.admin.directory.adminStaffAccounts.resetAuthenticator": "Reset authenticator",
  "screen.admin.directory.adminStaffAccounts.resetAuthenticatorFor":
    "Reset authenticator for {name}",
  "screen.admin.directory.adminStaffAccounts.tableCaption": "Admin staff accounts",
  "screen.admin.directory.adminStaffAccounts.emptyTitle": "No admin accounts to show",
  "screen.admin.directory.adminStaffAccounts.emptyBody":
    "Invitations you send from this page appear here.",
  // apps/web/src/screens/admin/directory/deletion-and-data-requests.tsx
  "screen.admin.directory.deletionAndDataRequests.title": "Deletion and data requests",
  "screen.admin.directory.deletionAndDataRequests.description":
    "Work account deletion and data copy requests.",
  "screen.admin.directory.deletionAndDataRequests.requestTypes": "Request types",
  "screen.admin.directory.deletionAndDataRequests.all": "All",
  "screen.admin.directory.deletionAndDataRequests.accountDeletion": "Account deletion",
  "screen.admin.directory.deletionAndDataRequests.dataCopy": "Data copy",
  "screen.admin.directory.deletionAndDataRequests.overdueTitle":
    "{count} data copy requests are overdue",
  "screen.admin.directory.deletionAndDataRequests.overdueBody":
    "Respond to these first. Each row shows its due date.",
  "screen.admin.directory.deletionAndDataRequests.requestType": "Request type",
  "screen.admin.directory.deletionAndDataRequests.account": "Account",
  "screen.admin.directory.deletionAndDataRequests.requested": "Requested",
  "screen.admin.directory.deletionAndDataRequests.graceEndOrDueDate": "Grace end or due date",
  "screen.admin.directory.deletionAndDataRequests.graceEnds": "Grace ends {date}",
  "screen.admin.directory.deletionAndDataRequests.due": "Due {date}",
  "screen.admin.directory.deletionAndDataRequests.status": "Status",
  "screen.admin.directory.deletionAndDataRequests.gracePeriod": "Grace period",
  "screen.admin.directory.deletionAndDataRequests.overdue": "Overdue",
  "screen.admin.directory.deletionAndDataRequests.inProgress": "In progress",
  "screen.admin.directory.deletionAndDataRequests.action": "Action",
  "screen.admin.directory.deletionAndDataRequests.openAccount": "Open account",
  "screen.admin.directory.deletionAndDataRequests.openAccountFor": "Open account for {account}",
  "screen.admin.directory.deletionAndDataRequests.tableCaption": "Deletion and data requests",
  "screen.admin.directory.deletionAndDataRequests.emptyTitle": "No requests",
  "screen.admin.directory.deletionAndDataRequests.emptyBody":
    "No account deletion or data copy requests to show.",
  // apps/web/src/screens/admin/directory/directory-shared.tsx
  "screen.admin.directory.directoryShared.active": "Active",
  "screen.admin.directory.directoryShared.deleted": "Deleted",
  "screen.admin.directory.directoryShared.driver": "Driver",
  "screen.admin.directory.directoryShared.moderator": "Moderator",
  "screen.admin.directory.directoryShared.noAccountSelected": "No account selected",
  "screen.admin.directory.directoryShared.openAnAccountFromTheDirectory":
    "Open an account from the users and entities directory.",
  "screen.admin.directory.directoryShared.openTheDirectory": "Open the directory",
  "screen.admin.directory.directoryShared.organization": "Organization",
  "screen.admin.directory.directoryShared.pendingApproval": "Pending approval",
  "screen.admin.directory.directoryShared.photographer": "Photographer",
  "screen.admin.directory.directoryShared.platformDriver": "Platform driver",
  "screen.admin.directory.directoryShared.platformPhotographer": "Platform photographer",
  "screen.admin.directory.directoryShared.suspended": "Suspended",
  "screen.admin.directory.directoryShared.traveler": "Traveler",
  // apps/web/src/screens/admin/directory/entity-detail.tsx
  "screen.admin.directory.entityDetail.title": "Account",
  "screen.admin.directory.entityDetail.suspend": "Suspend",
  "screen.admin.directory.entityDetail.reinstate": "Reinstate",
  "screen.admin.directory.entityDetail.resetCredentials": "Reset credentials",
  "screen.admin.directory.entityDetail.resetCredentialsUnavailable":
    "Credential reset for accounts is not available yet.",
  "screen.admin.directory.entityDetail.grantOrOverridePlan": "Grant or override plan",
  "screen.admin.directory.entityDetail.sections": "Account sections",
  "screen.admin.directory.entityDetail.profile": "Profile",
  "screen.admin.directory.entityDetail.plan": "Plan",
  "screen.admin.directory.entityDetail.tripsAndBookings": "Trips and bookings",
  "screen.admin.directory.entityDetail.history": "History",
  "screen.admin.directory.entityDetail.loading": "Loading the account.",
  "screen.admin.directory.entityDetail.name": "Name",
  "screen.admin.directory.entityDetail.email": "Email",
  "screen.admin.directory.entityDetail.phone": "Phone",
  "screen.admin.directory.entityDetail.country": "Country",
  "screen.admin.directory.entityDetail.roleAssignments": "Role assignments",
  "screen.admin.directory.entityDetail.planAndSubscription": "Plan and subscription",
  "screen.admin.directory.entityDetail.billingStatus": "Billing status",
  "screen.admin.directory.entityDetail.renewalDate": "Renewal date",
  "screen.admin.directory.entityDetail.deletionRequest": "Deletion request",
  "screen.admin.directory.entityDetail.requested": "Requested",
  "screen.admin.directory.entityDetail.graceEnd": "Grace end",
  "screen.admin.directory.entityDetail.openDeletionQueue":
    "Open the deletion queue to handle this request.",
  "screen.admin.directory.entityDetail.deletionQueue": "Deletion queue",
  "screen.admin.directory.entityDetail.auditHistory": "Audit history",
  "screen.admin.directory.entityDetail.noAuditEntries": "No audit entries to show",
  "screen.admin.directory.entityDetail.noAuditEntriesBody":
    "Actions on this account are recorded in the audit log.",
  "screen.admin.directory.entityDetail.openAuditLog": "Open the audit log",
  "screen.admin.directory.entityDetail.noTrips": "No trips or bookings to show",
  "screen.admin.directory.entityDetail.noTripsBody":
    "Trips and bookings of this account are not listed here yet.",
  // apps/web/src/screens/admin/directory/suspend-or-reinstate-decision.tsx
  "screen.admin.directory.suspendOrReinstateDecision.suspendTitle": "Suspend account",
  "screen.admin.directory.suspendOrReinstateDecision.suspendDescription":
    "Stop access without deleting data. {name}.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccess": "Suspend access",
  "screen.admin.directory.suspendOrReinstateDecision.suspendAcknowledge":
    "I understand that access stops at once and the data is kept.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendEffectAccess": "Access stops at once.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendEffectData":
    "Data is kept, not deleted.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendNotice":
    "Sign-in is refused and the account sees the suspended message.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendPlaceholder":
    "Describe why access is being stopped",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateTitle": "Reinstate account",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateDescription":
    "Restore access to a suspended account. {name}.",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccess": "Reinstate access",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAcknowledge":
    "I understand that access is restored at once.",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateEffectAccess":
    "Access is restored at once.",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateEffectData": "Data stays as it was.",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateNotice":
    "The account can sign in again as soon as you confirm.",
  "screen.admin.directory.suspendOrReinstateDecision.reinstatePlaceholder":
    "Describe why access is being restored",
  "screen.admin.directory.suspendOrReinstateDecision.effectAudit":
    "The action is written to the audit log.",
  "screen.admin.directory.suspendOrReinstateDecision.cancel": "Cancel",
  "screen.admin.directory.suspendOrReinstateDecision.reason": "Reason",
  "screen.admin.directory.suspendOrReinstateDecision.reasonRequired": "Reason (required)",
  "screen.admin.directory.suspendOrReinstateDecision.reasonHelp": "At least {min} characters.",
  "screen.admin.directory.suspendOrReinstateDecision.effect": "Effect",
  "screen.admin.directory.suspendOrReinstateDecision.loading": "Loading the account.",
  "screen.admin.directory.suspendOrReinstateDecision.notSaved": "The decision was not saved",
  "screen.admin.directory.suspendOrReinstateDecision.notSavedBody":
    "Nothing changed on the account. Try again.",
  // apps/web/src/screens/admin/directory/users-and-entities-directory.tsx
  "screen.admin.directory.usersAndEntitiesDirectory.title": "Users and entities",
  "screen.admin.directory.usersAndEntitiesDirectory.description":
    "Find any user, organization, driver, photographer or moderator.",
  "screen.admin.directory.usersAndEntitiesDirectory.filters": "Directory filters",
  "screen.admin.directory.usersAndEntitiesDirectory.search": "Search",
  "screen.admin.directory.usersAndEntitiesDirectory.searchPlaceholder":
    "Name, email, phone, organization or reference",
  "screen.admin.directory.usersAndEntitiesDirectory.role": "Role",
  "screen.admin.directory.usersAndEntitiesDirectory.allRoles": "All roles",
  "screen.admin.directory.usersAndEntitiesDirectory.status": "Status",
  "screen.admin.directory.usersAndEntitiesDirectory.allStatuses": "All statuses",
  "screen.admin.directory.usersAndEntitiesDirectory.active": "Active",
  "screen.admin.directory.usersAndEntitiesDirectory.suspended": "Suspended",
  "screen.admin.directory.usersAndEntitiesDirectory.statusFilterUnavailable":
    "Account status is shown on each account page.",
  "screen.admin.directory.usersAndEntitiesDirectory.name": "Name",
  "screen.admin.directory.usersAndEntitiesDirectory.email": "Email",
  "screen.admin.directory.usersAndEntitiesDirectory.action": "Action",
  "screen.admin.directory.usersAndEntitiesDirectory.openAccount": "Open account",
  "screen.admin.directory.usersAndEntitiesDirectory.openAccountFor": "Open account for {name}",
  "screen.admin.directory.usersAndEntitiesDirectory.loading": "Loading the directory.",
  "screen.admin.directory.usersAndEntitiesDirectory.tableCaption": "Users and entities",
  "screen.admin.directory.usersAndEntitiesDirectory.emptyTitle": "No results",
  "screen.admin.directory.usersAndEntitiesDirectory.emptyBody": "Change the search or the filters.",
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
  "screen.admin.finance.revenueDashboard.title": "Revenue dashboard",
  "screen.admin.finance.revenueDashboard.description":
    "MRR, churn, upgrades, downgrades and plan distribution for a period.",
  "screen.admin.finance.revenueDashboard.period": "Period",
  "screen.admin.finance.revenueDashboard.thisMonth": "This month",
  "screen.admin.finance.revenueDashboard.thisQuarter": "This quarter",
  "screen.admin.finance.revenueDashboard.thisYear": "This year",
  "screen.admin.finance.revenueDashboard.openFinancialView": "Open financial view",
  "screen.admin.finance.revenueDashboard.filters": "Filters",
  "screen.admin.finance.revenueDashboard.role": "Role",
  "screen.admin.finance.revenueDashboard.allRoles": "All roles",
  "screen.admin.finance.revenueDashboard.plan": "Plan",
  "screen.admin.finance.revenueDashboard.allPlans": "All plans",
  "screen.admin.finance.revenueDashboard.billingStatus": "Billing status",
  "screen.admin.finance.revenueDashboard.allStatuses": "All statuses",
  "screen.admin.finance.revenueDashboard.organization": "Organization",
  "screen.admin.finance.revenueDashboard.platformDriver": "Platform driver",
  "screen.admin.finance.revenueDashboard.photographer": "Photographer",
  "screen.admin.finance.revenueDashboard.traveler": "Traveler",
  "screen.admin.finance.revenueDashboard.mrr": "MRR",
  "screen.admin.finance.revenueDashboard.currencyForThePeriod": "{currency}, for the period",
  "screen.admin.finance.revenueDashboard.churn": "Churn",
  "screen.admin.finance.revenueDashboard.shareOfSubscriptionsLost": "Share of subscriptions lost",
  "screen.admin.finance.revenueDashboard.upgrades": "Upgrades",
  "screen.admin.finance.revenueDashboard.planMovedUp": "Plan moved up",
  "screen.admin.finance.revenueDashboard.downgrades": "Downgrades",
  "screen.admin.finance.revenueDashboard.planMovedDown": "Plan moved down",
  "screen.admin.finance.revenueDashboard.planDistribution": "Plan distribution",
  "screen.admin.finance.revenueDashboard.subscriptions": "Subscriptions",
  "screen.admin.finance.revenueDashboard.shareOfTotal": "Share of total",
  "screen.admin.finance.revenueDashboard.loading": "Loading the plan catalog…",
  "screen.admin.finance.revenueDashboard.emptyTitle": "No plans",
  "screen.admin.finance.revenueDashboard.emptyBody": "No plans match these filters.",
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
  "screen.admin.home.adminHome.title": "Admin home",
  "screen.admin.home.adminHome.description": "Queues that need action now.",
  "screen.admin.home.adminHome.refreshQueues": "Refresh queues",
  "screen.admin.home.adminHome.noValue": "—",
  "screen.admin.home.adminHome.applicationsWaiting": "Applications waiting",
  "screen.admin.home.adminHome.overdueAfterTwoDays": "{count} overdue after 2 working days",
  "screen.admin.home.adminHome.openApplications": "Open applications",
  "screen.admin.home.adminHome.labTests": "Lab tests",
  "screen.admin.home.adminHome.dueOrOverdue": "Due or overdue",
  "screen.admin.home.adminHome.openLabTests": "Open lab tests",
  "screen.admin.home.adminHome.openDisputes": "Open disputes",
  "screen.admin.home.adminHome.awaitingAcknowledgement": "Awaiting acknowledgement or resolution",
  "screen.admin.home.adminHome.openDisputesLink": "Open disputes",
  "screen.admin.home.adminHome.deletionRequests": "Deletion requests",
  "screen.admin.home.adminHome.withGraceEndDates": "With grace end dates",
  "screen.admin.home.adminHome.openRequests": "Open requests",
  "screen.admin.home.adminHome.couponAbuseFlags": "Coupon abuse flags",
  "screen.admin.home.adminHome.raisedByAbuseRules": "Raised by the abuse rules",
  "screen.admin.home.adminHome.openCoupons": "Open coupons",
  "screen.admin.home.adminHome.openSettlements": "Open settlements",
  "screen.admin.home.adminHome.owedBetweenParties": "Owed between parties",
  "screen.admin.home.adminHome.openSettlementsLink": "Open settlements",
  "screen.admin.home.adminHome.queueFailed": "Queue failed: {queue}",
  "screen.admin.home.adminHome.queueFailedBody":
    "Other queues show their current counts. Retry this queue to load its count.",
  "screen.admin.home.adminHome.retry": "Retry",
  "screen.admin.home.adminHome.sourceApplications": "Applications, lab tests and deletion requests",
  "screen.admin.home.adminHome.sourceDisputes": "Open disputes",
  "screen.admin.home.adminHome.sourceCoupons": "Coupon abuse flags",
  // apps/web/src/screens/admin/lab-tests/lab-test-detail-and-decision.tsx
  "screen.admin.labTests.labTestDetailAndDecision.title": "Lab test: {driver}",
  "screen.admin.labTests.labTestDetailAndDecision.description": "Review the result and decide.",
  "screen.admin.labTests.labTestDetailAndDecision.markFailed": "Mark failed",
  "screen.admin.labTests.labTestDetailAndDecision.markPassed": "Mark passed",
  "screen.admin.labTests.labTestDetailAndDecision.decisionFailedTitle":
    "The decision was not saved",
  "screen.admin.labTests.labTestDetailAndDecision.decisionFailedBody":
    "Try again. The driver's state has not changed.",
  "screen.admin.labTests.labTestDetailAndDecision.loading": "Loading the lab test",
  "screen.admin.labTests.labTestDetailAndDecision.test": "Test",
  "screen.admin.labTests.labTestDetailAndDecision.track": "Track",
  "screen.admin.labTests.labTestDetailAndDecision.requested": "Requested",
  "screen.admin.labTests.labTestDetailAndDecision.deadline": "Deadline",
  "screen.admin.labTests.labTestDetailAndDecision.state": "State",
  "screen.admin.labTests.labTestDetailAndDecision.decisionNeeded":
    "Result uploaded, decision needed",
  "screen.admin.labTests.labTestDetailAndDecision.resultFile": "Result file",
  "screen.admin.labTests.labTestDetailAndDecision.fileReference":
    "Lab partner file reference: {reference}",
  "screen.admin.labTests.labTestDetailAndDecision.viewFile": "View file",
  "screen.admin.labTests.labTestDetailAndDecision.consentRecord": "Consent record",
  "screen.admin.labTests.labTestDetailAndDecision.labConsentRecorded": "Lab consent recorded",
  "screen.admin.labTests.labTestDetailAndDecision.onFile": "On file, {date}",
  "screen.admin.labTests.labTestDetailAndDecision.notOnFile": "Not on file",
  "screen.admin.labTests.labTestDetailAndDecision.decisionEffect": "Decision effect",
  "screen.admin.labTests.labTestDetailAndDecision.markPassedLead": "Mark passed:",
  "screen.admin.labTests.labTestDetailAndDecision.markPassedEffect":
    "the driver is unpaused. The decision is audited.",
  "screen.admin.labTests.labTestDetailAndDecision.markFailedLead": "Mark failed:",
  "screen.admin.labTests.labTestDetailAndDecision.markFailedEffect":
    "the driver stays paused and a case is opened.",
  "screen.admin.labTests.labTestDetailAndDecision.missedTestRule":
    "A missed test suspends the driver. A suspension over 30 days closes the account.",
  "screen.admin.labTests.labTestDetailAndDecision.notFoundTitle": "Lab test not found",
  "screen.admin.labTests.labTestDetailAndDecision.notFoundBody":
    "Open a test from the lab tests queue.",
  "screen.admin.labTests.labTestDetailAndDecision.backToLabTests": "Back to lab tests",
  // apps/web/src/screens/admin/lab-tests/lab-test-state.tsx
  "screen.admin.labTests.labTestState.requested": "Requested",
  "screen.admin.labTests.labTestState.pending": "Pending",
  "screen.admin.labTests.labTestState.resultUploaded": "Result uploaded",
  "screen.admin.labTests.labTestState.passed": "Passed",
  "screen.admin.labTests.labTestState.failed": "Failed",
  "screen.admin.labTests.labTestState.missed": "Missed",
  "screen.admin.labTests.labTestState.overdueState": "{state}, overdue",
  // apps/web/src/screens/admin/lab-tests/lab-tests-queue.tsx
  "screen.admin.labTests.labTestsQueue.title": "Lab tests",
  "screen.admin.labTests.labTestsQueue.description": "Track lab tests by state and deadline.",
  "screen.admin.labTests.labTestsQueue.filters": "Lab test filters",
  "screen.admin.labTests.labTestsQueue.all": "All",
  "screen.admin.labTests.labTestsQueue.overdueOnly": "Overdue only",
  "screen.admin.labTests.labTestsQueue.showingCount": "Showing {count} tests",
  "screen.admin.labTests.labTestsQueue.driver": "Driver",
  "screen.admin.labTests.labTestsQueue.track": "Track",
  "screen.admin.labTests.labTestsQueue.requested": "Requested",
  "screen.admin.labTests.labTestsQueue.deadline": "Deadline",
  "screen.admin.labTests.labTestsQueue.state": "State",
  "screen.admin.labTests.labTestsQueue.action": "Action",
  "screen.admin.labTests.labTestsQueue.openTest": "Open test",
  "screen.admin.labTests.labTestsQueue.openTestFor": "Open test for {driver}",
  "screen.admin.labTests.labTestsQueue.loading": "Loading the lab tests",
  "screen.admin.labTests.labTestsQueue.tableCaption": "Lab tests",
  "screen.admin.labTests.labTestsQueue.emptyTitle": "No lab tests",
  "screen.admin.labTests.labTestsQueue.emptyBody": "No lab tests match these filters.",
  // apps/web/src/screens/admin/lab-tests/request-lab-test-decision.tsx
  "screen.admin.labTests.requestLabTestDecision.title": "Request lab test",
  "screen.admin.labTests.requestLabTestDecision.description":
    "Requesting a test pauses the driver at once.",
  "screen.admin.labTests.requestLabTestDecision.cancel": "Cancel",
  "screen.admin.labTests.requestLabTestDecision.requestTest": "Request test",
  "screen.admin.labTests.requestLabTestDecision.requestFailedTitle": "The request was not sent",
  "screen.admin.labTests.requestLabTestDecision.requestFailedBody":
    "Try again. The driver has not been paused.",
  "screen.admin.labTests.requestLabTestDecision.loading": "Loading the drivers",
  "screen.admin.labTests.requestLabTestDecision.driverAndTest": "Driver and test",
  "screen.admin.labTests.requestLabTestDecision.driver": "Driver",
  "screen.admin.labTests.requestLabTestDecision.noDriversTitle": "No drivers to choose",
  "screen.admin.labTests.requestLabTestDecision.noDriversBody":
    "No platform drivers are in the review queue.",
  "screen.admin.labTests.requestLabTestDecision.testType": "Test type",
  "screen.admin.labTests.requestLabTestDecision.drugScreening": "Drug screening",
  "screen.admin.labTests.requestLabTestDecision.medicalFitness": "Medical fitness",
  "screen.admin.labTests.requestLabTestDecision.both": "Both",
  "screen.admin.labTests.requestLabTestDecision.deadline": "Deadline",
  "screen.admin.labTests.requestLabTestDecision.deadlineHelp":
    "Choose 1 to 7 days. The default is 3 days.",
  "screen.admin.labTests.requestLabTestDecision.decreaseDeadline": "Decrease deadline",
  "screen.admin.labTests.requestLabTestDecision.increaseDeadline": "Increase deadline",
  "screen.admin.labTests.requestLabTestDecision.oneDay": "1 day",
  "screen.admin.labTests.requestLabTestDecision.days": "{days} days",
  "screen.admin.labTests.requestLabTestDecision.deadlineDate": "Deadline date: {date}",
  "screen.admin.labTests.requestLabTestDecision.effectTitle": "Effect of this request",
  "screen.admin.labTests.requestLabTestDecision.effectPaused":
    "The driver is paused at once and notified.",
  "screen.admin.labTests.requestLabTestDecision.effectAllowedActions":
    "Four actions stay allowed while paused.",
  "screen.admin.labTests.requestLabTestDecision.effectTrips":
    "Upcoming trips return to organizers.",
  "screen.admin.labTests.requestLabTestDecision.auditNote":
    "This request is recorded in the audit log. Test rules follow each market's legal review.",
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
  // apps/web/src/screens/admin/plans/override-plan-card.tsx
  "screen.admin.plans.overridePlanCard.title": "Override plan",
  "screen.admin.plans.overridePlanCard.account": "Account",
  "screen.admin.plans.overridePlanCard.accountNotFound":
    "No single account matches this name or reference.",
  "screen.admin.plans.overridePlanCard.plan": "Plan",
  "screen.admin.plans.overridePlanCard.selectPlan": "Select a plan",
  "screen.admin.plans.overridePlanCard.reason": "Reason (required)",
  "screen.admin.plans.overridePlanCard.reasonPlaceholder": "Why this override is needed",
  "screen.admin.plans.overridePlanCard.endDate": "End date",
  "screen.admin.plans.overridePlanCard.auditNote":
    "The override applies at once and is written to the audit log.",
  "screen.admin.plans.overridePlanCard.saveOverride": "Save override",
  "screen.admin.plans.overridePlanCard.saveFailedTitle": "The override was not saved",
  "screen.admin.plans.overridePlanCard.saveFailedBody":
    "Try again. The account's plan has not changed.",
  "screen.admin.plans.overridePlanCard.saved": "Override saved.",
  // apps/web/src/screens/admin/plans/plan-editor.tsx
  "screen.admin.plans.planEditor.title": "Plan editor",
  "screen.admin.plans.planEditor.description": "Role: {role} · Tier: {tier}",
  "screen.admin.plans.planEditor.cancel": "Cancel",
  "screen.admin.plans.planEditor.savePlan": "Save plan",
  "screen.admin.plans.planEditor.saveFailedTitle": "The plan was not saved",
  "screen.admin.plans.planEditor.saveFailedBody": "Try again. Nothing has changed.",
  "screen.admin.plans.planEditor.loading": "Loading the plan",
  "screen.admin.plans.planEditor.limits": "Limits",
  "screen.admin.plans.planEditor.noLimit": "No limit",
  "screen.admin.plans.planEditor.featureFlags": "Feature flags",
  "screen.admin.plans.planEditor.pricesAndTrial": "Prices and trial",
  "screen.admin.plans.planEditor.monthlyPrice": "Monthly price",
  "screen.admin.plans.planEditor.currency": "Currency",
  "screen.admin.plans.planEditor.annualPrice": "Annual price",
  "screen.admin.plans.planEditor.annualDiscount": "Annual discount",
  "screen.admin.plans.planEditor.discountPlaceholder": "Placeholder, Finance to set",
  "screen.admin.plans.planEditor.trialLength": "Trial length (days)",
  "screen.admin.plans.planEditor.gracePeriod": "Grace period (days)",
  "screen.admin.plans.planEditor.graceHelp": "Grace period is 7 days.",
  "screen.admin.plans.planEditor.graceInvalid": "Enter a whole number from 1 to 30.",
  "screen.admin.plans.planEditor.effect": "Effect",
  "screen.admin.plans.planEditor.effectBody": "Saved changes apply to new actions at once.",
  "screen.admin.plans.planEditor.existingSubscriptions":
    "The effect on existing subscriptions is not decided yet.",
  "screen.admin.plans.planEditor.notFoundTitle": "Plan not found",
  "screen.admin.plans.planEditor.notFoundBody": "Open a plan from the plans catalog.",
  "screen.admin.plans.planEditor.backToPlans": "Back to plans catalog",
  // apps/web/src/screens/admin/plans/plan-labels.ts
  "screen.admin.plans.planLabels.organization": "Organization",
  "screen.admin.plans.planLabels.platformDriver": "Platform driver",
  "screen.admin.plans.planLabels.photographer": "Photographer",
  "screen.admin.plans.planLabels.traveler": "Traveler",
  "screen.admin.plans.planLabels.activeTripsPerMonth": "Active trips per month",
  "screen.admin.plans.planLabels.vehiclesPerTrip": "Vehicles per trip",
  "screen.admin.plans.planLabels.programsPerTrip": "Programs per trip",
  "screen.admin.plans.planLabels.employeesMax": "Staff members",
  "screen.admin.plans.planLabels.activeCouponsMax": "Active coupons",
  "screen.admin.plans.planLabels.portfolioPhotosMax": "Portfolio photos",
  "screen.admin.plans.planLabels.webhookEndpointsMax": "Webhook endpoints",
  "screen.admin.plans.planLabels.platformSuppliers": "Platform suppliers",
  "screen.admin.plans.planLabels.seatSelfSelection": "Seat self-selection",
  "screen.admin.plans.planLabels.childTracking": "Child tracking",
  "screen.admin.plans.planLabels.customBranding": "Custom branding",
  "screen.admin.plans.planLabels.watermarks": "Watermarks",
  "screen.admin.plans.planLabels.receiptExport": "Receipt export",
  "screen.admin.plans.planLabels.vipEarlyAccess": "VIP early access",
  "screen.admin.plans.planLabels.prioritySeatWindow": "Priority seat window",
  // apps/web/src/screens/admin/plans/plans-catalog.tsx
  "screen.admin.plans.plansCatalog.title": "Plans catalog",
  "screen.admin.plans.plansCatalog.description": "Plans for each role, by tier.",
  "screen.admin.plans.plansCatalog.createTier": "Create tier",
  "screen.admin.plans.plansCatalog.createTierUnavailable": "Creating a tier is not available yet.",
  "screen.admin.plans.plansCatalog.role": "Role",
  "screen.admin.plans.plansCatalog.tier": "Tier",
  "screen.admin.plans.plansCatalog.status": "Status",
  "screen.admin.plans.plansCatalog.active": "Active",
  "screen.admin.plans.plansCatalog.inactive": "Inactive",
  "screen.admin.plans.plansCatalog.activeSubscriptions": "Active subscriptions",
  "screen.admin.plans.plansCatalog.action": "Action",
  "screen.admin.plans.plansCatalog.openPlan": "Open plan",
  "screen.admin.plans.plansCatalog.openPlanFor": "Open plan {tier}",
  "screen.admin.plans.plansCatalog.loading": "Loading the plans",
  "screen.admin.plans.plansCatalog.tableCaption": "Plans by role and tier",
  "screen.admin.plans.plansCatalog.emptyTitle": "No plans",
  "screen.admin.plans.plansCatalog.emptyBody": "The plans catalog is empty.",
  // apps/web/src/screens/admin/plans/subscriptions-and-overrides.tsx
  "screen.admin.plans.subscriptionsAndOverrides.title": "Subscriptions and overrides",
  "screen.admin.plans.subscriptionsAndOverrides.description":
    "Find subscriptions and grant, revoke or change a plan for one account.",
  "screen.admin.plans.subscriptionsAndOverrides.filters": "Subscription filters",
  "screen.admin.plans.subscriptionsAndOverrides.role": "Role",
  "screen.admin.plans.subscriptionsAndOverrides.allRoles": "All roles",
  "screen.admin.plans.subscriptionsAndOverrides.plan": "Plan",
  "screen.admin.plans.subscriptionsAndOverrides.allPlans": "All plans",
  "screen.admin.plans.subscriptionsAndOverrides.billingStatus": "Billing status",
  "screen.admin.plans.subscriptionsAndOverrides.allStatuses": "All statuses",
  "screen.admin.plans.subscriptionsAndOverrides.active": "Active",
  "screen.admin.plans.subscriptionsAndOverrides.gracePeriod": "Grace period",
  "screen.admin.plans.subscriptionsAndOverrides.cancelled": "Cancelled",
  "screen.admin.plans.subscriptionsAndOverrides.renewalDate": "Renewal date",
  "screen.admin.plans.subscriptionsAndOverrides.account": "Account",
  "screen.admin.plans.subscriptionsAndOverrides.action": "Action",
  "screen.admin.plans.subscriptionsAndOverrides.open": "Open",
  "screen.admin.plans.subscriptionsAndOverrides.openFor": "Open {account}",
  "screen.admin.plans.subscriptionsAndOverrides.loading": "Loading the subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.tableCaption": "Subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.emptyTitle": "No subscriptions",
  "screen.admin.plans.subscriptionsAndOverrides.emptyBody": "No subscriptions match these filters.",
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
  "screen.organization.accounting.ledgerAndExports.event": "Event",
  "screen.organization.accounting.ledgerAndExports.amount": "Amount",
  "screen.organization.accounting.ledgerAndExports.bookingOrDeal": "Booking or deal",
  "screen.organization.accounting.ledgerAndExports.gatewayReference": "Gateway reference",
  "screen.organization.accounting.ledgerAndExports.date": "Date",
  "screen.organization.accounting.ledgerAndExports.backToTripAccounting": "Back to trip accounting",
  "screen.organization.accounting.ledgerAndExports.ledgerAndExports": "Ledger and exports",
  "screen.organization.accounting.ledgerAndExports.from": "From",
  "screen.organization.accounting.ledgerAndExports.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.accounting.ledgerAndExports.to": "To",
  "screen.organization.accounting.ledgerAndExports.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.accounting.ledgerAndExports.filterByEvent": "Filter by event",
  "screen.organization.accounting.ledgerAndExports.clearFilter": "Clear filter",
  "screen.organization.accounting.ledgerAndExports.ledgerLines": "Ledger lines",
  "screen.organization.accounting.ledgerAndExports.ledgerLinesCaption": "Ledger lines",
  "screen.organization.accounting.ledgerAndExports.noLedgerLines": "No ledger lines",
  "screen.organization.accounting.ledgerAndExports.linesAppearHereAsPayments":
    "Lines appear here as payments, refunds and costs are recorded.",
  "screen.organization.accounting.ledgerAndExports.export": "Export",
  "screen.organization.accounting.ledgerAndExports.csvAndPdfExportsThat":
    "CSV and PDF exports that reconcile with the ledger are available on the Enterprise plan.",
  // apps/web/src/screens/organization/accounting/settlements.tsx
  "screen.organization.accounting.settlements.allSettlements": "All settlements",
  "screen.organization.accounting.settlements.open": "Open",
  "screen.organization.accounting.settlements.settled": "Settled",
  "screen.organization.accounting.settlements.counterparty": "Counterparty",
  "screen.organization.accounting.settlements.amount": "Amount",
  "screen.organization.accounting.settlements.state": "State",
  "screen.organization.accounting.settlements.openLabel": "Open",
  "screen.organization.accounting.settlements.settledLabel": "Settled",
  "screen.organization.accounting.settlements.date": "Date",
  "screen.organization.accounting.settlements.backToTripAccounting": "Back to trip accounting",
  "screen.organization.accounting.settlements.settlements": "Settlements",
  "screen.organization.accounting.settlements.providerPayoutsAreMadeWeekly":
    "Provider payouts are made weekly on Monday at 06:00.",
  "screen.organization.accounting.settlements.stateLabel": "State",
  "screen.organization.accounting.settlements.settlementsCaption": "Settlements",
  "screen.organization.accounting.settlements.noSettlements": "No settlements",
  "screen.organization.accounting.settlements.amountsOwedBetweenTheOrganization":
    "Amounts owed between the organization, suppliers and the platform appear here.",
  // apps/web/src/screens/organization/accounting/trip-accounting.tsx
  "screen.organization.accounting.tripAccounting.baseRevenue": "Base revenue",
  "screen.organization.accounting.tripAccounting.ticketRevenueForThisTrip":
    "Ticket revenue for this trip",
  "screen.organization.accounting.tripAccounting.programRevenue": "Program revenue",
  "screen.organization.accounting.tripAccounting.revenueFromPrograms": "Revenue from programs",
  "screen.organization.accounting.tripAccounting.couponImpact": "Coupon impact",
  "screen.organization.accounting.tripAccounting.discountsFromCoupons": "Discounts from coupons",
  "screen.organization.accounting.tripAccounting.supplierCosts": "Supplier costs",
  "screen.organization.accounting.tripAccounting.costsPaidToSuppliers": "Costs paid to suppliers",
  "screen.organization.accounting.tripAccounting.gatewayFees": "Gateway fees",
  "screen.organization.accounting.tripAccounting.paymentGatewayFees": "Payment gateway fees",
  "screen.organization.accounting.tripAccounting.backToTrip": "Back to trip",
  "screen.organization.accounting.tripAccounting.tripAccounting": "Trip accounting",
  "screen.organization.accounting.tripAccounting.tripName": "[Trip name]",
  "screen.organization.accounting.tripAccounting.openLedger": "Open ledger",
  "screen.organization.accounting.tripAccounting.accountingLines": "Accounting lines",
  "screen.organization.accounting.tripAccounting.reconciliation": "Reconciliation",
  "screen.organization.accounting.tripAccounting.reconciliationStatus": "[Reconciliation status]",
  "screen.organization.accounting.tripAccounting.invoices": "Invoices",
  "screen.organization.accounting.tripAccounting.settlements": "Settlements",
  // apps/web/src/screens/organization/billing/invoices-list.tsx
  "screen.organization.billing.invoicesList.number": "Number",
  "screen.organization.billing.invoicesList.type": "Type",
  "screen.organization.billing.invoicesList.buyer": "Buyer",
  "screen.organization.billing.invoicesList.amount": "Amount",
  "screen.organization.billing.invoicesList.status": "Status",
  "screen.organization.billing.invoicesList.issued": "Issued",
  "screen.organization.billing.invoicesList.open": "Open",
  "screen.organization.billing.invoicesList.openInvoice": "Open invoice",
  "screen.organization.billing.invoicesList.invoicesList": "Invoices list",
  "screen.organization.billing.invoicesList.issueInvoice": "Issue invoice",
  "screen.organization.billing.invoicesList.searchInvoices": "Search invoices",
  "screen.organization.billing.invoicesList.clearSearch": "Clear search",
  "screen.organization.billing.invoicesList.issuedInvoices": "Issued invoices",
  "screen.organization.billing.invoicesList.noInvoicesYet": "No invoices yet",
  "screen.organization.billing.invoicesList.issueAnInvoiceForA":
    "Issue an invoice for a trip or booking.",
  // apps/web/src/screens/organization/billing/issue-invoice-b2b-or-b2c.tsx
  "screen.organization.billing.issueInvoiceB2bOrB2c.businessB2b": "Business (B2B)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.consumerB2c": "Consumer (B2C)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.lineDescription": "[Line description]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.line": "Line",
  "screen.organization.billing.issueInvoiceB2bOrB2c.quantity": "Quantity",
  "screen.organization.billing.issueInvoiceB2bOrB2c.amount": "Amount",
  "screen.organization.billing.issueInvoiceB2bOrB2c.backToInvoices": "Back to invoices",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoiceB2bOrB2c":
    "Issue invoice (B2B or B2C)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoice": "Issue invoice",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoice": "Invoice",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceType": "Invoice type",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceNumber": "Invoice number",
  "screen.organization.billing.issueInvoiceB2bOrB2c.generatedNumber": "[Generated number]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyer": "Buyer",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerName": "Buyer name",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerNamePlaceholder": "[Buyer name]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerTaxNumber": "Buyer tax number",
  "screen.organization.billing.issueInvoiceB2bOrB2c.taxNumber": "[Tax number]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.lines": "Lines",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines": "Invoice lines",
  "screen.organization.billing.issueInvoiceB2bOrB2c.noLines": "No lines",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addLinesFromABooking":
    "Add lines from a booking or a trip.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.tax": "Tax",
  "screen.organization.billing.issueInvoiceB2bOrB2c.taxLabel": "Tax",
  "screen.organization.billing.issueInvoiceB2bOrB2c.taxAmount": "[Tax amount]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.total": "Total",
  "screen.organization.billing.issueInvoiceB2bOrB2c.totalAndCurrency": "[Total and currency]",
  // apps/web/src/screens/organization/billing/subscription-and-billing.tsx
  "screen.organization.billing.subscriptionAndBilling.subscriptionAndBilling":
    "Subscription and billing",
  "screen.organization.billing.subscriptionAndBilling.currentPlan": "Current plan",
  "screen.organization.billing.subscriptionAndBilling.growth": "Growth",
  "screen.organization.billing.subscriptionAndBilling.currentPlan2": "Current plan",
  "screen.organization.billing.subscriptionAndBilling.renewsOnRenewalDate":
    "Renews on [Renewal date]",
  "screen.organization.billing.subscriptionAndBilling.annualBilling": "Annual billing",
  "screen.organization.billing.subscriptionAndBilling.annual": "Annual",
  "screen.organization.billing.subscriptionAndBilling.monthly": "Monthly",
  "screen.organization.billing.subscriptionAndBilling.annualBillingAppliesTheAnnual":
    "Annual billing applies the annual discount to the monthly total. Discount: [OPEN: placeholder].",
  "screen.organization.billing.subscriptionAndBilling.paymentMethodPaymentMethod":
    "Payment method: [Payment method]",
  "screen.organization.billing.subscriptionAndBilling.updatePaymentMethod": "Update payment method",
  "screen.organization.billing.subscriptionAndBilling.usage": "Usage",
  "screen.organization.billing.subscriptionAndBilling.activeTripsThisMonth":
    "Active trips this month",
  "screen.organization.billing.subscriptionAndBilling.employees": "Employees",
  "screen.organization.billing.subscriptionAndBilling.vehiclesPerTrip": "Vehicles per trip",
  "screen.organization.billing.subscriptionAndBilling.programsPerTrip": "Programs per trip",
  "screen.organization.billing.subscriptionAndBilling.coupons": "Coupons",
  "screen.organization.billing.subscriptionAndBilling.changePlan": "Change plan",
  "screen.organization.billing.subscriptionAndBilling.currentPlan3": "Current plan",
  "screen.organization.billing.subscriptionAndBilling.price": "[Price]",
  "screen.organization.billing.subscriptionAndBilling.upgradesTakeEffectNowAnd":
    "Upgrades take effect now and are prorated. Downgrades take effect at the end of the billing cycle, on [Date].",
  // apps/web/src/screens/organization/bookings/booking-detail.tsx
  "screen.organization.bookings.bookingDetail.traveler": "Traveler",
  "screen.organization.bookings.bookingDetail.program": "Program",
  "screen.organization.bookings.bookingDetail.quantity": "Quantity",
  "screen.organization.bookings.bookingDetail.seat": "Seat",
  "screen.organization.bookings.bookingDetail.backToBookings": "Back to bookings",
  "screen.organization.bookings.bookingDetail.bookingDetail": "Booking detail",
  "screen.organization.bookings.bookingDetail.bookingReference": "[Booking reference]",
  "screen.organization.bookings.bookingDetail.confirmed": "Confirmed",
  "screen.organization.bookings.bookingDetail.travelersAndPrograms": "Travelers and programs",
  "screen.organization.bookings.bookingDetail.travelersAndProgramsOnThis":
    "Travelers and programs on this booking",
  "screen.organization.bookings.bookingDetail.noTravelers": "No travelers",
  "screen.organization.bookings.bookingDetail.travelersAppearHereOnceThey":
    "Travelers appear here once they are added to the booking.",
  "screen.organization.bookings.bookingDetail.seatTitle": "Seat",
  "screen.organization.bookings.bookingDetail.openSeatMap": "Open seat map",
  "screen.organization.bookings.bookingDetail.seatLabel": "Seat",
  "screen.organization.bookings.bookingDetail.seatPlaceholder": "[Seat]",
  "screen.organization.bookings.bookingDetail.organizationAssignedSeatsOnly":
    "Organization-assigned seats only.",
  "screen.organization.bookings.bookingDetail.coupon": "Coupon",
  "screen.organization.bookings.bookingDetail.couponCode": "[Coupon code]",
  "screen.organization.bookings.bookingDetail.payment": "Payment",
  "screen.organization.bookings.bookingDetail.paymentStatusPaymentStatus":
    "Payment status: [Payment status]",
  "screen.organization.bookings.bookingDetail.reversalStateReversalState":
    "Reversal state: [Reversal state]",
  "screen.organization.bookings.bookingDetail.aPendingRefundShowsTo":
    'A pending refund shows to the traveler as "refund in progress". Revenue is reversed only after the payment gateway confirms the refund.',
  "screen.organization.bookings.bookingDetail.issueRefund": "Issue refund",
  "screen.organization.bookings.bookingDetail.saveChange": "Save change",
  // apps/web/src/screens/organization/bookings/bookings-and-travelers.tsx
  "screen.organization.bookings.bookingsAndTravelers.booking": "Booking",
  "screen.organization.bookings.bookingsAndTravelers.state": "State",
  "screen.organization.bookings.bookingsAndTravelers.confirmed": "Confirmed",
  "screen.organization.bookings.bookingsAndTravelers.travelers": "Travelers",
  "screen.organization.bookings.bookingsAndTravelers.programs": "Programs",
  "screen.organization.bookings.bookingsAndTravelers.seat": "Seat",
  "screen.organization.bookings.bookingsAndTravelers.payment": "Payment",
  "screen.organization.bookings.bookingsAndTravelers.bookings": "Bookings",
  "screen.organization.bookings.bookingsAndTravelers.cancellationRequests": "Cancellation requests",
  "screen.organization.bookings.bookingsAndTravelers.backToTrip": "Back to trip",
  "screen.organization.bookings.bookingsAndTravelers.bookingsAndTravelers":
    "Bookings and travelers",
  "screen.organization.bookings.bookingsAndTravelers.tripName": "[Trip name]",
  "screen.organization.bookings.bookingsAndTravelers.seatMap": "Seat map",
  "screen.organization.bookings.bookingsAndTravelers.bookingViews": "Booking views",
  "screen.organization.bookings.bookingsAndTravelers.searchTravelersOrBookings":
    "Search travelers or bookings",
  "screen.organization.bookings.bookingsAndTravelers.clearSearch": "Clear search",
  "screen.organization.bookings.bookingsAndTravelers.bookingsOnThisTrip": "Bookings on this trip",
  "screen.organization.bookings.bookingsAndTravelers.noBookingsYet": "No bookings yet",
  "screen.organization.bookings.bookingsAndTravelers.bookingsAppearHereWhenTravelers":
    "Bookings appear here when travelers book this trip.",
  "screen.organization.bookings.bookingsAndTravelers.noCancellationRequests":
    "No cancellation requests",
  "screen.organization.bookings.bookingsAndTravelers.requestsFromTravelersAppearHere":
    "Requests from travelers appear here for approval or decline.",
  // apps/web/src/screens/organization/bookings/program-enrollment-report.tsx
  "screen.organization.bookings.programEnrollmentReport.programName": "[Program name]",
  "screen.organization.bookings.programEnrollmentReport.booking": "Booking",
  "screen.organization.bookings.programEnrollmentReport.quantity": "Quantity",
  "screen.organization.bookings.programEnrollmentReport.revenue": "Revenue",
  "screen.organization.bookings.programEnrollmentReport.backToAnalytics": "Back to analytics",
  "screen.organization.bookings.programEnrollmentReport.programEnrollmentReport":
    "Program enrollment report",
  "screen.organization.bookings.programEnrollmentReport.export": "Export",
  "screen.organization.bookings.programEnrollmentReport.program": "Program",
  "screen.organization.bookings.programEnrollmentReport.totalQuantity": "Total quantity",
  "screen.organization.bookings.programEnrollmentReport.totalRevenue": "Total revenue",
  "screen.organization.bookings.programEnrollmentReport.enrollments": "Enrollments",
  "screen.organization.bookings.programEnrollmentReport.enrollmentsForTheSelectedProgram":
    "Enrollments for the selected program",
  "screen.organization.bookings.programEnrollmentReport.noEnrollmentsYet": "No enrollments yet",
  "screen.organization.bookings.programEnrollmentReport.travelersWhoSelectThisProgram":
    "Travelers who select this program appear here.",
  // apps/web/src/screens/organization/bookings/seat-map-and-seat-assignment.tsx
  "screen.organization.bookings.seatMapAndSeatAssignment.seat": "Seat",
  "screen.organization.bookings.seatMapAndSeatAssignment.state": "State",
  "screen.organization.bookings.seatMapAndSeatAssignment.traveler": "Traveler",
  "screen.organization.bookings.seatMapAndSeatAssignment.program": "Program",
  "screen.organization.bookings.seatMapAndSeatAssignment.action": "Action",
  "screen.organization.bookings.seatMapAndSeatAssignment.map": "Map",
  "screen.organization.bookings.seatMapAndSeatAssignment.list": "List",
  "screen.organization.bookings.seatMapAndSeatAssignment.backToBooking": "Back to booking",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatMapAndSeatAssignment":
    "Seat map and seat assignment",
  "screen.organization.bookings.seatMapAndSeatAssignment.vehiclePlate": "[Vehicle plate]",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatView": "Seat view",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatMap": "Seat map",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatsOnThisVehicle":
    "Seats on this vehicle",
  "screen.organization.bookings.seatMapAndSeatAssignment.noSeats": "No seats",
  "screen.organization.bookings.seatMapAndSeatAssignment.thisVehicleTypeHasNo":
    "This vehicle type has no seats.",
  "screen.organization.bookings.seatMapAndSeatAssignment.legend": "Legend",
  "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelers":
    "Unassigned travelers",
  "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelersCaption":
    "Unassigned travelers",
  "screen.organization.bookings.seatMapAndSeatAssignment.everyoneHasASeat": "Everyone has a seat",
  "screen.organization.bookings.seatMapAndSeatAssignment.allTravelersOnThisVehicle":
    "All travelers on this vehicle are assigned.",
  // apps/web/src/screens/organization/common/org-link.tsx
  "screen.organization.common.orgLink.backLinks": "Back links",
  "screen.organization.common.orgLink.backToWorkspace": "Back to workspace",
  // apps/web/src/screens/organization/common/org-shared.tsx
  "screen.organization.common.orgShared.step.basics": "Basics",
  "screen.organization.common.orgShared.step.schedule": "Schedule and route",
  "screen.organization.common.orgShared.step.vehicles": "Vehicles",
  "screen.organization.common.orgShared.step.staffing": "Staffing",
  "screen.organization.common.orgShared.step.programs": "Programs",
  "screen.organization.common.orgShared.step.seating": "Seating",
  "screen.organization.common.orgShared.step.pricing": "Pricing and capacity",
  "screen.organization.common.orgShared.step.publish": "Publish",
  "screen.organization.common.orgShared.tripWizardProgress": "Trip wizard progress",
  "screen.organization.common.orgShared.back": "Back",
  // apps/web/src/screens/organization/common/organization-nav.tsx
  "screen.organization.nav.workspaceHome": "Workspace home",
  "screen.organization.nav.tripsList": "Trips",
  "screen.organization.nav.bookingsAndTravelers": "Bookings",
  "screen.organization.nav.couponsList": "Coupons",
  "screen.organization.nav.tripAccounting": "Accounting",
  "screen.organization.nav.subscriptionAndBilling": "Subscription",
  "screen.organization.nav.employeesList": "Employees",
  "screen.organization.nav.invoicesList": "Invoices",
  "screen.organization.nav.analyticsAndReports": "Analytics",
  "screen.organization.nav.liveOperations": "Live operations",
  "screen.organization.nav.organizationProfileSettingsAndBranding": "Settings",
  "screen.organization.common.organizationNav.organizationAreas": "Organization areas",
  // apps/web/src/screens/organization/common/organization-state-preview.tsx
  "screen.organization.common.organizationStatePreview.main": "Main",
  "screen.organization.common.organizationStatePreview.loading": "Loading",
  "screen.organization.common.organizationStatePreview.empty": "Empty",
  "screen.organization.common.organizationStatePreview.error": "Error",
  "screen.organization.common.organizationStatePreview.loading2": "Loading",
  "screen.organization.common.organizationStatePreview.previewState": "Preview state",
  "screen.organization.common.organizationStatePreview.nothingHereYet": "Nothing here yet",
  "screen.organization.common.organizationStatePreview.thisAreaHasNoItems":
    "This area has no items to show.",
  // apps/web/src/screens/organization/coupons/coupon-analytics.tsx
  "screen.organization.coupons.couponAnalytics.coupon": "Coupon",
  "screen.organization.coupons.couponAnalytics.redemptions": "Redemptions",
  "screen.organization.coupons.couponAnalytics.discountTotal": "Discount total",
  "screen.organization.coupons.couponAnalytics.remainingUses": "Remaining uses",
  "screen.organization.coupons.couponAnalytics.backToCoupons": "Back to coupons",
  "screen.organization.coupons.couponAnalytics.couponAnalytics": "Coupon analytics",
  "screen.organization.coupons.couponAnalytics.export": "Export",
  "screen.organization.coupons.couponAnalytics.from": "From",
  "screen.organization.coupons.couponAnalytics.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.coupons.couponAnalytics.to": "To",
  "screen.organization.coupons.couponAnalytics.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.coupons.couponAnalytics.coupons": "Coupons",
  "screen.organization.coupons.couponAnalytics.redemptionsAndDiscountsPerCoupon":
    "Redemptions and discounts per coupon",
  "screen.organization.coupons.couponAnalytics.noRedemptions": "No redemptions",
  "screen.organization.coupons.couponAnalytics.redemptionsAppearHereOnceTravelers":
    "Redemptions appear here once travelers use a coupon.",
  "screen.organization.coupons.couponAnalytics.fullBreakdown": "Full breakdown",
  "screen.organization.coupons.couponAnalytics.theFullCouponBreakdownIs":
    "The full coupon breakdown is available on the Enterprise plan.",
  // apps/web/src/screens/organization/coupons/coupon-editor.tsx
  "screen.organization.coupons.couponEditor.fixedAmount": "Fixed amount",
  "screen.organization.coupons.couponEditor.percentage": "Percentage",
  "screen.organization.coupons.couponEditor.programSpecific": "Program-specific",
  "screen.organization.coupons.couponEditor.freeProgram": "Free program",
  "screen.organization.coupons.couponEditor.firstBooking": "First booking",
  "screen.organization.coupons.couponEditor.minimumSpend": "Minimum spend",
  "screen.organization.coupons.couponEditor.public": "Public",
  "screen.organization.coupons.couponEditor.targeted": "Targeted",
  "screen.organization.coupons.couponEditor.backToCoupons": "Back to coupons",
  "screen.organization.coupons.couponEditor.couponEditor": "Coupon editor",
  "screen.organization.coupons.couponEditor.save": "Save",
  "screen.organization.coupons.couponEditor.codeAndType": "Code and type",
  "screen.organization.coupons.couponEditor.code": "Code",
  "screen.organization.coupons.couponEditor.codePlaceholder": "[Code]",
  "screen.organization.coupons.couponEditor.typeACustomCodeOr":
    "Type a custom code or generate one.",
  "screen.organization.coupons.couponEditor.type": "Type",
  "screen.organization.coupons.couponEditor.value": "Value",
  "screen.organization.coupons.couponEditor.valuePlaceholder": "[Value]",
  "screen.organization.coupons.couponEditor.scope": "Scope",
  "screen.organization.coupons.couponEditor.couponsApplyOnlyToThis":
    "Coupons apply only to this organization's trips.",
  "screen.organization.coupons.couponEditor.limitsAndValidity": "Limits and validity",
  "screen.organization.coupons.couponEditor.totalLimit": "Total limit",
  "screen.organization.coupons.couponEditor.totalUses": "[Total uses]",
  "screen.organization.coupons.couponEditor.perUserLimit": "Per-user limit",
  "screen.organization.coupons.couponEditor.usesPerUser": "[Uses per user]",
  "screen.organization.coupons.couponEditor.validFrom": "Valid from",
  "screen.organization.coupons.couponEditor.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.coupons.couponEditor.validUntil": "Valid until",
  "screen.organization.coupons.couponEditor.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.coupons.couponEditor.minimumBookingValue": "Minimum booking value",
  "screen.organization.coupons.couponEditor.amount": "[Amount]",
  "screen.organization.coupons.couponEditor.programs": "Programs",
  "screen.organization.coupons.couponEditor.programsPlaceholder": "[Programs]",
  "screen.organization.coupons.couponEditor.audience": "Audience",
  "screen.organization.coupons.couponEditor.audienceLabel": "Audience",
  "screen.organization.coupons.couponEditor.canBeCombinedWithOther":
    "Can be combined with other coupons",
  "screen.organization.coupons.couponEditor.yes": "Yes",
  "screen.organization.coupons.couponEditor.no": "No",
  // apps/web/src/screens/organization/coupons/coupons-list.tsx
  "screen.organization.coupons.couponsList.code": "Code",
  "screen.organization.coupons.couponsList.type": "Type",
  "screen.organization.coupons.couponsList.value": "Value",
  "screen.organization.coupons.couponsList.status": "Status",
  "screen.organization.coupons.couponsList.active": "Active",
  "screen.organization.coupons.couponsList.paused": "Paused",
  "screen.organization.coupons.couponsList.redemptions": "Redemptions",
  "screen.organization.coupons.couponsList.remainingUses": "Remaining uses",
  "screen.organization.coupons.couponsList.actions": "Actions",
  "screen.organization.coupons.couponsList.pause": "Pause",
  "screen.organization.coupons.couponsList.resume": "Resume",
  "screen.organization.coupons.couponsList.revoke": "Revoke",
  "screen.organization.coupons.couponsList.couponsList": "Coupons list",
  "screen.organization.coupons.couponsList.analytics": "Analytics",
  "screen.organization.coupons.couponsList.createCoupon": "Create coupon",
  "screen.organization.coupons.couponsList.coupons": "Coupons",
  "screen.organization.coupons.couponsList.countedTowardYourPlanLimit":
    "Counted toward your plan limit",
  "screen.organization.coupons.couponsList.searchCoupons": "Search coupons",
  "screen.organization.coupons.couponsList.clearSearch": "Clear search",
  "screen.organization.coupons.couponsList.couponsCaption": "Coupons",
  "screen.organization.coupons.couponsList.noCouponsYet": "No coupons yet",
  "screen.organization.coupons.couponsList.createACouponToOffer":
    "Create a coupon to offer a discount on your trips.",
  "screen.organization.coupons.couponsList.revokeThisCoupon": "Revoke this coupon?",
  "screen.organization.coupons.couponsList.travelersCanNoLongerUse":
    "Travelers can no longer use it. Past redemptions are kept.",
  "screen.organization.coupons.couponsList.revokePrimaryLabel": "Revoke",
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
  "screen.organization.operations.analyticsAndReports.enrollment": "Enrollment",
  "screen.organization.operations.analyticsAndReports.couponRedemption": "Coupon redemption",
  "screen.organization.operations.analyticsAndReports.revenue": "Revenue",
  "screen.organization.operations.analyticsAndReports.analyticsAndReports": "Analytics and reports",
  "screen.organization.operations.analyticsAndReports.export": "Export",
  "screen.organization.operations.analyticsAndReports.from": "From",
  "screen.organization.operations.analyticsAndReports.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.operations.analyticsAndReports.to": "To",
  "screen.organization.operations.analyticsAndReports.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.operations.analyticsAndReports.reports": "Reports",
  "screen.organization.operations.analyticsAndReports.openReport": "Open report",
  "screen.organization.operations.analyticsAndReports.fullAnalytics": "Full analytics",
  "screen.organization.operations.analyticsAndReports.fullTrendAndRevenueAnalytics":
    "Full trend and revenue analytics are available on the Enterprise plan.",
  // apps/web/src/screens/organization/operations/child-safety-reports.tsx
  "screen.organization.operations.childSafetyReports.case": "Case",
  "screen.organization.operations.childSafetyReports.time": "Time",
  "screen.organization.operations.childSafetyReports.trip": "Trip",
  "screen.organization.operations.childSafetyReports.vehicle": "Vehicle",
  "screen.organization.operations.childSafetyReports.status": "Status",
  "screen.organization.operations.childSafetyReports.caseOpen": "Case open",
  "screen.organization.operations.childSafetyReports.routedToEscalationContact":
    "Routed to escalation contact",
  "screen.organization.operations.childSafetyReports.backToLiveOperations":
    "Back to live operations",
  "screen.organization.operations.childSafetyReports.childSafetyReports": "Child-safety reports",
  "screen.organization.operations.childSafetyReports.newReport": "New report",
  "screen.organization.operations.childSafetyReports.escalationContact": "Escalation contact",
  "screen.organization.operations.childSafetyReports.reportsAreRoutedToEscalation":
    "Reports are routed to: [Escalation contact, to be decided].",
  "screen.organization.operations.childSafetyReports.cases": "Cases",
  "screen.organization.operations.childSafetyReports.childSafetyCases": "Child-safety cases",
  "screen.organization.operations.childSafetyReports.noCases": "No cases",
  "screen.organization.operations.childSafetyReports.casesYouSubmitForTrips":
    "Cases you submit for trips you run appear here.",
  // apps/web/src/screens/organization/operations/live-operations.tsx
  "screen.organization.operations.liveOperations.vehicle": "Vehicle",
  "screen.organization.operations.liveOperations.checkedIn": "Checked in",
  "screen.organization.operations.liveOperations.seats": "Seats",
  "screen.organization.operations.liveOperations.occupancy": "Occupancy",
  "screen.organization.operations.liveOperations.incidentSummary": "[Incident summary]",
  "screen.organization.operations.liveOperations.backToTrip": "Back to trip",
  "screen.organization.operations.liveOperations.liveOperations": "Live operations",
  "screen.organization.operations.liveOperations.tripName": "[Trip name]",
  "screen.organization.operations.liveOperations.tripStatus": "Trip status",
  "screen.organization.operations.liveOperations.travelersCheckedIn": "Travelers checked in",
  "screen.organization.operations.liveOperations.vehiclesOnTheRoad": "Vehicles on the road",
  "screen.organization.operations.liveOperations.liveMap": "Live map",
  "screen.organization.operations.liveOperations.liveVehiclePositions": "Live vehicle positions",
  "screen.organization.operations.liveOperations.vehiclePositionAndArrivalTime":
    "[Vehicle position and arrival time]",
  "screen.organization.operations.liveOperations.occupancyPerVehicle": "Occupancy per vehicle",
  "screen.organization.operations.liveOperations.occupancyPerVehicleCaption":
    "Occupancy per vehicle",
  "screen.organization.operations.liveOperations.noVehiclesInProgress": "No vehicles in progress",
  "screen.organization.operations.liveOperations.occupancyAppearsWhenATrip":
    "Occupancy appears when a trip is in progress.",
  "screen.organization.operations.liveOperations.travelerLookup": "Traveler lookup",
  "screen.organization.operations.liveOperations.findATraveler": "Find a traveler",
  "screen.organization.operations.liveOperations.clearSearch": "Clear search",
  "screen.organization.operations.liveOperations.theLookupShowsTheTraveler":
    "The lookup shows the traveler's vehicle only.",
  "screen.organization.operations.liveOperations.incidentFeed": "Incident feed",
  "screen.organization.operations.liveOperations.incidentFeedAriaLabel": "Incident feed",
  "screen.organization.operations.liveOperations.related": "Related",
  "screen.organization.operations.liveOperations.tripReportReview": "Trip report review",
  "screen.organization.operations.liveOperations.bookingsAndTravelers": "Bookings and travelers",
  "screen.organization.operations.liveOperations.childSafetyReports": "Child-safety reports",
  // apps/web/src/screens/organization/operations/trip-report-review.tsx
  "screen.organization.operations.tripReportReview.vehicle": "Vehicle",
  "screen.organization.operations.tripReportReview.finalHeadcount": "Final headcount",
  "screen.organization.operations.tripReportReview.checkedIn": "Checked in",
  "screen.organization.operations.tripReportReview.headcount": "Headcount",
  "screen.organization.operations.tripReportReview.matchesCheckIn": "Matches check-in",
  "screen.organization.operations.tripReportReview.mismatch": "Mismatch",
  "screen.organization.operations.tripReportReview.incidents": "Incidents",
  "screen.organization.operations.tripReportReview.submitted": "Submitted",
  "screen.organization.operations.tripReportReview.backToTrip": "Back to trip",
  "screen.organization.operations.tripReportReview.tripReportReview": "Trip report review",
  "screen.organization.operations.tripReportReview.tripName": "[Trip name]",
  "screen.organization.operations.tripReportReview.moderatorReports": "Moderator reports",
  "screen.organization.operations.tripReportReview.moderatorReportsPerVehicle":
    "Moderator reports per vehicle",
  "screen.organization.operations.tripReportReview.noReportsYet": "No reports yet",
  "screen.organization.operations.tripReportReview.reportsAppearHereAfterEach":
    "Reports appear here after each moderator submits one.",
  "screen.organization.operations.tripReportReview.organizationNote": "Organization note",
  "screen.organization.operations.tripReportReview.note": "Note",
  "screen.organization.operations.tripReportReview.notePlaceholder": "[Note]",
  "screen.organization.operations.tripReportReview.youCanAddANote":
    "You can add a note. Submitted reports cannot be edited.",
  "screen.organization.operations.tripReportReview.addNote": "Add note",
  // apps/web/src/screens/organization/people/crm-and-webhooks.tsx
  "screen.organization.people.crmAndWebhooks.labels.bookingConfirmed": "Booking confirmed",
  "screen.organization.people.crmAndWebhooks.labels.bookingCancelled": "Booking cancelled",
  "screen.organization.people.crmAndWebhooks.labels.tripPublished": "Trip published",
  "screen.organization.people.crmAndWebhooks.labels.checkIn": "Check-in",
  "screen.organization.people.crmAndWebhooks.labels.checkOut": "Check-out",
  "screen.organization.people.crmAndWebhooks.labels.signingStatus": "Signing status",
  "screen.organization.people.crmAndWebhooks.event": "Event",
  "screen.organization.people.crmAndWebhooks.time": "Time",
  "screen.organization.people.crmAndWebhooks.outcome": "Outcome",
  "screen.organization.people.crmAndWebhooks.delivered": "Delivered",
  "screen.organization.people.crmAndWebhooks.backToSettings": "Back to settings",
  "screen.organization.people.crmAndWebhooks.crmAndWebhooks": "CRM and webhooks",
  "screen.organization.people.crmAndWebhooks.addEndpoint": "Add endpoint",
  "screen.organization.people.crmAndWebhooks.crmConnection": "CRM connection",
  "screen.organization.people.crmAndWebhooks.notConnected": "Not connected",
  "screen.organization.people.crmAndWebhooks.connectCrm": "Connect CRM",
  "screen.organization.people.crmAndWebhooks.webhookEndpoint": "Webhook endpoint",
  "screen.organization.people.crmAndWebhooks.endpointUrl": "Endpoint URL",
  "screen.organization.people.crmAndWebhooks.httpsYourEndpoint": "https://[your endpoint]",
  "screen.organization.people.crmAndWebhooks.sendTest": "Send test",
  "screen.organization.people.crmAndWebhooks.rotateSecret": "Rotate secret",
  "screen.organization.people.crmAndWebhooks.events": "Events",
  "screen.organization.people.crmAndWebhooks.deliveryLog": "Delivery log",
  "screen.organization.people.crmAndWebhooks.webhookDeliveryLog": "Webhook delivery log",
  "screen.organization.people.crmAndWebhooks.noDeliveriesYet": "No deliveries yet",
  "screen.organization.people.crmAndWebhooks.eachEventSentToYour":
    "Each event sent to your endpoint is listed here with its outcome.",
  // apps/web/src/screens/organization/people/employee-invitation-acceptance.tsx
  "screen.organization.people.employeeInvitationAcceptance.employeeInvitationAcceptance":
    "Employee invitation acceptance",
  "screen.organization.people.employeeInvitationAcceptance.youHaveBeenInvitedTo":
    "You have been invited to join an organization.",
  "screen.organization.people.employeeInvitationAcceptance.acceptOnlyIfTheInvitation":
    "Accept only if the invitation was sent to the email address you are signed in with.",
  "screen.organization.people.employeeInvitationAcceptance.organizationName": "[Organization name]",
  "screen.organization.people.employeeInvitationAcceptance.permissionAreasGranted":
    "Permission areas granted",
  "screen.organization.people.employeeInvitationAcceptance.permissionArea": "[Permission area]",
  "screen.organization.people.employeeInvitationAcceptance.invitationToken": "Invitation token",
  "screen.organization.people.employeeInvitationAcceptance.pasteInvitationToken":
    "Paste invitation token",
  "screen.organization.people.employeeInvitationAcceptance.decline": "Decline",
  "screen.organization.people.employeeInvitationAcceptance.acceptInvitation": "Accept invitation",
  // apps/web/src/screens/organization/people/employee-invitation-and-permissions.tsx
  "screen.organization.people.employeeInvitationAndPermissions.labels.trips": "Trips",
  "screen.organization.people.employeeInvitationAndPermissions.labels.bookings": "Bookings",
  "screen.organization.people.employeeInvitationAndPermissions.labels.accounting": "Accounting",
  "screen.organization.people.employeeInvitationAndPermissions.labels.coupons": "Coupons",
  "screen.organization.people.employeeInvitationAndPermissions.labels.employees": "Employees",
  "screen.organization.people.employeeInvitationAndPermissions.labels.fleet": "Fleet",
  "screen.organization.people.employeeInvitationAndPermissions.labels.subscription": "Subscription",
  "screen.organization.people.employeeInvitationAndPermissions.changedBy": "Changed by",
  "screen.organization.people.employeeInvitationAndPermissions.when": "When",
  "screen.organization.people.employeeInvitationAndPermissions.before": "Before",
  "screen.organization.people.employeeInvitationAndPermissions.after": "After",
  "screen.organization.people.employeeInvitationAndPermissions.backToEmployees":
    "Back to employees",
  "screen.organization.people.employeeInvitationAndPermissions.employeeInvitationAndPermissions":
    "Employee invitation and permissions",
  "screen.organization.people.employeeInvitationAndPermissions.invite": "Invite",
  "screen.organization.people.employeeInvitationAndPermissions.email": "Email",
  "screen.organization.people.employeeInvitationAndPermissions.emailPlaceholder": "[Email]",
  "screen.organization.people.employeeInvitationAndPermissions.roleTitle": "Role title",
  "screen.organization.people.employeeInvitationAndPermissions.operationsCoordinator":
    "Operations Coordinator",
  "screen.organization.people.employeeInvitationAndPermissions.permissionAreas": "Permission areas",
  "screen.organization.people.employeeInvitationAndPermissions.changeHistory": "Change history",
  "screen.organization.people.employeeInvitationAndPermissions.permissionChangeHistory":
    "Permission change history",
  "screen.organization.people.employeeInvitationAndPermissions.noChangesYet": "No changes yet",
  "screen.organization.people.employeeInvitationAndPermissions.changesToPermissionAreasAre":
    "Changes to permission areas are recorded here.",
  "screen.organization.people.employeeInvitationAndPermissions.savePermissions": "Save permissions",
  "screen.organization.people.employeeInvitationAndPermissions.sendInvitation": "Send invitation",
  // apps/web/src/screens/organization/people/employees-list.tsx
  "screen.organization.people.employeesList.name": "Name",
  "screen.organization.people.employeesList.email": "Email",
  "screen.organization.people.employeesList.status": "Status",
  "screen.organization.people.employeesList.active": "Active",
  "screen.organization.people.employeesList.invited": "Invited",
  "screen.organization.people.employeesList.permissionAreas": "Permission areas",
  "screen.organization.people.employeesList.remove": "Remove",
  "screen.organization.people.employeesList.remove2": "Remove",
  "screen.organization.people.employeesList.employeesList": "Employees list",
  "screen.organization.people.employeesList.inviteEmployee": "Invite employee",
  "screen.organization.people.employeesList.employees": "Employees",
  "screen.organization.people.employeesList.searchEmployees": "Search employees",
  "screen.organization.people.employeesList.clearSearch": "Clear search",
  "screen.organization.people.employeesList.employeesCaption": "Employees",
  "screen.organization.people.employeesList.noEmployeesYet": "No employees yet",
  "screen.organization.people.employeesList.inviteEmployeesAndGiveThem":
    "Invite employees and give them the permission areas they need.",
  "screen.organization.people.employeesList.removeThisEmployee": "Remove this employee?",
  "screen.organization.people.employeesList.accessEndsAtOncePast":
    "Access ends at once. Past audit entries are kept.",
  "screen.organization.people.employeesList.removeEmployee": "Remove employee",
  "screen.organization.people.employeesList.keepEmployee": "Keep employee",
  // apps/web/src/screens/organization/staffing/deal-detail-and-negotiation.tsx
  "screen.organization.staffing.dealDetailAndNegotiation.trip": "Trip",
  "screen.organization.staffing.dealDetailAndNegotiation.route": "Route",
  "screen.organization.staffing.dealDetailAndNegotiation.date": "Date",
  "screen.organization.staffing.dealDetailAndNegotiation.pay": "Pay",
  "screen.organization.staffing.dealDetailAndNegotiation.proposedByTheOrganization":
    "Proposed by the organization",
  "screen.organization.staffing.dealDetailAndNegotiation.backToStaffingBoard":
    "Back to staffing board",
  "screen.organization.staffing.dealDetailAndNegotiation.dealDetailAndNegotiation":
    "Deal detail and negotiation",
  "screen.organization.staffing.dealDetailAndNegotiation.proposed": "Proposed",
  "screen.organization.staffing.dealDetailAndNegotiation.theDealExpires72Hours":
    "The deal expires 72 hours after the last counter-offer.",
  "screen.organization.staffing.dealDetailAndNegotiation.offerHistory": "Offer history",
  "screen.organization.staffing.dealDetailAndNegotiation.offerHistoryAriaLabel": "Offer history",
  "screen.organization.staffing.dealDetailAndNegotiation.counterOffer": "Counter-offer",
  "screen.organization.staffing.dealDetailAndNegotiation.counterAmount": "Counter amount",
  "screen.organization.staffing.dealDetailAndNegotiation.amount": "[Amount]",
  "screen.organization.staffing.dealDetailAndNegotiation.currency": "Currency",
  "screen.organization.staffing.dealDetailAndNegotiation.currencyCode": "[Currency code]",
  "screen.organization.staffing.dealDetailAndNegotiation.reject": "Reject",
  "screen.organization.staffing.dealDetailAndNegotiation.counter": "Counter",
  "screen.organization.staffing.dealDetailAndNegotiation.accept": "Accept",
  // apps/web/src/screens/organization/staffing/organization-owned-drivers-and-photographers.tsx
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.driver": "Driver",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.photographer":
    "Photographer",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.name": "Name",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.type": "Type",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.status": "Status",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.vehicleAssignments":
    "Vehicle assignments",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove": "Remove",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove2": "Remove",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.backToStaffingBoard":
    "Back to staffing board",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDriversAndPhotographers":
    "Organization-owned drivers and photographers",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer":
    "Add driver or photographer",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedStaffAreVisible":
    "Organization-owned staff are visible only to your organization. They are accepted automatically when assigned to a trip.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailed":
    "Action failed",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addOrganizationOwnedStaff":
    "Add organization-owned staff",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.role": "Role",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.fullName": "Full name",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.phone": "Phone",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emailOptional":
    "Email (optional)",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.licenseNumber":
    "License number",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cameraBody": "Camera body",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saving": "Saving...",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saveStaffMember":
    "Save staff member",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cancel": "Cancel",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedStaff":
    "Organization-owned staff",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.capStaffCap":
    "Cap: [staff cap]",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.staff": "Staff",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDriversAndPhotographersCaption":
    "Organization-owned drivers and photographers",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.noOrganizationOwnedStaffYet":
    "No organization-owned staff yet",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addADriverOrPhotographer":
    "Add a driver or photographer to assign them to trips.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removeThisStaffMember":
    "Remove this staff member?",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.futureAssignmentsAreAffectedTrips":
    "Future assignments are affected. Trips already assigned keep their history.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removePrimaryLabel":
    "Remove",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.keep": "Keep",
  // apps/web/src/screens/organization/staffing/platform-supplier-search-and-deal-start.tsx
  "screen.organization.staffing.platformSupplierSearchAndDealStart.backToStaffingBoard":
    "Back to staffing board",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.platformSupplierSearchAndDeal":
    "Platform supplier search and deal start",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.theTripRouteDateAnd":
    "The trip, route, date and pay are shown to the supplier.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.findASupplier":
    "Find a supplier",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.searchSuppliers":
    "Search suppliers",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.clearSearch": "Clear search",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.nameRoleOrArea":
    "[Name, role or area]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierName": "[Supplier name]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.verified": "Verified",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.availableOnDate":
    "Available on [date]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.price": "Price",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.amount": "[Amount]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.currency": "Currency",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.currencyCode": "[Currency code]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal": "Send proposal",
  // apps/web/src/screens/organization/staffing/staffing-board.tsx
  "screen.organization.staffing.staffingBoard.organizationOwned": "Organization-owned",
  "screen.organization.staffing.staffingBoard.accepted": "Accepted",
  "screen.organization.staffing.staffingBoard.platformNegotiating": "Platform negotiating",
  "screen.organization.staffing.staffingBoard.platformFinalized": "Platform finalized",
  "screen.organization.staffing.staffingBoard.missing": "Missing",
  "screen.organization.staffing.staffingBoard.vehicle": "Vehicle",
  "screen.organization.staffing.staffingBoard.driver": "Driver",
  "screen.organization.staffing.staffingBoard.moderator": "Moderator",
  "screen.organization.staffing.staffingBoard.photographer": "Photographer",
  "screen.organization.staffing.staffingBoard.actions": "Actions",
  "screen.organization.staffing.staffingBoard.manage": "Manage",
  "screen.organization.staffing.staffingBoard.backToTrip": "Back to trip",
  "screen.organization.staffing.staffingBoard.staffingBoard": "Staffing board",
  "screen.organization.staffing.staffingBoard.tripName": "[Trip name]",
  "screen.organization.staffing.staffingBoard.organizationOwnedStaff": "Organization-owned staff",
  "screen.organization.staffing.staffingBoard.findPlatformSupplier": "Find platform supplier",
  "screen.organization.staffing.staffingBoard.readyIsBlocked": "Ready is blocked",
  "screen.organization.staffing.staffingBoard.everyVehicleNeedsADriver":
    "Every vehicle needs a driver and a moderator before the trip can be Ready.",
  "screen.organization.staffing.staffingBoard.staffingForEachVehicle": "Staffing for each vehicle",
  "screen.organization.staffing.staffingBoard.noVehiclesOnThisTrip": "No vehicles on this trip",
  "screen.organization.staffing.staffingBoard.addVehiclesToTheTrip":
    "Add vehicles to the trip to assign staff.",
  // apps/web/src/screens/organization/trips/cancel-trip-decision.tsx
  "screen.organization.trips.cancelTripDecision.backToTrip": "Back to trip",
  "screen.organization.trips.cancelTripDecision.cancelTripDecision": "Cancel trip (decision)",
  "screen.organization.trips.cancelTripDecision.thisCancelsTheTripFor":
    "This cancels the trip for every traveler",
  "screen.organization.trips.cancelTripDecision.confirmedBookingsMoveToCancelled":
    "Confirmed bookings move to Cancelled, then Refunded. Travelers are notified and refunds are queued.",
  "screen.organization.trips.cancelTripDecision.affectedBookings": "Affected bookings",
  "screen.organization.trips.cancelTripDecision.refundPolicy": "Refund policy",
  "screen.organization.trips.cancelTripDecision.reason": "Reason",
  "screen.organization.trips.cancelTripDecision.reasonForCancellation": "Reason for cancellation",
  "screen.organization.trips.cancelTripDecision.reasonPlaceholder": "[Reason]",
  "screen.organization.trips.cancelTripDecision.requiredTheReasonIsRecorded":
    "Required. The reason is recorded with the cancellation.",
  "screen.organization.trips.cancelTripDecision.travelersAreNotifiedOfThe":
    "Travelers are notified of the cancellation.",
  "screen.organization.trips.cancelTripDecision.refundsAreQueuedUnderThe":
    "Refunds are queued under the refund policy.",
  "screen.organization.trips.cancelTripDecision.keepTrip": "Keep trip",
  "screen.organization.trips.cancelTripDecision.cancelTrip": "Cancel trip",
  "screen.organization.trips.cancelTripDecision.cancelThisTrip": "Cancel this trip?",
  "screen.organization.trips.cancelTripDecision.confirmedBookingsMoveToCancelledDescription":
    "Confirmed bookings move to Cancelled, then Refunded. Travelers are notified.",
  "screen.organization.trips.cancelTripDecision.cancelTripPrimaryLabel": "Cancel trip",
  "screen.organization.trips.cancelTripDecision.keepTripSecondaryLabel": "Keep trip",
  // apps/web/src/screens/organization/trips/program-editor.tsx
  "screen.organization.trips.programEditor.labels.optional": "Optional",
  "screen.organization.trips.programEditor.labels.preRequired": "Pre-required",
  "screen.organization.trips.programEditor.labels.capacityLimitedWithCap":
    "Capacity-limited (with cap)",
  "screen.organization.trips.programEditor.labels.vipOnly": "VIP-only",
  "screen.organization.trips.programEditor.free": "Free",
  "screen.organization.trips.programEditor.perPerson": "Per person",
  "screen.organization.trips.programEditor.byQuantity": "By quantity",
  "screen.organization.trips.programEditor.perGroup": "Per group",
  "screen.organization.trips.programEditor.tiered": "Tiered",
  "screen.organization.trips.programEditor.backToPrograms": "Back to programs",
  "screen.organization.trips.programEditor.programEditor": "Program editor",
  "screen.organization.trips.programEditor.save": "Save",
  "screen.organization.trips.programEditor.details": "Details",
  "screen.organization.trips.programEditor.programName": "Program name",
  "screen.organization.trips.programEditor.programNamePlaceholder": "[Program name]",
  "screen.organization.trips.programEditor.pricingModel": "Pricing model",
  "screen.organization.trips.programEditor.chooseExactlyOnePricingModel":
    "Choose exactly one pricing model.",
  "screen.organization.trips.programEditor.typeFlags": "Type flags",
  "screen.organization.trips.programEditor.prices": "Prices",
  "screen.organization.trips.programEditor.price": "Price",
  "screen.organization.trips.programEditor.amount": "[Amount]",
  "screen.organization.trips.programEditor.currency": "Currency",
  "screen.organization.trips.programEditor.currencyCode": "[Currency code]",
  // apps/web/src/screens/organization/trips/trip-command-view.tsx
  "screen.organization.trips.tripCommandView.vehicle": "Vehicle",
  "screen.organization.trips.tripCommandView.driver": "Driver",
  "screen.organization.trips.tripCommandView.missing": "Missing",
  "screen.organization.trips.tripCommandView.assigned": "Assigned",
  "screen.organization.trips.tripCommandView.moderator": "Moderator",
  "screen.organization.trips.tripCommandView.missingLabel": "Missing",
  "screen.organization.trips.tripCommandView.assignedLabel": "Assigned",
  "screen.organization.trips.tripCommandView.openDeal": "Open deal",
  "screen.organization.trips.tripCommandView.staffing": "Staffing",
  "screen.organization.trips.tripCommandView.seatMap": "Seat map",
  "screen.organization.trips.tripCommandView.bookings": "Bookings",
  "screen.organization.trips.tripCommandView.programs": "Programs",
  "screen.organization.trips.tripCommandView.enrollmentReport": "Enrollment report",
  "screen.organization.trips.tripCommandView.liveOperations": "Live operations",
  "screen.organization.trips.tripCommandView.accounting": "Accounting",
  "screen.organization.trips.tripCommandView.tripReports": "Trip reports",
  "screen.organization.trips.tripCommandView.tripCommandView": "Trip command view",
  "screen.organization.trips.tripCommandView.cancelTrip": "Cancel trip",
  "screen.organization.trips.tripCommandView.lifecycle": "Lifecycle",
  "screen.organization.trips.tripCommandView.seatsSold": "Seats sold",
  "screen.organization.trips.tripCommandView.seatsHeld": "Seats held",
  "screen.organization.trips.tripCommandView.seatsReserved": "Seats reserved",
  "screen.organization.trips.tripCommandView.occupancy": "Occupancy",
  "screen.organization.trips.tripCommandView.readyGaps": "Ready gaps",
  "screen.organization.trips.tripCommandView.readyGapsPerVehicle": "Ready gaps per vehicle",
  "screen.organization.trips.tripCommandView.noGaps": "No gaps",
  "screen.organization.trips.tripCommandView.everyVehicleHasADriver":
    "Every vehicle has a driver and a moderator.",
  "screen.organization.trips.tripCommandView.goTo": "Go to",
  // apps/web/src/screens/organization/trips/trip-wizard-step-1-basics.tsx
  "screen.organization.trips.tripWizardStep1Basics.tripWizardStep1Basics":
    "Trip wizard step 1: basics",
  "screen.organization.trips.tripWizardStep1Basics.activeTripsThisMonth": "Active trips this month",
  "screen.organization.trips.tripWizardStep1Basics.monthlyLimitPlanLimit":
    "Monthly limit: [plan limit]",
  "screen.organization.trips.tripWizardStep1Basics.yourDraftIsSavedAs":
    "Your draft is saved as you go. It stays available if your session ends.",
  "screen.organization.trips.tripWizardStep1Basics.tripName": "Trip name",
  "screen.organization.trips.tripWizardStep1Basics.tripNamePlaceholder": "[Trip name]",
  "screen.organization.trips.tripWizardStep1Basics.description": "Description",
  "screen.organization.trips.tripWizardStep1Basics.shortDescription": "[Short description]",
  "screen.organization.trips.tripWizardStep1Basics.tripType": "Trip type",
  "screen.organization.trips.tripWizardStep1Basics.tripTypePlaceholder": "[Trip type]",
  "screen.organization.trips.tripWizardStep1Basics.language": "Language",
  "screen.organization.trips.tripWizardStep1Basics.languagePlaceholder": "[Language]",
  // apps/web/src/screens/organization/trips/trip-wizard-step-2-schedule-and-route.tsx
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripWizardStep2Schedule":
    "Trip wizard step 2: schedule and route",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startDate": "Start date",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endDate": "End date",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startTime": "Start time",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.hhMm": "HH:MM",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endTime": "End time",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.hhMmPlaceholder": "HH:MM",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripTimeZone": "Trip time zone",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.timeZone": "[Time zone]",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.origin": "Origin",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.originPlaceholder": "[Origin]",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops":
    "Destinations and stops",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationOrStop":
    "[Destination or stop]",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.theMapPickerFromThe":
    "The map picker from the maps service sets the origin, destinations and stops.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-3-vehicles.tsx
  "screen.organization.trips.tripWizardStep3Vehicles.vehicle": "Vehicle",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicleType": "Vehicle type",
  "screen.organization.trips.tripWizardStep3Vehicles.seats": "Seats",
  "screen.organization.trips.tripWizardStep3Vehicles.remove": "Remove",
  "screen.organization.trips.tripWizardStep3Vehicles.removeVehicle": "Remove vehicle",
  "screen.organization.trips.tripWizardStep3Vehicles.tripWizardStep3Vehicles":
    "Trip wizard step 3: vehicles",
  "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip": "Vehicles on this trip",
  "screen.organization.trips.tripWizardStep3Vehicles.0Of10": "0 of 10",
  "screen.organization.trips.tripWizardStep3Vehicles.growthPlanLimitPerTrip":
    "Growth plan limit per trip",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicles": "Vehicles",
  "screen.organization.trips.tripWizardStep3Vehicles.addVehicle": "Add vehicle",
  "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTripCaption":
    "Vehicles on this trip",
  "screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet": "No vehicles yet",
  "screen.organization.trips.tripWizardStep3Vehicles.addAtLeastOneVehicle":
    "Add at least one vehicle to continue.",
  "screen.organization.trips.tripWizardStep3Vehicles.theSeatLayoutPreviewAppears":
    "The seat layout preview appears after you choose a vehicle type. Each vehicle has one vehicle type.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-4-staffing.tsx
  "screen.organization.trips.tripWizardStep4Staffing.notAssigned": "Not assigned",
  "screen.organization.trips.tripWizardStep4Staffing.organizationOwned": "Organization-owned",
  "screen.organization.trips.tripWizardStep4Staffing.platformThroughADeal":
    "Platform (through a deal)",
  "screen.organization.trips.tripWizardStep4Staffing.notAssignedLabel": "Not assigned",
  "screen.organization.trips.tripWizardStep4Staffing.organizationOwnedLabel": "Organization-owned",
  "screen.organization.trips.tripWizardStep4Staffing.notAssigned2": "Not assigned",
  "screen.organization.trips.tripWizardStep4Staffing.organizationOwned2": "Organization-owned",
  "screen.organization.trips.tripWizardStep4Staffing.platformThroughADealLabel":
    "Platform (through a deal)",
  "screen.organization.trips.tripWizardStep4Staffing.ready": "Ready",
  "screen.organization.trips.tripWizardStep4Staffing.driver": "Driver",
  "screen.organization.trips.tripWizardStep4Staffing.moderator": "Moderator",
  "screen.organization.trips.tripWizardStep4Staffing.photographer": "Photographer",
  "screen.organization.trips.tripWizardStep4Staffing.findPlatformSupplier":
    "Find platform supplier",
  "screen.organization.trips.tripWizardStep4Staffing.tripWizardStep4Staffing":
    "Trip wizard step 4: staffing",
  "screen.organization.trips.tripWizardStep4Staffing.aPlatformDriverOrPhotographer":
    "A platform driver or photographer is assigned only after the deal is finalized.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-5-programs.tsx
  "screen.organization.trips.tripWizardStep5Programs.program": "Program",
  "screen.organization.trips.tripWizardStep5Programs.pricingModel": "Pricing model",
  "screen.organization.trips.tripWizardStep5Programs.typeFlags": "Type flags",
  "screen.organization.trips.tripWizardStep5Programs.cap": "Cap",
  "screen.organization.trips.tripWizardStep5Programs.tripWizardStep5Programs":
    "Trip wizard step 5: programs",
  "screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip": "Programs on this trip",
  "screen.organization.trips.tripWizardStep5Programs.0Of15": "0 of 15",
  "screen.organization.trips.tripWizardStep5Programs.growthPlanLimitPerTrip":
    "Growth plan limit per trip",
  "screen.organization.trips.tripWizardStep5Programs.programs": "Programs",
  "screen.organization.trips.tripWizardStep5Programs.addProgram": "Add program",
  "screen.organization.trips.tripWizardStep5Programs.programsOnThisTripCaption":
    "Programs on this trip",
  "screen.organization.trips.tripWizardStep5Programs.noProgramsYet": "No programs yet",
  "screen.organization.trips.tripWizardStep5Programs.addAProgramOrContinue":
    "Add a program, or continue without one.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-6-seating.tsx
  "screen.organization.trips.tripWizardStep6Seating.tripWizardStep6Seating":
    "Trip wizard step 6: seating",
  "screen.organization.trips.tripWizardStep6Seating.travelersChooseTheirOwnSeats":
    "Travelers choose their own seats",
  "screen.organization.trips.tripWizardStep6Seating.selfSelect": "Self-select",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssignsSeats":
    "Organization assigns seats",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssignedSeatsAreThe":
    "Organization-assigned seats are the default. Changing the seat mode after bookings follows the trip change rules.",
  "screen.organization.trips.tripWizardStep6Seating.priorityWindowForExplorerAnd":
    "Priority window for Explorer and VIP travelers",
  "screen.organization.trips.tripWizardStep6Seating.windowLength": "[Window length]",
  "screen.organization.trips.tripWizardStep6Seating.theLengthOfTheWindow":
    "The length of the window is still to be decided.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-7-pricing-and-capacity.tsx
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.tripWizardStep7Pricing":
    "Trip wizard step 7: pricing and capacity",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePrice": "Base price",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.amount": "[Amount]",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.currency": "Currency",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.currencyCode": "[Currency code]",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityPerVehicle":
    "Capacity per vehicle",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.seatCount": "[Seat count]",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.setByTheSeatCount":
    "Set by the seat count of each vehicle type.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTracking": "Child tracking",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.on": "On",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.off": "Off",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingNeedsAParent":
    "Child tracking needs a parent on Explorer or VIP and an organization on Growth or Enterprise.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-8-publish.tsx
  "screen.organization.trips.tripWizardStep8Publish.basics": "Basics",
  "screen.organization.trips.tripWizardStep8Publish.scheduleAndRoute": "Schedule and route",
  "screen.organization.trips.tripWizardStep8Publish.vehicles": "Vehicles",
  "screen.organization.trips.tripWizardStep8Publish.staffing": "Staffing",
  "screen.organization.trips.tripWizardStep8Publish.programs": "Programs",
  "screen.organization.trips.tripWizardStep8Publish.seating": "Seating",
  "screen.organization.trips.tripWizardStep8Publish.pricingAndCapacity": "Pricing and capacity",
  "screen.organization.trips.tripWizardStep8Publish.saveAsDraft": "Save as draft",
  "screen.organization.trips.tripWizardStep8Publish.publishToEveryone": "Publish to everyone",
  "screen.organization.trips.tripWizardStep8Publish.publishToATargetedAudience":
    "Publish to a targeted audience list",
  "screen.organization.trips.tripWizardStep8Publish.tripWizardStep8Publish":
    "Trip wizard step 8: publish",
  "screen.organization.trips.tripWizardStep8Publish.publish": "Publish",
  "screen.organization.trips.tripWizardStep8Publish.saveDraft": "Save draft",
  "screen.organization.trips.tripWizardStep8Publish.tripsPublishedThisMonth":
    "Trips published this month",
  "screen.organization.trips.tripWizardStep8Publish.monthlyLimitPlanLimit":
    "Monthly limit: [plan limit]",
  "screen.organization.trips.tripWizardStep8Publish.readiness": "Readiness",
  "screen.organization.trips.tripWizardStep8Publish.requiredSteps": "Required steps",
  "screen.organization.trips.tripWizardStep8Publish.publishMode": "Publish mode",
  "screen.organization.trips.tripWizardStep8Publish.publishModeLabel": "Publish mode",
  "screen.organization.trips.tripWizardStep8Publish.audienceList": "Audience list",
  "screen.organization.trips.tripWizardStep8Publish.audienceListPlaceholder": "[Audience list]",
  "screen.organization.trips.tripWizardStep8Publish.usedOnlyWhenPublishingTo":
    "Used only when publishing to a targeted audience.",
  // apps/web/src/screens/organization/trips/trips-list.tsx
  "screen.organization.trips.tripsList.trip": "Trip",
  "screen.organization.trips.tripsList.dates": "Dates",
  "screen.organization.trips.tripsList.vehicles": "Vehicles",
  "screen.organization.trips.tripsList.seatsSold": "Seats sold",
  "screen.organization.trips.tripsList.staffing": "Staffing",
  "screen.organization.trips.tripsList.staffingGap": "Staffing gap",
  "screen.organization.trips.tripsList.staffed": "Staffed",
  "screen.organization.trips.tripsList.state": "State",
  "screen.organization.trips.tripsList.allStates": "All states",
  "screen.organization.trips.tripsList.tripsList": "Trips list",
  "screen.organization.trips.tripsList.createTrip": "Create trip",
  "screen.organization.trips.tripsList.activeTripsThisMonth": "Active trips this month",
  "screen.organization.trips.tripsList.monthlyLimitPlanLimit": "Monthly limit: [plan limit]",
  "screen.organization.trips.tripsList.tripsWithStaffingGaps": "Trips with staffing gaps",
  "screen.organization.trips.tripsList.searchTrips": "Search trips",
  "screen.organization.trips.tripsList.clearSearch": "Clear search",
  "screen.organization.trips.tripsList.stateLabel": "State",
  "screen.organization.trips.tripsList.trips": "Trips",
  "screen.organization.trips.tripsList.noTripsMatch": "No trips match",
  "screen.organization.trips.tripsList.changeTheSearchOrThe":
    "Change the search or the state filter.",
  // apps/web/src/screens/organization/vehicles/vehicle-editor.tsx
  "screen.organization.vehicles.vehicleEditor.confirmedBookingsCount":
    "This vehicle has {count} confirmed bookings. A vehicle with confirmed bookings cannot be removed.",
  "screen.organization.vehicles.vehicleEditor.backToVehicles": "Back to vehicles",
  "screen.organization.vehicles.vehicleEditor.vehicleEditor": "Vehicle editor",
  "screen.organization.vehicles.vehicleEditor.save": "Save",
  "screen.organization.vehicles.vehicleEditor.vehicle": "Vehicle",
  "screen.organization.vehicles.vehicleEditor.plate": "Plate",
  "screen.organization.vehicles.vehicleEditor.platePlaceholder": "[Plate]",
  "screen.organization.vehicles.vehicleEditor.model": "Model",
  "screen.organization.vehicles.vehicleEditor.modelPlaceholder": "[Model]",
  "screen.organization.vehicles.vehicleEditor.year": "Year",
  "screen.organization.vehicles.vehicleEditor.yearPlaceholder": "[Year]",
  "screen.organization.vehicles.vehicleEditor.vehicleType": "Vehicle type",
  "screen.organization.vehicles.vehicleEditor.vehicleTypePlaceholder": "[Vehicle type]",
  "screen.organization.vehicles.vehicleEditor.seatCount": "Seat count",
  "screen.organization.vehicles.vehicleEditor.seatCountPlaceholder": "[Seat count]",
  "screen.organization.vehicles.vehicleEditor.mustMatchTheSeatCount":
    "Must match the seat count of the vehicle type.",
  "screen.organization.vehicles.vehicleEditor.registrationStatus": "Registration status",
  "screen.organization.vehicles.vehicleEditor.registrationStatusPlaceholder":
    "[Registration status]",
  "screen.organization.vehicles.vehicleEditor.uploadVehiclePhoto": "Upload vehicle photo",
  "screen.organization.vehicles.vehicleEditor.removeVehicle": "Remove vehicle",
  "screen.organization.vehicles.vehicleEditor.removalIsBlockedWhileBookings":
    "Removal is blocked while bookings are confirmed",
  "screen.organization.vehicles.vehicleEditor.removeVehicle2": "Remove vehicle",
  "screen.organization.vehicles.vehicleEditor.removeThisVehicle": "Remove this vehicle?",
  "screen.organization.vehicles.vehicleEditor.theVehicleLeavesTheRegistry":
    "The vehicle leaves the registry and future trips. It cannot be removed while bookings are confirmed.",
  "screen.organization.vehicles.vehicleEditor.removeVehiclePrimaryLabel": "Remove vehicle",
  "screen.organization.vehicles.vehicleEditor.keepVehicle": "Keep vehicle",
  // apps/web/src/screens/organization/vehicles/vehicle-registry.tsx
  "screen.organization.vehicles.vehicleRegistry.plate": "Plate",
  "screen.organization.vehicles.vehicleRegistry.model": "Model",
  "screen.organization.vehicles.vehicleRegistry.year": "Year",
  "screen.organization.vehicles.vehicleRegistry.vehicleType": "Vehicle type",
  "screen.organization.vehicles.vehicleRegistry.seats": "Seats",
  "screen.organization.vehicles.vehicleRegistry.registration": "Registration",
  "screen.organization.vehicles.vehicleRegistry.allVehicleTypes": "All vehicle types",
  "screen.organization.vehicles.vehicleRegistry.vehicleTypeLabel": "[Vehicle type]",
  "screen.organization.vehicles.vehicleRegistry.allVehicleTypesLabel": "All vehicle types",
  "screen.organization.vehicles.vehicleRegistry.vehicleRegistry": "Vehicle registry",
  "screen.organization.vehicles.vehicleRegistry.vehicleTypes": "Vehicle types",
  "screen.organization.vehicles.vehicleRegistry.addVehicle": "Add vehicle",
  "screen.organization.vehicles.vehicleRegistry.searchByPlate": "Search by plate",
  "screen.organization.vehicles.vehicleRegistry.clearSearch": "Clear search",
  "screen.organization.vehicles.vehicleRegistry.vehicleType2": "Vehicle type",
  "screen.organization.vehicles.vehicleRegistry.vehicles": "Vehicles",
  "screen.organization.vehicles.vehicleRegistry.noVehiclesYet": "No vehicles yet",
  "screen.organization.vehicles.vehicleRegistry.addAVehicleToUse":
    "Add a vehicle to use it on trips.",
  // apps/web/src/screens/organization/vehicles/vehicle-types-and-seat-layout.tsx
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.backToVehicles": "Back to vehicles",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.vehicleTypesAndSeatLayout":
    "Vehicle types and seat layout",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archiveType": "Archive type",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.save": "Save",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.type": "Type",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.name": "Name",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.typeName": "[Type name]",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCount": "Seat count",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCountPlaceholder": "[Seat count]",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayout": "Seat layout",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayoutOfThisVehicle":
    "Seat layout of this vehicle type",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLabelsAppearOnThe":
    "Seat labels appear on the seat map. Archived types are not offered for new trips, and existing trips keep their layout.",
  // apps/web/src/screens/organization/workspace/organization-profile-settings-and-branding.tsx
  "screen.organization.workspace.organizationProfileSettingsAndBranding.organizationProfileSettingsAndBranding":
    "Organization profile, settings and branding",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.save": "Save",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalDetails":
    "Legal details",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNameArabic":
    "Legal name (Arabic)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalName": "[Legal name]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNameEnglish":
    "Legal name (English)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNamePlaceholder":
    "[Legal name]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameArabic":
    "Trade name (Arabic)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeName": "[Trade name]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameEnglish":
    "Trade name (English)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNamePlaceholder":
    "[Trade name]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.country": "Country",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.countryPlaceholder":
    "[Country]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZone": "Time zone",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZonePlaceholder":
    "[Time zone]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumber":
    "Registration number",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumberPlaceholder":
    "[Registration number]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxNumber": "Tax number",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxNumberPlaceholder":
    "[Tax number]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceDetails":
    "Invoice details",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddress":
    "Invoice address",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddressPlaceholder":
    "[Invoice address]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.integrations":
    "Integrations",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.crmConnectionAndOutboundWebhooks":
    "CRM connection and outbound webhooks",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.openCrmAndWebhooks":
    "Open CRM and webhooks",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.branding": "Branding",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.logoAndColorsAreAvailable":
    "Logo and colors are available on the Enterprise plan.",
  // apps/web/src/screens/organization/workspace/workspace-home.tsx
  "screen.organization.workspace.workspaceHome.organizationProfile": "Organization profile",
  "screen.organization.workspace.workspaceHome.accountingAndInvoiceDetails":
    "Accounting and invoice details",
  "screen.organization.workspace.workspaceHome.crmConnectionOptional": "CRM connection (optional)",
  "screen.organization.workspace.workspaceHome.webhooksOptional": "Webhooks (optional)",
  "screen.organization.workspace.workspaceHome.trip": "Trip",
  "screen.organization.workspace.workspaceHome.dates": "Dates",
  "screen.organization.workspace.workspaceHome.readyGaps": "Ready gaps",
  "screen.organization.workspace.workspaceHome.vehicleRegistry": "Vehicle registry",
  "screen.organization.workspace.workspaceHome.crmAndWebhooks": "CRM and webhooks",
  "screen.organization.workspace.workspaceHome.childSafetyReports": "Child-safety reports",
  "screen.organization.workspace.workspaceHome.workspaceHome": "Workspace home",
  "screen.organization.workspace.workspaceHome.yourOrganizationSStatusAnd":
    "Your organization's status and the next step.",
  "screen.organization.workspace.workspaceHome.createTrip": "Create trip",
  "screen.organization.workspace.workspaceHome.activeTripsThisMonth": "Active trips this month",
  "screen.organization.workspace.workspaceHome.monthlyLimitPlanLimit":
    "Monthly limit: [plan limit]",
  "screen.organization.workspace.workspaceHome.upcomingTrips": "Upcoming trips",
  "screen.organization.workspace.workspaceHome.tripsWithReadyGaps": "Trips with Ready gaps",
  "screen.organization.workspace.workspaceHome.alerts": "Alerts",
  "screen.organization.workspace.workspaceHome.tripNameChangesRequested":
    "[Trip name]: changes requested",
  "screen.organization.workspace.workspaceHome.reviewTheRequestedChangesAnd":
    "Review the requested changes and reply.",
  "screen.organization.workspace.workspaceHome.pendingDealRequest": "Pending deal request",
  "screen.organization.workspace.workspaceHome.vehicleOrSlotAPlatform":
    "[Vehicle or slot]: a platform supplier is waiting for a reply.",
  "screen.organization.workspace.workspaceHome.upcomingTripsTitle": "Upcoming trips",
  "screen.organization.workspace.workspaceHome.upcomingTripsCaption": "Upcoming trips",
  "screen.organization.workspace.workspaceHome.noUpcomingTrips": "No upcoming trips",
  "screen.organization.workspace.workspaceHome.createATripToSee": "Create a trip to see it here.",
  "screen.organization.workspace.workspaceHome.moreAreas": "More areas",
  "screen.organization.workspace.workspaceHome.setupChecklist": "Setup checklist",
  "screen.organization.workspace.workspaceHome.setupChecklistAriaLabel": "Setup checklist",
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
