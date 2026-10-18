// Arabic screen copy — the product default locale (PRD I2).
//
// `AppMessages` requires every key from ./en.ts, so a missing translation fails the build. Keys are
// ordered exactly like the English table, so the two files can be diffed side by side.
import type { AppMessages } from "./en";

export const ar: AppMessages = {
  // apps/web/src/auth/screens/pending-approval-screen.tsx
  "screen.pendingApprovalScreen.completeYourSupplierApplication": "أكمل طلب المورّد الخاص بك",
  "screen.pendingApprovalScreen.submitYourDocumentsAndDetails":
    "أرسل مستنداتك وبياناتك حتى يتمكن فريق المراجعة من اعتماد حسابك.",
  "screen.pendingApprovalScreen.openApplicationForm": "فتح نموذج الطلب",
  "screen.pendingApprovalScreen.applicationStatus": "حالة الطلب:",
  "screen.pendingApprovalScreen.notes": "ملاحظات:",
  "screen.pendingApprovalScreen.viewStatusRespondToChanges": "عرض الحالة والرد على التغييرات",
  "screen.pendingApprovalScreen.appealRejection": "الاعتراض على الرفض",
  "screen.pendingApprovalScreen.trackApplicationStatus": "تتبّع حالة الطلب",
  // apps/web/src/components/api-status.tsx
  "component.apiStatus.apiStatus": "حالة الواجهة البرمجية",
  "component.apiStatus.connected": "متصل",
  "component.apiStatus.disconnected": "غير متصل",
  // apps/web/src/components/component-gallery.tsx
  "component.componentGallery.placeholderTripImage": "صورة رحلة بديلة",
  "component.componentGallery.beach": "شاطئ",
  "component.componentGallery.desertSafari": "رحلة صحراوية",
  "component.componentGallery.museums": "متاحف",
  "component.componentGallery.trips": "الرحلات",
  "component.componentGallery.track": "التتبّع",
  "component.componentGallery.profile": "الملف الشخصي",
  "component.componentGallery.brand": "الهوية",
  "component.componentGallery.tripsEnjoyLogoFullColour":
    "شعار Trips Enjoy، بألوان كاملة، بتخطيط أفقي",
  "component.componentGallery.horizontalLogoOnCream": "الشعار الأفقي على خلفية كريمية",
  "component.componentGallery.tripsEnjoyLogoReversedFor":
    "شعار Trips Enjoy، معكوس للخلفيات الداكنة، بتخطيط أفقي",
  "component.componentGallery.reversedLogoOnNavy": "الشعار المعكوس على خلفية كحلية",
  "component.componentGallery.actions": "الإجراءات",
  "component.componentGallery.bookTrip": "احجز رحلة",
  "component.componentGallery.addActivity": "أضف نشاطًا",
  "component.componentGallery.viewItinerary": "عرض مسار الرحلة",
  "component.componentGallery.payNow": "ادفع الآن",
  "component.componentGallery.chips": "الشرائح",
  "component.componentGallery.inputs": "الحقول",
  "component.componentGallery.travelerName": "اسم المسافر",
  "component.componentGallery.parentPhone": "هاتف ولي الأمر",
  "component.componentGallery.usedForLiveBusUpdates": "يُستخدم لتحديثات الحافلة المباشرة.",
  "component.componentGallery.tripCardAndRoles": "بطاقة الرحلة والأدوار",
  "component.componentGallery.bus3Hurghada": "حافلة 3 · الغردقة",
  "component.componentGallery.seatConfirmed": "تم تأكيد المقعد",
  "component.componentGallery.status": "الحالة",
  "component.componentGallery.neutral": "محايد",
  "component.componentGallery.accent": "مميّز",
  "component.componentGallery.new": "جديد",
  "component.componentGallery.boarded": "صعد",
  "component.componentGallery.delayed": "متأخر",
  "component.componentGallery.notBoarded": "لم يصعد",
  "component.componentGallery.organization": "المؤسسة",
  "component.componentGallery.feedback": "الملاحظات",
  "component.componentGallery.paymentNotCompleted": "لم يكتمل الدفع",
  "component.componentGallery.yourBankDeclinedTheCard":
    "رفض بنكك البطاقة المنتهية بـ 4421. لم يُخصم أي مبلغ.",
  "component.componentGallery.seatsAreOnHold": "المقاعد محجوزة مؤقتًا",
  "component.componentGallery.payWithin10MinutesTo": "ادفع خلال 10 دقائق للاحتفاظ بمقاعدك.",
  "component.componentGallery.tripUpdated": "تم تحديث الرحلة",
  "component.componentGallery.theDeparturePointMovedTo": "نُقلت نقطة الانطلاق إلى البوابة 2.",
  "component.componentGallery.bookingSaved": "تم حفظ الحجز",
  "component.componentGallery.seatConfirmedForBus3": "تم تأكيد المقعد في الحافلة 3.",
  "component.componentGallery.connectionLostRetryingIn5":
    "انقطع الاتصال. جارٍ إعادة المحاولة خلال 5 ثوانٍ.",
  "component.componentGallery.seatConfirmedForBus3Message":
    "تم تأكيد المقعد في الحافلة 3. حجزك محفوظ.",
  "component.componentGallery.errorAndEmptyStates": "حالات الخطأ والفراغ",
  "component.componentGallery.noTripsYet": "لا توجد رحلات بعد",
  "component.componentGallery.whenYourCompanyAddsA": "عندما تضيف شركتك رحلة، ستظهر هنا.",
  "component.componentGallery.browseTrips": "تصفّح الرحلات",
  "component.componentGallery.liquidGlass": "الزجاج السائل",
  "component.componentGallery.main": "الرئيسية",
  "component.componentGallery.tripsEnjoy": "Trips Enjoy",
  "component.componentGallery.sections": "الأقسام",
  "component.componentGallery.trackBus": "تتبّع الحافلة",
  "component.componentGallery.icons": "الأيقونات",
  "component.componentGallery.tripsEnjoyComponents": "مكوّنات Trips Enjoy",
  "component.componentGallery.everyComponentReadsTheTrips":
    "كل مكوّن يستخدم رموز Trips Enjoy. إجراء رئيسي واحد لكل شاشة.",
  // apps/web/src/components/surface-page.tsx
  "component.surfacePage.organizationOwnedDriversAndPhotographers":
    "السائقون والمصورون التابعون للمؤسسة",
  // apps/web/src/router.tsx
  "route.notFound": "غير موجود",
  // apps/web/src/routes/__root.tsx
  "route.root.tripsEnjoy": "Trips Enjoy",
  // apps/web/src/routes/screens.$screenId.tsx
  "route.screens$screenId.noScreenMatchesThisAddress": "لا توجد شاشة تطابق هذا العنوان.",
  "route.screens$screenId.allScreens": "كل الشاشات",
  // apps/web/src/routes/screens.$surface.$slug.tsx
  "route.screens$surface$slug.noScreenMatchesThisAddress": "لا توجد شاشة تطابق هذا العنوان.",
  "route.screens$surface$slug.allScreens": "كل الشاشات",
  "route.screens$surface$slug.allScreens2": "كل الشاشات",
  // apps/web/src/routes/screens.index.tsx
  "route.screensIndex.screens": "الشاشات",
  "route.screensIndex.screensAcrossTheWebSurfaces": "شاشة عبر واجهات الويب.",
  // apps/web/src/screens/admin/applications/appeal-review.tsx
  "screen.admin.applications.appealReview.appealedPending": "تم الاعتراض (قيد الانتظار)",
  "screen.admin.applications.appealReview.selectADecision": "اختر قرارًا",
  "screen.admin.applications.appealReview.upholdAppealApplicationBecomesApproved":
    "تأييد الاعتراض (يصبح الطلب معتمدًا)",
  "screen.admin.applications.appealReview.upholdRejectionApplicationStaysRejected":
    "تأييد الرفض (يبقى الطلب مرفوضًا)",
  "screen.admin.applications.appealReview.appealReview": "مراجعة الاعتراض",
  "screen.admin.applications.appealReview.decideAnAppealFromA":
    "اتخذ قرارًا بشأن اعتراض من متقدم مرفوض.",
  "screen.admin.applications.appealReview.noAppealStatement": "لا يوجد بيان اعتراض",
  "screen.admin.applications.appealReview.theApplicantHasNotAdded":
    "لم يضف المتقدم بيانًا لهذا الاعتراض.",
  "screen.admin.applications.appealReview.loadingTheAppeal": "جارٍ تحميل الاعتراض.",
  "screen.admin.applications.appealReview.originalApplication": "الطلب الأصلي",
  "screen.admin.applications.appealReview.applicantName": "اسم المتقدم",
  "screen.admin.applications.appealReview.applicationType": "نوع الطلب",
  "screen.admin.applications.appealReview.rejectedOn": "تاريخ الرفض",
  "screen.admin.applications.appealReview.rejectionReason": "سبب الرفض",
  "screen.admin.applications.appealReview.openOriginalApplication": "فتح الطلب الأصلي",
  "screen.admin.applications.appealReview.appealStatement": "بيان الاعتراض",
  "screen.admin.applications.appealReview.appealReceived": "تم استلام الاعتراض",
  "screen.admin.applications.appealReview.appealWindowCloses": "إغلاق نافذة الاعتراض",
  "screen.admin.applications.appealReview.couldNotSaveDecision": "تعذّر حفظ القرار",
  "screen.admin.applications.appealReview.decision": "القرار",
  "screen.admin.applications.appealReview.decisionRequired": "القرار (مطلوب)",
  "screen.admin.applications.appealReview.reasonRequired": "السبب (مطلوب)",
  "screen.admin.applications.appealReview.reasonForTheDecision": "[سبب القرار]",
  "screen.admin.applications.appealReview.recordedWithTheDecisionIn":
    "يُسجَّل مع القرار في سجل التدقيق.",
  "screen.admin.applications.appealReview.appealWindow": "نافذة الاعتراض",
  "screen.admin.applications.appealReview.aDecisionCanBeSaved":
    "لا يمكن حفظ القرار إلا أثناء فتح نافذة الاعتراض.",
  "screen.admin.applications.appealReview.cancel": "إلغاء",
  "screen.admin.applications.appealReview.saving": "جارٍ الحفظ...",
  "screen.admin.applications.appealReview.saveDecision": "حفظ القرار",
  // apps/web/src/screens/admin/applications/application-queue.tsx
  "screen.admin.applications.applicationQueue.overdue": "متأخر",
  "screen.admin.applications.applicationQueue.onTime": "في الموعد",
  "screen.admin.applications.applicationQueue.allTypes": "كل الأنواع",
  "screen.admin.applications.applicationQueue.organization": "المؤسسة",
  "screen.admin.applications.applicationQueue.platformDriver": "سائق المنصة",
  "screen.admin.applications.applicationQueue.platformPhotographer": "مصور المنصة",
  "screen.admin.applications.applicationQueue.allCountries": "كل الدول",
  "screen.admin.applications.applicationQueue.egypt": "مصر",
  "screen.admin.applications.applicationQueue.jordan": "الأردن",
  "screen.admin.applications.applicationQueue.anyAge": "أي عمر",
  "screen.admin.applications.applicationQueue.overdueOver2WorkingDays": "متأخر (أكثر من يومَي عمل)",
  "screen.admin.applications.applicationQueue.anyState": "أي حالة",
  "screen.admin.applications.applicationQueue.pendingReview": "قيد المراجعة",
  "screen.admin.applications.applicationQueue.changesRequested": "طُلبت تغييرات",
  "screen.admin.applications.applicationQueue.approved": "معتمد",
  "screen.admin.applications.applicationQueue.rejected": "مرفوض",
  "screen.admin.applications.applicationQueue.type": "النوع",
  "screen.admin.applications.applicationQueue.applicant": "المتقدم",
  "screen.admin.applications.applicationQueue.country": "الدولة",
  "screen.admin.applications.applicationQueue.submitted": "تاريخ التقديم",
  "screen.admin.applications.applicationQueue.workingDaysWaiting": "أيام العمل في الانتظار",
  "screen.admin.applications.applicationQueue.state": "الحالة",
  "screen.admin.applications.applicationQueue.overdueHeader": "متأخر",
  "screen.admin.applications.applicationQueue.action": "الإجراء",
  "screen.admin.applications.applicationQueue.openApplicationFor": "فتح طلب {applicant}",
  "screen.admin.applications.applicationQueue.openApplication": "فتح الطلب",
  "screen.admin.applications.applicationQueue.applicationQueue": "قائمة الطلبات",
  "screen.admin.applications.applicationQueue.organizationsPlatformDriversAndPlatform":
    "مؤسسات وسائقو منصة ومصوّرو منصة في انتظار قرار.",
  "screen.admin.applications.applicationQueue.reviewAppeals": "مراجعة الاعتراضات",
  "screen.admin.applications.applicationQueue.openNextApplication": "فتح الطلب التالي",
  "screen.admin.applications.applicationQueue.noApplicationsWaiting": "لا توجد طلبات في الانتظار",
  "screen.admin.applications.applicationQueue.changeTheFiltersToSee":
    "غيّر عوامل التصفية لعرض طلبات أخرى.",
  "screen.admin.applications.applicationQueue.loadingTheApplicationQueue":
    "جارٍ تحميل قائمة الطلبات.",
  "screen.admin.applications.applicationQueue.typeLabel": "النوع",
  "screen.admin.applications.applicationQueue.countryLabel": "الدولة",
  "screen.admin.applications.applicationQueue.age": "العمر",
  "screen.admin.applications.applicationQueue.stateLabel": "الحالة",
  "screen.admin.applications.applicationQueue.applications": "الطلبات",
  "screen.admin.applications.applicationQueue.applicationsWaitingForReview":
    "طلبات في انتظار المراجعة",
  "screen.admin.applications.applicationQueue.noApplicationsWaitingEmptyTitle":
    "لا توجد طلبات في الانتظار",
  "screen.admin.applications.applicationQueue.changeTheFiltersToSeeEmptyDescription":
    "غيّر عوامل التصفية لعرض طلبات أخرى.",
  // apps/web/src/screens/admin/applications/application-review-detail.tsx
  "screen.admin.applications.applicationReviewDetail.identityDocument": "وثيقة الهوية",
  "screen.admin.applications.applicationReviewDetail.insuranceCertificate": "شهادة التأمين",
  "screen.admin.applications.applicationReviewDetail.initialLabResult": "نتيجة التحليل الأولية",
  "screen.admin.applications.applicationReviewDetail.verified": "موثّق",
  "screen.admin.applications.applicationReviewDetail.notVerified": "غير موثّق",
  "screen.admin.applications.applicationReviewDetail.submitted": "تاريخ التقديم",
  "screen.admin.applications.applicationReviewDetail.documents": "المستندات",
  "screen.admin.applications.applicationReviewDetail.checks": "الفحوص",
  "screen.admin.applications.applicationReviewDetail.decision": "القرار",
  "screen.admin.applications.applicationReviewDetail.backgroundCheckConsentSigned":
    "تم توقيع موافقة التحقق من الخلفية",
  "screen.admin.applications.applicationReviewDetail.labConsentSigned": "تم توقيع موافقة التحليل",
  "screen.admin.applications.applicationReviewDetail.initialLabResultDatedWithin":
    "نتيجة تحليل أولية بتاريخ لا يتجاوز 30 يومًا",
  "screen.admin.applications.applicationReviewDetail.insuranceValidFor3Months":
    "تأمين ساري لمدة 3 أشهر أو أكثر",
  "screen.admin.applications.applicationReviewDetail.document": "المستند",
  "screen.admin.applications.applicationReviewDetail.status": "الحالة",
  "screen.admin.applications.applicationReviewDetail.restrictedView": "عرض مقيّد",
  "screen.admin.applications.applicationReviewDetail.view": "عرض {label}",
  "screen.admin.applications.applicationReviewDetail.view2": "عرض",
  "screen.admin.applications.applicationReviewDetail.unverify": "إلغاء التوثيق",
  "screen.admin.applications.applicationReviewDetail.verify": "توثيق",
  "screen.admin.applications.applicationReviewDetail.applicationReviewDetail":
    "تفاصيل مراجعة الطلب",
  "screen.admin.applications.applicationReviewDetail.checkTheSubmittedDataAnd":
    "راجع البيانات والمستندات المقدّمة، ثم اتخذ القرار.",
  "screen.admin.applications.applicationReviewDetail.noDocuments": "لا توجد مستندات",
  "screen.admin.applications.applicationReviewDetail.theApplicantHasNotUploaded":
    "لم يرفع المتقدم أي مستندات.",
  "screen.admin.applications.applicationReviewDetail.loadingTheApplication": "جارٍ تحميل الطلب.",
  "screen.admin.applications.applicationReviewDetail.reviewSteps": "خطوات المراجعة",
  "screen.admin.applications.applicationReviewDetail.duplicateRegistrationHold":
    "إيقاف التسجيل المكرر",
  "screen.admin.applications.applicationReviewDetail.anotherOrganizationAlreadyUsesThis":
    "مؤسسة أخرى تستخدم رقم السجل التجاري أو الرقم الضريبي هذا بالفعل. الاعتماد موقوف ما دام هذا الإيقاف المكرر قائمًا.",
  "screen.admin.applications.applicationReviewDetail.restrictedDocumentOpenedAuditLogged":
    "تم فتح مستند مقيّد (مسجَّل في سجل التدقيق)",
  "screen.admin.applications.applicationReviewDetail.viewing": "المعروض:",
  "screen.admin.applications.applicationReviewDetail.actionFailed": "فشل الإجراء",
  "screen.admin.applications.applicationReviewDetail.applicantData": "بيانات المتقدم",
  "screen.admin.applications.applicationReviewDetail.applicantName": "اسم المتقدم",
  "screen.admin.applications.applicationReviewDetail.email": "البريد الإلكتروني",
  "screen.admin.applications.applicationReviewDetail.phone": "الهاتف",
  "screen.admin.applications.applicationReviewDetail.country": "الدولة",
  "screen.admin.applications.applicationReviewDetail.documentsTitle": "المستندات",
  "screen.admin.applications.applicationReviewDetail.submittedDocuments": "المستندات المقدّمة",
  "screen.admin.applications.applicationReviewDetail.noDocumentsEmptyTitle": "لا توجد مستندات",
  "screen.admin.applications.applicationReviewDetail.theApplicantHasNotUploadedEmptyDescription":
    "لم يرفع المتقدم أي مستندات.",
  "screen.admin.applications.applicationReviewDetail.checksDriver": "الفحوص (السائق)",
  "screen.admin.applications.applicationReviewDetail.driverChecks": "فحوص السائق",
  "screen.admin.applications.applicationReviewDetail.approveIsBlocked": "الاعتماد موقوف",
  "screen.admin.applications.applicationReviewDetail.approveStaysOffUntilEvery":
    "يبقى الاعتماد متوقفًا حتى تنجح كل الفحوص ويُوثَّق كل مستند. يمنح الاعتماد خطة Starter (D-24).",
  "screen.admin.applications.applicationReviewDetail.decisionTitle": "القرار",
  "screen.admin.applications.applicationReviewDetail.backToQueue": "العودة إلى القائمة",
  "screen.admin.applications.applicationReviewDetail.reject": "رفض",
  "screen.admin.applications.applicationReviewDetail.requestChanges": "طلب تغييرات",
  "screen.admin.applications.applicationReviewDetail.approving": "جارٍ الاعتماد...",
  "screen.admin.applications.applicationReviewDetail.approveApplication": "اعتماد الطلب",
  "screen.admin.applications.applicationReviewDetail.chooseOneDecisionEachDecision":
    "اختر قرارًا واحدًا. يُسجَّل كل قرار في سجل التدقيق.",
  // apps/web/src/screens/admin/applications/reject-with-reason-decision.tsx
  "screen.admin.applications.rejectWithReasonDecision.rejectWithReasonDecision":
    "الرفض مع ذكر السبب (قرار)",
  "screen.admin.applications.rejectWithReasonDecision.rejectThisApplicationTheApplicant":
    "ارفض هذا الطلب. يُبلَّغ المتقدم بالسبب.",
  "screen.admin.applications.rejectWithReasonDecision.noReasonEntered": "لم يُدخل أي سبب",
  "screen.admin.applications.rejectWithReasonDecision.enterAReasonBeforeYou":
    "أدخل سببًا قبل رفض الطلب.",
  "screen.admin.applications.rejectWithReasonDecision.loadingTheApplication": "جارٍ تحميل الطلب.",
  "screen.admin.applications.rejectWithReasonDecision.applicant": "المتقدم",
  "screen.admin.applications.rejectWithReasonDecision.applicantName": "اسم المتقدم",
  "screen.admin.applications.rejectWithReasonDecision.applicationType": "نوع الطلب",
  "screen.admin.applications.rejectWithReasonDecision.couldNotRejectApplication": "تعذّر رفض الطلب",
  "screen.admin.applications.rejectWithReasonDecision.reason": "السبب",
  "screen.admin.applications.rejectWithReasonDecision.reasonForRejectionRequired":
    "سبب الرفض (مطلوب)",
  "screen.admin.applications.rejectWithReasonDecision.reasonCodesAreProposedD":
    "أسباب مقترحة (D-234). تُرسل هذه الرسالة إلى المتقدم.",
  "screen.admin.applications.rejectWithReasonDecision.rejectApplication": "رفض الطلب",
  "screen.admin.applications.rejectWithReasonDecision.rejectThisApplication": "رفض هذا الطلب؟",
  "screen.admin.applications.rejectWithReasonDecision.theApplicantIsToldThe":
    "يُبلَّغ المتقدم بالسبب. يمكنه التقديم مجددًا بعد 30 يومًا أو الاعتراض.",
  "screen.admin.applications.rejectWithReasonDecision.rejectApplicationConfirmLabel": "رفض الطلب",
  "screen.admin.applications.rejectWithReasonDecision.cancel": "إلغاء",
  "screen.admin.applications.rejectWithReasonDecision.whatTheApplicantCanDo":
    "ما يمكن للمتقدم فعله بعد ذلك",
  "screen.admin.applications.rejectWithReasonDecision.theApplicantCanReApply":
    "يمكن للمتقدم التقديم مجددًا بعد 30 يومًا. ويمكنه أيضًا الاعتراض على هذا القرار.",
  // apps/web/src/screens/admin/applications/request-changes-decision.tsx
  "screen.admin.applications.requestChangesDecision.deadlineNotice":
    "لدى المتقدم 14 يومًا للرد. الموعد النهائي: {date}. إذا انقضت المهلة، يُغلق الطلب.",
  "screen.admin.applications.requestChangesDecision.readableIdentityDocument": "وثيقة هوية مقروءة",
  "screen.admin.applications.requestChangesDecision.validInsuranceCertificate": "شهادة تأمين سارية",
  "screen.admin.applications.requestChangesDecision.signedLabConsent": "موافقة تحليل موقّعة",
  "screen.admin.applications.requestChangesDecision.signedBackgroundCheckConsent":
    "موافقة موقّعة على التحقق من الخلفية",
  "screen.admin.applications.requestChangesDecision.atLeast8PortfolioPhotos":
    "8 صور من الأعمال على الأقل (للمصورين)",
  "screen.admin.applications.requestChangesDecision.english": "الإنجليزية",
  "screen.admin.applications.requestChangesDecision.arabic": "العربية",
  "screen.admin.applications.requestChangesDecision.requestChangesDecision": "طلب تغييرات (قرار)",
  "screen.admin.applications.requestChangesDecision.askTheApplicantForSpecific":
    "اطلب من المتقدم إصلاحات محددة خلال 14 يومًا.",
  "screen.admin.applications.requestChangesDecision.noItemsToFix": "لا توجد عناصر للإصلاح",
  "screen.admin.applications.requestChangesDecision.selectAtLeastOneItem":
    "اختر عنصرًا واحدًا على الأقل قبل إرسال الطلب.",
  "screen.admin.applications.requestChangesDecision.loadingTheApplication": "جارٍ تحميل الطلب.",
  "screen.admin.applications.requestChangesDecision.applicant": "المتقدم",
  "screen.admin.applications.requestChangesDecision.applicantName": "اسم المتقدم",
  "screen.admin.applications.requestChangesDecision.applicationState": "حالة الطلب",
  "screen.admin.applications.requestChangesDecision.itemsToFix": "العناصر المطلوب إصلاحها",
  "screen.admin.applications.requestChangesDecision.selectAtLeastOneItem2":
    "اختر عنصرًا واحدًا على الأقل. يبقى الإرسال متوقفًا حتى ذلك الحين.",
  "screen.admin.applications.requestChangesDecision.couldNotSendRequest": "تعذّر إرسال الطلب",
  "screen.admin.applications.requestChangesDecision.messageToApplicant": "رسالة إلى المتقدم",
  "screen.admin.applications.requestChangesDecision.messageLanguage": "لغة الرسالة",
  "screen.admin.applications.requestChangesDecision.useTheApplicantSLanguage":
    "استخدم لغة المتقدم.",
  "screen.admin.applications.requestChangesDecision.messageToApplicantRequired":
    "رسالة إلى المتقدم (مطلوب)",
  "screen.admin.applications.requestChangesDecision.sayExactlyWhatToFix":
    "وضّح بالضبط ما يجب إصلاحه. تُضاف مهلة الـ 14 يومًا تلقائيًا.",
  "screen.admin.applications.requestChangesDecision.sendRequest": "إرسال الطلب",
  "screen.admin.applications.requestChangesDecision.sendThisRequestToThe":
    "إرسال هذا الطلب إلى المتقدم؟",
  "screen.admin.applications.requestChangesDecision.theApplicantGets14Days":
    "يحصل المتقدم على 14 يومًا لإصلاح العناصر. وإلا يُغلق الطلب.",
  "screen.admin.applications.requestChangesDecision.sendRequestConfirmLabel": "إرسال الطلب",
  "screen.admin.applications.requestChangesDecision.applicationStateBecomesChangesRequested":
    "تصبح حالة الطلب «طُلبت تغييرات».",
  "screen.admin.applications.requestChangesDecision.cancel": "إلغاء",
  "screen.admin.applications.requestChangesDecision.responseDeadline": "مهلة الرد",
  // apps/web/src/screens/admin/common/admin-decision-form.tsx
  "screen.admin.common.adminDecisionForm.keepEditing": "متابعة التحرير",
  // apps/web/src/screens/admin/common/admin-nav.tsx
  "screen.admin.nav.adminHome": "الرئيسية",
  "screen.admin.nav.applicationQueue": "الطلبات",
  "screen.admin.nav.usersAndEntitiesDirectory": "المستخدمون",
  "screen.admin.nav.labTestsQueue": "التحاليل المخبرية",
  "screen.admin.nav.plansCatalog": "الخطط",
  "screen.admin.nav.platformCoupons": "الكوبونات",
  "screen.admin.nav.dealAuditList": "الاتفاقيات",
  "screen.admin.nav.disputesQueue": "النزاعات",
  "screen.admin.nav.platformFinancialView": "المالية",
  "screen.admin.nav.tripOversight": "الرحلات",
  "screen.admin.nav.auditLog": "التدقيق",
  "screen.admin.nav.featureFlagsAndPlatformConfiguration": "الإعدادات",
  "screen.admin.nav.operationsHealthDashboard": "العمليات",
  "screen.admin.common.adminNav.adminAreas": "أقسام الإدارة",
  // apps/web/src/screens/admin/common/admin-shared.tsx
  "screen.admin.common.adminShared.backToAdminHome": "العودة إلى الرئيسية الإدارية",
  "screen.admin.common.adminShared.chartDataPending": "{label}. بيانات الرسم البياني قيد الانتظار.",
  "screen.admin.common.adminShared.chartDataPending2": ". بيانات الرسم البياني قيد الانتظار.",
  // apps/web/src/screens/admin/common/admin-state-preview.tsx
  "screen.admin.common.adminStatePreview.main": "الرئيسية",
  "screen.admin.common.adminStatePreview.loading": "التحميل",
  "screen.admin.common.adminStatePreview.empty": "الفراغ",
  "screen.admin.common.adminStatePreview.error": "الخطأ",
  "screen.admin.common.adminStatePreview.screenStates": "حالات الشاشة",
  "screen.admin.common.adminStatePreview.chooseAScreenStateTo": "اختر حالة شاشة لمعاينتها",
  "screen.admin.common.adminStatePreview.loading2": "التحميل",
  // apps/web/src/screens/admin/coupons/platform-coupon-editor.tsx
  "screen.admin.coupons.platformCouponEditor.percentage": "نسبة مئوية",
  "screen.admin.coupons.platformCouponEditor.fixedAmount": "مبلغ ثابت",
  "screen.admin.coupons.platformCouponEditor.platformCouponEditor": "محرّر كوبونات المنصة",
  "screen.admin.coupons.platformCouponEditor.createACouponThatApplies":
    "أنشئ كوبونًا يُطبَّق على المنصة بأكملها.",
  "screen.admin.coupons.platformCouponEditor.noCouponYet": "لا يوجد كوبون بعد",
  "screen.admin.coupons.platformCouponEditor.fillInTheCouponDetails": "املأ تفاصيل الكوبون لإنشائه.",
  "screen.admin.coupons.platformCouponEditor.loadingTheCoupon": "جارٍ تحميل الكوبون.",
  "screen.admin.coupons.platformCouponEditor.coupon": "الكوبون",
  "screen.admin.coupons.platformCouponEditor.code": "الرمز",
  "screen.admin.coupons.platformCouponEditor.couponCode": "[رمز الكوبون]",
  "screen.admin.coupons.platformCouponEditor.type": "النوع",
  "screen.admin.coupons.platformCouponEditor.value": "القيمة",
  "screen.admin.coupons.platformCouponEditor.valuePlaceholder": "[القيمة]",
  "screen.admin.coupons.platformCouponEditor.usageLimit": "حد الاستخدام",
  "screen.admin.coupons.platformCouponEditor.limit": "[الحد]",
  "screen.admin.coupons.platformCouponEditor.validFrom": "ساري من",
  "screen.admin.coupons.platformCouponEditor.yyyyMmDd": "YYYY-MM-DD",
  "screen.admin.coupons.platformCouponEditor.validUntil": "ساري حتى",
  "screen.admin.coupons.platformCouponEditor.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.admin.coupons.platformCouponEditor.programs": "البرامج",
  "screen.admin.coupons.platformCouponEditor.programsThisCouponAppliesTo":
    "[البرامج التي يُطبَّق عليها هذا الكوبون]",
  "screen.admin.coupons.platformCouponEditor.audience": "الجمهور",
  "screen.admin.coupons.platformCouponEditor.audiencePlaceholder": "[الجمهور]",
  "screen.admin.coupons.platformCouponEditor.scope": "النطاق",
  "screen.admin.coupons.platformCouponEditor.scopeIsFixedAtPlatform":
    "النطاق ثابت على مستوى المنصة.",
  "screen.admin.coupons.platformCouponEditor.stackableWithOtherCoupons":
    "قابل للجمع مع كوبونات أخرى",
  "screen.admin.coupons.platformCouponEditor.cancel": "إلغاء",
  "screen.admin.coupons.platformCouponEditor.saveCoupon": "حفظ الكوبون",
  // apps/web/src/screens/admin/coupons/platform-coupons.tsx
  "screen.admin.coupons.platformCoupons.active": "نشط",
  "screen.admin.coupons.platformCoupons.revoked": "ملغى",
  "screen.admin.coupons.platformCoupons.expired": "منتهي",
  "screen.admin.coupons.platformCoupons.abuseFlag": "إشارة إساءة",
  "screen.admin.coupons.platformCoupons.anyStatus": "أي حالة",
  "screen.admin.coupons.platformCoupons.activeLabel": "نشط",
  "screen.admin.coupons.platformCoupons.revokedLabel": "ملغى",
  "screen.admin.coupons.platformCoupons.expiredLabel": "منتهي",
  "screen.admin.coupons.platformCoupons.creatorType": "نوع المُنشئ",
  "screen.admin.coupons.platformCoupons.code": "الرمز",
  "screen.admin.coupons.platformCoupons.status": "الحالة",
  "screen.admin.coupons.platformCoupons.redemptions": "مرات الاستخدام",
  "screen.admin.coupons.platformCoupons.abuseFlagHeader": "إشارة إساءة",
  "screen.admin.coupons.platformCoupons.none": "لا شيء",
  "screen.admin.coupons.platformCoupons.actions": "الإجراءات",
  "screen.admin.coupons.platformCoupons.revoke": "إلغاء {code}",
  "screen.admin.coupons.platformCoupons.revoke2": "إلغاء",
  "screen.admin.coupons.platformCoupons.openAnalyticsFor": "فتح تحليلات {code}",
  "screen.admin.coupons.platformCoupons.analytics": "التحليلات",
  "screen.admin.coupons.platformCoupons.platformCoupons": "كوبونات المنصة",
  "screen.admin.coupons.platformCoupons.couponsFromAllCreatorsRevoke":
    "كوبونات من جميع المُنشئين. ألغِ أي كوبون.",
  "screen.admin.coupons.platformCoupons.createPlatformCoupon": "إنشاء كوبون منصة",
  "screen.admin.coupons.platformCoupons.noCoupons": "لا توجد كوبونات",
  "screen.admin.coupons.platformCoupons.noCouponsMatchThisFilter":
    "لا توجد كوبونات تطابق هذا التصفية.",
  "screen.admin.coupons.platformCoupons.loadingTheCoupons": "جارٍ تحميل الكوبونات.",
  "screen.admin.coupons.platformCoupons.abuseThresholds": "حدود الإساءة",
  "screen.admin.coupons.platformCoupons.thresholdsAreNotYetSet":
    "لم تُحدَّد الحدود بعد (D-216). تُظهر الإشارة القاعدة التي رفعتها.",
  "screen.admin.coupons.platformCoupons.statusLabel": "الحالة",
  "screen.admin.coupons.platformCoupons.coupons": "الكوبونات",
  "screen.admin.coupons.platformCoupons.platformCouponsCaption": "كوبونات المنصة",
  "screen.admin.coupons.platformCoupons.noCouponsEmptyTitle": "لا توجد كوبونات",
  "screen.admin.coupons.platformCoupons.noCouponsMatchThisFilterEmptyDescription":
    "لا توجد كوبونات تطابق هذا التصفية.",
  // apps/web/src/screens/admin/deals-and-disputes/deal-audit-detail.tsx
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealOpened": "فُتحت الاتفاقية",
  "screen.admin.dealsAndDisputes.dealAuditDetail.counterOfferMade": "قُدِّم عرض مضاد",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealFinalizedOrRejected": "أُنهيت الاتفاقية أو رُفضت",
  "screen.admin.dealsAndDisputes.dealAuditDetail.open": "مفتوحة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.step": "الخطوة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.amount": "المبلغ",
  "screen.admin.dealsAndDisputes.dealAuditDetail.actor": "المنفّذ",
  "screen.admin.dealsAndDisputes.dealAuditDetail.time": "الوقت",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealAuditDetail": "تفاصيل تدقيق الاتفاقية",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealReferenceEveryOfferAnd":
    "[مرجع الاتفاقية]. كل عرض وتغيير حالة، بالترتيب.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.flagForReview": "الإشارة للمراجعة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.noOffers": "لا توجد عروض",
  "screen.admin.dealsAndDisputes.dealAuditDetail.thisDealHasNoOffers":
    "لا توجد عروض لهذه الاتفاقية بعد.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.loadingTheDeal": "جارٍ تحميل الاتفاقية.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.partiesAndVehicleOrTrip":
    "الأطراف والمركبة أو الرحلة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.organization": "المؤسسة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.supplier": "المورّد",
  "screen.admin.dealsAndDisputes.dealAuditDetail.vehicleOrTrip": "المركبة أو الرحلة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.finalAmount": "المبلغ النهائي",
  "screen.admin.dealsAndDisputes.dealAuditDetail.offersInOrder": "العروض، بالترتيب",
  "screen.admin.dealsAndDisputes.dealAuditDetail.offersInOrderCaption": "العروض بالترتيب",
  "screen.admin.dealsAndDisputes.dealAuditDetail.noOffersEmptyTitle": "لا توجد عروض",
  "screen.admin.dealsAndDisputes.dealAuditDetail.thisDealHasNoOffersEmptyDescription":
    "لا توجد عروض لهذه الاتفاقية بعد.",
  "screen.admin.dealsAndDisputes.dealAuditDetail.stateHistory": "سجل الحالات",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealStateHistory": "سجل حالات الاتفاقية",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCostAndCommission": "تكلفة الاتفاقية والعمولة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.dealCost": "تكلفة الاتفاقية",
  "screen.admin.dealsAndDisputes.dealAuditDetail.commission": "العمولة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.placeholderRate": "نسبة مؤقتة",
  "screen.admin.dealsAndDisputes.dealAuditDetail.theDealCostIs10":
    "تكلفة الاتفاقية 10% من سعر الرحلة الأساسي. هذه النسبة مؤقتة وتبقى مفتوحة حتى تعتمدها المالية (D-15).",
  "screen.admin.dealsAndDisputes.dealAuditDetail.viewLedgerEntries": "عرض قيود دفتر الأستاذ",
  "screen.admin.dealsAndDisputes.dealAuditDetail.backToDealList": "العودة إلى قائمة الاتفاقيات",
  // apps/web/src/screens/admin/deals-and-disputes/deal-audit-list.tsx
  "screen.admin.dealsAndDisputes.dealAuditList.open": "مفتوحة",
  "screen.admin.dealsAndDisputes.dealAuditList.finalized": "منتهية",
  "screen.admin.dealsAndDisputes.dealAuditList.rejected": "مرفوض",
  "screen.admin.dealsAndDisputes.dealAuditList.anyState": "أي حالة",
  "screen.admin.dealsAndDisputes.dealAuditList.openLabel": "مفتوحة",
  "screen.admin.dealsAndDisputes.dealAuditList.finalizedLabel": "منتهية",
  "screen.admin.dealsAndDisputes.dealAuditList.rejectedLabel": "مرفوض",
  "screen.admin.dealsAndDisputes.dealAuditList.organization": "المؤسسة",
  "screen.admin.dealsAndDisputes.dealAuditList.supplier": "المورّد",
  "screen.admin.dealsAndDisputes.dealAuditList.vehicleOrTrip": "المركبة أو الرحلة",
  "screen.admin.dealsAndDisputes.dealAuditList.state": "الحالة",
  "screen.admin.dealsAndDisputes.dealAuditList.counterOffers": "العروض المضادة",
  "screen.admin.dealsAndDisputes.dealAuditList.finalAmount": "المبلغ النهائي",
  "screen.admin.dealsAndDisputes.dealAuditList.action": "الإجراء",
  "screen.admin.dealsAndDisputes.dealAuditList.openDealFor": "فتح اتفاقية {supplier}",
  "screen.admin.dealsAndDisputes.dealAuditList.openDeal": "فتح الاتفاقية",
  "screen.admin.dealsAndDisputes.dealAuditList.flagDealForForReview":
    "الإشارة إلى اتفاقية {supplier} للمراجعة",
  "screen.admin.dealsAndDisputes.dealAuditList.flagForReview": "الإشارة للمراجعة",
  "screen.admin.dealsAndDisputes.dealAuditList.dealAuditList": "قائمة تدقيق الاتفاقيات",
  "screen.admin.dealsAndDisputes.dealAuditList.findDealsAndSeeTheir":
    "ابحث عن الاتفاقيات واطّلع على حالتها.",
  "screen.admin.dealsAndDisputes.dealAuditList.noDeals": "لا توجد اتفاقيات",
  "screen.admin.dealsAndDisputes.dealAuditList.noDealsMatchTheseFilters":
    "لا توجد اتفاقيات تطابق هذه التصفية.",
  "screen.admin.dealsAndDisputes.dealAuditList.loadingTheDeals": "جارٍ تحميل الاتفاقيات.",
  "screen.admin.dealsAndDisputes.dealAuditList.organizationOrSupplier": "المؤسسة أو المورّد",
  "screen.admin.dealsAndDisputes.dealAuditList.nameOrDealReference": "الاسم أو مرجع الاتفاقية",
  "screen.admin.dealsAndDisputes.dealAuditList.clearSearch": "مسح البحث",
  "screen.admin.dealsAndDisputes.dealAuditList.stateLabel": "الحالة",
  "screen.admin.dealsAndDisputes.dealAuditList.deals": "الاتفاقيات",
  "screen.admin.dealsAndDisputes.dealAuditList.dealAuditListCaption": "قائمة تدقيق الاتفاقيات",
  "screen.admin.dealsAndDisputes.dealAuditList.noDealsEmptyTitle": "لا توجد اتفاقيات",
  "screen.admin.dealsAndDisputes.dealAuditList.noDealsMatchTheseFiltersEmptyDescription":
    "لا توجد اتفاقيات تطابق هذه التصفية.",
  // apps/web/src/screens/admin/deals-and-disputes/dispute-detail-and-refund-decision.tsx
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.noRefundIsQueued":
    "لا يُدرَج أي استرداد عند الحفظ.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.theRefundIsLinked":
    "يرتبط الاسترداد بهذا النزاع والحجز ويُدرَج عند الحفظ.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.labels.aRefundOutsidePolicy":
    "الاسترداد خارج السياسة يحتاج إلى سبب. تُسجَّل هويتك في سجل التدقيق.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.open": "مفتوحة",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.noRefund": "لا استرداد",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundWithinPolicy":
    "استرداد داخل السياسة",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundOutsidePolicy":
    "استرداد خارج السياسة",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.disputeDetailAndRefundDecision":
    "تفاصيل النزاع وقرار الاسترداد",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.recordTheOutcomeAndAny":
    "سجّل النتيجة وأي استرداد مرتبط بهذا النزاع.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.noOutcomeYet": "لا نتيجة بعد",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.recordTheOutcomeOnceBoth":
    "سجّل النتيجة بعد الاستماع إلى الطرفين.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.loadingTheDispute":
    "جارٍ تحميل النزاع.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.partiesAndBooking": "الأطراف والحجز",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.traveler": "المسافر",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.organization": "المؤسسة",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.booking": "الحجز",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.payment": "الدفع",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.amountPaid": "المبلغ المدفوع",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeAndRefund":
    "النتيجة والاسترداد",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeSummaryRequired":
    "ملخص النتيجة (مطلوب)",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.outcomeOfTheDispute":
    "[نتيجة النزاع]",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refund": "الاسترداد",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.aRefundStaysPendingUntil":
    "يبقى الاسترداد معلّقًا حتى تؤكده بوابة الدفع.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.refundTitle": "الاسترداد",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.reasonForThisOutcomeRequired":
    "سبب هذه النتيجة (مطلوب)",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.requiredForEveryOutcomeA":
    "مطلوب لكل نتيجة. يُدقَّق الاسترداد خارج السياسة بهذا السبب.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcome": "حفظ النتيجة",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveThisOutcomeAndRefund":
    "حفظ هذه النتيجة والاسترداد؟",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.aRefundIsQueuedThrough":
    "يُدرَج الاسترداد عبر بوابة الدفع الأصلية. يُدقَّق القرار.",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.saveOutcomeConfirmLabel":
    "حفظ النتيجة",
  "screen.admin.dealsAndDisputes.disputeDetailAndRefundDecision.cancel": "إلغاء",
  // apps/web/src/screens/admin/deals-and-disputes/disputes-queue.tsx
  "screen.admin.dealsAndDisputes.disputesQueue.awaitingAcknowledgement": "في انتظار الإقرار",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledged": "تم الإقرار",
  "screen.admin.dealsAndDisputes.disputesQueue.resolved": "تم الحل",
  "screen.admin.dealsAndDisputes.disputesQueue.allTypes": "كل الأنواع",
  "screen.admin.dealsAndDisputes.disputesQueue.disputeTypesPendingD251":
    "[أنواع النزاعات، معلّقة على D-251]",
  "screen.admin.dealsAndDisputes.disputesQueue.anyState": "أي حالة",
  "screen.admin.dealsAndDisputes.disputesQueue.awaitingAcknowledgementLabel": "في انتظار الإقرار",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledgedLabel": "تم الإقرار",
  "screen.admin.dealsAndDisputes.disputesQueue.resolvedLabel": "تم الحل",
  "screen.admin.dealsAndDisputes.disputesQueue.parties": "الأطراف",
  "screen.admin.dealsAndDisputes.disputesQueue.bookingOrTrip": "الحجز أو الرحلة",
  "screen.admin.dealsAndDisputes.disputesQueue.type": "النوع",
  "screen.admin.dealsAndDisputes.disputesQueue.age": "العمر",
  "screen.admin.dealsAndDisputes.disputesQueue.state": "الحالة",
  "screen.admin.dealsAndDisputes.disputesQueue.action": "الإجراء",
  "screen.admin.dealsAndDisputes.disputesQueue.openDispute": "فتح النزاع {reference}",
  "screen.admin.dealsAndDisputes.disputesQueue.openDispute2": "فتح النزاع",
  "screen.admin.dealsAndDisputes.disputesQueue.disputesQueue": "قائمة النزاعات",
  "screen.admin.dealsAndDisputes.disputesQueue.workDisputesBetweenParties":
    "عالج النزاعات بين الأطراف.",
  "screen.admin.dealsAndDisputes.disputesQueue.noOpenDisputes": "لا توجد نزاعات مفتوحة",
  "screen.admin.dealsAndDisputes.disputesQueue.noDisputesMatchTheseFilters":
    "لا توجد نزاعات تطابق هذه التصفية.",
  "screen.admin.dealsAndDisputes.disputesQueue.loadingTheDisputes": "جارٍ تحميل النزاعات.",
  "screen.admin.dealsAndDisputes.disputesQueue.deadlines": "المواعيد النهائية",
  "screen.admin.dealsAndDisputes.disputesQueue.acknowledgeADisputeWithin2":
    "أقرّ بالنزاع خلال يومَي عمل. واحلّه خلال 10 أيام عمل (D-32).",
  "screen.admin.dealsAndDisputes.disputesQueue.typeLabel": "النوع",
  "screen.admin.dealsAndDisputes.disputesQueue.stateLabel": "الحالة",
  "screen.admin.dealsAndDisputes.disputesQueue.disputes": "النزاعات",
  "screen.admin.dealsAndDisputes.disputesQueue.disputesQueueCaption": "قائمة النزاعات",
  "screen.admin.dealsAndDisputes.disputesQueue.noOpenDisputesEmptyTitle": "لا توجد نزاعات مفتوحة",
  "screen.admin.dealsAndDisputes.disputesQueue.noDisputesMatchTheseFiltersEmptyDescription":
    "لا توجد نزاعات تطابق هذه التصفية.",
  // apps/web/src/screens/admin/directory/admin-staff-accounts.tsx
  "screen.admin.directory.adminStaffAccounts.active": "نشط",
  "screen.admin.directory.adminStaffAccounts.setUpRequired": "الإعداد مطلوب",
  "screen.admin.directory.adminStaffAccounts.name": "الاسم",
  "screen.admin.directory.adminStaffAccounts.email": "البريد الإلكتروني",
  "screen.admin.directory.adminStaffAccounts.status": "الحالة",
  "screen.admin.directory.adminStaffAccounts.authenticator": "المصادقة",
  "screen.admin.directory.adminStaffAccounts.action": "الإجراء",
  "screen.admin.directory.adminStaffAccounts.resetAuthenticatorFor": "إعادة تعيين مصادقة {name}",
  "screen.admin.directory.adminStaffAccounts.resetAuthenticator": "إعادة تعيين المصادقة",
  "screen.admin.directory.adminStaffAccounts.adminStaffAccounts": "حسابات موظفي الإدارة",
  "screen.admin.directory.adminStaffAccounts.createAdminAccountsAndSee":
    "أنشئ حسابات إدارية واطّلع على حالة إعدادها.",
  "screen.admin.directory.adminStaffAccounts.noAdminAccounts": "لا توجد حسابات إدارية",
  "screen.admin.directory.adminStaffAccounts.createTheFirstAdminAccount":
    "أنشئ أول حساب إداري أعلاه.",
  "screen.admin.directory.adminStaffAccounts.loadingTheAdminAccounts":
    "جارٍ تحميل الحسابات الإدارية.",
  "screen.admin.directory.adminStaffAccounts.createAdminAccount": "إنشاء حساب إداري",
  "screen.admin.directory.adminStaffAccounts.fullName": "الاسم الكامل",
  "screen.admin.directory.adminStaffAccounts.fullNamePlaceholder": "[الاسم الكامل]",
  "screen.admin.directory.adminStaffAccounts.emailLabel": "البريد الإلكتروني",
  "screen.admin.directory.adminStaffAccounts.emailPlaceholder": "[البريد الإلكتروني]",
  "screen.admin.directory.adminStaffAccounts.country": "الدولة",
  "screen.admin.directory.adminStaffAccounts.countryPlaceholder": "[الدولة]",
  "screen.admin.directory.adminStaffAccounts.countryIsProposedInD": "الدولة مقترحة في D-49.",
  "screen.admin.directory.adminStaffAccounts.createAdminAccount2": "إنشاء حساب إداري",
  "screen.admin.directory.adminStaffAccounts.howAdminAccountsStart": "كيف تبدأ الحسابات الإدارية",
  "screen.admin.directory.adminStaffAccounts.aNewAdminMustSet":
    "يجب على المسؤول الجديد إعداد مصادقة عند أول تسجيل دخول. ولا يمكن إنشاء حساب إداري إلا لمسؤول قائم. لا يوجد تسجيل ذاتي.",
  "screen.admin.directory.adminStaffAccounts.adminAccounts": "الحسابات الإدارية",
  "screen.admin.directory.adminStaffAccounts.adminStaffAccountsCaption": "حسابات موظفي الإدارة",
  "screen.admin.directory.adminStaffAccounts.noAdminAccountsEmptyTitle": "لا توجد حسابات إدارية",
  "screen.admin.directory.adminStaffAccounts.createTheFirstAdminAccountEmptyDescription":
    "أنشئ أول حساب إداري أعلاه.",
  // apps/web/src/screens/admin/directory/deletion-and-data-requests.tsx
  "screen.admin.directory.deletionAndDataRequests.gracePeriod": "فترة السماح",
  "screen.admin.directory.deletionAndDataRequests.overdue": "متأخر",
  "screen.admin.directory.deletionAndDataRequests.allTypes": "كل الأنواع",
  "screen.admin.directory.deletionAndDataRequests.accountDeletion": "حذف الحساب",
  "screen.admin.directory.deletionAndDataRequests.dataCopy": "نسخة البيانات",
  "screen.admin.directory.deletionAndDataRequests.anyStatus": "أي حالة",
  "screen.admin.directory.deletionAndDataRequests.gracePeriodLabel": "فترة السماح",
  "screen.admin.directory.deletionAndDataRequests.overdueLabel": "متأخر",
  "screen.admin.directory.deletionAndDataRequests.requestType": "نوع الطلب",
  "screen.admin.directory.deletionAndDataRequests.account": "الحساب",
  "screen.admin.directory.deletionAndDataRequests.requested": "تاريخ الطلب",
  "screen.admin.directory.deletionAndDataRequests.graceEndOrDueDate":
    "نهاية السماح أو تاريخ الاستحقاق",
  "screen.admin.directory.deletionAndDataRequests.status": "الحالة",
  "screen.admin.directory.deletionAndDataRequests.action": "الإجراء",
  "screen.admin.directory.deletionAndDataRequests.openAccountFor": "فتح حساب {account}",
  "screen.admin.directory.deletionAndDataRequests.openAccount": "فتح الحساب",
  "screen.admin.directory.deletionAndDataRequests.deletionAndDataRequests": "طلبات الحذف والبيانات",
  "screen.admin.directory.deletionAndDataRequests.workAccountDeletionAndData":
    "عالج طلبات حذف الحسابات ونسخ البيانات.",
  "screen.admin.directory.deletionAndDataRequests.noRequests": "لا توجد طلبات",
  "screen.admin.directory.deletionAndDataRequests.noDeletionOrDataCopy":
    "لا توجد طلبات حذف أو نسخ بيانات مفتوحة.",
  "screen.admin.directory.deletionAndDataRequests.loadingTheRequests": "جارٍ تحميل الطلبات.",
  "screen.admin.directory.deletionAndDataRequests.retentionRules": "قواعد الاحتفاظ",
  "screen.admin.directory.deletionAndDataRequests.accountsArePurgedOnDay":
    "تُحذف الحسابات في اليوم 31 بعد طلب الحذف (D-38). تُعلَّم نسخة البيانات المتجاوزة لموعدها بأنها متأخرة (D-162).",
  "screen.admin.directory.deletionAndDataRequests.requestTypeLabel": "نوع الطلب",
  "screen.admin.directory.deletionAndDataRequests.statusLabel": "الحالة",
  "screen.admin.directory.deletionAndDataRequests.requests": "الطلبات",
  "screen.admin.directory.deletionAndDataRequests.deletionAndDataRequestsCaption":
    "طلبات الحذف والبيانات",
  "screen.admin.directory.deletionAndDataRequests.noRequestsEmptyTitle": "لا توجد طلبات",
  "screen.admin.directory.deletionAndDataRequests.noDeletionOrDataCopyEmptyDescription":
    "لا توجد طلبات حذف أو نسخ بيانات مفتوحة.",
  // apps/web/src/screens/admin/directory/entity-detail.tsx
  "screen.admin.directory.entityDetail.adminActionFromTheAudit": "[إجراء إداري من سجل التدقيق]",
  "screen.admin.directory.entityDetail.adminActionFromTheAuditLabel":
    "[إجراء إداري من سجل التدقيق]",
  "screen.admin.directory.entityDetail.active": "نشط",
  "screen.admin.directory.entityDetail.trip": "الرحلة",
  "screen.admin.directory.entityDetail.state": "الحالة",
  "screen.admin.directory.entityDetail.dates": "التواريخ",
  "screen.admin.directory.entityDetail.entityDetail": "تفاصيل الكيان",
  "screen.admin.directory.entityDetail.entityNameProfilePlanTrips":
    "[اسم الكيان]. الملف والخطة والرحلات والحجوزات والسجل.",
  "screen.admin.directory.entityDetail.handleDeletion": "معالجة الحذف",
  "screen.admin.directory.entityDetail.grantOrOverridePlan": "منح الخطة أو تجاوزها",
  "screen.admin.directory.entityDetail.requestLabTest": "طلب تحليل مخبري",
  "screen.admin.directory.entityDetail.suspendOrReinstate": "الإيقاف أو إعادة التفعيل",
  "screen.admin.directory.entityDetail.noTripsOrBookings": "لا توجد رحلات أو حجوزات",
  "screen.admin.directory.entityDetail.thisAccountHasNoTrips":
    "لا توجد رحلات أو حجوزات لهذا الحساب بعد.",
  "screen.admin.directory.entityDetail.loadingTheAccount": "جارٍ تحميل الحساب.",
  "screen.admin.directory.entityDetail.suspended": "موقوف",
  "screen.admin.directory.entityDetail.signInIsRefusedWhile":
    "يُرفض تسجيل الدخول ما دام الحساب موقوفًا. تُحفظ البيانات.",
  "screen.admin.directory.entityDetail.profile": "الملف الشخصي",
  "screen.admin.directory.entityDetail.name": "الاسم",
  "screen.admin.directory.entityDetail.email": "البريد الإلكتروني",
  "screen.admin.directory.entityDetail.phone": "الهاتف",
  "screen.admin.directory.entityDetail.country": "الدولة",
  "screen.admin.directory.entityDetail.entityType": "نوع الكيان",
  "screen.admin.directory.entityDetail.deletionRequest": "طلب الحذف",
  "screen.admin.directory.entityDetail.backToDirectory": "العودة إلى الدليل",
  "screen.admin.directory.entityDetail.roleAssignments": "تعيينات الأدوار",
  "screen.admin.directory.entityDetail.roleAssignments2": "[تعيينات الأدوار]",
  "screen.admin.directory.entityDetail.planAndSubscription": "الخطة والاشتراك",
  "screen.admin.directory.entityDetail.plan": "الخطة",
  "screen.admin.directory.entityDetail.billingStatus": "حالة الفوترة",
  "screen.admin.directory.entityDetail.renewalDate": "تاريخ التجديد",
  "screen.admin.directory.entityDetail.tripsAndBookings": "الرحلات والحجوزات",
  "screen.admin.directory.entityDetail.tripsAndBookingsCaption": "الرحلات والحجوزات",
  "screen.admin.directory.entityDetail.noTripsOrBookingsEmptyTitle": "لا توجد رحلات أو حجوزات",
  "screen.admin.directory.entityDetail.thisAccountHasNoTripsEmptyDescription":
    "لا توجد رحلات أو حجوزات لهذا الحساب بعد.",
  "screen.admin.directory.entityDetail.auditHistory": "سجل التدقيق",
  "screen.admin.directory.entityDetail.auditHistoryForThisAccount": "سجل التدقيق لهذا الحساب",
  // apps/web/src/screens/admin/directory/suspend-or-reinstate-decision.tsx
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccount": "إيقاف الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccount": "إعادة تفعيل الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.active": "نشط",
  "screen.admin.directory.suspendOrReinstateDecision.suspendOrReinstateDecision":
    "الإيقاف أو إعادة التفعيل (قرار)",
  "screen.admin.directory.suspendOrReinstateDecision.stopOrRestoreAccessWithout":
    "أوقف الوصول أو استعده دون حذف البيانات.",
  "screen.admin.directory.suspendOrReinstateDecision.noAccountSelected": "لم يُحدَّد أي حساب",
  "screen.admin.directory.suspendOrReinstateDecision.openAnAccountFromThe":
    "افتح حسابًا من الدليل قبل إيقافه أو إعادة تفعيله.",
  "screen.admin.directory.suspendOrReinstateDecision.loadingTheAccount": "جارٍ تحميل الحساب.",
  "screen.admin.directory.suspendOrReinstateDecision.account": "الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.accountName": "اسم الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.entityType": "نوع الكيان",
  "screen.admin.directory.suspendOrReinstateDecision.decision": "القرار",
  "screen.admin.directory.suspendOrReinstateDecision.action": "الإجراء",
  "screen.admin.directory.suspendOrReinstateDecision.reasonRequired": "السبب (مطلوب)",
  "screen.admin.directory.suspendOrReinstateDecision.reasonRulesAreNotYet":
    "قواعد الأسباب لم تُحدَّد بعد (D-234).",
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccount2": "إيقاف الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccount2": "إعادة تفعيل الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.suspendThisAccount": "إيقاف هذا الحساب؟",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateThisAccount":
    "إعادة تفعيل هذا الحساب؟",
  "screen.admin.directory.suspendOrReinstateDecision.accessStopsAtOnceData":
    "يتوقف الوصول فورًا. تُحفظ البيانات. يُسجَّل الإجراء في سجل التدقيق.",
  "screen.admin.directory.suspendOrReinstateDecision.accessIsRestoredAtOnce":
    "يُستعاد الوصول فورًا. البيانات دون تغيير. يُسجَّل الإجراء في سجل التدقيق.",
  "screen.admin.directory.suspendOrReinstateDecision.suspendAccount3": "إيقاف الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.reinstateAccount3": "إعادة تفعيل الحساب",
  "screen.admin.directory.suspendOrReinstateDecision.cancel": "إلغاء",
  "screen.admin.directory.suspendOrReinstateDecision.effectOfSuspending": "أثر الإيقاف",
  "screen.admin.directory.suspendOrReinstateDecision.effectOfReinstating": "أثر إعادة التفعيل",
  "screen.admin.directory.suspendOrReinstateDecision.accessStopsAtOnceData2":
    "يتوقف الوصول فورًا. تُحفظ البيانات.",
  "screen.admin.directory.suspendOrReinstateDecision.accessIsRestoredAtOnce2":
    "يُستعاد الوصول فورًا. البيانات دون تغيير.",
  // apps/web/src/screens/admin/directory/users-and-entities-directory.tsx
  "screen.admin.directory.usersAndEntitiesDirectory.active": "نشط",
  "screen.admin.directory.usersAndEntitiesDirectory.suspended": "موقوف",
  "screen.admin.directory.usersAndEntitiesDirectory.allRoles": "كل الأدوار",
  "screen.admin.directory.usersAndEntitiesDirectory.allStatuses": "كل الحالات",
  "screen.admin.directory.usersAndEntitiesDirectory.activeLabel": "نشط",
  "screen.admin.directory.usersAndEntitiesDirectory.suspendedLabel": "موقوف",
  "screen.admin.directory.usersAndEntitiesDirectory.deletionRequested": "حذف مطلوب",
  "screen.admin.directory.usersAndEntitiesDirectory.name": "الاسم",
  "screen.admin.directory.usersAndEntitiesDirectory.role": "الدور",
  "screen.admin.directory.usersAndEntitiesDirectory.organization": "المؤسسة",
  "screen.admin.directory.usersAndEntitiesDirectory.status": "الحالة",
  "screen.admin.directory.usersAndEntitiesDirectory.action": "الإجراء",
  "screen.admin.directory.usersAndEntitiesDirectory.open": "فتح {name}",
  "screen.admin.directory.usersAndEntitiesDirectory.open2": "مفتوحة",
  "screen.admin.directory.usersAndEntitiesDirectory.usersAndEntitiesDirectory":
    "دليل المستخدمين والكيانات",
  "screen.admin.directory.usersAndEntitiesDirectory.findAnyUserOrganizationDriver":
    "ابحث عن أي مستخدم أو مؤسسة أو سائق أو مصوّر أو مشرف.",
  "screen.admin.directory.usersAndEntitiesDirectory.deletionRequests": "طلبات الحذف",
  "screen.admin.directory.usersAndEntitiesDirectory.adminStaffAccounts": "حسابات موظفي الإدارة",
  "screen.admin.directory.usersAndEntitiesDirectory.noResults": "لا نتائج",
  "screen.admin.directory.usersAndEntitiesDirectory.changeTheSearchOrThe":
    "غيّر البحث أو عوامل التصفية.",
  "screen.admin.directory.usersAndEntitiesDirectory.loadingTheDirectory": "جارٍ تحميل الدليل.",
  "screen.admin.directory.usersAndEntitiesDirectory.search": "بحث",
  "screen.admin.directory.usersAndEntitiesDirectory.nameEmailPhoneOrganizationOr":
    "الاسم أو البريد أو الهاتف أو المؤسسة أو المرجع",
  "screen.admin.directory.usersAndEntitiesDirectory.clearSearch": "مسح البحث",
  "screen.admin.directory.usersAndEntitiesDirectory.roleLabel": "الدور",
  "screen.admin.directory.usersAndEntitiesDirectory.statusLabel": "الحالة",
  "screen.admin.directory.usersAndEntitiesDirectory.results": "النتائج",
  "screen.admin.directory.usersAndEntitiesDirectory.usersAndEntities": "المستخدمون والكيانات",
  "screen.admin.directory.usersAndEntitiesDirectory.noResultsEmptyTitle": "لا نتائج",
  "screen.admin.directory.usersAndEntitiesDirectory.changeTheSearchOrTheEmptyDescription":
    "غيّر البحث أو عوامل التصفية.",
  // apps/web/src/screens/admin/entries-part-1.ts
  "screen.registry.admin.adminHome.title": "الرئيسية الإدارية",
  "screen.registry.admin.applicationQueue.title": "قائمة الطلبات",
  "screen.registry.admin.applicationReviewDetail.title": "تفاصيل مراجعة الطلب",
  "screen.registry.admin.requestChangesDecision.title": "طلب تغييرات (قرار)",
  "screen.registry.admin.rejectWithReasonDecision.title": "الرفض مع ذكر السبب (قرار)",
  "screen.registry.admin.appealReview.title": "مراجعة الاعتراض",
  "screen.registry.admin.usersAndEntitiesDirectory.title": "دليل المستخدمين والكيانات",
  "screen.registry.admin.entityDetail.title": "تفاصيل الكيان",
  "screen.registry.admin.suspendOrReinstateDecision.title": "الإيقاف أو إعادة التفعيل (قرار)",
  "screen.registry.admin.deletionAndDataRequests.title": "طلبات الحذف والبيانات",
  "screen.registry.admin.adminStaffAccounts.title": "حسابات موظفي الإدارة",
  "screen.registry.admin.labTestsQueue.title": "قائمة التحاليل المخبرية",
  "screen.registry.admin.labTestDetailAndDecision.title": "تفاصيل التحليل المخبري والقرار",
  "screen.registry.admin.requestLabTestDecision.title": "طلب تحليل مخبري (قرار)",
  "screen.registry.admin.plansCatalog.title": "دليل الخطط",
  "screen.registry.admin.planEditor.title": "محرّر الخطة",
  // apps/web/src/screens/admin/entries-part-2.ts
  "screen.registry.admin.subscriptionsAndOverrides.title": "الاشتراكات والتجاوزات",
  "screen.registry.admin.revenueDashboard.title": "لوحة الإيرادات",
  "screen.registry.admin.platformCoupons.title": "كوبونات المنصة",
  "screen.registry.admin.platformCouponEditor.title": "محرّر كوبونات المنصة",
  "screen.registry.admin.dealAuditList.title": "قائمة تدقيق الاتفاقيات",
  "screen.registry.admin.dealAuditDetail.title": "تفاصيل تدقيق الاتفاقية",
  "screen.registry.admin.disputesQueue.title": "قائمة النزاعات",
  "screen.registry.admin.disputeDetailAndRefundDecision.title": "تفاصيل النزاع وقرار الاسترداد",
  "screen.registry.admin.platformFinancialView.title": "العرض المالي للمنصة",
  "screen.registry.admin.payoutRuns.title": "دفعات المستحقات",
  "screen.registry.admin.reconciliationExceptions.title": "استثناءات المطابقة",
  "screen.registry.admin.settlementsTracker.title": "متتبّع التسويات",
  "screen.registry.admin.tripOversight.title": "الإشراف على الرحلات",
  "screen.registry.admin.auditLog.title": "سجل التدقيق",
  "screen.registry.admin.notificationTemplates.title": "قوالب الإشعارات",
  "screen.registry.admin.featureFlagsAndPlatformConfiguration.title":
    "أعلام الميزات وإعدادات المنصة",
  "screen.registry.admin.operationsHealthDashboard.title": "لوحة صحة العمليات",
  // apps/web/src/screens/admin/finance/payout-runs.tsx
  "screen.admin.finance.payoutRuns.completed": "مكتملة",
  "screen.admin.finance.payoutRuns.failed": "فاشلة",
  "screen.admin.finance.payoutRuns.week": "الأسبوع",
  "screen.admin.finance.payoutRuns.suppliers": "المورّدون",
  "screen.admin.finance.payoutRuns.total": "الإجمالي",
  "screen.admin.finance.payoutRuns.state": "الحالة",
  "screen.admin.finance.payoutRuns.action": "الإجراء",
  "screen.admin.finance.payoutRuns.openPayoutRunFor": "فتح دفعة مستحقات {week}",
  "screen.admin.finance.payoutRuns.openRun": "فتح الدفعة",
  "screen.admin.finance.payoutRuns.supplier": "المورّد",
  "screen.admin.finance.payoutRuns.amount": "المبلغ",
  "screen.admin.finance.payoutRuns.stateHeader": "الحالة",
  "screen.admin.finance.payoutRuns.payoutRuns": "دفعات المستحقات",
  "screen.admin.finance.payoutRuns.createAndTrackWeeklyPayout":
    "أنشئ دفعات المستحقات الأسبوعية للمورّدين وتتبّعها.",
  "screen.admin.finance.payoutRuns.createPayoutRun": "إنشاء دفعة مستحقات",
  "screen.admin.finance.payoutRuns.noPayoutRuns": "لا توجد دفعات مستحقات",
  "screen.admin.finance.payoutRuns.createTheFirstPayoutRun": "أنشئ أول دفعة مستحقات لهذا الأسبوع.",
  "screen.admin.finance.payoutRuns.loadingThePayoutRuns": "جارٍ تحميل دفعات المستحقات.",
  "screen.admin.finance.payoutRuns.schedule": "الجدولة",
  "screen.admin.finance.payoutRuns.payoutRunsAreCreatedWeekly":
    "تُنشأ دفعات المستحقات أسبوعيًا، يوم الاثنين الساعة 06:00 (D-28). يرى كل مورّد مبلغه فقط.",
  "screen.admin.finance.payoutRuns.runs": "الدفعات",
  "screen.admin.finance.payoutRuns.payoutRunsCaption": "دفعات المستحقات",
  "screen.admin.finance.payoutRuns.noPayoutRunsEmptyTitle": "لا توجد دفعات مستحقات",
  "screen.admin.finance.payoutRuns.createTheFirstPayoutRunEmptyDescription":
    "أنشئ أول دفعة مستحقات لهذا الأسبوع.",
  "screen.admin.finance.payoutRuns.runDetailWeekOfDate": "تفاصيل الدفعة: [أسبوع تاريخ]",
  "screen.admin.finance.payoutRuns.amountPerSupplierInThis": "المبلغ لكل مورّد في هذه الدفعة",
  "screen.admin.finance.payoutRuns.noSuppliersInThisRun": "لا يوجد مورّدون في هذه الدفعة",
  "screen.admin.finance.payoutRuns.thisRunHasNoSupplier": "لا توجد مبالغ مورّدين في هذه الدفعة.",
  "screen.admin.finance.payoutRuns.backToFinancialView": "العودة إلى العرض المالي",
  // apps/web/src/screens/admin/finance/platform-financial-view.tsx
  "screen.admin.finance.platformFinancialView.thisMonth": "هذا الشهر",
  "screen.admin.finance.platformFinancialView.thisQuarter": "هذا الربع",
  "screen.admin.finance.platformFinancialView.thisYear": "هذه السنة",
  "screen.admin.finance.platformFinancialView.platformFinancialView": "العرض المالي للمنصة",
  "screen.admin.finance.platformFinancialView.theSystemWideFinancialPicture":
    "الصورة المالية على مستوى النظام للفترة المحددة.",
  "screen.admin.finance.platformFinancialView.noActivityInThisPeriod": "لا نشاط في هذه الفترة",
  "screen.admin.finance.platformFinancialView.chooseAnotherPeriodToSee":
    "اختر فترة أخرى لعرض الإجماليات.",
  "screen.admin.finance.platformFinancialView.loadingTheFinancialTotals":
    "جارٍ تحميل الإجماليات المالية.",
  "screen.admin.finance.platformFinancialView.period": "الفترة",
  "screen.admin.finance.platformFinancialView.subscriptionRevenue": "إيرادات الاشتراكات",
  "screen.admin.finance.platformFinancialView.periodTotal": "إجمالي الفترة",
  "screen.admin.finance.platformFinancialView.commission": "العمولة",
  "screen.admin.finance.platformFinancialView.periodTotalHint": "إجمالي الفترة",
  "screen.admin.finance.platformFinancialView.dealAuditSummary": "ملخص تدقيق الاتفاقيات",
  "screen.admin.finance.platformFinancialView.periodTotal2": "إجمالي الفترة",
  "screen.admin.finance.platformFinancialView.couponRedemptions": "استخدام الكوبونات",
  "screen.admin.finance.platformFinancialView.periodTotal3": "إجمالي الفترة",
  "screen.admin.finance.platformFinancialView.disputes": "النزاعات",
  "screen.admin.finance.platformFinancialView.openedInThePeriod": "المفتوحة في الفترة",
  "screen.admin.finance.platformFinancialView.payouts": "المدفوعات",
  "screen.admin.finance.platformFinancialView.periodTotal4": "إجمالي الفترة",
  "screen.admin.finance.platformFinancialView.detailViews": "عروض التفاصيل",
  "screen.admin.finance.platformFinancialView.payoutRuns": "دفعات المستحقات",
  "screen.admin.finance.platformFinancialView.reconciliationExceptions": "استثناءات المطابقة",
  "screen.admin.finance.platformFinancialView.settlementsTracker": "متتبّع التسويات",
  "screen.admin.finance.platformFinancialView.amounts": "المبالغ",
  "screen.admin.finance.platformFinancialView.everyAmountShowsItsIso":
    "يظهر كل مبلغ برمز عملته وفق ISO. التقريب وفق D-157.",
  // apps/web/src/screens/admin/finance/reconciliation-exceptions.tsx
  "screen.admin.finance.reconciliationExceptions.missingFromLedger": "مفقود من دفتر الأستاذ",
  "screen.admin.finance.reconciliationExceptions.amountMismatch": "عدم تطابق المبلغ",
  "screen.admin.finance.reconciliationExceptions.open": "مفتوحة",
  "screen.admin.finance.reconciliationExceptions.resolved": "تم الحل",
  "screen.admin.finance.reconciliationExceptions.anyState": "أي حالة",
  "screen.admin.finance.reconciliationExceptions.openLabel": "مفتوحة",
  "screen.admin.finance.reconciliationExceptions.resolvedLabel": "تم الحل",
  "screen.admin.finance.reconciliationExceptions.gatewayReference": "مرجع بوابة الدفع",
  "screen.admin.finance.reconciliationExceptions.amount": "المبلغ",
  "screen.admin.finance.reconciliationExceptions.type": "النوع",
  "screen.admin.finance.reconciliationExceptions.state": "الحالة",
  "screen.admin.finance.reconciliationExceptions.action": "الإجراء",
  "screen.admin.finance.reconciliationExceptions.resolveException": "حل الاستثناء {reference}",
  "screen.admin.finance.reconciliationExceptions.resolve": "حل",
  "screen.admin.finance.reconciliationExceptions.reconciliationExceptions": "استثناءات المطابقة",
  "screen.admin.finance.reconciliationExceptions.gatewayRecordsThatDoNot":
    "سجلات بوابة الدفع التي لا تطابق دفتر الأستاذ.",
  "screen.admin.finance.reconciliationExceptions.noExceptions": "لا استثناءات",
  "screen.admin.finance.reconciliationExceptions.gatewayRecordsMatchTheLedger":
    "سجلات بوابة الدفع تطابق دفتر الأستاذ.",
  "screen.admin.finance.reconciliationExceptions.loadingTheExceptions": "جارٍ تحميل الاستثناءات.",
  "screen.admin.finance.reconciliationExceptions.schedule": "الجدولة",
  "screen.admin.finance.reconciliationExceptions.reconciliationRunsDailyD29":
    "تتم المطابقة يوميًا (D-29).",
  "screen.admin.finance.reconciliationExceptions.stateLabel": "الحالة",
  "screen.admin.finance.reconciliationExceptions.exceptions": "الاستثناءات",
  "screen.admin.finance.reconciliationExceptions.reconciliationExceptionsCaption":
    "استثناءات المطابقة",
  "screen.admin.finance.reconciliationExceptions.noExceptionsEmptyTitle": "لا استثناءات",
  "screen.admin.finance.reconciliationExceptions.gatewayRecordsMatchTheLedgerEmptyDescription":
    "سجلات بوابة الدفع تطابق دفتر الأستاذ.",
  "screen.admin.finance.reconciliationExceptions.resolveSelectedException": "حل الاستثناء المحدد",
  "screen.admin.finance.reconciliationExceptions.resolutionNoteRequired": "ملاحظة الحل (مطلوبة)",
  "screen.admin.finance.reconciliationExceptions.whatWasCheckedAndWhy":
    "[ما تم التحقق منه وسبب اعتبار هذا محلولًا]",
  "screen.admin.finance.reconciliationExceptions.backToFinancialView": "العودة إلى العرض المالي",
  "screen.admin.finance.reconciliationExceptions.resolveException2": "حل الاستثناء",
  // apps/web/src/screens/admin/finance/revenue-dashboard.tsx
  "screen.admin.finance.revenueDashboard.thisMonth": "هذا الشهر",
  "screen.admin.finance.revenueDashboard.thisQuarter": "هذا الربع",
  "screen.admin.finance.revenueDashboard.thisYear": "هذه السنة",
  "screen.admin.finance.revenueDashboard.allRoles": "كل الأدوار",
  "screen.admin.finance.revenueDashboard.plan": "الخطة",
  "screen.admin.finance.revenueDashboard.subscriptions": "الاشتراكات",
  "screen.admin.finance.revenueDashboard.share": "الحصة",
  "screen.admin.finance.revenueDashboard.revenueDashboard": "لوحة الإيرادات",
  "screen.admin.finance.revenueDashboard.mrrChurnUpgradesAndDowngrades":
    "الإيراد الشهري المتكرر والتسرّب والترقيات والتخفيضات للفترة المحددة.",
  "screen.admin.finance.revenueDashboard.openFinancialView": "فتح العرض المالي",
  "screen.admin.finance.revenueDashboard.noDataForThisPeriod": "لا بيانات لهذه الفترة",
  "screen.admin.finance.revenueDashboard.noSubscriptionsWereActiveIn":
    "لم يكن هناك اشتراكات نشطة في الفترة المحددة.",
  "screen.admin.finance.revenueDashboard.loadingTheRevenueFigures": "جارٍ تحميل أرقام الإيرادات.",
  "screen.admin.finance.revenueDashboard.period": "الفترة",
  "screen.admin.finance.revenueDashboard.role": "الدور",
  "screen.admin.finance.revenueDashboard.monthlyRecurringRevenueInThe":
    "الإيراد الشهري المتكرر، برمز العملة وفق ISO",
  "screen.admin.finance.revenueDashboard.churn": "التسرّب",
  "screen.admin.finance.revenueDashboard.subscriptionsCancelledInThePeriod":
    "الاشتراكات الملغاة في الفترة",
  "screen.admin.finance.revenueDashboard.upgrades": "الترقيات",
  "screen.admin.finance.revenueDashboard.planChangesToAHigher": "تغييرات الخطة إلى فئة أعلى",
  "screen.admin.finance.revenueDashboard.downgrades": "التخفيضات",
  "screen.admin.finance.revenueDashboard.planChangesToALower": "تغييرات الخطة إلى فئة أدنى",
  "screen.admin.finance.revenueDashboard.planDistribution": "توزيع الخطط",
  "screen.admin.finance.revenueDashboard.planDistributionCaption": "توزيع الخطط",
  "screen.admin.finance.revenueDashboard.noDataForThisPeriodEmptyTitle": "لا بيانات لهذه الفترة",
  "screen.admin.finance.revenueDashboard.noSubscriptionsWereActiveInEmptyDescription":
    "لم يكن هناك اشتراكات نشطة في الفترة المحددة.",
  // apps/web/src/screens/admin/finance/settlements-tracker.tsx
  "screen.admin.finance.settlementsTracker.open": "مفتوحة",
  "screen.admin.finance.settlementsTracker.settled": "مسوّاة",
  "screen.admin.finance.settlementsTracker.anyState": "أي حالة",
  "screen.admin.finance.settlementsTracker.openLabel": "مفتوحة",
  "screen.admin.finance.settlementsTracker.settledLabel": "مسوّاة",
  "screen.admin.finance.settlementsTracker.from": "من",
  "screen.admin.finance.settlementsTracker.to": "إلى",
  "screen.admin.finance.settlementsTracker.amount": "المبلغ",
  "screen.admin.finance.settlementsTracker.date": "التاريخ",
  "screen.admin.finance.settlementsTracker.state": "الحالة",
  "screen.admin.finance.settlementsTracker.action": "الإجراء",
  "screen.admin.finance.settlementsTracker.markSettlementFromToAs":
    "تعليم تسوية من {from} إلى {to} كمسوّاة",
  "screen.admin.finance.settlementsTracker.markSettled": "تعليم كمسوّاة",
  "screen.admin.finance.settlementsTracker.settlementsTracker": "متتبّع التسويات",
  "screen.admin.finance.settlementsTracker.amountsOwedBetweenOrganizationsSuppliers":
    "المبالغ المستحقة بين المؤسسات والمورّدين والمنصة، حتى تسويتها.",
  "screen.admin.finance.settlementsTracker.backToFinancialView": "العودة إلى العرض المالي",
  "screen.admin.finance.settlementsTracker.noSettlements": "لا تسويات",
  "screen.admin.finance.settlementsTracker.noAmountsAreOwedRight": "لا توجد مبالغ مستحقة الآن.",
  "screen.admin.finance.settlementsTracker.loadingTheSettlements": "جارٍ تحميل التسويات.",
  "screen.admin.finance.settlementsTracker.stateLabel": "الحالة",
  "screen.admin.finance.settlementsTracker.settlements": "التسويات",
  "screen.admin.finance.settlementsTracker.settlementsCaption": "التسويات",
  "screen.admin.finance.settlementsTracker.noSettlementsEmptyTitle": "لا تسويات",
  "screen.admin.finance.settlementsTracker.noAmountsAreOwedRightEmptyDescription":
    "لا توجد مبالغ مستحقة الآن.",
  "screen.admin.finance.settlementsTracker.markSettledTitle": "تعليم كمسوّاة",
  "screen.admin.finance.settlementsTracker.recordedPaymentReferenceRequired":
    "مرجع الدفع المسجَّل (مطلوب)",
  "screen.admin.finance.settlementsTracker.paymentReference": "[مرجع الدفع]",
  "screen.admin.finance.settlementsTracker.paymentDate": "تاريخ الدفع",
  "screen.admin.finance.settlementsTracker.yyyyMmDd": "YYYY-MM-DD",
  "screen.admin.finance.settlementsTracker.cancel": "إلغاء",
  "screen.admin.finance.settlementsTracker.markAsSettled": "تعليم كمسوّاة",
  // apps/web/src/screens/admin/home/admin-home.tsx
  "screen.admin.home.adminHome.queue": "القائمة",
  "screen.admin.home.adminHome.items": "العناصر",
  "screen.admin.home.adminHome.oldestItem": "أقدم عنصر",
  "screen.admin.home.adminHome.action": "الإجراء",
  "screen.admin.home.adminHome.open": "فتح {queue}",
  "screen.admin.home.adminHome.openQueue": "فتح القائمة",
  "screen.admin.home.adminHome.adminStaffAccounts": "حسابات موظفي الإدارة",
  "screen.admin.home.adminHome.subscriptionsAndOverrides": "الاشتراكات والتجاوزات",
  "screen.admin.home.adminHome.revenueDashboard": "لوحة الإيرادات",
  "screen.admin.home.adminHome.notificationTemplates": "قوالب الإشعارات",
  "screen.admin.home.adminHome.adminHome": "الرئيسية الإدارية",
  "screen.admin.home.adminHome.queuesThatNeedActionNow":
    "قوائم تحتاج إلى إجراء الآن. تُعلَّم الطلبات متأخرة بعد يومَي عمل.",
  "screen.admin.home.adminHome.allClear": "لا شيء معلّق",
  "screen.admin.home.adminHome.noQueueHasItemsThat": "لا توجد قائمة بها عناصر تحتاج إلى إجراء.",
  "screen.admin.home.adminHome.loadingTheQueues": "جارٍ تحميل القوائم.",
  "screen.admin.home.adminHome.theLabTestsQueueCould":
    "تعذّر تحميل قائمة التحاليل المخبرية. تُعرض القوائم الأخرى.",
  "screen.admin.home.adminHome.retryLabTests": "إعادة محاولة التحاليل المخبرية",
  "screen.admin.home.adminHome.queues": "القوائم",
  "screen.admin.home.adminHome.queuesThatNeedAction": "قوائم تحتاج إلى إجراء",
  "screen.admin.home.adminHome.allClearEmptyTitle": "لا شيء معلّق",
  "screen.admin.home.adminHome.noQueueHasItemsThatEmptyDescription":
    "لا توجد قائمة بها عناصر تحتاج إلى إجراء.",
  "screen.admin.home.adminHome.moreAreas": "أقسام أخرى",
  // apps/web/src/screens/admin/lab-tests/lab-test-detail-and-decision.tsx
  "screen.admin.labTests.labTestDetailAndDecision.resultUploaded": "تم رفع النتيجة",
  "screen.admin.labTests.labTestDetailAndDecision.testRequested": "طُلب التحليل",
  "screen.admin.labTests.labTestDetailAndDecision.resultUploadedByTheLab":
    "رفع شريك المختبر النتيجة",
  "screen.admin.labTests.labTestDetailAndDecision.decisionPassedOrFailed": "القرار: ناجح أو راسب",
  "screen.admin.labTests.labTestDetailAndDecision.labTestDetailAndDecision":
    "تفاصيل التحليل المخبري والقرار",
  "screen.admin.labTests.labTestDetailAndDecision.reviewTheResultAndDecide":
    "راجع النتيجة واتخذ القرار. يُدقَّق القراران.",
  "screen.admin.labTests.labTestDetailAndDecision.noResultYet": "لا نتيجة بعد",
  "screen.admin.labTests.labTestDetailAndDecision.theLabPartnerHasNot":
    "لم يرسل شريك المختبر نتيجة لهذا التحليل.",
  "screen.admin.labTests.labTestDetailAndDecision.loadingTheLabTest": "جارٍ تحميل التحليل المخبري.",
  "screen.admin.labTests.labTestDetailAndDecision.test": "التحليل",
  "screen.admin.labTests.labTestDetailAndDecision.driver": "السائق",
  "screen.admin.labTests.labTestDetailAndDecision.track": "التتبّع",
  "screen.admin.labTests.labTestDetailAndDecision.requested": "تاريخ الطلب",
  "screen.admin.labTests.labTestDetailAndDecision.deadline": "الموعد النهائي",
  "screen.admin.labTests.labTestDetailAndDecision.labResultReference": "مرجع نتيجة المختبر",
  "screen.admin.labTests.labTestDetailAndDecision.consentRecord": "سجل الموافقة",
  "screen.admin.labTests.labTestDetailAndDecision.openResultFile": "فتح ملف النتيجة",
  "screen.admin.labTests.labTestDetailAndDecision.openDriverAccount": "فتح حساب السائق",
  "screen.admin.labTests.labTestDetailAndDecision.timeline": "الخط الزمني",
  "screen.admin.labTests.labTestDetailAndDecision.labTestTimeline": "الخط الزمني للتحليل المخبري",
  "screen.admin.labTests.labTestDetailAndDecision.whatEachDecisionDoes": "ما يفعله كل قرار",
  "screen.admin.labTests.labTestDetailAndDecision.markPassedUnpausesTheDriver":
    "تعليم النتيجة ناجحة يرفع الإيقاف عن السائق. وتعليمها راسبة يُبقي الإيقاف ويفتح حالة.",
  "screen.admin.labTests.labTestDetailAndDecision.backToLabTests": "العودة إلى التحاليل المخبرية",
  "screen.admin.labTests.labTestDetailAndDecision.markFailed": "تعليم كراسب",
  "screen.admin.labTests.labTestDetailAndDecision.markPassed": "تعليم كناجح",
  // apps/web/src/screens/admin/lab-tests/lab-tests-queue.tsx
  "screen.admin.labTests.labTestsQueue.requested": "تاريخ الطلب",
  "screen.admin.labTests.labTestsQueue.pending": "قيد الانتظار",
  "screen.admin.labTests.labTestsQueue.resultUploaded": "تم رفع النتيجة",
  "screen.admin.labTests.labTestsQueue.passed": "ناجح",
  "screen.admin.labTests.labTestsQueue.failed": "فاشلة",
  "screen.admin.labTests.labTestsQueue.missed": "فائت",
  "screen.admin.labTests.labTestsQueue.overdue": "متأخر",
  "screen.admin.labTests.labTestsQueue.anyState": "أي حالة",
  "screen.admin.labTests.labTestsQueue.requestedLabel": "تاريخ الطلب",
  "screen.admin.labTests.labTestsQueue.pendingLabel": "قيد الانتظار",
  "screen.admin.labTests.labTestsQueue.resultUploadedLabel": "تم رفع النتيجة",
  "screen.admin.labTests.labTestsQueue.passedLabel": "ناجح",
  "screen.admin.labTests.labTestsQueue.failedLabel": "فاشلة",
  "screen.admin.labTests.labTestsQueue.missedLabel": "فائت",
  "screen.admin.labTests.labTestsQueue.driver": "السائق",
  "screen.admin.labTests.labTestsQueue.track": "التتبّع",
  "screen.admin.labTests.labTestsQueue.requestedHeader": "تاريخ الطلب",
  "screen.admin.labTests.labTestsQueue.deadline": "الموعد النهائي",
  "screen.admin.labTests.labTestsQueue.state": "الحالة",
  "screen.admin.labTests.labTestsQueue.overdueHeader": "متأخر",
  "screen.admin.labTests.labTestsQueue.notOverdue": "غير متأخر",
  "screen.admin.labTests.labTestsQueue.action": "الإجراء",
  "screen.admin.labTests.labTestsQueue.openLabTestFor": "فتح التحليل المخبري لـ {driver}",
  "screen.admin.labTests.labTestsQueue.openTest": "فتح التحليل",
  "screen.admin.labTests.labTestsQueue.labTestsQueue": "قائمة التحاليل المخبرية",
  "screen.admin.labTests.labTestsQueue.trackLabTestsByState":
    "تتبّع التحاليل المخبرية حسب الحالة والموعد النهائي.",
  "screen.admin.labTests.labTestsQueue.requestLabTest": "طلب تحليل مخبري",
  "screen.admin.labTests.labTestsQueue.openNextDueTest": "فتح التحليل المستحق التالي",
  "screen.admin.labTests.labTestsQueue.noLabTests": "لا توجد تحاليل مخبرية",
  "screen.admin.labTests.labTestsQueue.noLabTestsMatchThese":
    "لا توجد تحاليل مخبرية تطابق هذه التصفية.",
  "screen.admin.labTests.labTestsQueue.loadingTheLabTests": "جارٍ تحميل التحاليل المخبرية.",
  "screen.admin.labTests.labTestsQueue.overdueOnly": "المتأخرة فقط",
  "screen.admin.labTests.labTestsQueue.stateLabel": "الحالة",
  "screen.admin.labTests.labTestsQueue.labTests": "التحاليل المخبرية",
  "screen.admin.labTests.labTestsQueue.labTestsCaption": "التحاليل المخبرية",
  "screen.admin.labTests.labTestsQueue.noLabTestsEmptyTitle": "لا توجد تحاليل مخبرية",
  "screen.admin.labTests.labTestsQueue.noLabTestsMatchTheseEmptyDescription":
    "لا توجد تحاليل مخبرية تطابق هذه التصفية.",
  // apps/web/src/screens/admin/lab-tests/request-lab-test-decision.tsx
  "screen.admin.labTests.requestLabTestDecision.drugScreening": "فحص المخدرات",
  "screen.admin.labTests.requestLabTestDecision.medicalFitness": "اللياقة الطبية",
  "screen.admin.labTests.requestLabTestDecision.both": "كلاهما",
  "screen.admin.labTests.requestLabTestDecision.active": "نشط",
  "screen.admin.labTests.requestLabTestDecision.requestLabTestDecision": "طلب تحليل مخبري (قرار)",
  "screen.admin.labTests.requestLabTestDecision.requestALabTestFor":
    "اطلب تحليلًا مخبريًا لسائق. يوقف هذا السائق فورًا.",
  "screen.admin.labTests.requestLabTestDecision.noDriverSelected": "لم يُحدَّد أي سائق",
  "screen.admin.labTests.requestLabTestDecision.openADriverFromThe":
    "افتح سائقًا من الدليل قبل طلب التحليل المخبري.",
  "screen.admin.labTests.requestLabTestDecision.loadingTheDriver": "جارٍ تحميل السائق.",
  "screen.admin.labTests.requestLabTestDecision.driver": "السائق",
  "screen.admin.labTests.requestLabTestDecision.driverLabel": "السائق",
  "screen.admin.labTests.requestLabTestDecision.testRequest": "طلب التحليل",
  "screen.admin.labTests.requestLabTestDecision.testType": "نوع التحليل",
  "screen.admin.labTests.requestLabTestDecision.deadline": "الموعد النهائي",
  "screen.admin.labTests.requestLabTestDecision.between1And7Days":
    "بين يوم و7 أيام. الافتراضي 3 أيام (D-21).",
  "screen.admin.labTests.requestLabTestDecision.reasonForTheLabTest": "سبب التحليل المخبري (مطلوب)",
  "screen.admin.labTests.requestLabTestDecision.recordedWithTheRequestIn":
    "يُسجَّل مع الطلب في سجل التدقيق.",
  "screen.admin.labTests.requestLabTestDecision.requestTestAndPauseDriver":
    "طلب التحليل وإيقاف السائق",
  "screen.admin.labTests.requestLabTestDecision.pauseThisDriverNow": "إيقاف هذا السائق الآن؟",
  "screen.admin.labTests.requestLabTestDecision.theDriverIsPausedAt":
    "يُوقف السائق فورًا ولا يمكنه تنفيذ رحلات حتى تنجح النتيجة.",
  "screen.admin.labTests.requestLabTestDecision.requestTestAndPause": "طلب التحليل والإيقاف",
  "screen.admin.labTests.requestLabTestDecision.upcomingTripsReturnToOrganizers":
    "تعود الرحلات القادمة إلى المنظمين. تبقى أربعة إجراءات متاحة للسائق: حجز المختبر، ورفع النتيجة، والدعم، وتسجيل الخروج.",
  "screen.admin.labTests.requestLabTestDecision.cancel": "إلغاء",
  "screen.admin.labTests.requestLabTestDecision.effectOnTheDriver": "الأثر على السائق",
  "screen.admin.labTests.requestLabTestDecision.theDriverIsPausedAt2":
    "يُوقف السائق فورًا. تبقى الإجراءات الأربعة المسموح بها فقط متاحة. تعود الرحلات القادمة إلى المنظمين. تُطبَّق المراجعة القانونية لكل سوق (NFR-COM-05).",
  // apps/web/src/screens/admin/operations/operations-health-dashboard.tsx
  "screen.admin.operations.operationsHealthDashboard.lastHour": "آخر ساعة",
  "screen.admin.operations.operationsHealthDashboard.last24Hours": "آخر 24 ساعة",
  "screen.admin.operations.operationsHealthDashboard.last7Days": "آخر 7 أيام",
  "screen.admin.operations.operationsHealthDashboard.channel": "القناة",
  "screen.admin.operations.operationsHealthDashboard.delivered": "تم التسليم",
  "screen.admin.operations.operationsHealthDashboard.failed": "فاشلة",
  "screen.admin.operations.operationsHealthDashboard.deliveryRate": "معدل التسليم",
  "screen.admin.operations.operationsHealthDashboard.operationsHealthDashboard":
    "لوحة صحة العمليات",
  "screen.admin.operations.operationsHealthDashboard.tripOperationsPaymentSuccessAnd":
    "عمليات الرحلات ومعدلات نجاح وفشل الدفع وتسليم الإشعارات حسب القناة.",
  "screen.admin.operations.operationsHealthDashboard.noData": "لا بيانات",
  "screen.admin.operations.operationsHealthDashboard.noOperationsDataIsAvailable":
    "لا تتوفر بيانات عمليات للنطاق المحدد.",
  "screen.admin.operations.operationsHealthDashboard.loadingTheOperationsData":
    "جارٍ تحميل بيانات العمليات.",
  "screen.admin.operations.operationsHealthDashboard.timeRange": "النطاق الزمني",
  "screen.admin.operations.operationsHealthDashboard.paymentSuccessRate": "معدل نجاح الدفع",
  "screen.admin.operations.operationsHealthDashboard.paymentFailureRate": "معدل فشل الدفع",
  "screen.admin.operations.operationsHealthDashboard.liveTrips": "الرحلات الجارية",
  "screen.admin.operations.operationsHealthDashboard.checkInEvents": "أحداث تسجيل الحضور",
  "screen.admin.operations.operationsHealthDashboard.notificationsDelivered": "الإشعارات المسلَّمة",
  "screen.admin.operations.operationsHealthDashboard.allChannels": "كل القنوات",
  "screen.admin.operations.operationsHealthDashboard.paymentSuccessAndFailure": "نجاح الدفع وفشله",
  "screen.admin.operations.operationsHealthDashboard.paymentSuccessAndFailureOver":
    "نجاح الدفع وفشله خلال النطاق المحدد",
  "screen.admin.operations.operationsHealthDashboard.notificationDeliveryByChannel":
    "تسليم الإشعارات حسب القناة",
  "screen.admin.operations.operationsHealthDashboard.notificationDeliveryByChannelCaption":
    "تسليم الإشعارات حسب القناة",
  "screen.admin.operations.operationsHealthDashboard.noDeliveryData": "لا بيانات تسليم",
  "screen.admin.operations.operationsHealthDashboard.noNotificationsWereSentIn":
    "لم تُرسل أي إشعارات في النطاق المحدد.",
  "screen.admin.operations.operationsHealthDashboard.criticalAlertsGoToOn":
    "تذهب التنبيهات الحرجة إلى فريق المناوبة (NFR-OBS-04). هذه اللوحة لا تُغني عن التنبيهات.",
  // apps/web/src/screens/admin/plans/plan-editor.tsx
  "screen.admin.plans.planEditor.planEditor": "محرّر الخطة",
  "screen.admin.plans.planEditor.editOnePlanSLimits":
    "حرّر حدود خطة واحدة وميزاتها وأسعارها وفترتها التجريبية.",
  "screen.admin.plans.planEditor.noPlanLoaded": "لم تُحمَّل أي خطة",
  "screen.admin.plans.planEditor.chooseARoleAndA": "اختر دورًا وفئة للتعديل من الدليل.",
  "screen.admin.plans.planEditor.loadingThePlan": "جارٍ تحميل الخطة.",
  "screen.admin.plans.planEditor.plan": "الخطة",
  "screen.admin.plans.planEditor.role": "الدور",
  "screen.admin.plans.planEditor.tierName": "اسم الفئة",
  "screen.admin.plans.planEditor.tierNamePlaceholder": "[اسم الفئة]",
  "screen.admin.plans.planEditor.limitsAndFeatures": "الحدود والميزات",
  "screen.admin.plans.planEditor.limits": "الحدود",
  "screen.admin.plans.planEditor.limitValues": "[قيم الحدود]",
  "screen.admin.plans.planEditor.valuesComeFromTheBrd": "القيم مأخوذة من جداول BRD 5.1.",
  "screen.admin.plans.planEditor.featureFlag1": "[علم الميزة 1]",
  "screen.admin.plans.planEditor.featureFlag2": "[علم الميزة 2]",
  "screen.admin.plans.planEditor.pricesAndTrial": "الأسعار والفترة التجريبية",
  "screen.admin.plans.planEditor.monthlyPrice": "السعر الشهري",
  "screen.admin.plans.planEditor.amount": "[المبلغ]",
  "screen.admin.plans.planEditor.currency": "العملة",
  "screen.admin.plans.planEditor.currencyCode": "[رمز العملة]",
  "screen.admin.plans.planEditor.annualPrice": "السعر السنوي",
  "screen.admin.plans.planEditor.amountPlaceholder": "[المبلغ]",
  "screen.admin.plans.planEditor.annualDiscount": "الخصم السنوي (%)",
  "screen.admin.plans.planEditor.placeholderFinanceSetsThisValue":
    "قيمة مؤقتة. تحددها المالية (D-16).",
  "screen.admin.plans.planEditor.trialLengthDays": "مدة الفترة التجريبية (أيام)",
  "screen.admin.plans.planEditor.days": "[أيام]",
  "screen.admin.plans.planEditor.gracePeriodDays": "فترة السماح (أيام)",
  "screen.admin.plans.planEditor.setTo7DaysD": "مضبوطة على 7 أيام (D-08).",
  "screen.admin.plans.planEditor.whenChangesApply": "متى تُطبَّق التغييرات",
  "screen.admin.plans.planEditor.savedChangesApplyToNew":
    "تُطبَّق التغييرات المحفوظة على الإجراءات الجديدة فورًا. يُحدَّد أثرها على العناصر القائمة في D-144. الأسعار من دليل الخطط.",
  "screen.admin.plans.planEditor.save": "حفظ",
  "screen.admin.plans.planEditor.cancel": "إلغاء",
  "screen.admin.plans.planEditor.savePlan": "حفظ الخطة",
  "screen.admin.plans.planEditor.validationErrorsAppearNextTo":
    "تظهر أخطاء التحقق بجانب الحقل الذي يحتاج إلى تصحيح.",
  // apps/web/src/screens/admin/plans/plans-catalog.tsx
  "screen.admin.plans.plansCatalog.active": "نشط",
  "screen.admin.plans.plansCatalog.draft": "مسودة",
  "screen.admin.plans.plansCatalog.organization": "المؤسسة",
  "screen.admin.plans.plansCatalog.platformDriver": "سائق المنصة",
  "screen.admin.plans.plansCatalog.platformPhotographer": "مصور المنصة",
  "screen.admin.plans.plansCatalog.traveler": "المسافر",
  "screen.admin.plans.plansCatalog.tier": "الفئة",
  "screen.admin.plans.plansCatalog.status": "الحالة",
  "screen.admin.plans.plansCatalog.activeSubscriptions": "الاشتراكات النشطة",
  "screen.admin.plans.plansCatalog.action": "الإجراء",
  "screen.admin.plans.plansCatalog.editPlan": "تعديل خطة {tier}",
  "screen.admin.plans.plansCatalog.editPlan2": "تعديل الخطة",
  "screen.admin.plans.plansCatalog.plansCatalog": "دليل الخطط",
  "screen.admin.plans.plansCatalog.plansForEachRoleBy": "خطط كل دور، حسب الفئة.",
  "screen.admin.plans.plansCatalog.subscriptionsAndOverrides": "الاشتراكات والتجاوزات",
  "screen.admin.plans.plansCatalog.createTier": "إنشاء فئة",
  "screen.admin.plans.plansCatalog.noPlansForThisRole": "لا توجد خطط لهذا الدور",
  "screen.admin.plans.plansCatalog.createTheFirstTierFor": "أنشئ أول فئة لهذا الدور.",
  "screen.admin.plans.plansCatalog.loadingThePlans": "جارٍ تحميل الخطط.",
  "screen.admin.plans.plansCatalog.role": "الدور",
  "screen.admin.plans.plansCatalog.tiers": "الفئات",
  "screen.admin.plans.plansCatalog.plansForThisRole": "خطط هذا الدور",
  "screen.admin.plans.plansCatalog.noPlansForThisRoleEmptyTitle": "لا توجد خطط لهذا الدور",
  "screen.admin.plans.plansCatalog.createTheFirstTierForEmptyDescription":
    "أنشئ أول فئة لهذا الدور.",
  // apps/web/src/screens/admin/plans/subscriptions-and-overrides.tsx
  "screen.admin.plans.subscriptionsAndOverrides.active": "نشط",
  "screen.admin.plans.subscriptionsAndOverrides.pastDueGraceShown": "متأخر السداد (مع فترة السماح)",
  "screen.admin.plans.subscriptionsAndOverrides.cancelled": "ملغى",
  "screen.admin.plans.subscriptionsAndOverrides.allRoles": "كل الأدوار",
  "screen.admin.plans.subscriptionsAndOverrides.allPlans": "كل الخطط",
  "screen.admin.plans.subscriptionsAndOverrides.anyBillingStatus": "أي حالة فوترة",
  "screen.admin.plans.subscriptionsAndOverrides.activeLabel": "نشط",
  "screen.admin.plans.subscriptionsAndOverrides.pastDue": "متأخر السداد",
  "screen.admin.plans.subscriptionsAndOverrides.cancelledLabel": "ملغى",
  "screen.admin.plans.subscriptionsAndOverrides.selectAPlan": "اختر خطة",
  "screen.admin.plans.subscriptionsAndOverrides.planName": "[اسم الخطة]",
  "screen.admin.plans.subscriptionsAndOverrides.account": "الحساب",
  "screen.admin.plans.subscriptionsAndOverrides.role": "الدور",
  "screen.admin.plans.subscriptionsAndOverrides.plan": "الخطة",
  "screen.admin.plans.subscriptionsAndOverrides.billingStatus": "حالة الفوترة",
  "screen.admin.plans.subscriptionsAndOverrides.renewalDate": "تاريخ التجديد",
  "screen.admin.plans.subscriptionsAndOverrides.action": "الإجراء",
  "screen.admin.plans.subscriptionsAndOverrides.open": "فتح {account}",
  "screen.admin.plans.subscriptionsAndOverrides.openAccount": "فتح الحساب",
  "screen.admin.plans.subscriptionsAndOverrides.subscriptionsAndOverrides": "الاشتراكات والتجاوزات",
  "screen.admin.plans.subscriptionsAndOverrides.findSubscriptionsAndGrantRevoke":
    "ابحث عن الاشتراكات وامنح خطة أو اسحبها أو غيّرها لحساب واحد.",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptions": "لا اشتراكات",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsMatchTheseFilters":
    "لا اشتراكات تطابق هذه التصفية.",
  "screen.admin.plans.subscriptionsAndOverrides.loadingTheSubscriptions": "جارٍ تحميل الاشتراكات.",
  "screen.admin.plans.subscriptionsAndOverrides.roleLabel": "الدور",
  "screen.admin.plans.subscriptionsAndOverrides.planLabel": "الخطة",
  "screen.admin.plans.subscriptionsAndOverrides.billingStatusLabel": "حالة الفوترة",
  "screen.admin.plans.subscriptionsAndOverrides.renewalBefore": "التجديد قبل",
  "screen.admin.plans.subscriptionsAndOverrides.yyyyMmDd": "YYYY-MM-DD",
  "screen.admin.plans.subscriptionsAndOverrides.subscriptions": "الاشتراكات",
  "screen.admin.plans.subscriptionsAndOverrides.subscriptionsCaption": "الاشتراكات",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsEmptyTitle": "لا اشتراكات",
  "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsMatchTheseFiltersEmptyDescription":
    "لا اشتراكات تطابق هذه التصفية.",
  "screen.admin.plans.subscriptionsAndOverrides.overridePlanForOneAccount":
    "تجاوز الخطة لحساب واحد",
  "screen.admin.plans.subscriptionsAndOverrides.accountLabel": "الحساب",
  "screen.admin.plans.subscriptionsAndOverrides.accountNameOrReference": "[اسم الحساب أو مرجعه]",
  "screen.admin.plans.subscriptionsAndOverrides.plan2": "الخطة",
  "screen.admin.plans.subscriptionsAndOverrides.reasonRequired": "السبب (مطلوب)",
  "screen.admin.plans.subscriptionsAndOverrides.reasonForTheOverride": "[سبب التجاوز]",
  "screen.admin.plans.subscriptionsAndOverrides.endDate": "تاريخ الانتهاء",
  "screen.admin.plans.subscriptionsAndOverrides.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.admin.plans.subscriptionsAndOverrides.beforeYouSave": "قبل الحفظ",
  "screen.admin.plans.subscriptionsAndOverrides.anOverrideAppliesAtOnce":
    "يُطبَّق التجاوز فورًا ويُدقَّق. تُعرض التعارضات مع الفوترة قبل الحفظ (D-227).",
  "screen.admin.plans.subscriptionsAndOverrides.cancel": "إلغاء",
  "screen.admin.plans.subscriptionsAndOverrides.saveOverride": "حفظ التجاوز",
  // apps/web/src/screens/admin/platform/audit-log.tsx
  "screen.admin.platform.auditLog.last24Hours": "آخر 24 ساعة",
  "screen.admin.platform.auditLog.last7Days": "آخر 7 أيام",
  "screen.admin.platform.auditLog.last30Days": "آخر 30 يومًا",
  "screen.admin.platform.auditLog.customRange": "نطاق مخصص",
  "screen.admin.platform.auditLog.anyAction": "أي إجراء",
  "screen.admin.platform.auditLog.time": "الوقت",
  "screen.admin.platform.auditLog.actor": "المنفّذ",
  "screen.admin.platform.auditLog.action": "الإجراء",
  "screen.admin.platform.auditLog.target": "الهدف",
  "screen.admin.platform.auditLog.before": "قبل",
  "screen.admin.platform.auditLog.after": "بعد",
  "screen.admin.platform.auditLog.requestId": "معرّف الطلب",
  "screen.admin.platform.auditLog.auditLog": "سجل التدقيق",
  "screen.admin.platform.auditLog.everyAdminActionAndPermission":
    "كل إجراء إداري وتغيير صلاحيات. للقراءة فقط.",
  "screen.admin.platform.auditLog.noEntries": "لا توجد قيود",
  "screen.admin.platform.auditLog.noAuditEntriesMatchThese": "لا توجد قيود تدقيق تطابق هذه التصفية.",
  "screen.admin.platform.auditLog.loadingTheAuditEntries": "جارٍ تحميل قيود التدقيق.",
  "screen.admin.platform.auditLog.readOnly": "للقراءة فقط",
  "screen.admin.platform.auditLog.entriesCannotBeEditedOr":
    "لا يمكن تعديل القيود أو حذفها. يُحفظ السجل لمدة 7 سنوات (D-04).",
  "screen.admin.platform.auditLog.actorLabel": "المنفّذ",
  "screen.admin.platform.auditLog.nameOrEmail": "الاسم أو البريد الإلكتروني",
  "screen.admin.platform.auditLog.clearActor": "مسح المنفّذ",
  "screen.admin.platform.auditLog.actionLabel": "الإجراء",
  "screen.admin.platform.auditLog.targetLabel": "الهدف",
  "screen.admin.platform.auditLog.nameOrReference": "الاسم أو المرجع",
  "screen.admin.platform.auditLog.clearTarget": "مسح الهدف",
  "screen.admin.platform.auditLog.timeRange": "النطاق الزمني",
  "screen.admin.platform.auditLog.entries": "القيود",
  "screen.admin.platform.auditLog.auditLogEntries": "قيود سجل التدقيق",
  "screen.admin.platform.auditLog.noEntriesEmptyTitle": "لا توجد قيود",
  "screen.admin.platform.auditLog.noAuditEntriesMatchTheseEmptyDescription":
    "لا توجد قيود تدقيق تطابق هذه التصفية.",
  // apps/web/src/screens/admin/platform/feature-flags-and-platform-configuration.tsx
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.stripeInternational":
    "Stripe (الدولي)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.paymobLocalMena":
    "Paymob (الشرق الأوسط المحلي)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.tapLocalMena":
    "Tap (الشرق الأوسط المحلي)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.fawryCashInEgypt":
    "Fawry (الدفع النقدي في مصر)",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagsAndPlatformConfiguration":
    "أعلام الميزات وإعدادات المنصة",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.turnFeaturesOnOrOff":
    "شغّل الميزات أو أوقفها حسب المرحلة، واضبط إعدادات المنصة.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.saveConfiguration": "حفظ الإعدادات",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.noFeatureFlags": "لا توجد أعلام ميزات",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.noFeatureFlagsAreDefined":
    "لا توجد أعلام ميزات محددة لهذه المرحلة.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.loadingTheConfiguration":
    "جارٍ تحميل الإعدادات.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlags": "أعلام الميزات",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.aFlagChangeAppliesTo":
    "يُطبَّق تغيير العلم على كل المستخدمين فورًا ويُدقَّق.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagName": "[اسم علم الميزة]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.phasePhase": "المرحلة: [المرحلة]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagNameLabel":
    "[اسم علم الميزة]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.phasePhase2": "المرحلة: [المرحلة]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.paymentGatewayByMarket":
    "بوابة الدفع حسب السوق",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.market": "السوق",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.marketCode": "[رمز السوق]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.gateway": "البوابة",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.stripeForInternationalPaymentsPaymob":
    "Stripe للمدفوعات الدولية. Paymob أو Tap للشرق الأوسط المحلي. Fawry للدفع النقدي في مصر. يُؤكَّد اختيار كل سوق عند الإطلاق (D-12).",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.otpAndSessionPolicy":
    "سياسة الرموز والجلسات",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.otpPolicy": "سياسة الرموز",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.editabilityIsUnderReviewD":
    "قابلية التعديل قيد المراجعة (D-288).",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.sessionPolicy": "سياسة الجلسات",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.editabilityIsUnderReviewDSupportingText":
    "قابلية التعديل قيد المراجعة (D-288).",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.quietHours": "ساعات الهدوء",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentCategories": "الفئات العاجلة",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentNotificationCategories":
    "[فئات الإشعارات العاجلة]",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.setByD288": "محددة بـ D-288.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.audit": "التدقيق",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.everyChangeOnThisPage":
    "كل تغيير في هذه الصفحة يُسجَّل في سجل التدقيق.",
  "screen.admin.platform.featureFlagsAndPlatformConfiguration.cancel": "إلغاء",
  // apps/web/src/screens/admin/platform/notification-templates.tsx
  "screen.admin.platform.notificationTemplates.published": "منشور",
  "screen.admin.platform.notificationTemplates.translationMissing": "الترجمة مفقودة",
  "screen.admin.platform.notificationTemplates.allLanguages": "كل اللغات",
  "screen.admin.platform.notificationTemplates.english": "الإنجليزية",
  "screen.admin.platform.notificationTemplates.arabic": "العربية",
  "screen.admin.platform.notificationTemplates.englishLabel": "الإنجليزية",
  "screen.admin.platform.notificationTemplates.arabicLabel": "العربية",
  "screen.admin.platform.notificationTemplates.category": "الفئة",
  "screen.admin.platform.notificationTemplates.language": "اللغة",
  "screen.admin.platform.notificationTemplates.version": "الإصدار",
  "screen.admin.platform.notificationTemplates.status": "الحالة",
  "screen.admin.platform.notificationTemplates.action": "الإجراء",
  "screen.admin.platform.notificationTemplates.editIn": "تعديل {category} باللغة {language}",
  "screen.admin.platform.notificationTemplates.edit": "تعديل",
  "screen.admin.platform.notificationTemplates.notificationTemplates": "قوالب الإشعارات",
  "screen.admin.platform.notificationTemplates.editNotificationTextByCategory":
    "حرّر نص الإشعار حسب الفئة واللغة. كل حفظ ينشئ إصدارًا جديدًا.",
  "screen.admin.platform.notificationTemplates.noTemplates": "لا توجد قوالب",
  "screen.admin.platform.notificationTemplates.noTemplatesMatchTheseFilters":
    "لا توجد قوالب تطابق هذه التصفية.",
  "screen.admin.platform.notificationTemplates.loadingTheTemplates": "جارٍ تحميل القوالب.",
  "screen.admin.platform.notificationTemplates.categoryLabel": "الفئة",
  "screen.admin.platform.notificationTemplates.categoryName": "اسم الفئة",
  "screen.admin.platform.notificationTemplates.clearCategory": "مسح الفئة",
  "screen.admin.platform.notificationTemplates.languageLabel": "اللغة",
  "screen.admin.platform.notificationTemplates.templates": "القوالب",
  "screen.admin.platform.notificationTemplates.notificationTemplatesCaption": "قوالب الإشعارات",
  "screen.admin.platform.notificationTemplates.noTemplatesEmptyTitle": "لا توجد قوالب",
  "screen.admin.platform.notificationTemplates.noTemplatesMatchTheseFiltersEmptyDescription":
    "لا توجد قوالب تطابق هذه التصفية.",
  "screen.admin.platform.notificationTemplates.editTemplate": "تعديل القالب",
  "screen.admin.platform.notificationTemplates.language2": "اللغة",
  "screen.admin.platform.notificationTemplates.messageText": "نص الرسالة",
  "screen.admin.platform.notificationTemplates.messageTextPlaceholder": "[نص الرسالة]",
  "screen.admin.platform.notificationTemplates.useThePlaceholdersFromThe":
    "استخدم عناصر {variable} من دليل القوالب.",
  "screen.admin.platform.notificationTemplates.preview": "معاينة",
  "screen.admin.platform.notificationTemplates.englishPreview": "معاينة إنجليزية",
  "screen.admin.platform.notificationTemplates.englishPreviewOfTheMessage":
    "[معاينة إنجليزية للرسالة]",
  "screen.admin.platform.notificationTemplates.arabicPreview": "معاينة عربية",
  "screen.admin.platform.notificationTemplates.arabicPreviewOfTheMessage": "[معاينة عربية للرسالة]",
  "screen.admin.platform.notificationTemplates.saveAsNewVersion": "حفظ كإصدار جديد",
  "screen.admin.platform.notificationTemplates.publish": "نشر",
  "screen.admin.platform.notificationTemplates.earlierMessagesKeepTheVersion":
    "تحتفظ الرسائل السابقة بالإصدار الذي أُرسلت به.",
  // apps/web/src/screens/admin/trips/trip-oversight.tsx
  "screen.admin.trips.tripOversight.planned": "مخطط لها",
  "screen.admin.trips.tripOversight.inProgress": "قيد التنفيذ",
  "screen.admin.trips.tripOversight.allStates": "كل الحالات",
  "screen.admin.trips.tripOversight.plannedLabel": "مخطط لها",
  "screen.admin.trips.tripOversight.inProgressLabel": "قيد التنفيذ",
  "screen.admin.trips.tripOversight.completed": "مكتملة",
  "screen.admin.trips.tripOversight.cancelled": "ملغى",
  "screen.admin.trips.tripOversight.organization": "المؤسسة",
  "screen.admin.trips.tripOversight.trip": "الرحلة",
  "screen.admin.trips.tripOversight.state": "الحالة",
  "screen.admin.trips.tripOversight.dates": "التواريخ",
  "screen.admin.trips.tripOversight.staffingGaps": "نواقص الطواقم",
  "screen.admin.trips.tripOversight.actions": "الإجراءات",
  "screen.admin.trips.tripOversight.openTrip": "فتح الرحلة {trip}",
  "screen.admin.trips.tripOversight.openTrip2": "فتح الرحلة",
  "screen.admin.trips.tripOversight.cancelTrip": "إلغاء الرحلة {trip}",
  "screen.admin.trips.tripOversight.cancelTrip2": "إلغاء الرحلة",
  "screen.admin.trips.tripOversight.tripOversight": "الإشراف على الرحلات",
  "screen.admin.trips.tripOversight.seeAnyTripAcrossOrganizations":
    "اطّلع على أي رحلة عبر المؤسسات وتصرّف عند الحاجة.",
  "screen.admin.trips.tripOversight.noTrips": "لا توجد رحلات",
  "screen.admin.trips.tripOversight.noTripsMatchTheseFilters": "لا توجد رحلات تطابق هذه التصفية.",
  "screen.admin.trips.tripOversight.loadingTheTrips": "جارٍ تحميل الرحلات.",
  "screen.admin.trips.tripOversight.tripsInProgress": "رحلات قيد التنفيذ",
  "screen.admin.trips.tripOversight.aTripInProgressCannot":
    "لا يمكن إلغاء رحلة قيد التنفيذ هنا. استخدم معالجة الحوادث فقط (D-25).",
  "screen.admin.trips.tripOversight.tripOrOrganization": "الرحلة أو المؤسسة",
  "screen.admin.trips.tripOversight.tripOrOrganizationPlaceholder": "الرحلة أو المؤسسة",
  "screen.admin.trips.tripOversight.clearSearch": "مسح البحث",
  "screen.admin.trips.tripOversight.stateLabel": "الحالة",
  "screen.admin.trips.tripOversight.trips": "الرحلات",
  "screen.admin.trips.tripOversight.tripOversightCaption": "الإشراف على الرحلات",
  "screen.admin.trips.tripOversight.noTripsEmptyTitle": "لا توجد رحلات",
  "screen.admin.trips.tripOversight.noTripsMatchTheseFiltersEmptyDescription":
    "لا توجد رحلات تطابق هذه التصفية.",
  "screen.admin.trips.tripOversight.cancelTripDecision": "إلغاء الرحلة (قرار)",
  "screen.admin.trips.tripOversight.tripReferenceRequired": "مرجع الرحلة (مطلوب)",
  "screen.admin.trips.tripOversight.tripReference": "[مرجع الرحلة]",
  "screen.admin.trips.tripOversight.reasonForCancellingRequired": "سبب الإلغاء (مطلوب)",
  "screen.admin.trips.tripOversight.recordedInTheAuditLog":
    "يُسجَّل في سجل التدقيق. تتبع استردادات الحجوزات المدفوعة عملية الإلغاء.",
  "screen.admin.trips.tripOversight.cancelTripSubmitLabel": "إلغاء الرحلة",
  "screen.admin.trips.tripOversight.cancelThisTrip": "إلغاء هذه الرحلة؟",
  "screen.admin.trips.tripOversight.refundsForPaidBookingsAre":
    "تُدرَج استردادات الحجوزات المدفوعة. يُدقَّق الإلغاء.",
  "screen.admin.trips.tripOversight.cancelTripConfirmLabel": "إلغاء الرحلة",
  "screen.admin.trips.tripOversight.keepTrip": "الإبقاء على الرحلة",
  // apps/web/src/screens/organization/accounting/ledger-and-exports.tsx
  "screen.organization.accounting.ledgerAndExports.title": "دفتر الأستاذ",
  "screen.organization.accounting.ledgerAndExports.caption":
    "كل حدث مالي مع الحجز أو الصفقة المرتبطة ومرجع بوابة الدفع",
  "screen.organization.accounting.ledgerAndExports.exportCsv": "تصدير CSV",
  "screen.organization.accounting.ledgerAndExports.exportPdf": "تصدير PDF",
  "screen.organization.accounting.ledgerAndExports.pdfExportIsOnEnterprise":
    "تصدير PDF متاح في باقة المؤسسات. يمكن لباقتك التصدير بصيغة CSV.",
  "screen.organization.accounting.ledgerAndExports.period": "الفترة",
  "screen.organization.accounting.ledgerAndExports.allTime": "كل الفترات",
  "screen.organization.accounting.ledgerAndExports.thisMonth": "هذا الشهر",
  "screen.organization.accounting.ledgerAndExports.last30Days": "آخر 30 يومًا",
  "screen.organization.accounting.ledgerAndExports.thisYear": "هذا العام",
  "screen.organization.accounting.ledgerAndExports.eventTypeFilter": "نوع الحدث",
  "screen.organization.accounting.ledgerAndExports.allEvents": "كل الأحداث",
  "screen.organization.accounting.ledgerAndExports.bookingOrDealReference": "مرجع الحجز أو الصفقة",
  "screen.organization.accounting.ledgerAndExports.date": "التاريخ",
  "screen.organization.accounting.ledgerAndExports.eventType": "نوع الحدث",
  "screen.organization.accounting.ledgerAndExports.amount": "المبلغ",
  "screen.organization.accounting.ledgerAndExports.currency": "العملة",
  "screen.organization.accounting.ledgerAndExports.linkedBookingOrDeal": "الحجز أو الصفقة المرتبطة",
  "screen.organization.accounting.ledgerAndExports.gatewayReference": "مرجع بوابة الدفع",
  "screen.organization.accounting.ledgerAndExports.notApplicable": "لا ينطبق",
  "screen.organization.accounting.ledgerAndExports.bookingPaid": "دفع حجز",
  "screen.organization.accounting.ledgerAndExports.refundIssued": "صرف استرداد",
  "screen.organization.accounting.ledgerAndExports.supplierCost": "تكلفة مورد",
  "screen.organization.accounting.ledgerAndExports.platformCommission": "عمولة المنصة",
  "screen.organization.accounting.ledgerAndExports.payoutSettlement": "تسوية دفعة",
  "screen.organization.accounting.ledgerAndExports.noLedgerLines": "لا توجد قيود في الدفتر بعد",
  "screen.organization.accounting.ledgerAndExports.noMatchingLines":
    "لا توجد قيود تطابق عوامل التصفية هذه",
  "screen.organization.accounting.ledgerAndExports.eachEventsEntriesBalance":
    "قيود كل حدث متوازنة. ويطابق إجمالي التصدير بعوامل التصفية نفسها إجمالي هذه القائمة.",
  // apps/web/src/screens/organization/accounting/settlements.tsx
  "screen.organization.accounting.settlements.title": "التسويات",
  "screen.organization.accounting.settlements.caption":
    "المبالغ المستحقة بين مؤسستك والموردين والمنصة حتى تسويتها",
  "screen.organization.accounting.settlements.providerPayoutsRunWeekly":
    "تُصرف مستحقات مقدمي الخدمة أسبوعيًا",
  "screen.organization.accounting.settlements.payoutsAreMadeEveryMonday":
    "يتم الصرف كل يوم اثنين الساعة 06:00.",
  "screen.organization.accounting.settlements.openAmountsOwed": "المبالغ المستحقة المفتوحة",
  "screen.organization.accounting.settlements.openItems": "البنود المفتوحة",
  "screen.organization.accounting.settlements.filterByState": "تصفية التسويات حسب الحالة",
  "screen.organization.accounting.settlements.open": "مفتوحة",
  "screen.organization.accounting.settlements.settled": "مُسوّاة",
  "screen.organization.accounting.settlements.all": "الكل",
  "screen.organization.accounting.settlements.counterparty": "الطرف المقابل",
  "screen.organization.accounting.settlements.amount": "المبلغ",
  "screen.organization.accounting.settlements.state": "الحالة",
  "screen.organization.accounting.settlements.date": "التاريخ",
  "screen.organization.accounting.settlements.platform": "المنصة",
  "screen.organization.accounting.settlements.noSettlements": "لا توجد تسويات في هذا العرض",
  // apps/web/src/screens/organization/accounting/trip-accounting.tsx
  "screen.organization.accounting.tripAccounting.title": "محاسبة الرحلة",
  "screen.organization.accounting.tripAccounting.caption": "خمسة بنود محاسبية لرحلة واحدة · {trip}",
  "screen.organization.accounting.tripAccounting.trip": "الرحلة",
  "screen.organization.accounting.tripAccounting.noTrips": "لا توجد رحلات بعد",
  "screen.organization.accounting.tripAccounting.openLedger": "فتح دفتر الأستاذ",
  "screen.organization.accounting.tripAccounting.baseRevenue": "الإيراد الأساسي",
  "screen.organization.accounting.tripAccounting.programRevenue": "إيراد البرامج",
  "screen.organization.accounting.tripAccounting.couponImpact": "أثر القسائم",
  "screen.organization.accounting.tripAccounting.supplierCosts": "تكاليف الموردين",
  "screen.organization.accounting.tripAccounting.gatewayFees": "رسوم بوابة الدفع",
  "screen.organization.accounting.tripAccounting.reconciliationWithTheLedger":
    "المطابقة مع دفتر الأستاذ",
  "screen.organization.accounting.tripAccounting.reconciled": "مطابَق",
  "screen.organization.accounting.tripAccounting.differencesFound": "توجد فروق",
  "screen.organization.accounting.tripAccounting.line": "البند",
  "screen.organization.accounting.tripAccounting.tripTotal": "إجمالي الرحلة",
  "screen.organization.accounting.tripAccounting.ledgerTotal": "إجمالي الدفتر",
  "screen.organization.accounting.tripAccounting.difference": "الفرق",
  "screen.organization.accounting.tripAccounting.growthShowsAdvancedAccounting":
    "باقة النمو تعرض المحاسبة المتقدمة",
  "screen.organization.accounting.tripAccounting.enterpriseShowsTheFullDetail":
    "باقة المؤسسات تعرض التفاصيل الكاملة لكل بند.",
  // apps/web/src/screens/organization/billing/billing-parts.tsx
  "screen.organization.billing.billingParts.nOfLimit": "{n} من {limit}",
  "screen.organization.billing.billingParts.unlimited": "غير محدود",
  // apps/web/src/screens/organization/billing/invoices-list.tsx
  "screen.organization.billing.invoicesList.title": "الفواتير",
  "screen.organization.billing.invoicesList.caption": "الفواتير التي أصدرتها مؤسستك",
  "screen.organization.billing.invoicesList.issueInvoice": "إصدار فاتورة",
  "screen.organization.billing.invoicesList.filterByBuyerType": "تصفية الفواتير حسب نوع المشتري",
  "screen.organization.billing.invoicesList.all": "الكل",
  "screen.organization.billing.invoicesList.businessB2b": "شركات (B2B)",
  "screen.organization.billing.invoicesList.consumerB2c": "أفراد (B2C)",
  "screen.organization.billing.invoicesList.number": "الرقم",
  "screen.organization.billing.invoicesList.type": "النوع",
  "screen.organization.billing.invoicesList.buyer": "المشتري",
  "screen.organization.billing.invoicesList.amount": "المبلغ",
  "screen.organization.billing.invoicesList.status": "الحالة",
  "screen.organization.billing.invoicesList.action": "الإجراء",
  "screen.organization.billing.invoicesList.b2b": "B2B",
  "screen.organization.billing.invoicesList.b2c": "B2C",
  "screen.organization.billing.invoicesList.issued": "صادرة",
  "screen.organization.billing.invoicesList.openInvoice": "فتح الفاتورة",
  "screen.organization.billing.invoicesList.noInvoicesYet": "لا توجد فواتير بعد",
  "screen.organization.billing.invoicesList.noMatchingInvoices": "لا توجد فواتير من هذا النوع",
  "screen.organization.billing.invoicesList.issueAnInvoiceForA": "أصدر فاتورة لرحلة أو حجز.",
  // apps/web/src/screens/organization/billing/issue-invoice-b2b-or-b2c.tsx
  "screen.organization.billing.issueInvoiceB2bOrB2c.title": "إصدار فاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.caption": "لرحلة أو حجز · {trip}",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoice": "إصدار الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addTheBuyerName":
    "أضف اسم المشتري لإصدار الفاتورة.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addTheBuyerTaxNumber":
    "أضف الرقم الضريبي للمشتري، فهو مطلوب للمشترين من الشركات.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addLinesFromABooking":
    "تحتاج الفاتورة إلى بنود من حجز مدفوع قبل إصدارها.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueFailed": "لم تصدر الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueFailedBody":
    "راجع البيانات وحاول مرة أخرى. لم يُحفظ أي شيء.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyer": "المشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceType": "نوع الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.businessB2b": "شركات (B2B)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.consumerB2c": "أفراد (B2C)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerName": "اسم المشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerTaxNumber": "الرقم الضريبي للمشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.requiredForBusinessBuyers":
    "مطلوب للمشترين من الشركات.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerAddress": "عنوان المشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerEmail": "البريد الإلكتروني للمشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines": "بنود الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.line": "البند",
  "screen.organization.billing.issueInvoiceB2bOrB2c.qty": "الكمية",
  "screen.organization.billing.issueInvoiceB2bOrB2c.unitPrice": "سعر الوحدة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.tax": "الضريبة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.total": "الإجمالي",
  "screen.organization.billing.issueInvoiceB2bOrB2c.subtotal": "المجموع الفرعي",
  "screen.organization.billing.issueInvoiceB2bOrB2c.programsOf": "البرامج · {reference}",
  "screen.organization.billing.issueInvoiceB2bOrB2c.noLines": "لا توجد بنود حجز لهذه الرحلة بعد",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceNumber": "رقم الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.assignedWhenIssued": "يُخصَّص عند إصدار الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.saudiEInvoicingScope":
    "نطاق الفوترة الإلكترونية في السعودية لم يُحسم بعد",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issuingInSaudiArabiaWaits":
    "الإصدار في السعودية بانتظار قرار النطاق (D-11). وتُنشئ كل فاتورة صادرة قيدًا في دفتر الأستاذ.",
  // apps/web/src/screens/organization/billing/subscription-and-billing.tsx
  "screen.organization.billing.subscriptionAndBilling.title": "الاشتراك والفوترة",
  "screen.organization.billing.subscriptionAndBilling.caption":
    "باقتك واستخدامك مقارنة بالحدود والفوترة",
  "screen.organization.billing.subscriptionAndBilling.changePlan": "تغيير الباقة",
  "screen.organization.billing.subscriptionAndBilling.choosePlan": "اختر باقة",
  "screen.organization.billing.subscriptionAndBilling.planWithPrice": "{plan} · {price}",
  "screen.organization.billing.subscriptionAndBilling.changeFailed":
    "تعذّر تغيير الباقة. حاول مرة أخرى.",
  "screen.organization.billing.subscriptionAndBilling.cancel": "إلغاء",
  "screen.organization.billing.subscriptionAndBilling.confirmPlanChange": "تأكيد تغيير الباقة",
  "screen.organization.billing.subscriptionAndBilling.currentPlan": "الباقة الحالية",
  "screen.organization.billing.subscriptionAndBilling.active": "نشطة",
  "screen.organization.billing.subscriptionAndBilling.trial": "تجريبية",
  "screen.organization.billing.subscriptionAndBilling.pastDue": "متأخرة السداد",
  "screen.organization.billing.subscriptionAndBilling.cancelled": "ملغاة",
  "screen.organization.billing.subscriptionAndBilling.renewsOn": "تتجدد في {date}",
  "screen.organization.billing.subscriptionAndBilling.billingCycle": "دورة الفوترة",
  "screen.organization.billing.subscriptionAndBilling.monthly": "شهرية",
  "screen.organization.billing.subscriptionAndBilling.annual": "سنوية",
  "screen.organization.billing.subscriptionAndBilling.annualBillingSaves":
    "توفّر الفوترة السنوية {discount} من الإجمالي الشهري.",
  "screen.organization.billing.subscriptionAndBilling.paymentMethod": "طريقة الدفع",
  "screen.organization.billing.subscriptionAndBilling.noPaymentMethodOnFile":
    "لا توجد طريقة دفع محفوظة",
  "screen.organization.billing.subscriptionAndBilling.update": "تحديث",
  "screen.organization.billing.subscriptionAndBilling.usageAgainstLimits":
    "الاستخدام مقارنة بالحدود",
  "screen.organization.billing.subscriptionAndBilling.activeTripsThisMonth":
    "الرحلات النشطة هذا الشهر",
  "screen.organization.billing.subscriptionAndBilling.employees": "الموظفون",
  "screen.organization.billing.subscriptionAndBilling.vehiclesPerTrip": "المركبات لكل رحلة",
  "screen.organization.billing.subscriptionAndBilling.programsPerTrip": "البرامج لكل رحلة",
  "screen.organization.billing.subscriptionAndBilling.coupons": "القسائم",
  "screen.organization.billing.subscriptionAndBilling.upgradesApplyAtOnce":
    "تسري الترقيات فورًا مع احتساب تناسبي",
  "screen.organization.billing.subscriptionAndBilling.downgradesTakeEffect":
    "يسري خفض الباقة في نهاية دورة الفوترة، في {date}.",
  // apps/web/src/screens/organization/bookings/booking-detail.tsx
  "screen.organization.bookings.bookingDetail.traveler": "المسافر",
  "screen.organization.bookings.bookingDetail.seat": "المقعد",
  "screen.organization.bookings.bookingDetail.newSeatFor": "المقعد الجديد لـ {name}",
  "screen.organization.bookings.bookingDetail.notAssigned": "غير مُعيَّن",
  "screen.organization.bookings.bookingDetail.checkIn": "تسجيل الصعود",
  "screen.organization.bookings.bookingDetail.checkedIn": "تم تسجيل الصعود",
  "screen.organization.bookings.bookingDetail.notCheckedIn": "لم يُسجَّل الصعود",
  "screen.organization.bookings.bookingDetail.action": "الإجراء",
  "screen.organization.bookings.bookingDetail.cancel": "إلغاء",
  "screen.organization.bookings.bookingDetail.reassignSeat": "إعادة تعيين المقعد",
  "screen.organization.bookings.bookingDetail.program": "البرنامج",
  "screen.organization.bookings.bookingDetail.quantity": "الكمية",
  "screen.organization.bookings.bookingDetail.amount": "المبلغ",
  "screen.organization.bookings.bookingDetail.title": "الحجز {reference}",
  "screen.organization.bookings.bookingDetail.caption": "{trip} · حجزه {booker}",
  "screen.organization.bookings.bookingDetail.issueRefund": "إصدار استرداد",
  "screen.organization.bookings.bookingDetail.saveChange": "حفظ التغيير",
  "screen.organization.bookings.bookingDetail.saveHint":
    "اختر «إعادة تعيين المقعد» لأحد المسافرين وأدخل المقعد الجديد أولًا.",
  "screen.organization.bookings.bookingDetail.emptyTitle": "لا يوجد حجز لعرضه",
  "screen.organization.bookings.bookingDetail.emptyBody": "افتح حجزًا من صفحة الحجوزات والمسافرين.",
  "screen.organization.bookings.bookingDetail.actionFailed": "لم يُحفظ التغيير. حاول مرة أخرى.",
  "screen.organization.bookings.bookingDetail.travelersAndSeats": "المسافرون والمقاعد",
  "screen.organization.bookings.bookingDetail.noTravelers": "لا يوجد مسافرون في هذا الحجز",
  "screen.organization.bookings.bookingDetail.programsAndQuantities": "البرامج والكميات",
  "screen.organization.bookings.bookingDetail.noPrograms": "لم تُختر أي برامج",
  "screen.organization.bookings.bookingDetail.paymentAndCoupon": "الدفع والقسيمة",
  "screen.organization.bookings.bookingDetail.paymentStatus": "حالة الدفع",
  "screen.organization.bookings.bookingDetail.totalPaid": "إجمالي المدفوع",
  "screen.organization.bookings.bookingDetail.coupon": "القسيمة",
  "screen.organization.bookings.bookingDetail.couponApplied": "تم تطبيق {code}",
  "screen.organization.bookings.bookingDetail.none": "لا يوجد",
  "screen.organization.bookings.bookingDetail.refundUnderPolicy": "الاسترداد وفق السياسة",
  "screen.organization.bookings.bookingDetail.refundNote":
    "لا تُعكس أي إيرادات حتى تؤكد بوابة الدفع الاسترداد. يرى المسافرون في الأثناء عبارة «الاسترداد قيد التنفيذ».",
  "screen.organization.bookings.bookingDetail.confirmRefundTitle": "إصدار استرداد لهذا الحجز؟",
  "screen.organization.bookings.bookingDetail.keepBooking": "إبقاء الحجز",
  // apps/web/src/screens/organization/bookings/booking-parts.tsx
  "screen.organization.bookings.bookingParts.refundPending": "الاسترداد معلّق",
  "screen.organization.bookings.bookingParts.confirmed": "مؤكد",
  "screen.organization.bookings.bookingParts.checkedIn": "تم تسجيل الصعود",
  "screen.organization.bookings.bookingParts.completed": "مكتمل",
  "screen.organization.bookings.bookingParts.pendingPayment": "بانتظار الدفع",
  "screen.organization.bookings.bookingParts.refunded": "مُسترد",
  "screen.organization.bookings.bookingParts.cancelled": "ملغى",
  "screen.organization.bookings.bookingParts.refundInProgress": "الاسترداد قيد التنفيذ",
  "screen.organization.bookings.bookingParts.unpaid": "غير مدفوع",
  "screen.organization.bookings.bookingParts.paid": "مدفوع",
  // apps/web/src/screens/organization/bookings/bookings-and-travelers.tsx
  "screen.organization.bookings.bookingsAndTravelers.notAssigned": "غير مُعيَّن",
  "screen.organization.bookings.bookingsAndTravelers.booking": "الحجز",
  "screen.organization.bookings.bookingsAndTravelers.travelers": "المسافرون",
  "screen.organization.bookings.bookingsAndTravelers.programs": "البرامج",
  "screen.organization.bookings.bookingsAndTravelers.none": "لا يوجد",
  "screen.organization.bookings.bookingsAndTravelers.seat": "المقعد",
  "screen.organization.bookings.bookingsAndTravelers.payment": "الدفع",
  "screen.organization.bookings.bookingsAndTravelers.state": "الحالة",
  "screen.organization.bookings.bookingsAndTravelers.traveler": "المسافر",
  "screen.organization.bookings.bookingsAndTravelers.allTrips": "كل الرحلات",
  "screen.organization.bookings.bookingsAndTravelers.bookings": "الحجوزات",
  "screen.organization.bookings.bookingsAndTravelers.cancellationRequests": "طلبات الإلغاء",
  "screen.organization.bookings.bookingsAndTravelers.emptyTitle": "لا توجد حجوزات بعد",
  "screen.organization.bookings.bookingsAndTravelers.noMatchTitle": "لا توجد حجوزات مطابقة",
  "screen.organization.bookings.bookingsAndTravelers.emptyBody":
    "تظهر الحجوزات هنا عندما يحجز المسافرون هذه الرحلة.",
  "screen.organization.bookings.bookingsAndTravelers.noMatchBody":
    "جرّب اسم مسافر آخر أو مرجع حجز آخر.",
  "screen.organization.bookings.bookingsAndTravelers.title": "الحجوزات والمسافرون",
  "screen.organization.bookings.bookingsAndTravelers.caption": "{trip} · {n} حجز",
  "screen.organization.bookings.bookingsAndTravelers.searchTravelers": "البحث عن المسافرين",
  "screen.organization.bookings.bookingsAndTravelers.searchPlaceholder":
    "اسم المسافر أو مرجع الحجز",
  "screen.organization.bookings.bookingsAndTravelers.bookingViews": "طرق عرض الحجوزات",
  "screen.organization.bookings.bookingsAndTravelers.noCancellationRequests": "لا توجد طلبات إلغاء",
  "screen.organization.bookings.bookingsAndTravelers.refundNote":
    "تظهر عمليات الاسترداد للمسافرين بعبارة «الاسترداد قيد التنفيذ» حتى تؤكدها بوابة الدفع.",
  // apps/web/src/screens/organization/bookings/program-enrollment-report.tsx
  "screen.organization.bookings.programEnrollmentReport.bookingReference": "مرجع الحجز",
  "screen.organization.bookings.programEnrollmentReport.quantity": "الكمية",
  "screen.organization.bookings.programEnrollmentReport.revenue": "الإيراد",
  "screen.organization.bookings.programEnrollmentReport.total": "الإجمالي",
  "screen.organization.bookings.programEnrollmentReport.noPrograms": "لا توجد برامج في هذه الرحلة",
  "screen.organization.bookings.programEnrollmentReport.title": "التسجيل في البرامج",
  "screen.organization.bookings.programEnrollmentReport.caption":
    "من اختار كل برنامج والكميات والإيراد · {trip}",
  "screen.organization.bookings.programEnrollmentReport.program": "البرنامج",
  "screen.organization.bookings.programEnrollmentReport.export": "تصدير",
  "screen.organization.bookings.programEnrollmentReport.travelersEnrolled": "المسافرون المسجلون",
  "screen.organization.bookings.programEnrollmentReport.totalQuantity": "إجمالي الكمية",
  "screen.organization.bookings.programEnrollmentReport.programRevenue": "إيراد البرنامج",
  "screen.organization.bookings.programEnrollmentReport.emptyTitle": "لا توجد تسجيلات بعد",
  "screen.organization.bookings.programEnrollmentReport.emptyBody":
    "يظهر هنا المسافرون الذين يختارون هذا البرنامج.",
  "screen.organization.bookings.programEnrollmentReport.planNote":
    "يعتمد عمق هذا التقرير على خطتك. يستخدم التصدير الإجماليات نفسها الموجودة في هذا الجدول.",
  // apps/web/src/screens/organization/bookings/seat-grid.tsx
  "screen.organization.bookings.seatGrid.held": "محجوز مؤقتًا",
  "screen.organization.bookings.seatGrid.reserved": "محجوز",
  "screen.organization.bookings.seatGrid.blocked": "مغلق",
  "screen.organization.bookings.seatGrid.available": "متاح",
  "screen.organization.bookings.seatGrid.seatAria": "المقعد {label}، {state}",
  "screen.organization.bookings.seatGrid.picked": "مختار",
  "screen.organization.bookings.seatGrid.legend": "دليل الألوان",
  // apps/web/src/screens/organization/bookings/seat-map-and-seat-assignment.tsx
  "screen.organization.bookings.seatMapAndSeatAssignment.seat": "المقعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.state": "الحالة",
  "screen.organization.bookings.seatMapAndSeatAssignment.traveler": "المسافر",
  "screen.organization.bookings.seatMapAndSeatAssignment.none": "لا يوجد",
  "screen.organization.bookings.seatMapAndSeatAssignment.travelerChoice": "اختيار المسافر",
  "screen.organization.bookings.seatMapAndSeatAssignment.organizationAssigned": "تعيين من المؤسسة",
  "screen.organization.bookings.seatMapAndSeatAssignment.map": "الخريطة",
  "screen.organization.bookings.seatMapAndSeatAssignment.list": "القائمة",
  "screen.organization.bookings.seatMapAndSeatAssignment.title": "خريطة المقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.caption":
    "{trip} · نظام المقاعد: {mode} · تحديث مباشر",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatViews": "طرق عرض المقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.assignFailed":
    "لم يُعيَّن المقعد. ربما حُجز بالفعل؛ جرّب مقعدًا آخر.",
  "screen.organization.bookings.seatMapAndSeatAssignment.vehicleFrontAtTop":
    "المركبة {plate} · مقدمة الحافلة في الأعلى",
  "screen.organization.bookings.seatMapAndSeatAssignment.noSeats": "لا توجد مقاعد لعرضها",
  "screen.organization.bookings.seatMapAndSeatAssignment.noSeatsBody":
    "أضف إلى هذه الرحلة مركبة لها مخطط مقاعد.",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatMap": "خريطة المقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelers": "مسافرون بلا مقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.everyoneHasASeat": "لكل مسافر مقعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.programLine": "البرنامج {programs}",
  "screen.organization.bookings.seatMapAndSeatAssignment.selected": "محدَّد",
  "screen.organization.bookings.seatMapAndSeatAssignment.waiting": "بالانتظار",
  "screen.organization.bookings.seatMapAndSeatAssignment.assignToSeat": "التعيين في المقعد {label}",
  "screen.organization.bookings.seatMapAndSeatAssignment.moveSeat": "نقل المقعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.lockedRule":
    "المقاعد التي سُجّل صعود أصحابها مقفلة. لا يمكن تعيين مقعد محجوز بالفعل.",
  "screen.organization.bookings.seatMapAndSeatAssignment.moveHint":
    "لنقل مسافر، اختر مقعده المحجوز ثم مقعدًا متاحًا.",
  // apps/web/src/screens/organization/common/org-shared.tsx
  "screen.organization.common.orgShared.step.basics": "الأساسيات",
  "screen.organization.common.orgShared.step.schedule": "الجدول والمسار",
  "screen.organization.common.orgShared.step.vehicles": "المركبات",
  "screen.organization.common.orgShared.step.staffing": "الطاقم",
  "screen.organization.common.orgShared.step.programs": "البرامج",
  "screen.organization.common.orgShared.step.seating": "المقاعد",
  "screen.organization.common.orgShared.step.pricing": "التسعير",
  "screen.organization.common.orgShared.step.publish": "النشر",
  "screen.organization.common.orgShared.stepCaption": "الخطوة {n} من 8: {step}",
  "screen.organization.common.orgShared.stepCaption.basics": "الأساسيات",
  "screen.organization.common.orgShared.stepCaption.schedule": "الجدول والمسار",
  "screen.organization.common.orgShared.stepCaption.vehicles": "المركبات",
  "screen.organization.common.orgShared.stepCaption.staffing": "الطاقم",
  "screen.organization.common.orgShared.stepCaption.programs": "البرامج",
  "screen.organization.common.orgShared.stepCaption.seating": "المقاعد",
  "screen.organization.common.orgShared.stepCaption.pricing": "التسعير والسعة",
  "screen.organization.common.orgShared.stepCaption.publish": "النشر",
  "screen.organization.common.orgShared.stepDone": "(مكتملة)",
  "screen.organization.common.orgShared.tripWizardProgress": "خطوات معالج الرحلة",
  "screen.organization.common.orgShared.createTrip": "إنشاء رحلة",
  "screen.organization.common.orgShared.back": "رجوع",
  "screen.organization.common.orgShared.next": "التالي",
  "screen.organization.common.orgShared.saveAsDraft": "حفظ كمسودة",
  "screen.organization.common.orgShared.tripState.draft": "مسودة",
  "screen.organization.common.orgShared.tripState.published": "منشورة",
  "screen.organization.common.orgShared.tripState.negotiating": "قيد التفاوض",
  "screen.organization.common.orgShared.tripState.ready": "جاهزة",
  "screen.organization.common.orgShared.tripState.fillingUp": "قيد الامتلاء",
  "screen.organization.common.orgShared.tripState.soldOut": "نفدت المقاعد",
  "screen.organization.common.orgShared.tripState.inProgress": "جارية",
  "screen.organization.common.orgShared.tripState.partiallyCompleted": "مكتملة جزئيًا",
  "screen.organization.common.orgShared.tripState.completed": "مكتملة",
  "screen.organization.common.orgShared.tripState.postProcessing": "قيد المعالجة اللاحقة",
  "screen.organization.common.orgShared.tripState.archived": "مؤرشفة",
  "screen.organization.common.orgShared.tripState.cancelled": "ملغاة",
  "screen.organization.common.orgShared.tripState.refundsIssued": "صُرفت المبالغ المستردة",
  // apps/web/src/screens/organization/common/org-ui.tsx
  "screen.organization.common.orgUi.loading": "جارٍ التحميل",
  "screen.organization.common.orgUi.loadFailedTitle": "تعذّر تحميل هذه الصفحة",
  "screen.organization.common.orgUi.loadFailedBody":
    "تحقّق من اتصالك وحاول مرة أخرى. لم يُفقد أي شيء أدخلته.",
  "screen.organization.common.orgUi.tryAgain": "حاول مرة أخرى",
  // apps/web/src/screens/organization/coupons/coupon-analytics.tsx
  "screen.organization.coupons.couponAnalytics.unlimited": "غير محدود",
  "screen.organization.coupons.couponAnalytics.coupon": "القسيمة",
  "screen.organization.coupons.couponAnalytics.redemptions": "مرات الاستخدام",
  "screen.organization.coupons.couponAnalytics.discountTotal": "إجمالي الخصم",
  "screen.organization.coupons.couponAnalytics.remainingUses": "الاستخدامات المتبقية",
  "screen.organization.coupons.couponAnalytics.status": "الحالة",
  "screen.organization.coupons.couponAnalytics.allTime": "كل الفترات",
  "screen.organization.coupons.couponAnalytics.last30Days": "آخر 30 يومًا",
  "screen.organization.coupons.couponAnalytics.last90Days": "آخر 90 يومًا",
  "screen.organization.coupons.couponAnalytics.last12Months": "آخر 12 شهرًا",
  "screen.organization.coupons.couponAnalytics.title": "تحليلات القسائم",
  "screen.organization.coupons.couponAnalytics.caption":
    "مرات الاستخدام وإجمالي الخصم والاستخدامات المتبقية لكل قسيمة",
  "screen.organization.coupons.couponAnalytics.dateRange": "النطاق الزمني",
  "screen.organization.coupons.couponAnalytics.export": "تصدير",
  "screen.organization.coupons.couponAnalytics.growthBasicView": "تعرض خطة النمو العرض الأساسي",
  "screen.organization.coupons.couponAnalytics.enterpriseFullSet":
    "تعرض خطة المؤسسات المجموعة الكاملة من مقاييس القسائم.",
  "screen.organization.coupons.couponAnalytics.totalRedemptions": "إجمالي مرات الاستخدام",
  "screen.organization.coupons.couponAnalytics.emptyTitle": "لا توجد قسائم بعد",
  "screen.organization.coupons.couponAnalytics.emptyBody":
    "تظهر مرات الاستخدام هنا بعد أن يستخدم المسافرون قسائمك.",
  // apps/web/src/screens/organization/coupons/coupon-editor-form.tsx
  "screen.organization.coupons.couponEditorForm.fixedAmount": "مبلغ ثابت",
  "screen.organization.coupons.couponEditorForm.percentage": "نسبة مئوية",
  "screen.organization.coupons.couponEditorForm.programSpecific": "خاصة ببرنامج",
  "screen.organization.coupons.couponEditorForm.freeProgram": "برنامج مجاني",
  "screen.organization.coupons.couponEditorForm.firstBooking": "الحجز الأول",
  "screen.organization.coupons.couponEditorForm.minimumSpend": "حد أدنى للإنفاق",
  "screen.organization.coupons.couponEditorForm.codeAndValue": "الرمز والقيمة",
  "screen.organization.coupons.couponEditorForm.code": "الرمز",
  "screen.organization.coupons.couponEditorForm.generate": "توليد",
  "screen.organization.coupons.couponEditorForm.couponType": "نوع القسيمة",
  "screen.organization.coupons.couponEditorForm.value": "القيمة",
  "screen.organization.coupons.couponEditorForm.valuePercentHint": "نسبة الخصم من الحجز",
  "screen.organization.coupons.couponEditorForm.valueAmountHint": "مبلغ الخصم من الحجز",
  "screen.organization.coupons.couponEditorForm.scope": "النطاق",
  "screen.organization.coupons.couponEditorForm.thisOrganizationsTrips": "رحلات هذه المؤسسة",
  "screen.organization.coupons.couponEditorForm.limitsAndValidity": "الحدود والصلاحية",
  "screen.organization.coupons.couponEditorForm.totalLimit": "الحد الإجمالي",
  "screen.organization.coupons.couponEditorForm.usesHint":
    "عدد مرات الاستخدام؛ اتركه فارغًا لعدم التقييد",
  "screen.organization.coupons.couponEditorForm.perUserLimit": "الحد لكل مستخدم",
  "screen.organization.coupons.couponEditorForm.validFrom": "صالحة من",
  "screen.organization.coupons.couponEditorForm.validUntil": "صالحة حتى",
  "screen.organization.coupons.couponEditorForm.minimumBookingValue": "الحد الأدنى لقيمة الحجز",
  "screen.organization.coupons.couponEditorForm.programs": "البرامج",
  "screen.organization.coupons.couponEditorForm.audienceAndStacking": "الجمهور والجمع",
  "screen.organization.coupons.couponEditorForm.audience": "الجمهور",
  "screen.organization.coupons.couponEditorForm.public": "عام",
  "screen.organization.coupons.couponEditorForm.targetedAudienceList": "قائمة جمهور مستهدف",
  "screen.organization.coupons.couponEditorForm.canBeCombined": "يمكن جمعها مع قسائم أخرى",
  // apps/web/src/screens/organization/coupons/coupon-editor.tsx
  "screen.organization.coupons.couponEditor.allPrograms": "كل البرامج",
  "screen.organization.coupons.couponEditor.codeTooShort": "أدخل رمزًا من 3 أحرف على الأقل.",
  "screen.organization.coupons.couponEditor.couponTitle": "القسيمة {code}",
  "screen.organization.coupons.couponEditor.createCoupon": "إنشاء قسيمة",
  "screen.organization.coupons.couponEditor.caption":
    "النطاق: رحلات هذه المؤسسة فقط · {counted} قسيمة محتسبة",
  "screen.organization.coupons.couponEditor.viewAnalytics": "عرض التحليلات",
  "screen.organization.coupons.couponEditor.saveAsDraft": "حفظ كمسودة",
  "screen.organization.coupons.couponEditor.saveCoupon": "حفظ القسيمة",
  "screen.organization.coupons.couponEditor.notFoundTitle": "لم يُعثر على هذه القسيمة",
  "screen.organization.coupons.couponEditor.notFoundBody": "ربما تتبع مؤسسة أخرى أو أُزيلت.",
  "screen.organization.coupons.couponEditor.savedTitle": "هذه القسيمة محفوظة",
  "screen.organization.coupons.couponEditor.savedBody":
    "لا يمكن تغيير رمزها وقيمتها. أوقفها مؤقتًا أو استأنفها أو ألغها من صفحة القسائم.",
  "screen.organization.coupons.couponEditor.saveFailed": "لم تُحفظ القسيمة",
  "screen.organization.coupons.couponEditor.saveFailedBody":
    "ربما الرمز مستخدم بالفعل، أو بلغت الحد المسموح في خطتك.",
  "screen.organization.coupons.couponEditor.draftNote":
    "القسيمة المحفوظة كمسودة لا تظهر للمسافرين. فعّلها عندما تكون جاهزًا.",
  // apps/web/src/screens/organization/coupons/coupon-parts.tsx
  "screen.organization.coupons.couponParts.nOfLimit": "{n} من {limit}",
  "screen.organization.coupons.couponParts.unlimited": "غير محدود",
  "screen.organization.coupons.couponParts.percentage": "نسبة مئوية",
  "screen.organization.coupons.couponParts.fixedAmount": "مبلغ ثابت",
  "screen.organization.coupons.couponParts.active": "نشطة",
  "screen.organization.coupons.couponParts.paused": "متوقفة مؤقتًا",
  "screen.organization.coupons.couponParts.revoked": "ملغاة",
  "screen.organization.coupons.couponParts.expired": "منتهية",
  // apps/web/src/screens/organization/coupons/coupons-list.tsx
  "screen.organization.coupons.couponsList.code": "الرمز",
  "screen.organization.coupons.couponsList.type": "النوع",
  "screen.organization.coupons.couponsList.value": "القيمة",
  "screen.organization.coupons.couponsList.status": "الحالة",
  "screen.organization.coupons.couponsList.redemptions": "مرات الاستخدام",
  "screen.organization.coupons.couponsList.remainingUses": "الاستخدامات المتبقية",
  "screen.organization.coupons.couponsList.action": "الإجراء",
  "screen.organization.coupons.couponsList.none": "لا يوجد",
  "screen.organization.coupons.couponsList.pause": "إيقاف مؤقت",
  "screen.organization.coupons.couponsList.resume": "استئناف",
  "screen.organization.coupons.couponsList.revoke": "إلغاء القسيمة",
  "screen.organization.coupons.couponsList.all": "الكل",
  "screen.organization.coupons.couponsList.active": "نشطة",
  "screen.organization.coupons.couponsList.paused": "متوقفة مؤقتًا",
  "screen.organization.coupons.couponsList.revoked": "ملغاة",
  "screen.organization.coupons.couponsList.createCoupon": "إنشاء قسيمة",
  "screen.organization.coupons.couponsList.title": "القسائم",
  "screen.organization.coupons.couponsList.caption": "قسائم مؤسستك · المحتسب منها {counted}",
  "screen.organization.coupons.couponsList.couponsCountedAgainstPlan": "القسائم المحتسبة ضمن الخطة",
  "screen.organization.coupons.couponsList.redemptionsThisMonth": "مرات الاستخدام هذا الشهر",
  "screen.organization.coupons.couponsList.filterByStatus": "تصفية القسائم حسب الحالة",
  "screen.organization.coupons.couponsList.emptyTitle": "لا توجد قسائم بعد",
  "screen.organization.coupons.couponsList.noMatchTitle": "لا توجد قسائم مطابقة",
  "screen.organization.coupons.couponsList.emptyBody": "أنشئ قسيمة لتقديم خصم للمسافرين على رحلاتك.",
  "screen.organization.coupons.couponsList.noMatchBody": "اختر حالة أخرى.",
  "screen.organization.coupons.couponsList.revokeThisCoupon": "إلغاء هذه القسيمة؟",
  "screen.organization.coupons.couponsList.revokeBody":
    "لن يتمكن المسافرون من استخدامها بعد الآن. تحتفظ الحجوزات التي استخدمتها بخصمها.",
  "screen.organization.coupons.couponsList.keepCoupon": "إبقاء القسيمة",
  // apps/web/src/screens/organization/entries-part-1.ts
  "screen.registry.organization.workspaceHome.title": "رئيسية مساحة العمل",
  "screen.registry.organization.employeeInvitationAcceptance.title": "قبول دعوة الموظف",
  "screen.registry.organization.organizationProfileSettingsAndBranding.title":
    "ملف المؤسسة والإعدادات والهوية",
  "screen.registry.organization.tripsList.title": "قائمة الرحلات",
  "screen.registry.organization.tripWizardStep1Basics.title": "معالج الرحلة، الخطوة 1: الأساسيات",
  "screen.registry.organization.tripWizardStep2ScheduleAndRoute.title":
    "معالج الرحلة، الخطوة 2: الجدول والمسار",
  "screen.registry.organization.tripWizardStep3Vehicles.title": "معالج الرحلة، الخطوة 3: المركبات",
  "screen.registry.organization.tripWizardStep4Staffing.title": "معالج الرحلة، الخطوة 4: الطاقم",
  "screen.registry.organization.tripWizardStep5Programs.title": "معالج الرحلة، الخطوة 5: البرامج",
  "screen.registry.organization.tripWizardStep6Seating.title": "معالج الرحلة، الخطوة 6: المقاعد",
  "screen.registry.organization.tripWizardStep7PricingAndCapacity.title":
    "معالج الرحلة، الخطوة 7: التسعير والسعة",
  "screen.registry.organization.tripWizardStep8Publish.title": "معالج الرحلة، الخطوة 8: النشر",
  "screen.registry.organization.programEditor.title": "محرّر البرامج",
  "screen.registry.organization.tripCommandView.title": "عرض قيادة الرحلة",
  "screen.registry.organization.cancelTripDecision.title": "إلغاء الرحلة (قرار)",
  "screen.registry.organization.vehicleRegistry.title": "سجل المركبات",
  "screen.registry.organization.vehicleEditor.title": "محرّر المركبة",
  "screen.registry.organization.vehicleTypesAndSeatLayout.title": "أنواع المركبات وتخطيط المقاعد",
  "screen.registry.organization.staffingBoard.title": "لوحة الطواقم",
  "screen.registry.organization.organizationOwnedDriversAndPhotographers.title":
    "السائقون والمصورون التابعون للمؤسسة",
  "screen.registry.organization.platformSupplierSearchAndDealStart.title":
    "البحث عن مورّد المنصة وبدء اتفاقية",
  // apps/web/src/screens/organization/entries-part-2.ts
  "screen.registry.organization.dealDetailAndNegotiation.title": "تفاصيل الاتفاقية والتفاوض",
  "screen.registry.organization.bookingsAndTravelers.title": "الحجوزات والمسافرون",
  "screen.registry.organization.bookingDetail.title": "تفاصيل الحجز",
  "screen.registry.organization.seatMapAndSeatAssignment.title": "خريطة المقاعد وتخصيصها",
  "screen.registry.organization.programEnrollmentReport.title": "تقرير التسجيل في البرامج",
  "screen.registry.organization.couponsList.title": "قائمة الكوبونات",
  "screen.registry.organization.couponEditor.title": "محرّر الكوبون",
  "screen.registry.organization.couponAnalytics.title": "تحليلات الكوبونات",
  "screen.registry.organization.tripAccounting.title": "محاسبة الرحلات",
  "screen.registry.organization.ledgerAndExports.title": "دفتر الأستاذ والتصدير",
  "screen.registry.organization.settlements.title": "التسويات",
  "screen.registry.organization.subscriptionAndBilling.title": "الاشتراك والفوترة",
  "screen.registry.organization.employeesList.title": "قائمة الموظفين",
  "screen.registry.organization.employeeInvitationAndPermissions.title": "دعوة الموظف والصلاحيات",
  "screen.registry.organization.crmAndWebhooks.title": "إدارة العلاقات والويب هوك",
  "screen.registry.organization.invoicesList.title": "قائمة الفواتير",
  "screen.registry.organization.issueInvoiceB2bOrB2c.title": "إصدار فاتورة (B2B أو B2C)",
  "screen.registry.organization.analyticsAndReports.title": "التحليلات والتقارير",
  "screen.registry.organization.liveOperations.title": "العمليات المباشرة",
  "screen.registry.organization.tripReportReview.title": "مراجعة تقرير الرحلة",
  "screen.registry.organization.childSafetyReports.title": "تقارير سلامة الأطفال",
  // apps/web/src/screens/organization/operations/analytics-and-reports.tsx
  "screen.organization.operations.analyticsAndReports.title": "التحليلات والتقارير",
  "screen.organization.operations.analyticsAndReports.caption":
    "الرحلات والبرامج والقسائم والإيرادات",
  "screen.organization.operations.analyticsAndReports.starterLockedPreview":
    "الباقة المبدئية: معاينة مقفلة",
  "screen.organization.operations.analyticsAndReports.growthBasicView": "باقة النمو: عرض أساسي",
  "screen.organization.operations.analyticsAndReports.enterpriseFullView":
    "باقة المؤسسات: عرض كامل",
  "screen.organization.operations.analyticsAndReports.dateRange": "النطاق الزمني",
  "screen.organization.operations.analyticsAndReports.allTime": "كل الفترات",
  "screen.organization.operations.analyticsAndReports.thisMonth": "هذا الشهر",
  "screen.organization.operations.analyticsAndReports.last30Days": "آخر 30 يومًا",
  "screen.organization.operations.analyticsAndReports.thisYear": "هذا العام",
  "screen.organization.operations.analyticsAndReports.export": "تصدير",
  "screen.organization.operations.analyticsAndReports.programEnrollment": "الالتحاق بالبرامج",
  "screen.organization.operations.analyticsAndReports.nTravelers": "عدد المسافرين: {n}",
  "screen.organization.operations.analyticsAndReports.acrossNTrips":
    "ملتحقون ببرامج في عدد {trips} من الرحلات.",
  "screen.organization.operations.analyticsAndReports.couponRedemption": "استخدام القسائم",
  "screen.organization.operations.analyticsAndReports.nRedemptions": "مرات الاستخدام: {n}",
  "screen.organization.operations.analyticsAndReports.nActiveCoupons":
    "القسائم النشطة: {n}. التحليلات الكاملة في باقة المؤسسات.",
  "screen.organization.operations.analyticsAndReports.revenue": "الإيرادات",
  "screen.organization.operations.analyticsAndReports.netOfCoupons":
    "بعد خصم القسائم ورسوم بوابة الدفع.",
  "screen.organization.operations.analyticsAndReports.openReport": "فتح التقرير",
  "screen.organization.operations.analyticsAndReports.planViewsDiffer": "يختلف العرض حسب الباقة",
  "screen.organization.operations.analyticsAndReports.starterShowsALockedPreview":
    "تعرض الباقة المبدئية معاينة مقفلة مع دعوة للترقية، وتعرض باقة النمو العرض الأساسي، وتعرض باقة المؤسسات العرض الكامل.",
  // apps/web/src/screens/organization/operations/child-safety-reports.tsx
  "screen.organization.operations.childSafetyReports.title": "بلاغات سلامة الأطفال",
  "screen.organization.operations.childSafetyReports.caption":
    "المخاوف المتعلقة بالرحلات التي تديرها مؤسستك، مع حالتها",
  "screen.organization.operations.childSafetyReports.everyCaseIsRouted": "تُحال كل حالة",
  "screen.organization.operations.childSafetyReports.escalationContactBody":
    "جهة التصعيد: {contact}. تبقى الحالة موقوفة إلى أن تُحدَّد جهة تصعيد.",
  "screen.organization.operations.childSafetyReports.contactToBeConfirmed": "لم تُؤكَّد بعد",
  "screen.organization.operations.childSafetyReports.yourCases": "حالاتك",
  "screen.organization.operations.childSafetyReports.case": "الحالة",
  "screen.organization.operations.childSafetyReports.status": "الوضع",
  "screen.organization.operations.childSafetyReports.time": "الوقت",
  "screen.organization.operations.childSafetyReports.trip": "الرحلة",
  "screen.organization.operations.childSafetyReports.vehicle": "المركبة",
  "screen.organization.operations.childSafetyReports.routedToEscalationContact":
    "أُحيلت إلى جهة التصعيد",
  "screen.organization.operations.childSafetyReports.caseOpen": "الحالة مفتوحة",
  "screen.organization.operations.childSafetyReports.noCases": "لا توجد حالات لهذه الرحلة",
  "screen.organization.operations.childSafetyReports.newReport": "بلاغ جديد",
  "screen.organization.operations.childSafetyReports.noTrips": "لا توجد رحلات بعد",
  "screen.organization.operations.childSafetyReports.noVehicle": "بدون مركبة محددة",
  "screen.organization.operations.childSafetyReports.description": "الوصف",
  "screen.organization.operations.childSafetyReports.submitFailed": "لم يُرسل البلاغ. حاول مرة أخرى.",
  "screen.organization.operations.childSafetyReports.reportSubmitted": "أُرسل البلاغ",
  "screen.organization.operations.childSafetyReports.submitReport": "إرسال البلاغ",
  // apps/web/src/screens/organization/operations/live-operations.tsx
  "screen.organization.operations.liveOperations.title": "العمليات المباشرة",
  "screen.organization.operations.liveOperations.tripInState": "{trip} · {state}",
  "screen.organization.operations.liveOperations.lastUpdate":
    "آخر تحديث {time} · تُحدَّث المواقع خلال 500 مللي ثانية",
  "screen.organization.operations.liveOperations.childTrackingOn": "تتبع الأطفال مفعّل",
  "screen.organization.operations.liveOperations.childTrackingOff": "تتبع الأطفال متوقف",
  "screen.organization.operations.liveOperations.noTripInProgress": "لا توجد رحلة للمتابعة بعد",
  "screen.organization.operations.liveOperations.occupancyAppearsWhenATrip":
    "تظهر هنا المركبات والإشغال والحوادث عند تشغيل رحلة.",
  "screen.organization.operations.liveOperations.liveMap": "الخريطة المباشرة",
  "screen.organization.operations.liveOperations.liveVehiclePositions": "مواقع المركبات المباشرة",
  "screen.organization.operations.liveOperations.vehiclePositionUpdated":
    "يظهر آخر موقع للمركبة، وقد حُدِّث {time}.",
  "screen.organization.operations.liveOperations.noPositionYet": "لم يصل أي موقع للمركبة بعد.",
  "screen.organization.operations.liveOperations.vehiclesInProgress": "المركبات قيد التشغيل",
  "screen.organization.operations.liveOperations.noVehiclesInProgress":
    "لا توجد مركبات في هذه الرحلة",
  "screen.organization.operations.liveOperations.occupancyNOfSeats":
    "الإشغال: {n} من {seats} سجّلوا الصعود",
  "screen.organization.operations.liveOperations.moving": "تتحرك",
  "screen.organization.operations.liveOperations.stopped": "متوقفة",
  "screen.organization.operations.liveOperations.noSignal": "لا توجد إشارة",
  "screen.organization.operations.liveOperations.incidentFeed": "سجل الحوادث",
  "screen.organization.operations.liveOperations.noIncidents": "لم يُبلَّغ عن أي حوادث.",
  "screen.organization.operations.liveOperations.incidentLine": "{time} · {plate} · {description}",
  "screen.organization.operations.liveOperations.travelerLookup": "البحث عن مسافر",
  "screen.organization.operations.liveOperations.showsTheVehicleOnly":
    "يعرض المركبة فقط، ولا يعرض الموقع أبدًا.",
  "screen.organization.operations.liveOperations.noTravelerFound":
    "لا يوجد مسافر بهذا الاسم في هذه الرحلة.",
  // apps/web/src/screens/organization/operations/trip-report-review.tsx
  "screen.organization.operations.tripReportReview.title": "مراجعة تقارير الرحلة",
  "screen.organization.operations.tripReportReview.caption":
    "{trip} · تقارير نهاية الرحلة من كل مشرف",
  "screen.organization.operations.tripReportReview.moderatorReportsPerVehicle":
    "تقارير المشرفين لكل مركبة",
  "screen.organization.operations.tripReportReview.vehicle": "المركبة",
  "screen.organization.operations.tripReportReview.finalHeadcount": "العدد النهائي",
  "screen.organization.operations.tripReportReview.checkedIn": "سجّلوا الصعود",
  "screen.organization.operations.tripReportReview.submittedAt": "وقت الإرسال",
  "screen.organization.operations.tripReportReview.status": "الحالة",
  "screen.organization.operations.tripReportReview.incidents": "الحوادث",
  "screen.organization.operations.tripReportReview.notYet": "ليس بعد",
  "screen.organization.operations.tripReportReview.submitted": "مُرسَل",
  "screen.organization.operations.tripReportReview.headcountDiffers": "العدد مختلف",
  "screen.organization.operations.tripReportReview.reportPending": "التقرير قيد الانتظار",
  "screen.organization.operations.tripReportReview.noReportsYet": "لا توجد مركبات في هذه الرحلة بعد",
  "screen.organization.operations.tripReportReview.reportsAppearHereAfterEach":
    "يظهر تقرير كل مشرف هنا بعد انتهاء الرحلة.",
  "screen.organization.operations.tripReportReview.headcountMismatch": "اختلاف عدد الركاب",
  "screen.organization.operations.tripReportReview.nCountedNCheckedIn":
    "عُدّ {counted}، وسجّل الصعود {checkedIn}",
  "screen.organization.operations.tripReportReview.moderatorsReason": "سبب المشرف: {reason}.",
  "screen.organization.operations.tripReportReview.submittedAtReadOnly":
    "أُرسل في {time} للمركبة {plate}. للقراءة فقط بالنسبة للمشرف.",
  "screen.organization.operations.tripReportReview.noMismatch":
    "كل الأعداد المُرسلة تطابق تسجيل الصعود.",
  "screen.organization.operations.tripReportReview.organizationNote": "ملاحظة المؤسسة",
  "screen.organization.operations.tripReportReview.addANote":
    "أضف ملاحظة (يمكن إضافة الملاحظات دون تعديلها)",
  "screen.organization.operations.tripReportReview.savingNotesIsNotAvailable":
    "حفظ الملاحظات غير متاح بعد.",
  "screen.organization.operations.tripReportReview.addNote": "إضافة ملاحظة",
  // apps/web/src/screens/organization/people/crm-and-webhooks.tsx
  "screen.organization.people.crmAndWebhooks.title": "نظام إدارة العملاء والـ Webhooks",
  "screen.organization.people.crmAndWebhooks.caption":
    "اربط نظام إدارة العملاء وأرسل أحداثًا موقّعة إلى نظامك",
  "screen.organization.people.crmAndWebhooks.saveEndpoint": "حفظ نقطة الاستقبال",
  "screen.organization.people.crmAndWebhooks.addEndpoint": "إضافة نقطة استقبال",
  "screen.organization.people.crmAndWebhooks.notSavedTitle": "لم يتم الحفظ",
  "screen.organization.people.crmAndWebhooks.notSavedBody":
    "تحقّق من عنوان نقطة الاستقبال والأحداث، ثم حاول مرة أخرى.",
  "screen.organization.people.crmAndWebhooks.newSecretTitle": "سرّ توقيع جديد",
  "screen.organization.people.crmAndWebhooks.newSecretBody": "انسخه الآن، فهو لا يظهر إلا مرة واحدة.",
  "screen.organization.people.crmAndWebhooks.crmConnection": "ربط نظام إدارة العملاء",
  "screen.organization.people.crmAndWebhooks.connected": "متصل",
  "screen.organization.people.crmAndWebhooks.notConnected": "غير متصل",
  "screen.organization.people.crmAndWebhooks.crmBody":
    "أرسل الحجوزات والمسافرين إلى نظام إدارة العملاء، وتبدأ المزامنة عند الربط.",
  "screen.organization.people.crmAndWebhooks.disconnectCrm": "إلغاء ربط نظام إدارة العملاء",
  "screen.organization.people.crmAndWebhooks.connectCrm": "ربط نظام إدارة العملاء",
  "screen.organization.people.crmAndWebhooks.deliveryLog": "سجل الإرسال",
  "screen.organization.people.crmAndWebhooks.time": "الوقت",
  "screen.organization.people.crmAndWebhooks.event": "الحدث",
  "screen.organization.people.crmAndWebhooks.outcome": "النتيجة",
  "screen.organization.people.crmAndWebhooks.attempts": "المحاولات",
  "screen.organization.people.crmAndWebhooks.noDeliveriesTitle": "لا توجد عمليات إرسال بعد",
  "screen.organization.people.crmAndWebhooks.noDeliveriesBody":
    "سيظهر هنا كل حدث يُرسل إلى نقطة الاستقبال مع نتيجته.",
  // apps/web/src/screens/organization/people/employee-invitation-acceptance.tsx
  "screen.organization.people.employeeInvitationAcceptance.title": "الانضمام إلى المؤسسة",
  "screen.organization.people.employeeInvitationAcceptance.invitationSentTo":
    "أُرسلت الدعوة إلى {email}",
  "screen.organization.people.employeeInvitationAcceptance.caption":
    "تمت دعوتك للعمل في لوحة تحكم هذه المؤسسة",
  "screen.organization.people.employeeInvitationAcceptance.joinedTitle": "انضممت إلى المؤسسة",
  "screen.organization.people.employeeInvitationAcceptance.joinedBody":
    "يمكنك الآن فتح الأقسام المذكورة أدناه.",
  "screen.organization.people.employeeInvitationAcceptance.checkYourEmail":
    "تحقّق من بريدك الإلكتروني",
  "screen.organization.people.employeeInvitationAcceptance.checkYourEmailBody":
    "اقبل الدعوة بالحساب الذي يستخدم البريد الإلكتروني المدعو.",
  "screen.organization.people.employeeInvitationAcceptance.notAcceptedTitle": "لم تُقبل الدعوة",
  "screen.organization.people.employeeInvitationAcceptance.notAcceptedBody":
    "ربما انتهت صلاحية الدعوة أو استُخدمت من قبل. اطلب دعوة جديدة من مالك المؤسسة.",
  "screen.organization.people.employeeInvitationAcceptance.permissionAreasGranted":
    "الأقسام المسموح بها",
  "screen.organization.people.employeeInvitationAcceptance.permissionAreasIntro":
    "يمكنك فتح هذه الأقسام من لوحة التحكم، وتظل الأقسام الأخرى مخفية.",
  "screen.organization.people.employeeInvitationAcceptance.areasAfterAccept":
    "تظهر أقسامك المسموح بها هنا بعد قبول الدعوة.",
  "screen.organization.people.employeeInvitationAcceptance.areasSetByOwner":
    "يحدّد مالك المؤسسة الأقسام المسموح بها، وقد تتغيّر لاحقًا.",
  "screen.organization.people.employeeInvitationAcceptance.invitationCode": "رمز الدعوة",
  "screen.organization.people.employeeInvitationAcceptance.invitationCodeHint":
    "الصق الرمز الموجود في رسالة الدعوة.",
  "screen.organization.people.employeeInvitationAcceptance.signInToAccept":
    "سجّل الدخول بالحساب المدعو لقبول الدعوة.",
  "screen.organization.people.employeeInvitationAcceptance.openWorkspace": "فتح مساحة العمل",
  "screen.organization.people.employeeInvitationAcceptance.decline": "رفض",
  "screen.organization.people.employeeInvitationAcceptance.acceptInvitation": "قبول الدعوة",
  // apps/web/src/screens/organization/people/employee-invitation-and-permissions.tsx
  "screen.organization.people.employeeInvitationAndPermissions.emailInvalid":
    "أدخل بريدًا إلكترونيًا مثل name@example.com.",
  "screen.organization.people.employeeInvitationAndPermissions.roleTitleTooShort":
    "أدخل مسمّى وظيفيًا من حرفين على الأقل.",
  "screen.organization.people.employeeInvitationAndPermissions.employeeEmail":
    "البريد الإلكتروني للموظف",
  "screen.organization.people.employeeInvitationAndPermissions.roleTitle": "المسمّى الوظيفي",
  "screen.organization.people.employeeInvitationAndPermissions.permissionAreas":
    "الأقسام المسموح بها",
  "screen.organization.people.employeeInvitationAndPermissions.editTitle": "صلاحيات الموظف",
  "screen.organization.people.employeeInvitationAndPermissions.title": "دعوة موظف",
  "screen.organization.people.employeeInvitationAndPermissions.caption":
    "حدّد الأقسام المسموح بها لهذا الموظف، ويُسجَّل كل تغيير.",
  "screen.organization.people.employeeInvitationAndPermissions.savePermissions": "حفظ الصلاحيات",
  "screen.organization.people.employeeInvitationAndPermissions.sendInvitation": "إرسال الدعوة",
  "screen.organization.people.employeeInvitationAndPermissions.notSavedTitle": "لم يتم الحفظ",
  "screen.organization.people.employeeInvitationAndPermissions.notSavedBody":
    "تحقّق من البريد الإلكتروني ومن حدّ الموظفين في باقتك، ثم حاول مرة أخرى.",
  "screen.organization.people.employeeInvitationAndPermissions.invitation": "الدعوة",
  "screen.organization.people.employeeInvitationAndPermissions.changeHistory": "سجل التغييرات",
  "screen.organization.people.employeeInvitationAndPermissions.historyCaption":
    "للقراءة فقط. يوضّح كل إدخال من غيّر ماذا ومتى.",
  // apps/web/src/screens/organization/people/employees-list.tsx
  "screen.organization.people.employeesList.active": "نشط",
  "screen.organization.people.employeesList.invitationSent": "أُرسلت الدعوة",
  "screen.organization.people.employeesList.suspended": "موقوف",
  "screen.organization.people.employeesList.removed": "تمت الإزالة",
  "screen.organization.people.employeesList.name": "الاسم",
  "screen.organization.people.employeesList.email": "البريد الإلكتروني",
  "screen.organization.people.employeesList.status": "الحالة",
  "screen.organization.people.employeesList.permissionAreas": "الأقسام المسموح بها",
  "screen.organization.people.employeesList.none": "لا شيء",
  "screen.organization.people.employeesList.action": "الإجراء",
  "screen.organization.people.employeesList.removeName": "إزالة {name}",
  "screen.organization.people.employeesList.remove": "إزالة",
  "screen.organization.people.employeesList.nOfLimit": "{n} من {limit}",
  "screen.organization.people.employeesList.inviteEmployee": "دعوة موظف",
  "screen.organization.people.employeesList.title": "الموظفون",
  "screen.organization.people.employeesList.caption":
    "من يمكنه فتح لوحة التحكم هذه، وحالته، والأقسام المسموح له بها",
  "screen.organization.people.employeesList.employeesOnYourPlan": "الموظفون في باقتك",
  "screen.organization.people.employeesList.invitationsWaiting": "دعوات بانتظار القبول",
  "screen.organization.people.employeesList.notRemovedTitle": "لم تتم إزالة الموظف",
  "screen.organization.people.employeesList.notRemovedBody":
    "حاول مرة أخرى، وإذا تكرّر الخطأ فأعد تحميل الصفحة.",
  "screen.organization.people.employeesList.emptyTitle": "لا يوجد موظفون بعد",
  "screen.organization.people.employeesList.emptyBody":
    "ادعُ الموظفين واختر الأقسام التي يمكن لكل منهم فتحها.",
  "screen.organization.people.employeesList.removalNote":
    "تؤدي إزالة الموظف إلى إنهاء وصوله فورًا، مع الاحتفاظ بسجلات التدقيق السابقة.",
  "screen.organization.people.employeesList.removeThisEmployee": "إزالة هذا الموظف؟",
  "screen.organization.people.employeesList.removeEmployee": "إزالة الموظف",
  "screen.organization.people.employeesList.keepEmployee": "الإبقاء على الموظف",
  // apps/web/src/screens/organization/people/people-parts.tsx
  "screen.organization.people.peopleParts.areaTrips": "الرحلات",
  "screen.organization.people.peopleParts.areaBookings": "الحجوزات",
  "screen.organization.people.peopleParts.areaAccounting": "المحاسبة",
  "screen.organization.people.peopleParts.areaCoupons": "القسائم",
  "screen.organization.people.peopleParts.areaEmployees": "الموظفون",
  "screen.organization.people.peopleParts.areaFleet": "الأسطول",
  "screen.organization.people.peopleParts.areaSubscription": "الاشتراك",
  "screen.organization.people.peopleParts.areaTracking": "التتبّع المباشر",
  "screen.organization.people.peopleParts.areaSettings": "الإعدادات",
  // apps/web/src/screens/organization/people/permission-history.tsx
  "screen.organization.people.permissionHistory.owner": "المالك",
  "screen.organization.people.permissionHistory.employee": "موظف",
  "screen.organization.people.permissionHistory.platformAdmin": "مشرف المنصة",
  "screen.organization.people.permissionHistory.invitationSent": "أُرسلت الدعوة",
  "screen.organization.people.permissionHistory.invitationResent": "أُعيد إرسال الدعوة",
  "screen.organization.people.permissionHistory.invitationAccepted": "قُبلت الدعوة",
  "screen.organization.people.permissionHistory.permissionsChanged": "تغيّرت الصلاحيات",
  "screen.organization.people.permissionHistory.statusChanged": "تغيّرت الحالة",
  "screen.organization.people.permissionHistory.statusActive": "نشط",
  "screen.organization.people.permissionHistory.statusInvited": "مدعو",
  "screen.organization.people.permissionHistory.statusSuspended": "موقوف",
  "screen.organization.people.permissionHistory.statusRemoved": "تمت الإزالة",
  "screen.organization.people.permissionHistory.none": "لا شيء",
  "screen.organization.people.permissionHistory.when": "التوقيت",
  "screen.organization.people.permissionHistory.who": "بواسطة",
  "screen.organization.people.permissionHistory.change": "التغيير",
  "screen.organization.people.permissionHistory.before": "قبل",
  "screen.organization.people.permissionHistory.after": "بعد",
  "screen.organization.people.permissionHistory.caption": "سجل التغييرات",
  "screen.organization.people.permissionHistory.emptyTitle": "لا توجد تغييرات بعد",
  "screen.organization.people.permissionHistory.emptyBody": "تظهر التغييرات هنا بعد إرسال الدعوة.",
  // apps/web/src/screens/organization/people/webhook-form.tsx
  "screen.organization.people.webhookForm.bookingConfirmed": "تأكيد الحجز",
  "screen.organization.people.webhookForm.bookingCancelled": "إلغاء الحجز",
  "screen.organization.people.webhookForm.tripPublished": "نشر الرحلة",
  "screen.organization.people.webhookForm.checkIn": "تسجيل الصعود",
  "screen.organization.people.webhookForm.checkOut": "تسجيل النزول",
  "screen.organization.people.webhookForm.signingStatus": "حالة التوقيع",
  "screen.organization.people.webhookForm.urlInvalid": "أدخل عنوانًا يبدأ بـ https://.",
  "screen.organization.people.webhookForm.webhookEndpoint": "نقطة استقبال الـ Webhook",
  "screen.organization.people.webhookForm.endpointUrl": "عنوان نقطة الاستقبال",
  "screen.organization.people.webhookForm.signingSecretHidden": "سرّ التوقيع: ••••••••••••",
  "screen.organization.people.webhookForm.signingSecretAfterSave":
    "يُنشأ سرّ التوقيع عند حفظ نقطة الاستقبال.",
  "screen.organization.people.webhookForm.rotateSecret": "تغيير السرّ",
  "screen.organization.people.webhookForm.sendTest": "إرسال تجربة",
  "screen.organization.people.webhookForm.sendTestUnavailable": "إرسال التجارب غير متاح بعد.",
  "screen.organization.people.webhookForm.events": "الأحداث",
  "screen.organization.people.webhookForm.eventsRequired": "اختر حدثًا واحدًا على الأقل.",
  // apps/web/src/screens/organization/staffing/deal-detail-and-negotiation.tsx
  "screen.organization.staffing.dealDetailAndNegotiation.dealWith": "صفقة مع {name}",
  "screen.organization.staffing.dealDetailAndNegotiation.vehicleLastUpdate":
    "المركبة {plate} · آخر تحديث {time}",
  "screen.organization.staffing.dealDetailAndNegotiation.emptyTitle": "لا توجد صفقة لعرضها",
  "screen.organization.staffing.dealDetailAndNegotiation.emptyBody":
    "ابدأ صفقة من البحث عن موردي المنصة.",
  "screen.organization.staffing.dealDetailAndNegotiation.expiresInHours": "تنتهي خلال {hours} ساعة",
  "screen.organization.staffing.dealDetailAndNegotiation.expiryRule":
    "تُرفض الصفقة كمنتهية إذا لم يصل رد خلال 72 ساعة من آخر عرض مضاد.",
  "screen.organization.staffing.dealDetailAndNegotiation.respondFailed":
    "لم يُرسل ردك. حاول مرة أخرى.",
  "screen.organization.staffing.dealDetailAndNegotiation.dealDetails": "تفاصيل الصفقة",
  "screen.organization.staffing.dealDetailAndNegotiation.trip": "الرحلة",
  "screen.organization.staffing.dealDetailAndNegotiation.date": "التاريخ",
  "screen.organization.staffing.dealDetailAndNegotiation.route": "المسار",
  "screen.organization.staffing.dealDetailAndNegotiation.currentPay": "الأجر الحالي",
  "screen.organization.staffing.dealDetailAndNegotiation.offerHistory": "سجل العروض",
  "screen.organization.staffing.dealDetailAndNegotiation.proposed": "مقترح",
  "screen.organization.staffing.dealDetailAndNegotiation.organizationProposed":
    "اقترحت المؤسسة {amount} في {date}",
  "screen.organization.staffing.dealDetailAndNegotiation.counteredByProvider": "عرض مضاد من المورد",
  "screen.organization.staffing.dealDetailAndNegotiation.counteredByOrganization":
    "عرض مضاد من المؤسسة",
  "screen.organization.staffing.dealDetailAndNegotiation.providerCountered":
    "قدّم المورد عرضًا مضادًا بقيمة {amount} في {date}",
  "screen.organization.staffing.dealDetailAndNegotiation.organizationCountered":
    "قدّمت المؤسسة عرضًا مضادًا بقيمة {amount} في {date}",
  "screen.organization.staffing.dealDetailAndNegotiation.yourResponse": "ردك",
  "screen.organization.staffing.dealDetailAndNegotiation.counterAmount": "قيمة العرض المضاد",
  "screen.organization.staffing.dealDetailAndNegotiation.counterVoidsAcceptance":
    "يُلغي العرض المضاد أي قبول لهذه الصفقة حتى يتفق الطرفان من جديد.",
  "screen.organization.staffing.dealDetailAndNegotiation.rejectDeal": "رفض الصفقة",
  "screen.organization.staffing.dealDetailAndNegotiation.acceptOffer": "قبول العرض",
  "screen.organization.staffing.dealDetailAndNegotiation.sendCounter": "إرسال عرض مضاد",
  // apps/web/src/screens/organization/staffing/organization-owned-drivers-and-photographers.tsx
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.driver": "سائق",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.photographer": "مصور",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.name": "الاسم",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.type": "النوع",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.status": "الحالة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.active": "نشط",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.inactive": "غير نشط",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.vehicleAssignments":
    "تعيينات المركبات",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.action": "الإجراء",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove": "إزالة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer":
    "إضافة سائق أو مصور",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.fullName": "الاسم الكامل",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.phone": "الهاتف",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emailOptional":
    "البريد الإلكتروني (اختياري)",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.licenseNumber":
    "رقم الرخصة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cameraBody":
    "هيكل الكاميرا",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saving": "جارٍ الحفظ…",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saveStaffMember":
    "حفظ عضو الطاقم",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cancel": "إلغاء",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.title": "طاقم المؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.caption":
    "السائقون والمصورون الذين توظفهم مؤسستك. لا تراهم المؤسسات الأخرى أبدًا.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailed":
    "تعذّر إتمام الإجراء",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailedBody":
    "لم يُحفظ التغيير. راجع البيانات وحاول مرة أخرى.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDrivers":
    "سائقو المؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedPhotographers":
    "مصورو المؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.tableCaption":
    "سائقو المؤسسة ومصوروها",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emptyTitle":
    "لا يوجد طاقم للمؤسسة بعد",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emptyBody":
    "أضف سائقًا أو مصورًا توظفه مؤسستك.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.assignmentsAcceptedAutomatically":
    "تُقبل التعيينات تلقائيًا",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removingChangesFutureOnly":
    "إزالة شخص تغيّر التعيينات المستقبلية فقط. تحتفظ الرحلات التي اكتمل طاقمها بتعيينها الحالي حتى تغيّره.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removeThisStaffMember":
    "إزالة عضو الطاقم هذا؟",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.keep": "إبقاء",
  // apps/web/src/screens/organization/staffing/platform-supplier-search-and-deal-start.tsx
  "screen.organization.staffing.platformSupplierSearchAndDealStart.verified": "موثَّق",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.unavailableOnDate":
    "غير متاح في {date}",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.availableOnDate":
    "متاح في {date}",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.availabilityUnknown":
    "لم يُتحقق من التوفر",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.selected": "محدَّد",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.selectSupplier": "اختيار المورد",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.title":
    "البحث عن مورد من المنصة",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.caption":
    "{trip} · المركبة {plate}",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.searchSuppliers":
    "البحث في الموردين",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierType": "نوع المورد",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.date": "التاريخ",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.emptyTitle":
    "لا يوجد موردون مطابقون",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.emptyBody":
    "جرّب اسمًا آخر أو نوع مورد آخر.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.startADeal": "بدء صفقة",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.trip": "الرحلة",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.route": "المسار",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplier": "المورد",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.proposedPay": "الأجر المقترح",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.currency": "العملة",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierSeesDetails":
    "يرى المورد الرحلة والمسار والتاريخ والأجر قبل أن يرد.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.sendFailed":
    "لم يُرسل العرض. حاول مرة أخرى.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.selectSupplierFirst":
    "اختر موردًا أولًا.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal": "إرسال العرض",
  // apps/web/src/screens/organization/staffing/staffing-board.tsx
  "screen.organization.staffing.staffingBoard.platformFinalized": "مورد المنصة مؤكَّد",
  "screen.organization.staffing.staffingBoard.platformNegotiating": "تفاوض مع مورد المنصة",
  "screen.organization.staffing.staffingBoard.assigned": "مُعيَّن",
  "screen.organization.staffing.staffingBoard.ownStaff": "طاقم المؤسسة",
  "screen.organization.staffing.staffingBoard.acceptedOwnStaff": "مقبول، من طاقم المؤسسة",
  "screen.organization.staffing.staffingBoard.notAssigned": "غير مُعيَّن",
  "screen.organization.staffing.staffingBoard.missing": "ناقص",
  "screen.organization.staffing.staffingBoard.vehicle": "المركبة",
  "screen.organization.staffing.staffingBoard.driver": "السائق",
  "screen.organization.staffing.staffingBoard.moderator": "المشرف",
  "screen.organization.staffing.staffingBoard.photographer": "المصور",
  "screen.organization.staffing.staffingBoard.action": "الإجراء",
  "screen.organization.staffing.staffingBoard.openDeal": "فتح الصفقة",
  "screen.organization.staffing.staffingBoard.openStaff": "فتح الطاقم",
  "screen.organization.staffing.staffingBoard.missingDriverOn": "لا يوجد سائق على {plate}.",
  "screen.organization.staffing.staffingBoard.missingModeratorOn": "لا يوجد مشرف على {plate}.",
  "screen.organization.staffing.staffingBoard.noTrips": "لا توجد رحلات بعد",
  "screen.organization.staffing.staffingBoard.title": "لوحة الطاقم",
  "screen.organization.staffing.staffingBoard.caption": "صف لكل مركبة في الرحلة المحددة",
  "screen.organization.staffing.staffingBoard.trip": "الرحلة",
  "screen.organization.staffing.staffingBoard.readyBlockedByGaps":
    "حالة «جاهزة» متوقفة بسبب {n} من النواقص",
  "screen.organization.staffing.staffingBoard.eachGapHighlighted": "كل نقص مُبرز في الجدول.",
  "screen.organization.staffing.staffingBoard.tableCaption": "الطاقم لكل مركبة",
  "screen.organization.staffing.staffingBoard.emptyTitle": "لا توجد مركبات في هذه الرحلة",
  "screen.organization.staffing.staffingBoard.emptyBody": "أضف مركبات إلى الرحلة لتخطيط طاقمها.",
  "screen.organization.staffing.staffingBoard.readyNeedsDriverAndModerator":
    "تتطلب حالة «جاهزة» سائقًا ومشرفًا على كل مركبة.",
  "screen.organization.staffing.staffingBoard.openOrganizationOwnedStaff": "فتح طاقم المؤسسة",
  // apps/web/src/screens/organization/staffing/staffing-parts.tsx
  "screen.organization.staffing.staffingParts.routeFromTo": "من {from} إلى {to}",
  "screen.organization.staffing.staffingParts.driver": "سائق",
  "screen.organization.staffing.staffingParts.photographer": "مصور",
  "screen.organization.staffing.staffingParts.proposed": "مقترح",
  "screen.organization.staffing.staffingParts.counteredByProvider": "عرض مضاد من المورد",
  "screen.organization.staffing.staffingParts.counteredByOrganization": "عرض مضاد من المؤسسة",
  "screen.organization.staffing.staffingParts.accepted": "مقبول",
  "screen.organization.staffing.staffingParts.rejected": "مرفوض",
  "screen.organization.staffing.staffingParts.expired": "منتهٍ",
  "screen.organization.staffing.staffingParts.cancelled": "ملغى",
  // apps/web/src/screens/organization/trips/cancel-trip-decision.tsx
  "screen.organization.trips.cancelTripDecision.dateRange": "من {start} إلى {end}",
  "screen.organization.trips.cancelTripDecision.reasonRequired": "أدخل سببًا لا يقل عن 3 أحرف.",
  "screen.organization.trips.cancelTripDecision.cancelTrip": "إلغاء الرحلة",
  "screen.organization.trips.cancelTripDecision.cannotBeUndoneTitle":
    "لا يمكن التراجع عن هذا الإجراء",
  "screen.organization.trips.cancelTripDecision.cannotBeUndoneBody":
    "يؤدي الإلغاء إلى إبلاغ كل مسافر في هذه الرحلة وجدولة استرداد مبالغهم.",
  "screen.organization.trips.cancelTripDecision.cancelFailedTitle": "لم تُلغَ الرحلة",
  "screen.organization.trips.cancelTripDecision.cancelFailedBody":
    "لم يتغير شيء. حاول مرة أخرى بعد قليل.",
  "screen.organization.trips.cancelTripDecision.reason": "السبب",
  "screen.organization.trips.cancelTripDecision.reasonLabel": "سبب الإلغاء (مطلوب)",
  "screen.organization.trips.cancelTripDecision.auditNote":
    "يُحفظ السبب في سجل التدقيق ويُشارك مع مالك المنظمة.",
  "screen.organization.trips.cancelTripDecision.whatHappensNext": "ما الذي سيحدث بعد ذلك",
  "screen.organization.trips.cancelTripDecision.affectedBookings": "الحجوزات المتأثرة",
  "screen.organization.trips.cancelTripDecision.nConfirmed": "{n} مؤكدة",
  "screen.organization.trips.cancelTripDecision.refundPolicy": "سياسة الاسترداد",
  "screen.organization.trips.cancelTripDecision.refundPolicySummary":
    "عند إلغاء المنظمة للرحلة يُسترد 100٪ من قيمة كل حجز مؤكد.",
  "screen.organization.trips.cancelTripDecision.bookingsMoveToCancelled":
    "ينتقل كل حجز مؤكد إلى «ملغى» ثم إلى «مسترد»",
  "screen.organization.trips.cancelTripDecision.travelersNotified":
    "يُبلَّغ المسافرون عبر البريد الإلكتروني وداخل التطبيق",
  "screen.organization.trips.cancelTripDecision.refundsQueued":
    "تُجدوَل المبالغ المستردة عبر بوابة الدفع",
  "screen.organization.trips.cancelTripDecision.keepTrip": "الإبقاء على الرحلة",
  "screen.organization.trips.cancelTripDecision.blockedWhileInProgress":
    "الإلغاء غير متاح أثناء تنفيذ الرحلة.",
  // apps/web/src/screens/organization/trips/program-editor.tsx
  "screen.organization.trips.programEditor.perPerson": "لكل شخص",
  "screen.organization.trips.programEditor.free": "مجاني",
  "screen.organization.trips.programEditor.byQuantity": "حسب الكمية",
  "screen.organization.trips.programEditor.perGroup": "لكل مجموعة",
  "screen.organization.trips.programEditor.tiered": "متدرج",
  "screen.organization.trips.programEditor.optional": "اختياري",
  "screen.organization.trips.programEditor.preRequired": "مطلوب مسبقًا",
  "screen.organization.trips.programEditor.capacityLimited": "محدود السعة",
  "screen.organization.trips.programEditor.vipOnly": "لكبار الشخصيات فقط",
  "screen.organization.trips.programEditor.nameRequired": "أدخل اسم البرنامج للحفظ.",
  "screen.organization.trips.programEditor.programCaption": "برنامج {name}",
  "screen.organization.trips.programEditor.newProgram": "برنامج جديد",
  "screen.organization.trips.programEditor.editProgram": "تعديل البرنامج",
  "screen.organization.trips.programEditor.saveProgram": "حفظ البرنامج",
  "screen.organization.trips.programEditor.bookingsAffectedTitle": "تتأثر الحجوزات المؤكدة",
  "screen.organization.trips.programEditor.bookingsAffectedBody":
    "يُبلَّغ المسافرون ويُعرض عليهم حل بديل قبل سريان هذا التغيير.",
  "screen.organization.trips.programEditor.saveFailedTitle": "لم يُحفظ البرنامج",
  "screen.organization.trips.programEditor.saveFailedBody": "راجع الحقول وحاول مرة أخرى.",
  "screen.organization.trips.programEditor.programDetails": "تفاصيل البرنامج",
  "screen.organization.trips.programEditor.programName": "اسم البرنامج",
  "screen.organization.trips.programEditor.pricingModelChooseOne": "نموذج التسعير (اختر واحدًا)",
  "screen.organization.trips.programEditor.typeFlags": "خصائص النوع",
  "screen.organization.trips.programEditor.cap": "الحد الأقصى",
  "screen.organization.trips.programEditor.capHint": "عدد الأماكن.",
  "screen.organization.trips.programEditor.prices": "الأسعار",
  "screen.organization.trips.programEditor.pricePerPerson": "السعر للفرد",
  "screen.organization.trips.programEditor.currency": "العملة",
  // apps/web/src/screens/organization/trips/trip-command-parts.tsx
  "screen.organization.trips.tripCommandParts.tripStateFlow": "مسار حالات الرحلة",
  "screen.organization.trips.tripCommandParts.currentState": "{state} (الحالية)",
  "screen.organization.trips.tripCommandParts.open": "مفتوحة",
  "screen.organization.trips.tripCommandParts.none": "لا يوجد",
  "screen.organization.trips.tripCommandParts.assigned": "معيّن",
  "screen.organization.trips.tripCommandParts.missing": "غير معيّن",
  // apps/web/src/screens/organization/trips/trip-command-view.tsx
  "screen.organization.trips.tripCommandView.overview": "نظرة عامة",
  "screen.organization.trips.tripCommandView.staffing": "الطاقم",
  "screen.organization.trips.tripCommandView.seats": "المقاعد",
  "screen.organization.trips.tripCommandView.bookings": "الحجوزات",
  "screen.organization.trips.tripCommandView.programs": "البرامج",
  "screen.organization.trips.tripCommandView.liveOperations": "العمليات المباشرة",
  "screen.organization.trips.tripCommandView.accounting": "المحاسبة",
  "screen.organization.trips.tripCommandView.vehicle": "المركبة",
  "screen.organization.trips.tripCommandView.driver": "السائق",
  "screen.organization.trips.tripCommandView.moderator": "المشرف",
  "screen.organization.trips.tripCommandView.openDeal": "صفقة مفتوحة",
  "screen.organization.trips.tripCommandView.dateRange": "من {start} إلى {end}",
  "screen.organization.trips.tripCommandView.departsFrom": "تنطلق الساعة {time} من {origin}",
  "screen.organization.trips.tripCommandView.percent": "{n}٪",
  "screen.organization.trips.tripCommandView.cancelTrip": "إلغاء الرحلة",
  "screen.organization.trips.tripCommandView.trip": "الرحلة",
  "screen.organization.trips.tripCommandView.tripSections": "أقسام الرحلة",
  "screen.organization.trips.tripCommandView.seatsSold": "المقاعد المباعة",
  "screen.organization.trips.tripCommandView.nOfCapacity": "{n} من {capacity}",
  "screen.organization.trips.tripCommandView.seatsHeld": "المقاعد المحجوزة مؤقتًا",
  "screen.organization.trips.tripCommandView.seatsReserved": "المقاعد المخصصة",
  "screen.organization.trips.tripCommandView.occupancy": "نسبة الإشغال",
  "screen.organization.trips.tripCommandView.tripState": "حالة الرحلة",
  "screen.organization.trips.tripCommandView.cancelBlockedTitle":
    "الإلغاء غير متاح أثناء تنفيذ الرحلة",
  "screen.organization.trips.tripCommandView.cancelBlockedBody":
    "لا يمكن إلغاء رحلة بدأت. تنتقل حالتها عند انتهاء الرحلة.",
  "screen.organization.trips.tripCommandView.readyGaps": "نواقص الجاهزية",
  "screen.organization.trips.tripCommandView.noVehicles": "لا توجد مركبات في هذه الرحلة بعد.",
  "screen.organization.trips.tripCommandView.goTo": "الانتقال إلى",
  // apps/web/src/screens/organization/trips/trip-parts.tsx
  "screen.organization.trips.tripParts.money": "{amount} {currency}",
  "screen.organization.trips.tripParts.unlimited": "غير محدود",
  "screen.organization.trips.tripParts.seatLayoutPreviewLabel":
    "معاينة مخطط المقاعد بعدد {n} مقعدًا",
  // apps/web/src/screens/organization/trips/trip-wizard-step-1-basics.tsx
  "screen.organization.trips.tripWizardStep1Basics.nameRequired": "أدخل اسم الرحلة للمتابعة.",
  "screen.organization.trips.tripWizardStep1Basics.chooseTripType": "اختر نوع الرحلة",
  "screen.organization.trips.tripWizardStep1Basics.arabic": "العربية",
  "screen.organization.trips.tripWizardStep1Basics.english": "الإنجليزية",
  "screen.organization.trips.tripWizardStep1Basics.tripBasics": "أساسيات الرحلة",
  "screen.organization.trips.tripWizardStep1Basics.tripName": "اسم الرحلة",
  "screen.organization.trips.tripWizardStep1Basics.description": "الوصف",
  "screen.organization.trips.tripWizardStep1Basics.descriptionPlaceholder":
    "وصف موجز للرحلة للمسافرين",
  "screen.organization.trips.tripWizardStep1Basics.tripType": "نوع الرحلة",
  "screen.organization.trips.tripWizardStep1Basics.language": "اللغة",
  "screen.organization.trips.tripWizardStep1Basics.saveFailedTitle": "لم تُحفظ المسودة",
  "screen.organization.trips.tripWizardStep1Basics.saveFailedBody": "راجع الحقول وحاول مرة أخرى.",
  "screen.organization.trips.tripWizardStep1Basics.draftSavedNote":
    "تُحفظ مسودتك أثناء الكتابة. يمكنك المغادرة والعودة إليها لاحقًا.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-2-schedule-and-route.tsx
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.mapPickerNote":
    "منتقي الخريطة من خدمة الخرائط",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.stop": "المحطة",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.order": "الترتيب",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.action": "الإجراء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.removeStop": "إزالة {name}",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.remove": "إزالة",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.saveFailedTitle": "لم يُحفظ الجدول",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.saveFailedBody":
    "راجع التواريخ والأوقات والمحطات، ثم حاول مرة أخرى.",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.datesAndTimes": "التواريخ والأوقات",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startDate": "تاريخ البدء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startTime": "وقت البدء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endDate": "تاريخ الانتهاء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endTime": "وقت الانتهاء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripTimeZone":
    "المنطقة الزمنية للرحلة",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.origin": "نقطة الانطلاق",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops":
    "الوجهات والمحطات",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.noStops": "أضف محطة واحدة على الأقل.",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.newStop": "محطة جديدة",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.addStop": "إضافة محطة",
  // apps/web/src/screens/organization/trips/trip-wizard-step-3-vehicles.tsx
  "screen.organization.trips.tripWizardStep3Vehicles.plate": "اللوحة",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicleType": "نوع المركبة",
  "screen.organization.trips.tripWizardStep3Vehicles.seats": "المقاعد",
  "screen.organization.trips.tripWizardStep3Vehicles.nSeats": "{n} مقعدًا",
  "screen.organization.trips.tripWizardStep3Vehicles.action": "الإجراء",
  "screen.organization.trips.tripWizardStep3Vehicles.removeVehicle": "إزالة {plate}",
  "screen.organization.trips.tripWizardStep3Vehicles.remove": "إزالة",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicleLimitNote":
    "المركبات في هذه الرحلة: {n} من {limit}. هل تحتاج إلى مركبات أكثر؟",
  "screen.organization.trips.tripWizardStep3Vehicles.upgradeYourPlan": "رقِّ باقتك.",
  "screen.organization.trips.tripWizardStep3Vehicles.saveFailedTitle": "لم تُحفظ المركبات",
  "screen.organization.trips.tripWizardStep3Vehicles.saveFailedBody":
    "حاول مرة أخرى. إذا تكرر الخطأ، فتأكد من أن المركبات نشطة.",
  "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip": "المركبات في هذه الرحلة",
  "screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet":
    "لا توجد مركبات في هذه الرحلة بعد.",
  "screen.organization.trips.tripWizardStep3Vehicles.addVehicle": "إضافة مركبة",
  "screen.organization.trips.tripWizardStep3Vehicles.atLimitNote":
    "بلغت هذه الرحلة الحد الأقصى للمركبات في باقتك.",
  "screen.organization.trips.tripWizardStep3Vehicles.noMoreVehiclesNote":
    "كل مركبات أسطولك مضافة إلى هذه الرحلة بالفعل.",
  "screen.organization.trips.tripWizardStep3Vehicles.seatLayoutPreview": "معاينة مخطط المقاعد",
  "screen.organization.trips.tripWizardStep3Vehicles.layoutOfVehicle": "مخطط {type}",
  "screen.organization.trips.tripWizardStep3Vehicles.layoutCaption": "مخطط نوع المركبة المحدد",
  // apps/web/src/screens/organization/trips/trip-wizard-step-4-staffing.tsx
  "screen.organization.trips.tripWizardStep4Staffing.missingDriver": "لا يوجد سائق",
  "screen.organization.trips.tripWizardStep4Staffing.missingModerator": "لا يوجد مشرف",
  "screen.organization.trips.tripWizardStep4Staffing.notAssigned": "غير معيّن",
  "screen.organization.trips.tripWizardStep4Staffing.assigned": "معيّن",
  "screen.organization.trips.tripWizardStep4Staffing.nameOwnStaff": "{name}، من طاقمك",
  "screen.organization.trips.tripWizardStep4Staffing.namePlatform": "{name}، من المنصة",
  "screen.organization.trips.tripWizardStep4Staffing.vehicle": "المركبة",
  "screen.organization.trips.tripWizardStep4Staffing.driver": "السائق",
  "screen.organization.trips.tripWizardStep4Staffing.moderator": "المشرف",
  "screen.organization.trips.tripWizardStep4Staffing.photographer": "المصور",
  "screen.organization.trips.tripWizardStep4Staffing.platformStaffTitle":
    "طاقم المنصة متاح في باقتي النمو والمؤسسات",
  "screen.organization.trips.tripWizardStep4Staffing.platformStaffBody":
    "تعتمد باقتك على سائقيك ومصوريك. تُتاح خيارات المنصة عند ترقية الباقة.",
  "screen.organization.trips.tripWizardStep4Staffing.saveFailedTitle": "لم يُحفظ الطاقم",
  "screen.organization.trips.tripWizardStep4Staffing.saveFailedBody": "حاول مرة أخرى بعد قليل.",
  "screen.organization.trips.tripWizardStep4Staffing.staffForEachVehicle": "الطاقم لكل مركبة",
  "screen.organization.trips.tripWizardStep4Staffing.noVehicles": "أضف المركبات في الخطوة 3 أولًا.",
  "screen.organization.trips.tripWizardStep4Staffing.readyNeedsNote":
    "تتطلب حالة «جاهزة» سائقًا ومشرفًا في كل مركبة. كل نقص مذكور أعلاه.",
  "screen.organization.trips.tripWizardStep4Staffing.assignOwnStaff": "تعيين طاقمك",
  // apps/web/src/screens/organization/trips/trip-wizard-step-5-programs.tsx
  "screen.organization.trips.tripWizardStep5Programs.program": "البرنامج",
  "screen.organization.trips.tripWizardStep5Programs.pricingModel": "نموذج التسعير",
  "screen.organization.trips.tripWizardStep5Programs.typeFlags": "خصائص النوع",
  "screen.organization.trips.tripWizardStep5Programs.cap": "الحد الأقصى",
  "screen.organization.trips.tripWizardStep5Programs.price": "السعر",
  "screen.organization.trips.tripWizardStep5Programs.preRequired": "مطلوب مسبقًا",
  "screen.organization.trips.tripWizardStep5Programs.optional": "اختياري",
  "screen.organization.trips.tripWizardStep5Programs.capacityLimited": "محدود السعة",
  "screen.organization.trips.tripWizardStep5Programs.free": "مجاني",
  "screen.organization.trips.tripWizardStep5Programs.perPerson": "لكل شخص",
  "screen.organization.trips.tripWizardStep5Programs.listSeparator": "، ",
  "screen.organization.trips.tripWizardStep5Programs.none": "لا يوجد",
  "screen.organization.trips.tripWizardStep5Programs.nOfLimitPrograms": "{n} من {limit} برامج",
  "screen.organization.trips.tripWizardStep5Programs.addProgram": "إضافة برنامج",
  "screen.organization.trips.tripWizardStep5Programs.saveFailedTitle": "لم تُحفظ خطوة البرامج",
  "screen.organization.trips.tripWizardStep5Programs.saveFailedBody": "حاول مرة أخرى بعد قليل.",
  "screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip": "البرامج في هذه الرحلة",
  "screen.organization.trips.tripWizardStep5Programs.noProgramsYet": "لا توجد برامج بعد",
  "screen.organization.trips.tripWizardStep5Programs.noProgramsBody": "أضف برنامجًا، أو تابع بدونه.",
  "screen.organization.trips.tripWizardStep5Programs.atLimitNote":
    "بلغت هذه الرحلة الحد الأقصى للبرامج في باقتك.",
  "screen.organization.trips.tripWizardStep5Programs.onePricingModelNote":
    "لكل برنامج نموذج تسعير واحد فقط. عدّل البرنامج لتغيير سعره أو خصائصه قبل بدء الرحلة.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-6-seating.tsx
  "screen.organization.trips.tripWizardStep6Seating.saveFailedTitle": "لم تُحفظ إعدادات المقاعد",
  "screen.organization.trips.tripWizardStep6Seating.saveFailedBody": "حاول مرة أخرى بعد قليل.",
  "screen.organization.trips.tripWizardStep6Seating.seatMode": "طريقة تخصيص المقاعد",
  "screen.organization.trips.tripWizardStep6Seating.chooseHowTravelersGetSeats":
    "اختر طريقة حصول المسافرين على المقاعد",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssigned": "تخصيص من المنظمة",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssignedBody":
    "الخيار الافتراضي. يخصص فريقك لكل مسافر مقعدًا من خريطة المقاعد.",
  "screen.organization.trips.tripWizardStep6Seating.travelerSelfSelect": "اختيار المسافر بنفسه",
  "screen.organization.trips.tripWizardStep6Seating.growthOrEnterprise": "النمو أو المؤسسات",
  "screen.organization.trips.tripWizardStep6Seating.travelerSelfSelectLocked":
    "يختار المسافرون مقاعدهم بأنفسهم. غير متاح في باقتك.",
  "screen.organization.trips.tripWizardStep6Seating.travelerSelfSelectBody":
    "يختار المسافرون مقاعدهم بأنفسهم.",
  "screen.organization.trips.tripWizardStep6Seating.priorityWindow": "فترة الأولوية",
  "screen.organization.trips.tripWizardStep6Seating.priorityWindowLabel":
    "فترة الأولوية لمسافري باقتي المستكشف وكبار الشخصيات",
  "screen.organization.trips.tripWizardStep6Seating.windowHoursHint": "بالساعات.",
  "screen.organization.trips.tripWizardStep6Seating.windowTbc": "لم تُعتمد مدة الفترة بعد.",
  "screen.organization.trips.tripWizardStep6Seating.changeRulesNote":
    "يخضع تغيير طريقة تخصيص المقاعد بعد وجود حجوزات لقواعد تعديل الرحلة، ويُبلَّغ المسافرون أولًا.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-7-pricing-and-capacity.tsx
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.perVehicleValue":
    "{n} مقعدًا، حسب نوع المركبة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.nSeats": "{n} مقعدًا",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.saveFailedTitle": "لم يُحفظ التسعير",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.saveFailedBody":
    "راجع السعر وحاول مرة أخرى.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePriceAndCapacity":
    "السعر الأساسي والسعة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePricePerPerson":
    "السعر الأساسي للفرد",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.currency": "العملة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityPerVehicle":
    "السعة لكل مركبة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.totalCapacity":
    "إجمالي السعة في هذه الرحلة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTracking": "تتبع الأطفال",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.growthOrEnterprise":
    "النمو أو المؤسسات",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.turnOnChildTracking":
    "تفعيل تتبع الأطفال في هذه الرحلة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingLocked":
    "غير متاح في باقة البداية. يمكن تفعيله في باقتي النمو والمؤسسات. يحتاج أولياء الأمور إلى حجز بباقة المستكشف أو كبار الشخصيات.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingBody":
    "يحتاج أولياء الأمور إلى حجز بباقة المستكشف أو كبار الشخصيات.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityNote":
    "لا يمكن أن تتجاوز السعة عدد مقاعد المركبات في هذه الرحلة.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-8-publish.tsx
  "screen.organization.trips.tripWizardStep8Publish.basics": "الأساسيات",
  "screen.organization.trips.tripWizardStep8Publish.scheduleAndRoute": "الجدول والمسار",
  "screen.organization.trips.tripWizardStep8Publish.vehicles": "المركبات",
  "screen.organization.trips.tripWizardStep8Publish.staffing": "الطاقم",
  "screen.organization.trips.tripWizardStep8Publish.programs": "البرامج",
  "screen.organization.trips.tripWizardStep8Publish.seating": "المقاعد",
  "screen.organization.trips.tripWizardStep8Publish.pricingAndCapacity": "التسعير والسعة",
  "screen.organization.trips.tripWizardStep8Publish.missingDriver": "لا يوجد سائق",
  "screen.organization.trips.tripWizardStep8Publish.missingModerator": "لا يوجد مشرف",
  "screen.organization.trips.tripWizardStep8Publish.blockedMissingDriver":
    "الطاقم غير مكتمل. أضف سائقًا للمركبة {plate} للمتابعة.",
  "screen.organization.trips.tripWizardStep8Publish.blockedMissingModerator":
    "الطاقم غير مكتمل. أضف مشرفًا للمركبة {plate} للمتابعة.",
  "screen.organization.trips.tripWizardStep8Publish.blockedIncompleteStep":
    "خطوة «{step}» غير مكتملة. أكملها للمتابعة.",
  "screen.organization.trips.tripWizardStep8Publish.requiredStep": "الخطوة المطلوبة",
  "screen.organization.trips.tripWizardStep8Publish.status": "الحالة",
  "screen.organization.trips.tripWizardStep8Publish.complete": "مكتملة",
  "screen.organization.trips.tripWizardStep8Publish.incomplete": "غير مكتملة",
  "screen.organization.trips.tripWizardStep8Publish.action": "الإجراء",
  "screen.organization.trips.tripWizardStep8Publish.open": "فتح",
  "screen.organization.trips.tripWizardStep8Publish.openStepN": "فتح الخطوة {n}",
  "screen.organization.trips.tripWizardStep8Publish.public": "عامة",
  "screen.organization.trips.tripWizardStep8Publish.draft": "مسودة",
  "screen.organization.trips.tripWizardStep8Publish.targetedAudienceList": "قائمة جمهور مستهدف",
  "screen.organization.trips.tripWizardStep8Publish.publishTrip": "نشر الرحلة",
  "screen.organization.trips.tripWizardStep8Publish.publish": "نشر",
  "screen.organization.trips.tripWizardStep8Publish.saveDraft": "حفظ المسودة",
  "screen.organization.trips.tripWizardStep8Publish.publishUnlocksNote":
    "يُتاح النشر عند اكتمال كل الخطوات المطلوبة.",
  "screen.organization.trips.tripWizardStep8Publish.publishBlocked": "النشر متوقف",
  "screen.organization.trips.tripWizardStep8Publish.actionFailedTitle": "لم تكتمل العملية",
  "screen.organization.trips.tripWizardStep8Publish.actionFailedBody": "حاول مرة أخرى بعد قليل.",
  "screen.organization.trips.tripWizardStep8Publish.readinessChecklist": "قائمة الجاهزية",
  "screen.organization.trips.tripWizardStep8Publish.publishMode": "طريقة النشر",
  "screen.organization.trips.tripWizardStep8Publish.audienceList": "قائمة الجمهور",
  "screen.organization.trips.tripWizardStep8Publish.audienceListHint":
    "معرّفات الجمهور، مفصولة بفواصل.",
  "screen.organization.trips.tripWizardStep8Publish.tripsPublishedThisMonth":
    "الرحلات المنشورة هذا الشهر",
  "screen.organization.trips.tripWizardStep8Publish.nOfLimit": "{n} من {limit}",
  // apps/web/src/screens/organization/trips/trips-list.tsx
  "screen.organization.trips.tripsList.title": "الرحلات",
  "screen.organization.trips.tripsList.caption": "كل رحلة مع حالتها والإجراء التالي",
  "screen.organization.trips.tripsList.createTrip": "إنشاء رحلة",
  "screen.organization.trips.tripsList.activeTripsThisMonth": "الرحلات النشطة هذا الشهر",
  "screen.organization.trips.tripsList.tripsNeedingStaffing": "رحلات تحتاج إلى طاقم",
  "screen.organization.trips.tripsList.filterByState": "تصفية الرحلات حسب الحالة",
  "screen.organization.trips.tripsList.all": "الكل",
  "screen.organization.trips.tripsList.trip": "الرحلة",
  "screen.organization.trips.tripsList.state": "الحالة",
  "screen.organization.trips.tripsList.dates": "التواريخ",
  "screen.organization.trips.tripsList.vehicles": "المركبات",
  "screen.organization.trips.tripsList.seatsSold": "المقاعد المباعة",
  "screen.organization.trips.tripsList.staffing": "الطاقم",
  "screen.organization.trips.tripsList.dateRange": "من {start} إلى {end}",
  "screen.organization.trips.tripsList.nOfCapacity": "{n} من {capacity}",
  "screen.organization.trips.tripsList.notStarted": "لم يبدأ",
  "screen.organization.trips.tripsList.staffingGap": "نقص في الطاقم",
  "screen.organization.trips.tripsList.staffed": "الطاقم مكتمل",
  "screen.organization.trips.tripsList.emptyTitle": "لا توجد رحلات بعد",
  "screen.organization.trips.tripsList.emptyBody":
    "أنشئ رحلتك الأولى. يحفظ المعالج مسودة أثناء العمل.",
  "screen.organization.trips.tripsList.noMatchTitle": "لا توجد رحلات بهذه الحالة",
  "screen.organization.trips.tripsList.noMatchBody": "اختر حالة أخرى، أو «الكل» لعرض كل الرحلات.",
  // apps/web/src/screens/organization/vehicles/seat-layout.tsx
  "screen.organization.vehicles.seatLayout.gridLabel": "مخطط المقاعد",
  // apps/web/src/screens/organization/vehicles/vehicle-editor-form.tsx
  "screen.organization.vehicles.vehicleEditorForm.plateRequired": "أدخل رقم اللوحة.",
  "screen.organization.vehicles.vehicleEditorForm.modelRequired": "أدخل الطراز.",
  "screen.organization.vehicles.vehicleEditorForm.yearInvalid": "أدخل سنة بين {min} و{max}.",
  "screen.organization.vehicles.vehicleEditorForm.typeRequired": "اختر نوع المركبة.",
  "screen.organization.vehicles.vehicleEditorForm.seatCountMismatch":
    "يجب أن يطابق عدد المقاعد نوع المركبة. يحتوي النوع على {n} مقعدًا، وقد أدخلت {m}.",
  "screen.organization.vehicles.vehicleEditorForm.chooseType": "اختر نوع المركبة",
  "screen.organization.vehicles.vehicleEditorForm.notSavedTitle": "لم تُحفظ المركبة",
  "screen.organization.vehicles.vehicleEditorForm.fixSeatCount":
    "صحّح عدد المقاعد ثم احفظ مرة أخرى.",
  "screen.organization.vehicles.vehicleEditorForm.notSavedBody":
    "صحّح الحقول المشار إليها ثم احفظ مرة أخرى.",
  "screen.organization.vehicles.vehicleEditorForm.notRemovedTitle": "لم تُزل المركبة",
  "screen.organization.vehicles.vehicleEditorForm.notRemovedBody":
    "ربما تكون مخصّصة لرحلة. حاول مرة أخرى لاحقًا.",
  "screen.organization.vehicles.vehicleEditorForm.photoNotUploaded":
    "لم تُرفع الصورة. استخدم صورة PNG أو JPEG أو WebP وحاول مرة أخرى.",
  "screen.organization.vehicles.vehicleEditorForm.vehicleDetails": "بيانات المركبة",
  "screen.organization.vehicles.vehicleEditorForm.plateNumber": "رقم اللوحة",
  "screen.organization.vehicles.vehicleEditorForm.model": "الطراز",
  "screen.organization.vehicles.vehicleEditorForm.year": "السنة",
  "screen.organization.vehicles.vehicleEditorForm.vehicleType": "نوع المركبة",
  "screen.organization.vehicles.vehicleEditorForm.seatCount": "عدد المقاعد",
  "screen.organization.vehicles.vehicleEditorForm.registrationStatus": "حالة الترخيص",
  "screen.organization.vehicles.vehicleEditorForm.vehiclePhoto": "صورة المركبة",
  "screen.organization.vehicles.vehicleEditorForm.photosAttached": "الصور المرفقة: {n}",
  "screen.organization.vehicles.vehicleEditorForm.removeVehicle": "إزالة المركبة",
  "screen.organization.vehicles.vehicleEditorForm.removalBlocked":
    "لا يمكن الإزالة ما دام لهذه المركبة {n} من الحجوزات المؤكدة.",
  "screen.organization.vehicles.vehicleEditorForm.cancel": "إلغاء",
  "screen.organization.vehicles.vehicleEditorForm.saveVehicle": "حفظ المركبة",
  // apps/web/src/screens/organization/vehicles/vehicle-editor.tsx
  "screen.organization.vehicles.vehicleEditor.addTitle": "إضافة مركبة",
  "screen.organization.vehicles.vehicleEditor.editTitle": "تعديل المركبة",
  "screen.organization.vehicles.vehicleEditor.plateAndModel": "{plate} · {model}",
  "screen.organization.vehicles.vehicleEditor.addCaption": "مركبة جديدة في سجل مركباتك",
  "screen.organization.vehicles.vehicleEditor.notFoundTitle": "لم يتم العثور على المركبة",
  "screen.organization.vehicles.vehicleEditor.backToVehicles": "العودة إلى المركبات",
  "screen.organization.vehicles.vehicleEditor.notFoundBody": "ربما أُزيلت من سجل المركبات.",
  "screen.organization.vehicles.vehicleEditor.removeThisVehicle": "إزالة هذه المركبة؟",
  "screen.organization.vehicles.vehicleEditor.removeDialogBody":
    "ستُزال المركبة من السجل ولن يمكن إضافتها إلى الرحلات بعد ذلك.",
  "screen.organization.vehicles.vehicleEditor.removeVehicle": "إزالة المركبة",
  "screen.organization.vehicles.vehicleEditor.keepVehicle": "الإبقاء على المركبة",
  // apps/web/src/screens/organization/vehicles/vehicle-parts.tsx
  "screen.organization.vehicles.vehicleParts.registered": "مسجّلة",
  "screen.organization.vehicles.vehicleParts.pendingReview": "قيد المراجعة",
  "screen.organization.vehicles.vehicleParts.expired": "انتهى الترخيص",
  // apps/web/src/screens/organization/vehicles/vehicle-registry.tsx
  "screen.organization.vehicles.vehicleRegistry.plate": "اللوحة",
  "screen.organization.vehicles.vehicleRegistry.model": "الطراز",
  "screen.organization.vehicles.vehicleRegistry.year": "السنة",
  "screen.organization.vehicles.vehicleRegistry.vehicleType": "نوع المركبة",
  "screen.organization.vehicles.vehicleRegistry.seats": "المقاعد",
  "screen.organization.vehicles.vehicleRegistry.registration": "الترخيص",
  "screen.organization.vehicles.vehicleRegistry.addVehicle": "إضافة مركبة",
  "screen.organization.vehicles.vehicleRegistry.title": "المركبات",
  "screen.organization.vehicles.vehicleRegistry.caption": "مركبات مؤسستك وعدد مقاعد كل منها",
  "screen.organization.vehicles.vehicleRegistry.vehicleTypes": "أنواع المركبات",
  "screen.organization.vehicles.vehicleRegistry.filterByRegistration": "تصفية المركبات حسب الترخيص",
  "screen.organization.vehicles.vehicleRegistry.all": "الكل",
  "screen.organization.vehicles.vehicleRegistry.registered": "مسجّلة",
  "screen.organization.vehicles.vehicleRegistry.pendingReview": "قيد المراجعة",
  "screen.organization.vehicles.vehicleRegistry.emptyTitle": "لا توجد مركبات بعد",
  "screen.organization.vehicles.vehicleRegistry.noMatchTitle": "لا توجد مركبات تطابق هذه التصفية",
  "screen.organization.vehicles.vehicleRegistry.emptyBody": "أضف مركبة لاستخدامها في الرحلات.",
  // apps/web/src/screens/organization/vehicles/vehicle-types-and-seat-layout.tsx
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.typeDetails": "بيانات النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.typeName": "اسم النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.nameRequired": "أدخل اسم النوع.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCount": "عدد المقاعد",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCountInvalid":
    "أدخل عدد مقاعد من 1 إلى {max}.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.status": "الحالة",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.active": "نشط",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archived": "مؤرشف",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archiveType": "أرشفة النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayout": "مخطط المقاعد",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayoutCaption":
    "لكل مقعد رمز يظهر على خريطة المقاعد.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.title": "نوع المركبة",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.caption":
    "مخطط مقاعد قابل لإعادة الاستخدام · {name}",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.saveType": "حفظ النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archivedNote":
    "لا تُعرض الأنواع المؤرشفة للرحلات الجديدة، وتحتفظ الرحلات التي تستخدم هذا النوع بمخططها.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.notSavedTitle": "لم يُحفظ نوع المركبة",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.notSavedBody":
    "تحقّق من الاسم وعدد المقاعد، ثم حاول مرة أخرى.",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.saved": "تم حفظ نوع المركبة",
  // apps/web/src/screens/organization/workspace/organization-profile-parts.tsx
  "screen.organization.workspace.organizationProfileParts.logoUrlInvalid":
    "أدخل عنوان ويب يبدأ بـ https://.",
  "screen.organization.workspace.organizationProfileParts.brandColorInvalid":
    "أدخل اللون بالصيغة # وستة رموز، مثل ‎#1A2B3C.",
  // apps/web/src/screens/organization/workspace/organization-profile-settings-and-branding.tsx
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameTooShort":
    "أدخل اسمًا تجاريًا من حرفين على الأقل.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.lockedOnYourPlan":
    "غير متاح في باقتك",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalAndInvoiceDetails":
    "البيانات القانونية وبيانات الفواتير",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalName": "الاسم القانوني",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.setAtVerification":
    "حُدّد عند توثيق المؤسسة. تواصل مع الدعم لتغييره.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeName": "الاسم التجاري",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.country": "الدولة",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZone":
    "المنطقة الزمنية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumber":
    "رقم السجل التجاري",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxReference":
    "الرقم الضريبي",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddress":
    "عنوان الفواتير",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.branding": "الهوية البصرية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.enterpriseOnly":
    "لباقة المؤسسات فقط",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.brandingCaption":
    "يظهر الشعار والألوان على صفحات الرحلات والفواتير في باقة المؤسسات. تعرض باقتك علامة Trips Enjoy.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.logo": "الشعار",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.brandColor": "لون الهوية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.title": "ملف المؤسسة",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.caption":
    "البيانات القانونية وبيانات الفواتير والهوية البصرية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.saveChanges":
    "حفظ التغييرات",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.notSavedTitle":
    "لم تُحفظ التغييرات",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.notSavedBody":
    "راجع البيانات ثم احفظ مرة أخرى.",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.saved": "تم حفظ التغييرات",
  // apps/web/src/screens/organization/workspace/workspace-home-parts.tsx
  "screen.organization.workspace.workspaceHomeParts.done": "تم",
  "screen.organization.workspace.workspaceHomeParts.toDo": "مطلوب",
  "screen.organization.workspace.workspaceHomeParts.profile": "الملف التعريفي",
  "screen.organization.workspace.workspaceHomeParts.accountingAndInvoiceDetails":
    "بيانات المحاسبة والفواتير",
  "screen.organization.workspace.workspaceHomeParts.crmAndWebhooks":
    "نظام إدارة العملاء والـ Webhooks",
  "screen.organization.workspace.workspaceHomeParts.optional": "اختياري",
  "screen.organization.workspace.workspaceHomeParts.departsFrom": "{date}، {time} من {place}",
  "screen.organization.workspace.workspaceHomeParts.departsAt": "{date}، {time}",
  "screen.organization.workspace.workspaceHomeParts.trip": "الرحلة",
  "screen.organization.workspace.workspaceHomeParts.departs": "المغادرة",
  "screen.organization.workspace.workspaceHomeParts.vehicles": "المركبات",
  "screen.organization.workspace.workspaceHomeParts.readiness": "الجاهزية",
  "screen.organization.workspace.workspaceHomeParts.staffingGap": "نقص في الطاقم",
  "screen.organization.workspace.workspaceHomeParts.ready": "جاهزة",
  "screen.organization.workspace.workspaceHomeParts.upcomingTripsCaption": "الرحلات القادمة",
  "screen.organization.workspace.workspaceHomeParts.noUpcomingTrips": "لا توجد رحلات قادمة",
  "screen.organization.workspace.workspaceHomeParts.createTrip": "إنشاء رحلة",
  "screen.organization.workspace.workspaceHomeParts.noUpcomingTripsBody":
    "تظهر هنا الرحلات التي لها موعد مغادرة.",
  // apps/web/src/screens/organization/workspace/workspace-home.tsx
  "screen.organization.workspace.workspaceHome.nOfLimit": "{n} من {limit}",
  "screen.organization.workspace.workspaceHome.captionEmployee": "{name} · عرض الموظف",
  "screen.organization.workspace.workspaceHome.captionOwner": "{name} · عرض المالك",
  "screen.organization.workspace.workspaceHome.title": "الصفحة الرئيسية لمساحة العمل",
  "screen.organization.workspace.workspaceHome.createTrip": "إنشاء رحلة",
  "screen.organization.workspace.workspaceHome.gracePeriod": "فترة السماح",
  "screen.organization.workspace.workspaceHome.gracePeriodBody":
    "تظل ميزاتك مفعّلة حتى {date}. حدّث وسيلة الدفع لتجنّب خفض الباقة.",
  "screen.organization.workspace.workspaceHome.activeTripsThisMonth": "الرحلات النشطة هذا الشهر",
  "screen.organization.workspace.workspaceHome.upcomingTripsWithReadyGaps":
    "رحلات قادمة بها نواقص قبل الجاهزية",
  "screen.organization.workspace.workspaceHome.dealRequestsPending": "طلبات الاتفاق المعلّقة",
  "screen.organization.workspace.workspaceHome.setupChecklist": "قائمة الإعداد",
  "screen.organization.workspace.workspaceHome.upcomingTrips": "الرحلات القادمة",
  // apps/web/src/screens/public/account-recovery/account-suspended.tsx
  "screen.public.accountRecovery.accountSuspended.accountSuspended": "الحساب موقوف",
  "screen.public.accountRecovery.accountSuspended.accessToThisAccountIs":
    "الوصول إلى هذا الحساب متوقف. لم تُحذف أي بيانات.",
  "screen.public.accountRecovery.accountSuspended.reason": "السبب",
  "screen.public.accountRecovery.accountSuspended.theReasonFromTheSuspension":
    "يُعرض هنا السبب من إشعار الإيقاف.",
  "screen.public.accountRecovery.accountSuspended.toAskForAReview":
    "لطلب مراجعة، تواصل مع الدعم. يبقى تسجيل الدخول مرفوضًا ما دام الإيقاف قائمًا.",
  // apps/web/src/screens/public/account-recovery/appeal-a-rejection.tsx
  "screen.public.accountRecovery.appealARejection.appealStatement": "بيان الاعتراض",
  "screen.public.accountRecovery.appealARejection.explainWhyTheDecisionShould":
    "اشرح سبب وجوب مراجعة القرار (10 أحرف على الأقل).",
  "screen.public.accountRecovery.appealARejection.supportingFiles": "المستندات الداعمة",
  "screen.public.accountRecovery.appealARejection.addAnyDocumentThatSupports":
    "أضف أي مستند يدعم اعتراضك.",
  "screen.public.accountRecovery.appealARejection.appealSubmitted": "تم إرسال الاعتراض",
  "screen.public.accountRecovery.appealARejection.yourAppealHasBeenSent":
    "أُرسل اعتراضك إلى فريق المراجعة.",
  "screen.public.accountRecovery.appealARejection.appealCouldNotBeSubmitted": "تعذّر إرسال الاعتراض",
  "screen.public.accountRecovery.appealARejection.submitting": "جارٍ الإرسال...",
  "screen.public.accountRecovery.appealARejection.submitAppeal": "إرسال الاعتراض",
  "screen.public.accountRecovery.appealARejection.backToStatus": "العودة إلى الحالة",
  "screen.public.accountRecovery.appealARejection.appealARejection": "الاعتراض على رفض",
  "screen.public.accountRecovery.appealARejection.askForAReviewOf":
    "اطلب مراجعة القرار ما دامت نافذة الاعتراض مفتوحة.",
  "screen.public.accountRecovery.appealARejection.rejected": "مرفوض",
  "screen.public.accountRecovery.appealARejection.reasonOnRecord": "السبب المسجَّل:",
  "screen.public.accountRecovery.appealARejection.theReasonFromTheReview":
    "يُعرض هنا السبب من فريق المراجعة.",
  // apps/web/src/screens/public/account-recovery/application-status-and-changes-response.tsx
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.submitted": "تاريخ التقديم",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.pendingReview": "قيد المراجعة",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.decision": "القرار",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.uploadAClearerInsuranceDocument":
    "ارفع مستند تأمين أوضح",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.confirmTheVehicleSeatCount":
    "أكّد عدد مقاعد المركبة",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.approved": "معتمد",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.changesRequested":
    "طُلبت تغييرات",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.appealed": "تم الاعتراض",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.pendingReviewLabel":
    "قيد المراجعة",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.targetReviewWithin2Working":
    "الهدف: المراجعة خلال يومَي عمل.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.applicationProgress":
    "تقدّم الطلب",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.respondWithin14Days":
    "الرد خلال 14 يومًا",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChangesMustBeAnswered":
    "يجب الرد على التغييرات المطلوبة قبل الموعد النهائي",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.orTheApplicationCloses":
    "، وإلا يُغلق الطلب.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.reviewerNotes":
    "ملاحظات المراجع",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.updateSaved": "تم حفظ التحديث",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.actionFailed": "فشل الإجراء",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChanges":
    "التغييرات المطلوبة",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChangesAriaLabel":
    "التغييرات المطلوبة",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.updatedDocumentsOptional":
    "مستندات محدَّثة (اختياري)",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.attachReplacementOrSupportingDocuments":
    "أرفق مستندات بديلة أو داعمة قبل إعادة الإرسال.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.submitting": "جارٍ الإرسال...",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.resubmit": "إعادة الإرسال",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.request7DayExtension":
    "طلب تمديد 7 أيام",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.appealARejection":
    "الاعتراض على رفض",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.applicationStatusAndChangesResponse":
    "حالة الطلب والرد على التغييرات",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.trackYourApplicationAndRespond":
    "تتبّع طلبك وردّ على أي تغييرات مطلوبة.",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.statusCouldNotLoad":
    "تعذّر تحميل الحالة",
  "screen.public.accountRecovery.applicationStatusAndChangesResponse.tryAgainInAFew":
    "أعد المحاولة بعد بضع دقائق.",
  // apps/web/src/screens/public/account-recovery/deletion-grace-period.tsx
  "screen.public.accountRecovery.deletionGracePeriod.deletionGracePeriod": "فترة السماح للحذف",
  "screen.public.accountRecovery.deletionGracePeriod.yourAccountIsInThe":
    "حسابك في فترة السماح البالغة 30 يومًا بعد طلب الحذف.",
  "screen.public.accountRecovery.deletionGracePeriod.gracePeriodEnds": "تنتهي فترة السماح",
  "screen.public.accountRecovery.deletionGracePeriod.30DaysAfterTheDeletion":
    "30 يومًا بعد طلب الحذف",
  "screen.public.accountRecovery.deletionGracePeriod.signInToRestore": "سجّل الدخول للاستعادة",
  "screen.public.accountRecovery.deletionGracePeriod.signingInRestoresYourAccount":
    "يؤدي تسجيل الدخول إلى استعادة حسابك وإلغاء طلب الحذف.",
  "screen.public.accountRecovery.deletionGracePeriod.ifTheDeletionBecomesPermanent":
    "إذا أصبح الحذف نهائيًا، تُلغى الحجوزات المستقبلية وتُسترد مبالغها.",
  "screen.public.accountRecovery.deletionGracePeriod.continueToAppHome":
    "المتابعة إلى رئيسية التطبيق",
  // apps/web/src/screens/public/account-recovery/password-reset.tsx
  "screen.public.accountRecovery.passwordReset.emailOrPhone": "البريد الإلكتروني أو الهاتف",
  "screen.public.accountRecovery.passwordReset.newPassword": "كلمة المرور الجديدة",
  "screen.public.accountRecovery.passwordReset.atLeastCharactersPasswordsFound":
    "{min} أحرف على الأقل. تُرفض كلمات المرور الواردة في قوائم مسرّبة.",
  "screen.public.accountRecovery.passwordReset.setPassword": "تعيين كلمة المرور",
  "screen.public.accountRecovery.passwordReset.rememberedIt": "تذكرتها؟",
  "screen.public.accountRecovery.passwordReset.backToSignIn": "العودة إلى تسجيل الدخول",
  "screen.public.accountRecovery.passwordReset.passwordReset": "إعادة تعيين كلمة المرور",
  "screen.public.accountRecovery.passwordReset.weSendACodeTo":
    "نرسل رمزًا إلى بريدك أو هاتفك الموثّق. ثم عيّن كلمة مرور جديدة.",
  "screen.public.accountRecovery.passwordReset.passwordRefused": "تم رفض كلمة المرور",
  "screen.public.accountRecovery.passwordReset.theNewPasswordIsShorter":
    "كلمة المرور الجديدة أقصر من",
  "screen.public.accountRecovery.passwordReset.charactersOrWasFoundIn":
    "حرفًا أو وردت في قائمة مسرّبة.",
  // apps/web/src/screens/public/account-recovery/session-expired.tsx
  "screen.public.accountRecovery.sessionExpired.sessionExpired": "انتهت الجلسة",
  "screen.public.accountRecovery.sessionExpired.forYourSecurityYouWere":
    "لأمانك تم تسجيل خروجك. مسوداتك غير المحفوظة محفوظة.",
  "screen.public.accountRecovery.sessionExpired.draftsKept": "المسودات محفوظة",
  "screen.public.accountRecovery.sessionExpired.signInToContinueWhere":
    "سجّل الدخول لمتابعة ما كنت تفعله، في التطبيق نفسه.",
  "screen.public.accountRecovery.sessionExpired.signIn": "تسجيل الدخول",
  // apps/web/src/screens/public/common/auth-frame.tsx
  "screen.public.common.authFrame.backToTheStart": "العودة إلى البداية",
  // apps/web/src/screens/public/common/country-options.ts
  "screen.public.common.countryOptions.selectACountry": "اختر دولة",
  "screen.public.common.countryOptions.saudiArabia": "المملكة العربية السعودية",
  // apps/web/src/screens/public/common/language-select.tsx
  "screen.public.common.languageSelect.language": "اللغة",
  // apps/web/src/screens/public/common/public-nav.tsx
  "screen.public.common.publicNav.start": "ابدأ",
  "screen.public.common.publicNav.signUp": "إنشاء حساب",
  "screen.public.common.publicNav.signIn": "تسجيل الدخول",
  "screen.public.common.publicNav.applicationStatus": "حالة الطلب",
  "screen.public.common.publicNav.public": "عام",
  // apps/web/src/screens/public/common/sign-up-footer.tsx
  "screen.public.common.signUpFooter.nextConfirmYourDetailsWith": "بعد ذلك، أكّد بياناتك برمز:",
  "screen.public.common.signUpFooter.verificationByCode": "التحقق بالرمز",
  "screen.public.common.signUpFooter.alreadyHaveAnAccount": "لديك حساب بالفعل؟",
  "screen.public.common.signUpFooter.signIn": "تسجيل الدخول",
  // apps/web/src/screens/public/common/staff-code-panel.tsx
  "screen.public.common.staffCodePanel.authenticatorApp": "تطبيق المصادقة",
  "screen.public.common.staffCodePanel.secondFactorMethod": "طريقة العامل الثاني",
  "screen.public.common.staffCodePanel.staffCode": "رمز الموظف",
  // apps/web/src/screens/public/index.ts
  "screen.registry.public.landing.title": "الصفحة الرئيسية",
  "screen.registry.public.signUpChooser.title": "اختيار نوع التسجيل (/register)",
  "screen.registry.public.travelerSignUp.title": "تسجيل المسافر",
  "screen.registry.public.platformDriverSignUp.title": "تسجيل سائق المنصة",
  "screen.registry.public.photographerSignUp.title": "تسجيل المصوّر",
  "screen.registry.public.organizationSignUp.title": "تسجيل المؤسسة (عبر الويب فقط)",
  "screen.registry.public.verificationByCode.title": "التحقق بالرمز",
  "screen.registry.public.signIn.title": "تسجيل الدخول (المسافر والمورّد)",
  "screen.registry.public.adminSignIn.title": "تسجيل دخول المسؤول",
  "screen.registry.public.adminAuthenticatorSetUpAndCode.title": "إعداد مصادقة المسؤول والرمز",
  "screen.registry.public.organizationStaffSignInWithCode.title": "تسجيل دخول موظف المؤسسة بالرمز",
  "screen.registry.public.staffCodeSetUp.title": "إعداد رمز الموظف (أول تسجيل دخول)",
  "screen.registry.public.passwordReset.title": "إعادة تعيين كلمة المرور",
  "screen.registry.public.sessionExpired.title": "انتهت الجلسة",
  "screen.registry.public.accountSuspended.title": "الحساب موقوف",
  "screen.registry.public.deletionGracePeriod.title": "فترة السماح للحذف",
  "screen.registry.public.applicationStatusAndChangesResponse.title":
    "حالة الطلب والرد على التغييرات",
  "screen.registry.public.appealARejection.title": "الاعتراض على رفض",
  "screen.registry.public.moderatorSignInWithStaffCode.title": "تسجيل دخول المشرف برمز الموظف",
  // apps/web/src/screens/public/landing/landing.tsx
  "screen.public.landing.landing.traveler": "المسافر",
  "screen.public.landing.landing.createATravelerAccountAnd": "أنشئ حساب مسافر واحجز الرحلات.",
  "screen.public.landing.landing.platformDriver": "سائق المنصة",
  "screen.public.landing.landing.applyToJoinThePlatform": "تقدّم للانضمام إلى مجموعة سائقي المنصة.",
  "screen.public.landing.landing.photographer": "مصوّر",
  "screen.public.landing.landing.applyToJoinThePlatformDescription":
    "تقدّم للانضمام إلى مجموعة مصوّري المنصة.",
  "screen.public.landing.landing.organization": "المؤسسة",
  "screen.public.landing.landing.registerYourOrganizationWebOnly": "سجّل مؤسستك. عبر الويب فقط.",
  "screen.public.landing.landing.permissionDenied": "تم رفض الإذن",
  "screen.public.landing.landing.notFound": "غير موجود",
  "screen.public.landing.landing.unauthorized": "غير مصرّح",
  "screen.public.landing.landing.serverError": "خطأ في الخادم",
  "screen.public.landing.landing.serviceUnavailable": "الخدمة غير متاحة",
  "screen.public.landing.landing.maintenancePage": "صفحة الصيانة",
  "screen.public.landing.landing.sharedStates": "الحالات المشتركة",
  "screen.public.landing.landing.tripsEnjoyHome": "رئيسية Trips Enjoy",
  "screen.public.landing.landing.tripsEnjoy": "Trips Enjoy",
  "screen.public.landing.landing.publicTrips": "الرحلات العامة",
  "screen.public.landing.landing.browseTheTripsThatAre": "تصفّح الرحلات المنشورة للعامة.",
  "screen.public.landing.landing.browseTrips": "تصفّح الرحلات",
  "screen.public.landing.landing.noPublicTripsRightNow": "لا توجد رحلات عامة الآن",
  "screen.public.landing.landing.tripsAppearHereOnceThey":
    "تظهر الرحلات هنا بعد نشرها. يمكنك التسجيل في دور أدناه.",
  "screen.public.landing.landing.tripsCouldNotLoad": "تعذّر تحميل الرحلات",
  "screen.public.landing.landing.tryAgainInAFew": "أعد المحاولة بعد بضع دقائق.",
  "screen.public.landing.landing.signUpAs": "سجّل بصفة",
  "screen.public.landing.landing.signUpAs2": "سجّل بصفة",
  // apps/web/src/screens/public/sign-in/admin-authenticator-set-up-and-code.tsx
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpAuthenticator": "إعداد المصادقة",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.enterCode": "أدخل الرمز",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpSteps": "خطوات الإعداد",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.setUpRequired": "الإعداد مطلوب",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.theAdminConsoleDoesNot":
    "لا تُفتح لوحة الإدارة حتى يتم إعداد المصادقة.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.scanTheQrCodeShown":
    "امسح رمز QR الظاهر على الشاشة بتطبيق المصادقة، ثم أدخل الرمز المكوّن من ستة أرقام.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.authenticatorCode": "رمز المصادقة",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.verify": "توثيق",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.afterVerificationTheAdminConsole":
    "بعد التحقق، تُفتح لوحة الإدارة.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.adminHome": "الرئيسية الإدارية",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.adminAuthenticatorSetUpAnd":
    "إعداد مصادقة المسؤول والرمز",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.adminSignInNeedsAn":
    "يحتاج تسجيل دخول المسؤول إلى رمز مصادقة. تُفتح لوحة الإدارة بعد هذه الخطوة.",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.wrongCode": "رمز خاطئ",
  "screen.public.signIn.adminAuthenticatorSetUpAndCode.tryAgainFiveFailuresLock":
    "أعد المحاولة. خمس محاولات فاشلة تقفل تسجيل دخول المسؤول لمدة 15 دقيقة.",
  // apps/web/src/screens/public/sign-in/admin-sign-in.tsx
  "screen.public.signIn.adminSignIn.email": "البريد الإلكتروني",
  "screen.public.signIn.adminSignIn.password": "كلمة المرور",
  "screen.public.signIn.adminSignIn.atLeast12CharactersPasswords":
    "12 حرفًا على الأقل. تُرفض كلمات المرور الواردة في قوائم مسرّبة.",
  "screen.public.signIn.adminSignIn.continue": "متابعة",
  "screen.public.signIn.adminSignIn.authenticatorNotSetUpYet": "لم تُعدّ المصادقة بعد؟",
  "screen.public.signIn.adminSignIn.setItUp": "أعدّها",
  "screen.public.signIn.adminSignIn.adminSignIn": "تسجيل دخول المسؤول",
  "screen.public.signIn.adminSignIn.staffOnlyThereIsNo":
    "للموظفين فقط. لا يوجد تسجيل عام للمسؤولين.",
  "screen.public.signIn.adminSignIn.signInRefused": "تم رفض تسجيل الدخول",
  "screen.public.signIn.adminSignIn.theEmailOrPasswordIs":
    "البريد الإلكتروني أو كلمة المرور غير صحيحة. خمس محاولات فاشلة تقفل تسجيل الدخول لمدة 15 دقيقة.",
  // apps/web/src/screens/public/sign-in/moderator-sign-in-with-staff-code.tsx
  "screen.public.signIn.moderatorSignInWithStaffCode.emailOrPhone": "البريد الإلكتروني أو الهاتف",
  "screen.public.signIn.moderatorSignInWithStaffCode.signIn": "تسجيل الدخول",
  "screen.public.signIn.moderatorSignInWithStaffCode.moderatorSignInWithStaff":
    "تسجيل دخول المشرف برمز الموظف",
  "screen.public.signIn.moderatorSignInWithStaffCode.afterSignInYouSee":
    "بعد تسجيل الدخول ترى مركبتك المعيَّنة فقط.",
  // apps/web/src/screens/public/sign-in/organization-staff-sign-in-with-code.tsx
  "screen.public.signIn.organizationStaffSignInWithCode.email": "البريد الإلكتروني",
  "screen.public.signIn.organizationStaffSignInWithCode.password": "كلمة المرور",
  "screen.public.signIn.organizationStaffSignInWithCode.secondFactor": "العامل الثاني",
  "screen.public.signIn.organizationStaffSignInWithCode.signIn": "تسجيل الدخول",
  "screen.public.signIn.organizationStaffSignInWithCode.firstSignIn": "أول تسجيل دخول؟",
  "screen.public.signIn.organizationStaffSignInWithCode.setUpYourStaffCode": "أعدّ رمز الموظف",
  "screen.public.signIn.organizationStaffSignInWithCode.organizationStaffSignInWith":
    "تسجيل دخول موظف المؤسسة بالرمز",
  "screen.public.signIn.organizationStaffSignInWithCode.enterYourEmailYourPassword":
    "أدخل بريدك الإلكتروني وكلمة المرور والرمز من عاملك الثاني. إذا كان بريدك مرتبطًا بعدة مؤسسات، تختار واحدة بعد الرمز.",
  "screen.public.signIn.organizationStaffSignInWithCode.signInRefused": "تم رفض تسجيل الدخول",
  "screen.public.signIn.organizationStaffSignInWithCode.theCodeIsWrongOr":
    "الرمز خاطئ، أو هذا البريد غير مرتبط بأي مؤسسة.",
  // apps/web/src/screens/public/sign-in/sign-in.tsx
  "screen.public.signIn.signIn.oneTimeCode": "رمز لمرة واحدة",
  "screen.public.signIn.signIn.password": "كلمة المرور",
  "screen.public.signIn.signIn.sessionExpired": "انتهت الجلسة",
  "screen.public.signIn.signIn.accountSuspended": "الحساب موقوف",
  "screen.public.signIn.signIn.deletionRequested": "حذف مطلوب",
  "screen.public.signIn.signIn.applicationPending": "الطلب قيد الانتظار",
  "screen.public.signIn.signIn.emailOrPhone": "البريد الإلكتروني أو الهاتف",
  "screen.public.signIn.signIn.signInMethod": "طريقة تسجيل الدخول",
  "screen.public.signIn.signIn.passwordLabel": "كلمة المرور",
  "screen.public.signIn.signIn.weSendAOneTime":
    "نرسل رمزًا لمرة واحدة إلى البريد أو الهاتف الذي تدخله.",
  "screen.public.signIn.signIn.signIn": "تسجيل الدخول",
  "screen.public.signIn.signIn.createAnAccount": "إنشاء حساب",
  "screen.public.signIn.signIn.forgotPassword": "هل نسيت كلمة المرور؟",
  "screen.public.signIn.signIn.otherSignInOutcomes": "نتائج تسجيل دخول أخرى",
  "screen.public.signIn.signIn.otherOutcomes": "نتائج أخرى",
  "screen.public.signIn.signIn.signInTravelerAndSupplier": "تسجيل الدخول (المسافر والمورّد)",
  "screen.public.signIn.signIn.travelersAndApprovedSuppliersSign":
    "يسجّل المسافرون والمورّدون المعتمدون الدخول هنا.",
  "screen.public.signIn.signIn.detailsDoNotMatch": "البيانات غير مطابقة",
  "screen.public.signIn.signIn.checkYourDetailsAndTry":
    "تحقق من بياناتك وأعد المحاولة. الإخفاقات المتكررة توقف تسجيل الدخول مؤقتًا.",
  // apps/web/src/screens/public/sign-in/staff-code-set-up.tsx
  "screen.public.signIn.staffCodeSetUp.confirm": "تأكيد",
  "screen.public.signIn.staffCodeSetUp.afterConfirmationTheWorkspaceOpens":
    "بعد التأكيد، تُفتح مساحة العمل.",
  "screen.public.signIn.staffCodeSetUp.openTheWorkspace": "فتح مساحة العمل",
  "screen.public.signIn.staffCodeSetUp.staffCodeSetUpFirst": "إعداد رمز الموظف (أول تسجيل دخول)",
  "screen.public.signIn.staffCodeSetUp.chooseSmsOrAnAuthenticator":
    "اختر SMS أو تطبيق مصادقة، ثم أكّد رمزًا. تُفتح مساحة العمل بعد هذه الخطوة.",
  "screen.public.signIn.staffCodeSetUp.codeExpired": "انتهت صلاحية الرمز",
  "screen.public.signIn.staffCodeSetUp.theCodeIsWrongOr":
    "الرمز خاطئ أو منتهي الصلاحية. اطلب رمزًا جديدًا وأعد المحاولة.",
  // apps/web/src/screens/public/sign-up/organization-sign-up.tsx
  "screen.public.signUp.organizationSignUp.owner": "المالك",
  "screen.public.signUp.organizationSignUp.ownerName": "اسم المالك",
  "screen.public.signUp.organizationSignUp.ownerEmail": "بريد المالك",
  "screen.public.signUp.organizationSignUp.ownerPhone": "هاتف المالك",
  "screen.public.signUp.organizationSignUp.organization": "المؤسسة",
  "screen.public.signUp.organizationSignUp.legalName": "الاسم القانوني",
  "screen.public.signUp.organizationSignUp.country": "الدولة",
  "screen.public.signUp.organizationSignUp.required": "مطلوب.",
  "screen.public.signUp.organizationSignUp.commercialRegistrationNumber": "رقم السجل التجاري",
  "screen.public.signUp.organizationSignUp.taxNumber": "الرقم الضريبي",
  "screen.public.signUp.organizationSignUp.commercialRegistrationDocument": "مستند السجل التجاري",
  "screen.public.signUp.organizationSignUp.aClearPhotoOrScan": "صورة أو نسخة ممسوحة واضحة.",
  "screen.public.signUp.organizationSignUp.billingContact": "جهة اتصال الفوترة",
  "screen.public.signUp.organizationSignUp.billingContactName": "اسم جهة اتصال الفوترة",
  "screen.public.signUp.organizationSignUp.billingContactEmail": "بريد جهة اتصال الفوترة",
  "screen.public.signUp.organizationSignUp.submissionFailed": "فشل الإرسال",
  "screen.public.signUp.organizationSignUp.planAndReview": "الخطة والمراجعة",
  "screen.public.signUp.organizationSignUp.theStarterPlanIsAssigned":
    "تُمنح خطة Starter عند اعتماد مؤسستك. التحقق من السجل يدوي. لا يُمنح وصول الموظفين قبل الاعتماد.",
  "screen.public.signUp.organizationSignUp.submitting": "جارٍ الإرسال...",
  "screen.public.signUp.organizationSignUp.submitForReview": "الإرسال للمراجعة",
  "screen.public.signUp.organizationSignUp.organizationSignUpWebOnly":
    "تسجيل المؤسسة (عبر الويب فقط)",
  "screen.public.signUp.organizationSignUp.registerYourOrganizationForAdmin":
    "سجّل مؤسستك لمراجعة الإدارة. يتحقق المالك من البريد والهاتف معًا.",
  "screen.public.signUp.organizationSignUp.countryIsMissing": "الدولة مفقودة",
  "screen.public.signUp.organizationSignUp.selectACountrySubmitIs":
    "اختر دولة. يُرفض الإرسال حتى تُحدَّد.",
  // apps/web/src/screens/public/sign-up/photographer-sign-up.tsx
  "screen.public.signUp.photographerSignUp.uploadProgress":
    "ارفع {min} صور على الأقل. المرفوع: {uploaded} من {min}.",
  "screen.public.signUp.photographerSignUp.nameOrStudioName": "الاسم أو اسم الاستوديو",
  "screen.public.signUp.photographerSignUp.email": "البريد الإلكتروني",
  "screen.public.signUp.photographerSignUp.phone": "الهاتف",
  "screen.public.signUp.photographerSignUp.country": "الدولة",
  "screen.public.signUp.photographerSignUp.required": "مطلوب.",
  "screen.public.signUp.photographerSignUp.portfolioPhotosNeeded": "صور الأعمال المطلوبة",
  "screen.public.signUp.photographerSignUp.portfolioPhotos": "صور الأعمال",
  "screen.public.signUp.photographerSignUp.minimumPhotosSubmitStaysBlocked":
    "بحد أدنى {min} صور. يبقى الإرسال متوقفًا حتى بلوغ الحد.",
  "screen.public.signUp.photographerSignUp.submissionFailed": "فشل الإرسال",
  "screen.public.signUp.photographerSignUp.submitting": "جارٍ الإرسال...",
  "screen.public.signUp.photographerSignUp.submitApplication": "إرسال الطلب",
  "screen.public.signUp.photographerSignUp.photographerSignUp": "تسجيل المصوّر",
  "screen.public.signUp.photographerSignUp.applyToJoinThePlatform":
    "تقدّم للانضمام إلى مجموعة مصوّري المنصة. يتحقق المصوّرون من البريد والهاتف معًا.",
  "screen.public.signUp.photographerSignUp.addMorePhotos": "إضافة صور أخرى",
  "screen.public.signUp.photographerSignUp.yourPortfolioHasFewerThan": "أعمالك أقل من",
  "screen.public.signUp.photographerSignUp.photosAddMoreToSubmit": "صور. أضف المزيد للإرسال.",
  // apps/web/src/screens/public/sign-up/platform-driver-sign-up.tsx
  "screen.public.signUp.platformDriverSignUp.registrationDocument": "مستند التسجيل",
  "screen.public.signUp.platformDriverSignUp.insuranceDocument": "مستند التأمين",
  "screen.public.signUp.platformDriverSignUp.labResult": "نتيجة التحليل",
  "screen.public.signUp.platformDriverSignUp.aClearPhotoOrScan": "صورة أو نسخة ممسوحة واضحة.",
  "screen.public.signUp.platformDriverSignUp.identity": "الهوية",
  "screen.public.signUp.platformDriverSignUp.fullName": "الاسم الكامل",
  "screen.public.signUp.platformDriverSignUp.email": "البريد الإلكتروني",
  "screen.public.signUp.platformDriverSignUp.phone": "الهاتف",
  "screen.public.signUp.platformDriverSignUp.country": "الدولة",
  "screen.public.signUp.platformDriverSignUp.required": "مطلوب.",
  "screen.public.signUp.platformDriverSignUp.vehicle": "المركبة",
  "screen.public.signUp.platformDriverSignUp.iDriveMyOwnVehicle": "أقود مركبتي الخاصة",
  "screen.public.signUp.platformDriverSignUp.plateNumber": "رقم اللوحة",
  "screen.public.signUp.platformDriverSignUp.model": "الطراز",
  "screen.public.signUp.platformDriverSignUp.year": "السنة",
  "screen.public.signUp.platformDriverSignUp.seats": "المقاعد",
  "screen.public.signUp.platformDriverSignUp.documents": "المستندات",
  "screen.public.signUp.platformDriverSignUp.insuranceValidUntil": "التأمين ساري حتى",
  "screen.public.signUp.platformDriverSignUp.yyyyMmDd": "YYYY-MM-DD",
  "screen.public.signUp.platformDriverSignUp.insuranceMustBeValidFor":
    "يجب أن يكون التأمين ساريًا لثلاثة أشهر على الأقل.",
  "screen.public.signUp.platformDriverSignUp.labTestDate": "تاريخ التحليل المخبري",
  "screen.public.signUp.platformDriverSignUp.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.public.signUp.platformDriverSignUp.theLabResultMustBe":
    "يجب ألا تتجاوز نتيجة التحليل 30 يومًا.",
  "screen.public.signUp.platformDriverSignUp.consent": "الموافقة",
  "screen.public.signUp.platformDriverSignUp.iConsentToABackground": "أوافق على التحقق من الخلفية",
  "screen.public.signUp.platformDriverSignUp.requiredToJoinTheDriver":
    "مطلوب للانضمام إلى مجموعة السائقين.",
  "screen.public.signUp.platformDriverSignUp.iConsentToALab": "أوافق على التحليل المخبري",
  "screen.public.signUp.platformDriverSignUp.requiredToJoinTheDriverDescription":
    "مطلوب للانضمام إلى مجموعة السائقين.",
  "screen.public.signUp.platformDriverSignUp.applicationBlocked": "الطلب محظور",
  "screen.public.signUp.platformDriverSignUp.submitting": "جارٍ الإرسال...",
  "screen.public.signUp.platformDriverSignUp.submitApplication": "إرسال الطلب",
  "screen.public.signUp.platformDriverSignUp.platformDriverSignUp": "تسجيل سائق المنصة",
  "screen.public.signUp.platformDriverSignUp.applyToJoinThePlatform":
    "تقدّم للانضمام إلى مجموعة سائقي المنصة. يتحقق السائقون من البريد والهاتف معًا.",
  "screen.public.signUp.platformDriverSignUp.applicationBlockedTitle": "الطلب محظور",
  "screen.public.signUp.platformDriverSignUp.insuranceMustBeValidFor2":
    "يجب أن يكون التأمين ساريًا لثلاثة أشهر أخرى على الأقل، وألا تتجاوز نتيجة التحليل 30 يومًا.",
  // apps/web/src/screens/public/sign-up/sign-up-chooser.tsx
  "screen.public.signUp.signUpChooser.traveler": "المسافر",
  "screen.public.signUp.signUpChooser.createATravelerAccountOn":
    "أنشئ حساب مسافر على الخطة المجانية.",
  "screen.public.signUp.signUpChooser.platformDriver": "سائق المنصة",
  "screen.public.signUp.signUpChooser.applyToJoinThePlatform":
    "تقدّم للانضمام إلى مجموعة سائقي المنصة.",
  "screen.public.signUp.signUpChooser.photographer": "مصوّر",
  "screen.public.signUp.signUpChooser.applyToJoinThePlatformDescription":
    "تقدّم للانضمام إلى مجموعة مصوّري المنصة.",
  "screen.public.signUp.signUpChooser.organization": "المؤسسة",
  "screen.public.signUp.signUpChooser.registerAnOrganizationForAdmin": "سجّل مؤسسة لمراجعة الإدارة.",
  "screen.public.signUp.signUpChooser.webOnly": "عبر الويب فقط",
  "screen.public.signUp.signUpChooser.continueAs": "المتابعة بصفة",
  "screen.public.signUp.signUpChooser.signUpChooserRegister": "اختيار نوع التسجيل (/register)",
  "screen.public.signUp.signUpChooser.pickTheRoleThatFits": "اختر الدور الذي يناسبك.",
  "screen.public.signUp.signUpChooser.rolesCouldNotLoad": "تعذّر تحميل الأدوار",
  "screen.public.signUp.signUpChooser.refreshThePageToTry": "حدّث الصفحة لإعادة المحاولة.",
  "screen.public.signUp.signUpChooser.alreadyHaveAnAccount": "لديك حساب بالفعل؟",
  "screen.public.signUp.signUpChooser.signIn": "تسجيل الدخول",
  // apps/web/src/screens/public/sign-up/traveler-sign-up.tsx
  "screen.public.signUp.travelerSignUp.fullName": "الاسم الكامل",
  "screen.public.signUp.travelerSignUp.email": "البريد الإلكتروني",
  "screen.public.signUp.travelerSignUp.enterAnEmailAPhone":
    "أدخل بريدًا إلكترونيًا أو رقم هاتف أو كليهما. مطلوب واحد على الأقل.",
  "screen.public.signUp.travelerSignUp.phone": "الهاتف",
  "screen.public.signUp.travelerSignUp.country": "الدولة",
  "screen.public.signUp.travelerSignUp.required": "مطلوب.",
  "screen.public.signUp.travelerSignUp.language": "اللغة",
  "screen.public.signUp.travelerSignUp.passwordOptional": "كلمة المرور (اختياري)",
  "screen.public.signUp.travelerSignUp.leaveEmptyToSignIn":
    "اتركه فارغًا لتسجيل الدخول برمز لمرة واحدة.",
  "screen.public.signUp.travelerSignUp.createAccount": "إنشاء الحساب",
  "screen.public.signUp.travelerSignUp.travelerSignUp": "تسجيل المسافر",
  "screen.public.signUp.travelerSignUp.createATravelerAccountOn":
    "أنشئ حساب مسافر على الخطة المجانية.",
  "screen.public.signUp.travelerSignUp.accountAlreadyExists": "الحساب موجود بالفعل",
  "screen.public.signUp.travelerSignUp.anAccountAlreadyUsesThis":
    "يستخدم حساب بالفعل هذا البريد أو الهاتف. سجّل الدخول بدلًا من ذلك.",
  // apps/web/src/screens/public/sign-up/verification-by-code.tsx
  "screen.public.signUp.verificationByCode.verify": "توثيق",
  "screen.public.signUp.verificationByCode.afterVerification": "بعد التحقق",
  "screen.public.signUp.verificationByCode.signIn": "تسجيل الدخول",
  "screen.public.signUp.verificationByCode.applicationStatus": "حالة الطلب",
  "screen.public.signUp.verificationByCode.verificationByCode": "التحقق بالرمز",
  "screen.public.signUp.verificationByCode.confirmYourEmailOrPhone":
    "أكّد بريدك أو هاتفك قبل أن يتمكن حسابك من العمل.",
  "screen.public.signUp.verificationByCode.wrongCode": "رمز خاطئ",
  "screen.public.signUp.verificationByCode.thatCodeDoesNotMatch":
    "هذا الرمز غير مطابق. خمسة رموز خاطئة توقف التحقق لمدة 15 دقيقة.",
  // apps/web/src/screens/registry.ts
  "screen.registry.surface.publicAndSignIn": "العام وتسجيل الدخول",
  "screen.registry.surface.sharedStates": "الحالات المشتركة",
  "screen.registry.surface.organizationDashboard": "لوحة المؤسسة",
  "screen.registry.surface.adminConsole": "لوحة الإدارة",
  // apps/web/src/screens/shared/index.ts
  "screen.registry.shared.planLimitUpgradePrompt.title": "تنبيه تجاوز حد الخطة",
  "screen.registry.shared.permissionDenied.title": "تم رفض الإذن (403)",
  "screen.registry.shared.notFound.title": "غير موجود (404)",
  "screen.registry.shared.unauthorized.title": "غير مصرّح (401)",
  "screen.registry.shared.serverError.title": "خطأ في الخادم (500)",
  "screen.registry.shared.serviceUnavailable.title": "الخدمة غير متاحة (503)",
  "screen.registry.shared.maintenancePage.title": "صفحة الصيانة",
  "screen.registry.shared.offlineBanner.title": "شريط عدم الاتصال",
  "screen.registry.shared.confirmationDialog.title": "مربع حوار التأكيد",
  "screen.registry.shared.languageSwitchAndRtl.title": "تبديل اللغة والاتجاه من اليمين إلى اليسار",
  "screen.registry.shared.notificationCentre.title": "مركز الإشعارات",
  "screen.registry.shared.receiptAndInvoiceView.title": "عرض الإيصال والفاتورة",
  "screen.registry.shared.roleAndOrganizationSwitcher.title": "مبدّل الدور والمؤسسة",
  "screen.registry.shared.otpEntry.title": "إدخال الرمز",
  "screen.registry.shared.seatMap.title": "خريطة المقاعد",
  "screen.registry.shared.documentAndPhotoUpload.title": "رفع المستندات والصور",
  // apps/web/src/screens/shared/otp-entry-panel.tsx
  "screen.shared.otpEntryPanel.enterDigitCode": "أدخل الرمز المكوّن من {length} أرقام المرسل إلى",
  "screen.shared.otpEntryPanel.codeExpiry": ". تنتهي صلاحية الرمز خلال {minutes} دقائق.",
  "screen.shared.otpEntryPanel.resendIn": "إعادة إرسال الرمز خلال {seconds} ثانية",
  "screen.shared.otpEntryPanel.verificationCode": "رمز التحقق",
  "screen.shared.otpEntryPanel.digitOf": "الرقم {position} من {length}",
  "screen.shared.otpEntryPanel.changeEmailOrPhone": "تغيير البريد أو الهاتف",
  // apps/web/src/screens/shared/scr-shr-01-plan-limit-upgrade-prompt.tsx
  "screen.shared.scrShr01PlanLimitUpgradePrompt.planLimitUpgradePrompt": "تنبيه تجاوز حد الخطة",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.aPlanLimitBlocksThis":
    "حد الخطة يمنع هذا الإجراء. الترقية ترفع الحد.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.thisActionIsLockedOn":
    "هذا الإجراء مقفل في خطتك الحالية.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.paymentFailed": "فشل الدفع",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.theUpgradeDidNotGo":
    "لم تكتمل الترقية، لذا يبقى الإجراء مقفلًا. جرّب طريقة دفع أخرى.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.planLimitReached": "تم بلوغ حد الخطة",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.yourCurrentPlanDoesNot":
    "خطتك الحالية لا تسمح بهذا الإجراء. الترقية تُطبَّق فورًا وتُحتسب بالتناسب.",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.upgradeTo": "الترقية إلى {plan}",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.cancel": "إلغاء",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.limit": "الحد",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.limitNameFromTheBlocked":
    "اسم الحد من الإجراء المحظور",
  "screen.shared.scrShr01PlanLimitUpgradePrompt.liftedBy": "يُرفع بواسطة",
  // apps/web/src/screens/shared/scr-shr-02-permission-denied.tsx
  "screen.shared.scrShr02PermissionDenied.youDonTHavePermission": "لا تملك إذنًا لهذا",
  "screen.shared.scrShr02PermissionDenied.yourRoleDoesNotInclude":
    "دورك لا يشمل هذا الإجراء. عُد إلى الشاشة التي أتيت منها.",
  "screen.shared.scrShr02PermissionDenied.goBack": "رجوع",
  // apps/web/src/screens/shared/scr-shr-03-not-found.tsx
  "screen.shared.scrShr03NotFound.theLinkMayBeOut":
    "قد يكون الرابط قديمًا أو أُزيل العنصر. تحقق من العنوان، أو انتقل إلى الرئيسية.",
  "screen.shared.scrShr03NotFound.goToHome": "الانتقال إلى الرئيسية",
  // apps/web/src/screens/shared/scr-shr-04-unauthorized.tsx
  "screen.shared.scrShr04Unauthorized.signInToContinue": "سجّل الدخول للمتابعة",
  "screen.shared.scrShr04Unauthorized.yourSessionIsNoLonger":
    "جلستك لم تعد صالحة. سجّل الدخول مجددًا وستعود إلى هذه الصفحة.",
  "screen.shared.scrShr04Unauthorized.signIn": "تسجيل الدخول",
  // apps/web/src/screens/shared/scr-shr-05-server-error.tsx
  "screen.shared.scrShr05ServerError.requestId": "معرّف الطلب",
  "screen.shared.scrShr05ServerError.tryAgain": "إعادة المحاولة",
  "screen.shared.scrShr05ServerError.goToHome": "الانتقال إلى الرئيسية",
  // apps/web/src/screens/shared/scr-shr-06-service-unavailable.tsx
  "screen.shared.scrShr06ServiceUnavailable.serviceIsTemporarilyUnavailable":
    "الخدمة غير متاحة مؤقتًا",
  "screen.shared.scrShr06ServiceUnavailable.weAreRestoringTheService":
    "نعمل على استعادة الخدمة. مدفوعات الحجز ليست مفقودة: تُرتَّب الاستدعاءات وتُعالَج عند عودة الخدمة.",
  "screen.shared.scrShr06ServiceUnavailable.retry": "إعادة المحاولة",
  "screen.shared.scrShr06ServiceUnavailable.updatesArePostedOnThe":
    "تُنشر التحديثات على صفحة الحالة.",
  // apps/web/src/screens/shared/scr-shr-07-maintenance-page.tsx
  "screen.shared.scrShr07MaintenancePage.plannedMaintenance": "صيانة مخطط لها",
  "screen.shared.scrShr07MaintenancePage.tripsEnjoyIsUnavailableDuring":
    "Trips Enjoy غير متاح خلال نافذة صيانة مخطط لها. تستمر استدعاءات الدفع في الترتيب وتُعالَج بعد النافذة.",
  "screen.shared.scrShr07MaintenancePage.startAndEndTimesIn":
    "أوقات البدء والانتهاء، بمنطقتك الزمنية",
  "screen.shared.scrShr07MaintenancePage.plannedWindow": "النافذة المخططة",
  "screen.shared.scrShr07MaintenancePage.tryAgainAfterTheWindow": "أعد المحاولة بعد انتهاء النافذة",
  // apps/web/src/screens/shared/scr-shr-08-offline-banner.tsx
  "screen.shared.scrShr08OfflineBanner.youAreOfflineViewingSaved":
    "أنت غير متصل. عرض الرحلات المحفوظة لا يزال يعمل. إجراءات الحجز والدفع متوقفة حتى تعود الاتصال.",
  "screen.shared.scrShr08OfflineBanner.retry": "إعادة المحاولة",
  "screen.shared.scrShr08OfflineBanner.offlineBanner": "شريط عدم الاتصال",
  "screen.shared.scrShr08OfflineBanner.theBannerSitsAboveThe":
    "يظهر الشريط أعلى الشاشة الحالية ويختفي عند عودة الاتصال.",
  "screen.shared.scrShr08OfflineBanner.contentAlreadyOnScreenStays":
    "يبقى المحتوى الظاهر على الشاشة مرئيًا. الإجراءات التي تحتاج إلى اتصال معطّلة حتى يعود التطبيق متصلًا.",
  // apps/web/src/screens/shared/scr-shr-09-confirmation-dialog.tsx
  "screen.shared.scrShr09ConfirmationDialog.confirmationDialog": "مربع حوار التأكيد",
  "screen.shared.scrShr09ConfirmationDialog.aDecisionScreenAsksFor":
    "تطلب شاشة القرار تأكيدًا قبل حفظ التغيير.",
  "screen.shared.scrShr09ConfirmationDialog.reviewChange": "مراجعة التغيير",
  "screen.shared.scrShr09ConfirmationDialog.back": "رجوع",
  "screen.shared.scrShr09ConfirmationDialog.confirmThisChange": "تأكيد هذا التغيير",
  "screen.shared.scrShr09ConfirmationDialog.theChangeTakesEffectWhen":
    "يُطبَّق التغيير عند التأكيد. يُبلَّغ المسافرون المتأثرون قبل تطبيقه. يُسجَّل هذا الإجراء.",
  "screen.shared.scrShr09ConfirmationDialog.confirmChange": "تأكيد التغيير",
  "screen.shared.scrShr09ConfirmationDialog.cancel": "إلغاء",
  "screen.shared.scrShr09ConfirmationDialog.reason": "السبب",
  "screen.shared.scrShr09ConfirmationDialog.requiredForThisChangeConfirm":
    "مطلوب لهذا التغيير. يبقى التأكيد معطّلًا حتى تعبئته.",
  // apps/web/src/screens/shared/scr-shr-10-language-switch-and-rtl.tsx
  "screen.shared.scrShr10LanguageSwitchAndRtl.languageSwitchAndRtl":
    "تبديل اللغة والاتجاه من اليمين إلى اليسار",
  "screen.shared.scrShr10LanguageSwitchAndRtl.layoutRightToLeft": "التخطيط: من اليمين إلى اليسار",
  "screen.shared.scrShr10LanguageSwitchAndRtl.layoutLeftToRight": "التخطيط: من اليسار إلى اليمين",
  "screen.shared.scrShr10LanguageSwitchAndRtl.back": "رجوع",
  "screen.shared.scrShr10LanguageSwitchAndRtl.fullName": "الاسم الكامل",
  "screen.shared.scrShr10LanguageSwitchAndRtl.country": "الدولة",
  "screen.shared.scrShr10LanguageSwitchAndRtl.continue": "متابعة",
  // apps/web/src/screens/shared/scr-shr-11-notification-centre.tsx
  "screen.shared.scrShr11NotificationCentre.applicationStatusChanged": "تغيّرت حالة الطلب",
  "screen.shared.scrShr11NotificationCentre.yourApplicationIsNowPending": "طلبك الآن قيد المراجعة.",
  "screen.shared.scrShr11NotificationCentre.verificationCodeSent": "أُرسل رمز التحقق",
  "screen.shared.scrShr11NotificationCentre.checkYourEmailForThe":
    "تحقق من بريدك للحصول على الرمز. تنتهي صلاحية الرموز بعد 5 دقائق.",
  "screen.shared.scrShr11NotificationCentre.tripTimeChanged": "تغيّر وقت الرحلة",
  "screen.shared.scrShr11NotificationCentre.emailDeliveryFailedDeliveryStatus":
    "فشل تسليم البريد. حالة التسليم: إعادة المحاولة مجدولة.",
  "screen.shared.scrShr11NotificationCentre.all": "الكل",
  "screen.shared.scrShr11NotificationCentre.unread": "غير المقروء",
  "screen.shared.scrShr11NotificationCentre.filterNotifications": "تصفية الإشعارات",
  "screen.shared.scrShr11NotificationCentre.markAllAsRead": "تعليم الكل كمقروء",
  "screen.shared.scrShr11NotificationCentre.noUnreadNotifications": "لا إشعارات غير مقروءة",
  "screen.shared.scrShr11NotificationCentre.youAreAllCaughtUp": "لا شيء جديد لديك.",
  "screen.shared.scrShr11NotificationCentre.notificationCentre": "مركز الإشعارات",
  "screen.shared.scrShr11NotificationCentre.yourNotificationsWithDeliveryStatus":
    "إشعاراتك، مع حالة التسليم لكل منها.",
  "screen.shared.scrShr11NotificationCentre.back": "رجوع",
  "screen.shared.scrShr11NotificationCentre.noNotificationsYet": "لا إشعارات بعد",
  "screen.shared.scrShr11NotificationCentre.notificationsAboutYourBookingsAnd":
    "تظهر هنا الإشعارات المتعلقة بحجوزاتك وطلباتك.",
  "screen.shared.scrShr11NotificationCentre.notificationsCouldNotLoad": "تعذّر تحميل الإشعارات",
  "screen.shared.scrShr11NotificationCentre.tryAgainInAFew": "أعد المحاولة بعد بضع دقائق.",
  // apps/web/src/screens/shared/scr-shr-12-receipt-and-invoice-view.tsx
  "screen.shared.scrShr12ReceiptAndInvoiceView.lineDescription": "وصف البند",
  "screen.shared.scrShr12ReceiptAndInvoiceView.description": "الوصف",
  "screen.shared.scrShr12ReceiptAndInvoiceView.amount": "المبلغ",
  "screen.shared.scrShr12ReceiptAndInvoiceView.issued": "تاريخ الإصدار",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptNumberIssueDateAnd":
    "يظهر هنا رقم الإيصال وتاريخ الإصدار وبيانات المشتري.",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptLines": "بنود الإيصال",
  "screen.shared.scrShr12ReceiptAndInvoiceView.noLines": "لا بنود",
  "screen.shared.scrShr12ReceiptAndInvoiceView.tax": "الضريبة",
  "screen.shared.scrShr12ReceiptAndInvoiceView.total": "الإجمالي",
  "screen.shared.scrShr12ReceiptAndInvoiceView.exportIsLockedOnThe":
    "التصدير مقفل في الخطة المجانية.",
  "screen.shared.scrShr12ReceiptAndInvoiceView.upgradeToExport": "الترقية للتصدير",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptAndInvoiceView": "عرض الإيصال والفاتورة",
  "screen.shared.scrShr12ReceiptAndInvoiceView.numberDateBuyerLinesTax":
    "الرقم والتاريخ والمشتري والبنود والضريبة والإجماليات.",
  "screen.shared.scrShr12ReceiptAndInvoiceView.back": "رجوع",
  "screen.shared.scrShr12ReceiptAndInvoiceView.receiptCouldNotLoad": "تعذّر تحميل الإيصال",
  "screen.shared.scrShr12ReceiptAndInvoiceView.tryAgainLaterTheReceipt":
    "أعد المحاولة لاحقًا. يبقى الإيصال متاحًا من حجوزاتك.",
  // apps/web/src/screens/shared/scr-shr-13-role-and-organization-switcher.tsx
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.showingRole":
    "المعروض: {role}. لا تُعرض بيانات الأدوار الأخرى.",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.traveler": "المسافر",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.driver": "السائق",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.organization1": "المؤسسة 1",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.organization2": "المؤسسة 2",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.roleAndOrganizationSwitcher":
    "مبدّل الدور والمؤسسة",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.onlyRolesYouHoldAnd":
    "تُعرض فقط الأدوار التي تشغلها والمؤسسات المرتبطة ببريدك. لا يُظهر التبديل بيانات دور آخر.",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.back": "رجوع",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.roles": "الأدوار",
  "screen.shared.scrShr13RoleAndOrganizationSwitcher.organizations": "المؤسسات",
  // apps/web/src/screens/shared/scr-shr-14-otp-entry.tsx
  "screen.shared.scrShr14OtpEntry.verify": "توثيق",
  "screen.shared.scrShr14OtpEntry.otpEntry": "إدخال الرمز",
  "screen.shared.scrShr14OtpEntry.enterTheOneTimeCode":
    "أدخل الرمز لمرة واحدة. لا تُعرض الرموز ولا تُسجَّل.",
  "screen.shared.scrShr14OtpEntry.back": "رجوع",
  "screen.shared.scrShr14OtpEntry.wrongCode": "رمز خاطئ",
  "screen.shared.scrShr14OtpEntry.thatCodeDoesNotMatch":
    "هذا الرمز غير مطابق. بعد خمسة رموز خاطئة، يتوقف التحقق لمدة 15 دقيقة.",
  // apps/web/src/screens/shared/scr-shr-15-seat-map.tsx
  "screen.shared.scrShr15SeatMap.vehicleSeatMap": "خريطة مقاعد المركبة",
  "screen.shared.scrShr15SeatMap.seatsAsAList": "المقاعد كقائمة",
  "screen.shared.scrShr15SeatMap.seat": "المقعد",
  "screen.shared.scrShr15SeatMap.selectedSeat": "المقعد المحدد:",
  "screen.shared.scrShr15SeatMap.confirmSeat": "تأكيد المقعد",
  "screen.shared.scrShr15SeatMap.seatMap": "خريطة المقاعد",
  "screen.shared.scrShr15SeatMap.selectAnAvailableSeatSeat":
    "اختر مقعدًا متاحًا. تُعرض حالات المقاعد ككلمات وأيقونات.",
  "screen.shared.scrShr15SeatMap.back": "رجوع",
  "screen.shared.scrShr15SeatMap.seatTaken": "المقعد محجوز",
  "screen.shared.scrShr15SeatMap.thisSeatWasTakenWhile":
    "حُجز هذا المقعد أثناء اختيارك. اختر مقعدًا آخر.",
  // apps/web/src/screens/shared/scr-shr-16-document-and-photo-upload.tsx
  "screen.shared.scrShr16DocumentAndPhotoUpload.uploadProgress":
    "ارفع {min} صور على الأقل. المرفوع: {uploaded} من {min}.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.fileTypeNotAllowed": "نوع الملف غير مسموح",
  "screen.shared.scrShr16DocumentAndPhotoUpload.documents": "المستندات",
  "screen.shared.scrShr16DocumentAndPhotoUpload.chooseAFileOrTake": "اختر ملفًا أو التقط صورة.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.portfolioPhotos": "صور الأعمال",
  "screen.shared.scrShr16DocumentAndPhotoUpload.minimumCount": "الحد الأدنى للعدد",
  "screen.shared.scrShr16DocumentAndPhotoUpload.portfolioPhotosLabel": "صور الأعمال",
  "screen.shared.scrShr16DocumentAndPhotoUpload.photosAreStrippedOfLocation":
    "تُزال بيانات الموقع من الصور قبل تخزينها.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.documentAndPhotoUpload": "رفع المستندات والصور",
  "screen.shared.scrShr16DocumentAndPhotoUpload.filesAreCheckedForType":
    "تُفحص الملفات من حيث النوع والحجم والعدد. يُستأنف الرفع المتقطع دون البدء من جديد.",
  "screen.shared.scrShr16DocumentAndPhotoUpload.back": "رجوع",
  "screen.shared.scrShr16DocumentAndPhotoUpload.fileRefused": "تم رفض الملف",
  "screen.shared.scrShr16DocumentAndPhotoUpload.thisFileTypeIsNot":
    "نوع الملف هذا غير مسموح. اختر PDF أو صورة.",
  // apps/web/src/screens/shared/state-preview.tsx
  "screen.shared.statePreview.labels.main": "الرئيسية",
  "screen.shared.statePreview.labels.loading": "التحميل",
  "screen.shared.statePreview.labels.empty": "الفراغ",
  "screen.shared.statePreview.labels.error": "الخطأ",
  "screen.shared.statePreview.previewState": "معاينة الحالة",
  "screen.shared.statePreview.loading": "التحميل",
  // packages/ui/src/components/message-scroller.tsx
  "ui.messageScroller.scrollToEnd": "التمرير إلى النهاية",
  "ui.messageScroller.scrollToStart": "التمرير إلى البداية",
  // packages/ui/src/components/te-application-card.tsx
  "ui.teApplicationCard.labels.pendingReview": "قيد المراجعة",
  "ui.teApplicationCard.labels.changesRequested": "طُلبت تغييرات",
  "ui.teApplicationCard.labels.approved": "معتمد",
  "ui.teApplicationCard.labels.rejected": "مرفوض",
  // packages/ui/src/components/te-assignment-card.tsx
  "ui.teAssignmentCard.labels.route": "المسار",
  "ui.teAssignmentCard.labels.departure": "الانطلاق",
  "ui.teAssignmentCard.labels.vehicle": "المركبة",
  // packages/ui/src/components/te-bar-chart.tsx
  "ui.teBarChart.item": "العنصر",
  "ui.teBarChart.value": "القيمة",
  // packages/ui/src/components/te-calendar.tsx
  "ui.teCalendar.dateSelected": "{date}، محدد",
  "ui.teCalendar.previousMonth": "الشهر السابق",
  "ui.teCalendar.nextMonth": "الشهر التالي",
  // packages/ui/src/components/te-checklist.tsx
  "ui.teChecklist.labels.checked": "تم",
  "ui.teChecklist.labels.notYet": "ليس بعد",
  // packages/ui/src/components/te-error-state.tsx
  "ui.teErrorState.weCanTFindThis": "لا نجد هذه الصفحة",
  "ui.teErrorState.theLinkMayBeOut":
    "قد يكون الرابط قديمًا أو نُقلت الصفحة. تحقق من العنوان، أو عُد إلى رحلاتك.",
  "ui.teErrorState.goToMyTrips": "الانتقال إلى رحلاتي",
  "ui.teErrorState.somethingWentWrongOnOur": "حدث خطأ من جانبنا",
  "ui.teErrorState.yourBookingAndPaymentsAre": "حجزك ومدفوعاتك آمنة. أعد المحاولة بعد بضع دقائق.",
  "ui.teErrorState.tryAgain": "إعادة المحاولة",
  "ui.teErrorState.youReOffline": "أنت غير متصل",
  "ui.teErrorState.checkYourInternetConnectionThen": "تحقق من اتصالك بالإنترنت، ثم أعد المحاولة.",
  "ui.teErrorState.tryAgainActionLabel": "إعادة المحاولة",
  "ui.teErrorState.youDonTHaveAccess": "لا تملك وصولًا إلى هذه الصفحة",
  "ui.teErrorState.askTheTripOrganizerFor":
    "اطلب الوصول من منظم الرحلة، أو سجّل الدخول بالحساب الذي يملكه.",
  "ui.teErrorState.signIn": "تسجيل الدخول",
  "ui.teErrorState.signInToContinue": "سجّل الدخول للمتابعة",
  "ui.teErrorState.yourSessionHasEndedSign": "انتهت جلستك. سجّل الدخول مجددًا لعرض هذه الصفحة.",
  "ui.teErrorState.signInActionLabel": "تسجيل الدخول",
  "ui.teErrorState.serviceTemporarilyUnavailable": "الخدمة غير متاحة مؤقتًا",
  "ui.teErrorState.weAreWorkingOnIt": "نعمل على ذلك. أعد المحاولة بعد بضع دقائق.",
  "ui.teErrorState.tryAgain2": "إعادة المحاولة",
  // packages/ui/src/components/te-file-upload.tsx
  "ui.teFileUpload.labels.waiting": "في الانتظار",
  "ui.teFileUpload.labels.uploading": "جارٍ الرفع",
  "ui.teFileUpload.labels.uploaded": "تم الرفع",
  "ui.teFileUpload.labels.failed": "فاشلة",
  // packages/ui/src/components/te-inline-alert.tsx
  "ui.teInlineAlert.error": "الخطأ",
  "ui.teInlineAlert.warning": "تحذير",
  "ui.teInlineAlert.info": "معلومة",
  "ui.teInlineAlert.success": "نجاح",
  // packages/ui/src/components/te-link.tsx
  "ui.teLink.opensInANewTab": "(يفتح في تبويب جديد)",
  // packages/ui/src/components/te-offer-card.tsx
  "ui.teOfferCard.labels.open": "مفتوحة",
  "ui.teOfferCard.labels.accepted": "مقبول",
  "ui.teOfferCard.labels.declined": "مرفوض",
  "ui.teOfferCard.labels.countered": "عرض مضاد",
  // packages/ui/src/components/te-pagination.tsx
  "ui.tePagination.labels.previousPage": "الصفحة السابقة",
  "ui.tePagination.labels.nextPage": "الصفحة التالية",
  "ui.tePagination.labels.pageOf": "الصفحة {page} من {pageCount}",
  // packages/ui/src/components/te-role-badge.tsx
  "ui.teRoleBadge.labels.traveler": "المسافر",
  "ui.teRoleBadge.labels.parent": "ولي الأمر",
  "ui.teRoleBadge.labels.driver": "السائق",
  "ui.teRoleBadge.labels.photographer": "مصوّر",
  "ui.teRoleBadge.labels.organization": "المؤسسة",
  "ui.teRoleBadge.labels.admin": "مسؤول",
  // packages/ui/src/components/te-seat-map.tsx
  "ui.teSeatMap.labels.available": "متاح",
  "ui.teSeatMap.labels.selected": "محدد",
  "ui.teSeatMap.labels.held": "محجوز مؤقتًا",
  "ui.teSeatMap.labels.reserved": "محجوز",
  "ui.teSeatMap.labels.checkedIn": "تم تسجيل الحضور",
  "ui.teSeatMap.labels.checkedOut": "تم تسجيل المغادرة",
  "ui.teSeatMap.labels.cancelled": "ملغى",
  "ui.teSeatMap.labels.taken": "مشغول",
  "ui.teSeatMap.labels.blocked": "محظور",
  // packages/ui/src/components/te-stepper.tsx
  "ui.teStepper.labels.done": "تم",
  "ui.teStepper.labels.current": "الحالي",
  "ui.teStepper.labels.upcoming": "القادم",
  // packages/ui/src/components/te-timeline.tsx
  "ui.teTimeline.labels.done": "تم",
  "ui.teTimeline.labels.current": "الحالي",
  "ui.teTimeline.labels.upcoming": "القادم",
  "ui.teTimeline.labels.missed": "فائت",
  // packages/ui/src/components/te-tracking-status.tsx
  "ui.teTrackingStatus.onTime": "في الموعد",
  "ui.teTrackingStatus.delayed": "متأخر",
  "ui.teTrackingStatus.boarded": "صعد",
  "ui.teTrackingStatus.notBoarded": "لم يصعد",
  "ui.teTrackingStatus.arrived": "وصل",
  // apps/web/src/components/shells
  "component.shell.brand.name": "تريبس إنجوي",
  "component.shell.skipToContent": "انتقل إلى المحتوى",
  "component.shell.language.arabic": "العربية",
  "component.shell.language.english": "English",
  "component.shell.public.signIn": "تسجيل الدخول",
  "component.shell.public.signUp": "إنشاء حساب",
  "component.shell.public.primaryNav": "الموقع",
  "component.shell.screenNotBuilt": "هذه الصفحة غير متاحة بعد.",
  "component.shell.org.navLabel": "المؤسسة",
  "component.shell.org.nav.home": "الصفحة الرئيسية",
  "component.shell.org.nav.trips": "الرحلات",
  "component.shell.org.nav.vehicles": "المركبات",
  "component.shell.org.nav.staffing": "فريق العمل",
  "component.shell.org.nav.bookings": "الحجوزات",
  "component.shell.org.nav.coupons": "القسائم",
  "component.shell.org.nav.accounting": "المحاسبة",
  "component.shell.org.nav.employees": "الموظفون",
  "component.shell.org.nav.invoices": "الفواتير",
  "component.shell.org.nav.reports": "التقارير",
  "component.shell.org.nav.live": "العمليات المباشرة",
  "component.shell.org.nav.subscription": "الاشتراك",
  "component.shell.org.nav.settings": "الإعدادات وإدارة العملاء",
  "component.shell.admin.consoleName": "لوحة الإدارة",
  "component.shell.admin.navLabel": "أقسام الإدارة",
  "component.shell.admin.nav.home": "الرئيسية",
  "component.shell.admin.nav.applications": "الطلبات",
  "component.shell.admin.nav.directory": "المستخدمون والجهات",
  "component.shell.admin.nav.labTests": "الفحوصات المخبرية",
  "component.shell.admin.nav.plans": "الخطط والإيرادات",
  "component.shell.admin.nav.coupons": "القسائم والصفقات",
  "component.shell.admin.nav.disputes": "النزاعات",
  "component.shell.admin.nav.money": "الأموال",
  "component.shell.admin.nav.trips": "الرحلات",
  "component.shell.admin.nav.audit": "سجل التدقيق",
  "component.shell.admin.nav.notifications": "الإشعارات",
  "component.shell.admin.nav.platform": "المنصة",
};
