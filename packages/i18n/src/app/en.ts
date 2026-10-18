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
  "screen.pendingApprovalScreen.applicationStatus": "Application status",
  "screen.pendingApprovalScreen.notes": "Notes:",
  "screen.pendingApprovalScreen.viewStatusRespondToChanges": "View status and respond to changes",
  "screen.pendingApprovalScreen.appealRejection": "Appeal the rejection",
  "screen.pendingApprovalScreen.trackApplicationStatus": "Track application status",
  "screen.auth.pending.badge": "Submitted",
  // apps/web/src/auth/screens/sign-in-screen.tsx
  "screen.auth.signIn.lead": "For travelers and approved suppliers.",
  "screen.auth.signIn.identifierPlaceholder": "name@example.com or +20 100 000 0000",
  "screen.auth.signIn.methodOtp": "Code by message",
  "screen.auth.signIn.submit": "Sign in",
  "screen.auth.code.placeholder": "6-digit code",
  // apps/web/src/auth/screens/otp-screen.tsx
  "screen.auth.otp.title": "Enter the code",
  "screen.auth.otp.sentTo": "We sent a 6-digit code to",
  "screen.auth.otp.expires": ". The code expires in 5 minutes.",
  "screen.auth.otp.resendIn": "You can resend a code in {seconds} seconds.",
  "screen.auth.otp.resendReady": "You can resend a code now.",
  // apps/web/src/auth/screens/sign-up-screen.tsx
  "screen.auth.signUp.chooserTitle": "Create your account",
  "screen.auth.signUp.chooserLead":
    "Choose the role that fits you. Each role has its own sign-up form.",
  "screen.auth.signUp.rolesLabel": "Account type",
  "screen.auth.signUp.selected": "Selected",
  "screen.auth.signUp.webOnly": "Web only",
  "screen.auth.signUp.traveler": "Traveler",
  "screen.auth.signUp.travelerBody": "Join group trips and book seats for your group. Free plan.",
  "screen.auth.signUp.driver": "Platform driver",
  "screen.auth.signUp.driverBody": "Apply to join the driver pool. Access after approval.",
  "screen.auth.signUp.photographer": "Photographer",
  "screen.auth.signUp.photographerBody":
    "Apply to join the photographer pool. Access after approval.",
  "screen.auth.signUp.organization": "Organization",
  "screen.auth.signUp.organizationBody":
    "Register a company to run group trips. Access after approval.",
  "screen.auth.signUp.continue.traveler": "Continue as traveler",
  "screen.auth.signUp.continue.driver": "Continue as platform driver",
  "screen.auth.signUp.continue.photographer": "Continue as photographer",
  "screen.auth.signUp.continue.organization": "Continue as organization",
  "screen.auth.signUp.travelerTitle": "Create your traveler account",
  "screen.auth.signUp.travelerLead":
    "Add an email, a phone number, or both. You verify at least one.",
  "screen.auth.signUp.emailPlaceholder": "name@example.com",
  "screen.auth.signUp.phonePlaceholder": "+20 100 000 0000",
  "screen.auth.signUp.selectCountry": "Select country",
  "screen.auth.signUp.language": "Language",
  "screen.auth.signUp.countryRequired": "Select your country to continue.",
  "screen.auth.signUp.contactRequired": "Add an email or a phone number to continue.",
  "screen.auth.signUp.changeEmail": "Change email",
  // apps/web/src/auth/screens/admin-sign-in-screen.tsx
  "screen.auth.admin.lead": "Staff only. There is no public sign-up for admin accounts.",
  "screen.auth.admin.email": "Email",
  "screen.auth.admin.passwordPlaceholder": "At least 12 characters",
  // apps/web/src/auth/screens/staff-sign-in-screen.tsx
  "screen.auth.staff.codeLead":
    "Enter the code from your app or text message. A code is needed at every sign-in.",
  "screen.auth.staff.passwordDone": "Signed in with password",
  "screen.auth.staff.code": "Code",
  "screen.auth.staff.orgChoice":
    "If your email is linked to more than one organization, you choose one after this step.",
  "screen.auth.staff.differentMethod": "Use a different method",
  // apps/web/src/auth/screens/crew-sign-in-screen.tsx
  "screen.auth.crew.title": "Moderator sign-in",
  "screen.auth.crew.lead": "You see only the vehicle assigned to you for the trip.",
  "screen.auth.crew.noCode":
    "Without a staff code you cannot sign in. Ask the trip organizer for help.",
  // apps/web/src/components/shells/public-shell.tsx
  "component.shell.admin.signInLabel": "Admin",
  // apps/web/src/auth/components/session-expired-dialog.tsx
  "screen.auth.sessionExpired.badge": "Session ended",
  "screen.auth.sessionExpired.title": "Sign in again to continue",
  "screen.auth.sessionExpired.bodyMax":
    "For your security, your session ended after 12 hours. You will return to the same page after you sign in.",
  "screen.auth.sessionExpired.body":
    "For your security, your session ended. You will return to the same page after you sign in.",
  "screen.auth.sessionExpired.drafts": "Your unsaved drafts are kept.",
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
  "screen.public.accountSuspended.badge": "Account suspended",
  "screen.public.accountSuspended.title": "Your access is stopped",
  "screen.public.accountSuspended.reason": "Reason: {reason}",
  "screen.public.accountSuspended.body":
    "No data has been deleted. Contact support to ask about this decision.",
  "screen.public.accountSuspended.signOut": "Sign out",
  // apps/web/src/screens/public/account-recovery/appeal-a-rejection.tsx
  "screen.public.appeal.title": "Appeal the rejection",
  "screen.public.appeal.lead": "Tell us why the decision should be reviewed.",
  "screen.public.appeal.rejected": "Rejected",
  "screen.public.appeal.reason": "Reason as recorded: {reason}",
  "screen.public.appeal.reasonMissing": "not available",
  "screen.public.appeal.statement": "Your appeal statement",
  "screen.public.appeal.statementPlaceholder": "Explain why the decision should be reviewed",
  "screen.public.appeal.files": "Supporting files (optional)",
  "screen.public.appeal.filesHint": "PDF or photo, up to 15 MB each",
  "screen.public.appeal.submit": "Submit appeal",
  "screen.public.appeal.submitting": "Submitting…",
  "screen.public.appeal.cancel": "Cancel",
  "screen.public.appeal.submitted": "Your appeal was sent. We review it within 2 working days.",
  "screen.public.appeal.noApplication": "No rejected application was found for this account.",
  "screen.public.appeal.submitFailed": "The appeal could not be submitted. Try again.",
  // apps/web/src/screens/public/account-recovery/application-status-and-changes-response.tsx
  "screen.public.applicationStatus.title": "Your application",
  "screen.public.applicationStatus.summary": "{type} application. Submitted {date}.",
  "screen.public.applicationStatus.type.platform_driver": "Driver",
  "screen.public.applicationStatus.type.platform_photographer": "Photographer",
  "screen.public.applicationStatus.type.organization": "Organization",
  "screen.public.applicationStatus.signInFirst": "Sign in to see your application.",
  "screen.public.applicationStatus.loading": "Loading your application",
  "screen.public.applicationStatus.notFound": "No application was found for this account.",
  "screen.public.applicationStatus.status": "Status",
  "screen.public.applicationStatus.submitted": "Submitted",
  "screen.public.applicationStatus.pendingReview": "Pending review (2 working days)",
  "screen.public.applicationStatus.outcome.changes": "Changes requested",
  "screen.public.applicationStatus.outcome.approved": "Approved",
  "screen.public.applicationStatus.outcome.rejected": "Rejected",
  "screen.public.applicationStatus.outcome.closed": "Closed",
  "screen.public.applicationStatus.outcome.appealed": "Appeal under review",
  "screen.public.applicationStatus.respondBy":
    "Respond by {date} (14 days from the request). After that the application closes.",
  "screen.public.applicationStatus.notes": "Reviewer notes: {notes}",
  "screen.public.applicationStatus.requestedChanges": "Requested changes",
  "screen.public.applicationStatus.noChanges": "No changes are requested.",
  "screen.public.applicationStatus.updatedDocuments": "Updated documents (optional)",
  "screen.public.applicationStatus.updatedDocumentsHint": "PDF or photo, up to 15 MB each",
  "screen.public.applicationStatus.resubmit": "Resubmit application",
  "screen.public.applicationStatus.submitting": "Submitting…",
  "screen.public.applicationStatus.extend": "Ask for 7 more days",
  "screen.public.applicationStatus.appeal": "Appeal a rejection",
  "screen.public.applicationStatus.resubmitted": "Your updated application was sent for review.",
  "screen.public.applicationStatus.resubmitFailed":
    "The application could not be resubmitted. Try again.",
  "screen.public.applicationStatus.extended": "Your deadline was extended by 7 days.",
  "screen.public.applicationStatus.extendFailed":
    "The extension could not be requested. Try again.",
  // apps/web/src/screens/public/account-recovery/deletion-grace-period.tsx
  "screen.public.deletionGrace.badge": "Deletion requested",
  "screen.public.deletionGrace.title": "Your account is scheduled for deletion",
  "screen.public.deletionGrace.endsLabel": "Grace period ends",
  "screen.public.deletionGrace.endsValue": "{date}, {days} days after your request",
  "screen.public.deletionGrace.body":
    "Signing in restores your account and cancels the deletion request. Future bookings are cancelled and refunded only when deletion becomes permanent.",
  "screen.public.deletionGrace.continue": "Continue to app home",
  "screen.public.deletionGrace.restoreFailed":
    "Your account could not be restored. Sign in to restore it.",
  // apps/web/src/screens/public/account-recovery/password-reset.tsx
  "screen.public.passwordReset.step1": "Step 1 of 2: code",
  "screen.public.passwordReset.step2": "Step 2 of 2: new password",
  "screen.public.passwordReset.title": "Reset your password",
  "screen.public.passwordReset.lead": "We send a code to the email or phone on your account.",
  "screen.public.passwordReset.sendCode": "Send code",
  "screen.public.passwordReset.remembered": "Remembered it?",
  "screen.public.passwordReset.backToSignIn": "Back to sign in",
  "screen.public.passwordReset.passwordTitle": "Set a new password",
  "screen.public.passwordReset.passwordLead":
    "Your code is ready. Choose a new password for your account.",
  "screen.public.passwordReset.newPassword": "New password",
  "screen.public.passwordReset.confirmPassword": "Confirm new password",
  "screen.public.passwordReset.ruleLength": "At least {min} characters",
  "screen.public.passwordReset.ruleBreached": "Not found in breached password lists",
  "screen.public.passwordReset.mismatch": "The passwords do not match.",
  "screen.public.passwordReset.setPassword": "Set password",
  "screen.public.passwordReset.doneTitle": "Password updated",
  "screen.public.passwordReset.doneLead": "Sign in with your new password.",
  // apps/web/src/screens/public/common/country-select.tsx
  "screen.public.common.countrySelect.country": "Country",
  "screen.public.common.countrySelect.selectCountry": "Select country",
  // apps/web/src/screens/public/common/document-drop.tsx
  "screen.public.common.documentDrop.added": "{count} file(s) added",
  "screen.public.common.documentDrop.remove": "Remove",
  "screen.public.common.documentDrop.removeFile": "Remove {name}",
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
  "screen.public.landing.title": "Your next group trip",
  "screen.public.landing.lead": "Browse public trips, or sign up for your role.",
  "screen.public.landing.browseTrips": "Browse trips",
  "screen.public.landing.publicTrips": "Public trips",
  "screen.public.landing.loading": "Loading trips",
  "screen.public.landing.tripsFailed": "Trips could not load. Try again in a few minutes.",
  "screen.public.landing.noTrips": "No public trips right now",
  "screen.public.landing.noTripsBody": "Trips appear here once organizers publish them.",
  "screen.public.landing.groupPhoto": "Group photo",
  "screen.public.landing.fromPrice": "From {price}",
  "screen.public.landing.seatsLeft": "{count} seats left",
  "screen.public.landing.signUpForRole": "Sign up for your role",
  "screen.public.landing.signUp": "Sign up",
  "screen.public.landing.role.traveler": "Traveler",
  "screen.public.landing.role.travelerBody": "Book seats and activities for your group.",
  "screen.public.landing.role.driver": "Platform driver",
  "screen.public.landing.role.driverBody": "Apply to join the driver pool.",
  "screen.public.landing.role.photographer": "Photographer",
  "screen.public.landing.role.photographerBody": "Apply to join the photographer pool.",
  "screen.public.landing.role.organization": "Organization",
  "screen.public.landing.role.organizationBody": "Run group trips for your company. Web only.",
  "screen.public.landing.fullyBooked": "Fully booked",
  // apps/web/src/screens/public/sign-in/admin-authenticator-set-up-and-code.tsx
  "screen.public.signIn.adminAuthenticator.setUpRequired": "Set-up required",
  "screen.public.signIn.adminAuthenticator.title": "Set up your authenticator",
  "screen.public.signIn.adminAuthenticator.lead":
    "Scan the code in your authenticator app, then enter the 6-digit code it shows. The admin console opens after this step.",
  "screen.public.signIn.adminAuthenticator.qrLabel": "Set-up QR code",
  "screen.public.signIn.adminAuthenticator.qrCode": "QR code",
  "screen.public.signIn.adminAuthenticator.cannotScan": "Cannot scan?",
  "screen.public.signIn.adminAuthenticator.enterKey": "Enter this key in your app:",
  "screen.public.signIn.adminAuthenticator.keyMissing": "Ask a platform admin for your set-up key.",
  "screen.public.signIn.adminAuthenticator.codeLabel": "Authenticator code",
  // apps/web/src/screens/public/sign-in/staff-code-set-up.tsx
  "screen.public.signIn.staffCodeSetUp.required": "Required before the workspace opens",
  "screen.public.signIn.staffCodeSetUp.title": "Set your sign-in code",
  "screen.public.signIn.staffCodeSetUp.lead":
    "Each staff sign-in needs a second code. Choose how you receive it.",
  "screen.public.signIn.staffCodeSetUp.method": "Code method",
  "screen.public.signIn.staffCodeSetUp.app": "Authenticator app",
  "screen.public.signIn.staffCodeSetUp.sms": "Text message (SMS)",
  "screen.public.signIn.staffCodeSetUp.codeFromApp": "Code from your app",
  "screen.public.signIn.staffCodeSetUp.codeFromSms": "Code from the text message",
  "screen.public.signIn.staffCodeSetUp.confirm": "Confirm",
  // apps/web/src/screens/public/sign-up/organization-sign-up.tsx
  "screen.public.signUp.organization.title": "Register your organization",
  "screen.public.signUp.organization.lead":
    "Admin reviews the registration. Staff access opens after approval.",
  "screen.public.signUp.organization.organization": "Organization",
  "screen.public.signUp.organization.legalName": "Legal name",
  "screen.public.signUp.organization.registrationNumber": "Commercial registration number",
  "screen.public.signUp.organization.taxNumber": "Tax number",
  "screen.public.signUp.organization.certificate": "Commercial registration certificate",
  "screen.public.signUp.organization.certificateHint": "PDF or photo, up to 15 MB",
  "screen.public.signUp.organization.ownerAndBilling": "Owner and billing",
  "screen.public.signUp.organization.ownerName": "Owner name",
  "screen.public.signUp.organization.ownerEmail": "Owner email",
  "screen.public.signUp.organization.ownerPhone": "Owner phone",
  "screen.public.signUp.organization.billingEmail": "Billing contact email",
  "screen.public.signUp.organization.billingEmailPlaceholder": "billing@example.com",
  "screen.public.signUp.organization.planNote":
    "No plan choice here. The Starter plan is assigned when your registration is approved.",
  "screen.public.signUp.organization.submit": "Submit registration",
  "screen.public.signUp.organization.submitting": "Submitting…",
  "screen.public.signUp.organization.submitFailed":
    "The registration could not be submitted. Try again.",
  // apps/web/src/screens/public/sign-up/photographer-sign-up.tsx
  "screen.public.signUp.photographer.title": "Apply as a photographer",
  "screen.public.signUp.photographer.lead":
    "Show your work with a portfolio of at least 8 photos. Access starts after approval.",
  "screen.public.signUp.photographer.yourDetails": "Your details",
  "screen.public.signUp.photographer.name": "Name or studio name",
  "screen.public.signUp.photographer.email": "Email",
  "screen.public.signUp.photographer.phone": "Phone",
  "screen.public.signUp.photographer.portfolio": "Portfolio",
  "screen.public.signUp.photographer.count": "{count} of {required} photos",
  "screen.public.signUp.photographer.addPhotos": "Add photos",
  "screen.public.signUp.photographer.needMore":
    "Add at least {required} photos to submit. You have {count} of {required}.",
  "screen.public.signUp.photographer.submit": "Submit application",
  "screen.public.signUp.photographer.submitting": "Submitting…",
  "screen.public.signUp.photographer.submitFailed":
    "The application could not be submitted. Try again.",
  // apps/web/src/screens/public/sign-up/platform-driver-sign-up.tsx
  "screen.public.signUp.driver.title": "Apply to drive",
  "screen.public.signUp.driver.lead": "Platform driver application. You can sign in after review.",
  "screen.public.signUp.driver.yourDetails": "Your details",
  "screen.public.signUp.driver.fullName": "Full name",
  "screen.public.signUp.driver.fullNamePlaceholder": "As on your ID",
  "screen.public.signUp.driver.email": "Email",
  "screen.public.signUp.driver.phone": "Phone",
  "screen.public.signUp.driver.yourVehicle": "Your vehicle",
  "screen.public.signUp.driver.plate": "Plate",
  "screen.public.signUp.driver.model": "Model",
  "screen.public.signUp.driver.documentsAndConsent": "Documents and consent",
  "screen.public.signUp.driver.registrationDocument": "Registration document",
  "screen.public.signUp.driver.registrationHint": "PDF or photo, up to 15 MB",
  "screen.public.signUp.driver.insuranceDocument": "Insurance document",
  "screen.public.signUp.driver.insuranceHint": "Must be valid for at least 3 months",
  "screen.public.signUp.driver.backgroundConsent": "I consent to a background check.",
  "screen.public.signUp.driver.labConsent":
    "I consent to a lab test and to storing this consent record.",
  "screen.public.signUp.driver.labDate": "Initial lab result date",
  "screen.public.signUp.driver.labDateHint":
    "The lab result must be dated within the last 30 days.",
  "screen.public.signUp.driver.labDateTooOld": "Choose a date within the last 30 days.",
  "screen.public.signUp.driver.submit": "Submit application",
  "screen.public.signUp.driver.submitting": "Submitting…",
  "screen.public.signUp.driver.submitFailed": "The application could not be submitted. Try again.",
  // apps/web/src/screens/public/sign-up/verification-by-code.tsx
  "screen.public.signUp.verification.stepEmail": "Step 1 of 2: email",
  "screen.public.signUp.verification.stepPhone": "Step 1 of 2: phone",
  "screen.public.signUp.verification.changeNumber": "Change number",
  "screen.public.signUp.verification.verified": "Verified. You can sign in now.",
  // apps/web/src/screens/registry.ts
  "screen.registry.surface.publicAndSignIn": "Public and sign-in",
  "screen.registry.surface.sharedStates": "Shared states",
  "screen.registry.surface.organizationDashboard": "Organization dashboard",
  "screen.registry.surface.adminConsole": "Admin console",
  // apps/web/src/screens/shared/confirmation-dialog.tsx
  "screen.shared.confirmation.reason": "Reason (required)",
  "screen.shared.confirmation.reasonPlaceholder": "Write the reason",
  "screen.shared.confirmation.cancel": "Cancel",
  // apps/web/src/screens/shared/error-page.tsx
  "screen.shared.errorPage.status": "Error {status}",
  "screen.shared.errorPage.backHome": "Back to home",
  "screen.shared.errorPage.goHome": "Go to home",
  "screen.shared.errorPage.tryAgain": "Try again",
  // apps/web/src/screens/shared/language-switch.tsx
  "screen.shared.languageSwitch.label": "Language",
  "screen.shared.languageSwitch.keepsData":
    "Your typed data and current step stay when you switch language.",
  // apps/web/src/screens/shared/offline-banner.tsx
  "screen.shared.offline.title": "No connection",
  "screen.shared.offline.body":
    "You can still view what is on screen. Actions that need a connection wait until you are back online.",
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
  "screen.shared.otpEntry.expires": ". It expires in 5 minutes.",
  "screen.shared.otpEntry.waiting": "Waiting for the code. You can resend in {seconds} seconds.",
  // apps/web/src/screens/shared/plan-limit-prompt.tsx
  "screen.shared.planLimit.badge": "Limit reached",
  "screen.shared.planLimit.title": "Upgrade to add more",
  "screen.shared.planLimit.usage": "{limit}: {current} of {allowance} used on your current plan.",
  "screen.shared.planLimit.limit.activeTripsPerMonth": "Active trips this month",
  "screen.shared.planLimit.limit.vehiclesPerTrip": "Vehicles per trip",
  "screen.shared.planLimit.limit.programsPerTrip": "Programs per trip",
  "screen.shared.planLimit.limit.employeesMax": "Employees",
  "screen.shared.planLimit.limit.activeCouponsMax": "Active coupons",
  "screen.shared.planLimit.limit.portfolioPhotosMax": "Portfolio photos",
  "screen.shared.planLimit.limit.webhookEndpointsMax": "Webhook endpoints",
  "screen.shared.planLimit.tierLifts": "{tier} plan lifts this limit",
  "screen.shared.planLimit.perMonth": "{price} per month",
  "screen.shared.planLimit.prorated": "Upgrades start now and are prorated.",
  "screen.shared.planLimit.upgrade": "Upgrade to {tier}",
  "screen.shared.planLimit.cancel": "Cancel",
  // apps/web/src/screens/shared/role-switcher.tsx
  "screen.shared.roleSwitcher.title": "Switch role or organization",
  "screen.shared.roleSwitcher.loading": "Loading your roles",
  "screen.shared.roleSwitcher.roles": "Your roles",
  "screen.shared.roleSwitcher.organizations": "Organizations linked to this email",
  "screen.shared.roleSwitcher.note":
    "Each role and organization keeps its own data. Switching does not create a second account.",
  "screen.shared.roleSwitcher.failed": "The switch did not go through. Try again.",
  "screen.shared.roleSwitcher.switch": "Switch",
  "screen.shared.roleSwitcher.role.traveler": "Traveler",
  "screen.shared.roleSwitcher.role.parent": "Parent",
  "screen.shared.roleSwitcher.role.platformDriver": "Platform driver",
  "screen.shared.roleSwitcher.role.orgDriver": "Organization driver",
  "screen.shared.roleSwitcher.role.platformPhotographer": "Platform photographer",
  "screen.shared.roleSwitcher.role.orgPhotographer": "Organization photographer",
  "screen.shared.roleSwitcher.role.organizationOwner": "Organization owner",
  "screen.shared.roleSwitcher.role.organizationEmployee": "Organization employee",
  "screen.shared.roleSwitcher.role.moderator": "Moderator",
  "screen.shared.roleSwitcher.role.admin": "Admin",
  "screen.shared.roleSwitcher.signIn": "Sign in to switch roles.",
  // apps/web/src/screens/shared/seat-map.tsx
  "screen.shared.seatMap.legend": "Seat states",
  "screen.shared.seatMap.state.available": "Available",
  "screen.shared.seatMap.state.selected": "Selected",
  "screen.shared.seatMap.state.held": "Held, timed",
  "screen.shared.seatMap.state.taken": "Taken",
  "screen.shared.seatMap.front": "Front",
  "screen.shared.seatMap.seat.available": "Seat {seat}, available",
  "screen.shared.seatMap.seat.selected": "Seat {seat}, selected",
  "screen.shared.seatMap.seat.taken": "Seat {seat}, taken",
  "screen.shared.seatMap.seatHeld": "Seat {seat}, held for {minutes} minutes",
  // apps/web/src/screens/shared/scr-shr-01-plan-limit-upgrade-prompt.tsx
  "screen.shared.planLimit.loading": "Loading plans",
  "screen.shared.planLimit.noTier": "No higher plan is available.",
  "screen.shared.planLimit.failed": "The upgrade did not go through. Your plan is unchanged.",
  "screen.shared.planLimit.signIn": "Sign in to your organization to see plans.",
  // apps/web/src/screens/shared/scr-shr-02-permission-denied.tsx
  "screen.shared.permissionDenied.title": "You do not have access to this page",
  "screen.shared.permissionDenied.body":
    "Your role does not include this area. Ask your organization owner if you need access.",
  // apps/web/src/screens/shared/scr-shr-03-not-found.tsx
  "screen.shared.notFound.title": "We could not find that",
  "screen.shared.notFound.body": "The item may have been removed, or the link is no longer shared.",
  // apps/web/src/screens/shared/scr-shr-04-unauthorized.tsx
  "screen.shared.unauthorized.title": "Sign in to continue",
  "screen.shared.unauthorized.body":
    "Your session has ended. You will return to this page after you sign in. Your drafts are kept.",
  // apps/web/src/screens/shared/scr-shr-05-server-error.tsx
  "screen.shared.serverError.title": "Something went wrong on our side",
  "screen.shared.serverError.body": "Your drafts are saved. Try again in a moment.",
  "screen.shared.serverError.reference": "Reference for support:",
  // apps/web/src/screens/shared/scr-shr-06-service-unavailable.tsx
  "screen.shared.serviceUnavailable.title": "Service is temporarily unavailable",
  "screen.shared.serviceUnavailable.body":
    "We are working on it. Your booking payments are not lost: they are queued and processed when the service returns.",
  // apps/web/src/screens/shared/scr-shr-07-maintenance-page.tsx
  "screen.shared.maintenance.badge": "Planned maintenance",
  "screen.shared.maintenance.title": "We are updating Trips Enjoy",
  "screen.shared.maintenance.window": "Maintenance window",
  "screen.shared.maintenance.windowValue": "{from} to {until} ({zone})",
  "screen.shared.maintenance.otherLanguage":
    "The site is in planned maintenance during the window above.",
  "screen.shared.maintenance.payments":
    "Booking payments are not lost. Payment confirmations are queued and are processed when the service returns.",
  "screen.shared.maintenance.retryAfter": "Try again after {time}",
  // apps/web/src/screens/shared/scr-shr-08-offline-banner.tsx
  "screen.shared.offline.example": "Your trips",
  "screen.shared.offline.exampleBody":
    "Trips saved on this device stay available while you are offline.",
  // apps/web/src/screens/shared/scr-shr-09-confirmation-dialog.tsx
  "screen.shared.confirmation.exampleTitle": "Remove this passenger from the trip?",
  "screen.shared.confirmation.exampleBody":
    "They will be notified before this takes effect. The seat is released and this action is recorded.",
  "screen.shared.confirmation.exampleConfirm": "Remove passenger",
  // apps/web/src/screens/shared/scr-shr-10-language-switch-and-rtl.tsx
  "screen.shared.languageSwitch.title": "Language and direction",
  "screen.shared.languageSwitch.fullName": "Full name",
  "screen.shared.languageSwitch.today": "Today",
  "screen.shared.languageSwitch.formats":
    "Dates and numbers follow the format of the selected language.",
  "screen.shared.languageSwitch.continue": "Continue",
  // apps/web/src/screens/shared/scr-shr-11-notification-centre.tsx
  "screen.shared.notifications.title": "Notifications",
  "screen.shared.notifications.loading": "Loading notifications",
  "screen.shared.notifications.failed": "Notifications could not load. Try again in a few minutes.",
  "screen.shared.notifications.empty": "No notifications yet",
  "screen.shared.notifications.emptyBody":
    "Updates about your trips, bookings and account appear here.",
  "screen.shared.notifications.category.bookings": "Booking",
  "screen.shared.notifications.category.trip_updates": "Trip update",
  "screen.shared.notifications.category.promotions": "Offer",
  "screen.shared.notifications.category.security": "Account",
  "screen.shared.notifications.category.safety": "Safety",
  "screen.shared.notifications.category.operations": "Operations",
  "screen.shared.notifications.channel.in_app": "Sent by app",
  "screen.shared.notifications.channel.email": "Sent by email",
  "screen.shared.notifications.channel.sms": "Sent by SMS",
  "screen.shared.notifications.channel.push": "Sent by push notification",
  "screen.shared.notifications.open": "Open",
  "screen.shared.notifications.markRead": "Mark read",
  "screen.shared.notifications.markAll": "Mark all as read",
  "screen.shared.notifications.signIn": "Sign in to see your notifications.",
  // apps/web/src/screens/shared/scr-shr-12-receipt-and-invoice-view.tsx
  "screen.shared.receipt.title": "Receipt",
  "screen.shared.receipt.loading": "Loading the receipt",
  "screen.shared.receipt.failed": "The receipt could not load. Try again later.",
  "screen.shared.receipt.notFound": "This receipt was not found.",
  "screen.shared.receipt.issued": "Issued",
  "screen.shared.receipt.date": "Date",
  "screen.shared.receipt.item": "Item",
  "screen.shared.receipt.amount": "Amount",
  "screen.shared.receipt.subtotal": "Subtotal",
  "screen.shared.receipt.commission": "Platform commission",
  "screen.shared.receipt.total": "Total",
  "screen.shared.receipt.download": "Print or save as PDF",
  "screen.shared.receipt.signIn": "Sign in to see this receipt.",
  // apps/web/src/screens/shared/scr-shr-15-seat-map.tsx
  "screen.shared.seatMap.title": "Seat map",
  "screen.shared.seatMap.loading": "Loading seats",
  "screen.shared.seatMap.noSeats": "No seat map is available for a public trip right now.",
  "screen.shared.seatMap.lead": "{trip}. Pick a seat, then confirm to hold it.",
  "screen.shared.seatMap.heldNote":
    "Seat {seat} is held until {time}. Choose another seat if the hold expires.",
  "screen.shared.seatMap.holdFailed": "That seat could not be held. Choose another seat.",
  "screen.shared.seatMap.confirm": "Confirm seat {seat}",
  "screen.shared.seatMap.choose": "Choose a seat",
  "screen.shared.seatMap.signIn": "Sign in to choose a seat.",
  // apps/web/src/screens/shared/scr-shr-16-document-and-photo-upload.tsx
  "screen.shared.upload.title": "Add your photos",
  "screen.shared.upload.count": "{count} of {required} required",
  "screen.shared.upload.choose": "Choose files or take a photo",
  "screen.shared.upload.hint": "JPG or PNG, up to 15 MB each",
  "screen.shared.upload.privacy":
    "Photos are checked before they are shared. Location details are removed from each photo.",
  "screen.shared.upload.continue": "Continue",
  "screen.shared.upload.waiting": "Continue after uploads finish",
  "screen.shared.upload.uploading": "Uploading…",
  "screen.shared.upload.uploadingFile": "Uploading {name}",
  "screen.shared.upload.cancel": "Cancel",
  "screen.shared.upload.status.done": "Complete",
  "screen.shared.upload.status.tooLarge": "Not accepted: file too large",
  "screen.shared.upload.status.wrongType": "Not accepted: use JPG or PNG",
  "screen.shared.upload.status.failed": "Upload failed. Remove it and try again.",
  "screen.shared.upload.signIn": "Sign in to upload your photos.",
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
