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
  "screen.admin.applications.appealReview.title": "مراجعة الطعن",
  "screen.admin.applications.appealReview.description": "قرّر في طعن مقدَّم من متقدّم مرفوض.",
  "screen.admin.applications.appealReview.appealedPending": "مطعون فيه، القرار معلّق",
  "screen.admin.applications.appealReview.decidedApproved": "قُبل الطعن، تمت الموافقة",
  "screen.admin.applications.appealReview.decidedRejected": "تم تأييد الرفض",
  "screen.admin.applications.appealReview.originalApplication": "الطلب الأصلي",
  "screen.admin.applications.appealReview.applicant": "مقدّم الطلب",
  "screen.admin.applications.appealReview.type": "النوع",
  "screen.admin.applications.appealReview.driver": "سائق",
  "screen.admin.applications.appealReview.organization": "منظمة",
  "screen.admin.applications.appealReview.photographer": "مصوّر",
  "screen.admin.applications.appealReview.rejectedOn": "تاريخ الرفض",
  "screen.admin.applications.appealReview.originalReason": "السبب الأصلي",
  "screen.admin.applications.appealReview.noMessage": "لم تُرسل رسالة مع الرفض.",
  "screen.admin.applications.appealReview.appealStatement": "بيان الطعن",
  "screen.admin.applications.appealReview.noStatement": "لم يكتب مقدّم الطلب بيانًا.",
  "screen.admin.applications.appealReview.appealWindow": "مهلة الطعن: متبقٍ {days} يوم",
  "screen.admin.applications.appealReview.decision": "القرار",
  "screen.admin.applications.appealReview.upholdAppeal": "قبول الطعن",
  "screen.admin.applications.appealReview.upholdAppealBody": "تعيين حالة الطلب إلى مقبول.",
  "screen.admin.applications.appealReview.upholdRejection": "تأييد الرفض",
  "screen.admin.applications.appealReview.upholdRejectionBody": "إبقاء الطلب مرفوضًا.",
  "screen.admin.applications.appealReview.reasonRequired": "السبب (مطلوب)",
  "screen.admin.applications.appealReview.reasonPlaceholder": "لا يضيف الطعن المستند الناقص.",
  "screen.admin.applications.appealReview.reasonTooShort": "اكتب 5 أحرف على الأقل.",
  "screen.admin.applications.appealReview.cancel": "إلغاء",
  "screen.admin.applications.appealReview.saveDecision": "حفظ القرار",
  "screen.admin.applications.appealReview.saving": "جارٍ الحفظ…",
  "screen.admin.applications.appealReview.saveFailed": "لم يُحفظ القرار",
  "screen.admin.applications.appealReview.saveFailedBody":
    "حاول مرة أخرى. إذا استمر الخطأ، أعد تحميل الصفحة.",
  "screen.admin.applications.appealReview.loading": "جارٍ تحميل الطعن…",
  "screen.admin.applications.appealReview.emptyTitle": "لا توجد طعون للمراجعة",
  "screen.admin.applications.appealReview.emptyBody":
    "تظهر هنا الطعون المقدّمة من المتقدمين المرفوضين.",
  // apps/web/src/screens/admin/applications/application-queue.tsx
  "screen.admin.applications.applicationQueue.title": "قائمة الطلبات",
  "screen.admin.applications.applicationQueue.description":
    "قائمة واحدة لطلبات المؤسسات وسائقي المنصة ومصوري المنصة.",
  "screen.admin.applications.applicationQueue.openApplication": "فتح الطلب",
  "screen.admin.applications.applicationQueue.openApplicationFor": "فتح طلب {applicant}",
  "screen.admin.applications.applicationQueue.filters": "عوامل التصفية",
  "screen.admin.applications.applicationQueue.type": "النوع",
  "screen.admin.applications.applicationQueue.allTypes": "كل الأنواع",
  "screen.admin.applications.applicationQueue.organization": "مؤسسة",
  "screen.admin.applications.applicationQueue.driver": "سائق",
  "screen.admin.applications.applicationQueue.photographer": "مصوّر",
  "screen.admin.applications.applicationQueue.country": "الدولة",
  "screen.admin.applications.applicationQueue.allCountries": "كل الدول",
  "screen.admin.applications.applicationQueue.ageWorkingDays": "المدة (أيام عمل)",
  "screen.admin.applications.applicationQueue.anyAge": "أي مدة",
  "screen.admin.applications.applicationQueue.overdueOnly": "متأخر (أكثر من يومي عمل)",
  "screen.admin.applications.applicationQueue.state": "الحالة",
  "screen.admin.applications.applicationQueue.allStates": "كل الحالات",
  "screen.admin.applications.applicationQueue.submittedState": "تم التقديم",
  "screen.admin.applications.applicationQueue.underReview": "قيد المراجعة",
  "screen.admin.applications.applicationQueue.changesRequested": "مطلوب تعديلات",
  "screen.admin.applications.applicationQueue.approved": "تمت الموافقة",
  "screen.admin.applications.applicationQueue.rejected": "مرفوض",
  "screen.admin.applications.applicationQueue.appealed": "تم الاستئناف",
  "screen.admin.applications.applicationQueue.closed": "مغلق",
  "screen.admin.applications.applicationQueue.applicant": "مقدّم الطلب",
  "screen.admin.applications.applicationQueue.submitted": "تاريخ التقديم",
  "screen.admin.applications.applicationQueue.workingDaysWaiting": "أيام العمل في الانتظار",
  "screen.admin.applications.applicationQueue.overdue": "متأخر",
  "screen.admin.applications.applicationQueue.notOverdue": "غير متأخر",
  "screen.admin.applications.applicationQueue.action": "الإجراء",
  "screen.admin.applications.applicationQueue.tableCaption": "الطلبات بانتظار المراجعة",
  "screen.admin.applications.applicationQueue.loading": "جارٍ تحميل قائمة الطلبات.",
  "screen.admin.applications.applicationQueue.emptyTitle": "لا توجد طلبات تطابق عوامل التصفية",
  "screen.admin.applications.applicationQueue.emptyBody":
    "غيّر عوامل التصفية لرؤية المزيد من الطلبات.",
  // apps/web/src/screens/admin/applications/application-review-detail.tsx
  "screen.admin.applications.applicationReviewDetail.title": "مراجعة الطلب",
  "screen.admin.applications.applicationReviewDetail.description":
    "راجع البيانات والمستندات المقدّمة، ثم اتخذ القرار.",
  "screen.admin.applications.applicationReviewDetail.reject": "رفض",
  "screen.admin.applications.applicationReviewDetail.requestChanges": "طلب تعديلات",
  "screen.admin.applications.applicationReviewDetail.approve": "موافقة",
  "screen.admin.applications.applicationReviewDetail.approving": "جارٍ الاعتماد…",
  "screen.admin.applications.applicationReviewDetail.applicantData": "بيانات مقدّم الطلب",
  "screen.admin.applications.applicationReviewDetail.applicant": "مقدّم الطلب",
  "screen.admin.applications.applicationReviewDetail.type": "النوع",
  "screen.admin.applications.applicationReviewDetail.country": "الدولة",
  "screen.admin.applications.applicationReviewDetail.submitted": "تاريخ التقديم",
  "screen.admin.applications.applicationReviewDetail.driver": "سائق",
  "screen.admin.applications.applicationReviewDetail.organization": "منظمة",
  "screen.admin.applications.applicationReviewDetail.photographer": "مصوّر",
  "screen.admin.applications.applicationReviewDetail.driverChecks": "فحوصات السائق",
  "screen.admin.applications.applicationReviewDetail.noChecksForType":
    "لا تنطبق فحوصات تلقائية على هذا النوع من الطلبات.",
  "screen.admin.applications.applicationReviewDetail.backgroundConsent":
    "الموافقة على التحقق من السجل",
  "screen.admin.applications.applicationReviewDetail.labConsent": "الموافقة على التحليل المخبري",
  "screen.admin.applications.applicationReviewDetail.initialLabResult":
    "نتيجة التحليل الأولية خلال 30 يومًا",
  "screen.admin.applications.applicationReviewDetail.insuranceValid":
    "تأمين ساري لمدة 3 أشهر أو أكثر",
  "screen.admin.applications.applicationReviewDetail.decision": "القرار",
  "screen.admin.applications.applicationReviewDetail.readyToApprove":
    "اجتازت جميع الفحوصات وكل المستندات متوفرة. تؤدي الموافقة إلى تعيين الخطة المبدئية وإرسال إشعار إلى مقدّم الطلب.",
  "screen.admin.applications.applicationReviewDetail.approveBlocked":
    "يبقى زر الموافقة معطّلًا حتى تجتاز جميع الفحوصات ويُتحقق من كل المستندات.",
  "screen.admin.applications.applicationReviewDetail.restrictedTitle":
    "مستندات الهوية معروضة في وضع مقيّد",
  "screen.admin.applications.applicationReviewDetail.auditRecorded": "يُسجَّل كل عرض في سجل التدقيق.",
  "screen.admin.applications.applicationReviewDetail.documentOpened":
    "تم فتح {document} في العرض المقيّد",
  "screen.admin.applications.applicationReviewDetail.duplicateHold": "تعليق بسبب تسجيل مكرر",
  "screen.admin.applications.applicationReviewDetail.duplicateHoldBody":
    "تستخدم منظمة أخرى هذا التسجيل بالفعل. عالج التكرار قبل الموافقة.",
  "screen.admin.applications.applicationReviewDetail.actionFailed": "لم يكتمل الإجراء",
  "screen.admin.applications.applicationReviewDetail.actionFailedBody":
    "حاول مرة أخرى. إذا استمر الخطأ، أعد تحميل الصفحة.",
  "screen.admin.applications.applicationReviewDetail.unverifiedNote":
    "وُضعت عليه علامة غير مُتحقق منه أثناء المراجعة",
  "screen.admin.applications.applicationReviewDetail.loading": "جارٍ تحميل الطلب…",
  "screen.admin.applications.applicationReviewDetail.emptyTitle": "لا يوجد طلب للمراجعة",
  "screen.admin.applications.applicationReviewDetail.emptyBody":
    "افتح طلبًا من قائمة الانتظار لمراجعته.",
  // apps/web/src/screens/admin/applications/application-review-sections.tsx
  "screen.admin.applications.applicationReviewSections.documents": "المستندات",
  "screen.admin.applications.applicationReviewSections.checks": "الفحوصات",
  "screen.admin.applications.applicationReviewSections.restrictedView": "عرض مقيّد",
  "screen.admin.applications.applicationReviewSections.openRestricted":
    "فتح {document} في العرض المقيّد",
  "screen.admin.applications.applicationReviewSections.received": "مستلم",
  "screen.admin.applications.applicationReviewSections.verified": "تم التحقق",
  "screen.admin.applications.applicationReviewSections.rejected": "مرفوض",
  "screen.admin.applications.applicationReviewSections.verify": "تحقق",
  "screen.admin.applications.applicationReviewSections.unverify": "إلغاء التحقق",
  "screen.admin.applications.applicationReviewSections.verifyDocument": "التحقق من {document}",
  "screen.admin.applications.applicationReviewSections.unverifyDocument":
    "إلغاء التحقق من {document}",
  "screen.admin.applications.applicationReviewSections.noDocuments": "لا توجد مستندات",
  "screen.admin.applications.applicationReviewSections.noDocumentsBody":
    "لم يرفع مقدّم الطلب أي مستندات بعد.",
  "screen.admin.applications.applicationReviewSections.passed": "ناجح",
  "screen.admin.applications.applicationReviewSections.notConfirmed": "غير مؤكد",
  "screen.admin.applications.applicationReviewSections.missing": "غير متوفر",
  "screen.admin.applications.applicationReviewSections.markPassed": "تحديد كناجح",
  "screen.admin.applications.applicationReviewSections.undo": "تراجع",
  "screen.admin.applications.applicationReviewSections.toggleCheck": "تغيير نتيجة {check}",
  // apps/web/src/screens/admin/applications/reject-with-reason-decision.tsx
  "screen.admin.applications.rejectWithReasonDecision.title": "رفض الطلب",
  "screen.admin.applications.rejectWithReasonDecision.description":
    "اذكر سببًا واحدًا. سيراه مقدّم الطلب.",
  "screen.admin.applications.rejectWithReasonDecision.cancel": "إلغاء",
  "screen.admin.applications.rejectWithReasonDecision.rejectApplication": "رفض الطلب",
  "screen.admin.applications.rejectWithReasonDecision.rejecting": "جارٍ الرفض…",
  "screen.admin.applications.rejectWithReasonDecision.reason": "السبب",
  "screen.admin.applications.rejectWithReasonDecision.reasonCode": "رمز السبب (مطلوب)",
  "screen.admin.applications.rejectWithReasonDecision.chooseReason": "اختر رمز السبب",
  "screen.admin.applications.rejectWithReasonDecision.reasonDocuments":
    "المستندات غير مكتملة أو غير مقروءة",
  "screen.admin.applications.rejectWithReasonDecision.reasonChecks": "لم تُجتز الفحوصات المطلوبة",
  "screen.admin.applications.rejectWithReasonDecision.reasonEligibility": "لا يستوفي شروط الأهلية",
  "screen.admin.applications.rejectWithReasonDecision.reasonDuplicate": "تسجيل مكرر",
  "screen.admin.applications.rejectWithReasonDecision.message": "رسالة إلى مقدّم الطلب",
  "screen.admin.applications.rejectWithReasonDecision.defaultMessage":
    "لا يمكن الموافقة على طلبك حاليًا. السبب موضّح أعلاه.",
  "screen.admin.applications.rejectWithReasonDecision.messageTooShort": "اكتب 5 أحرف على الأقل.",
  "screen.admin.applications.rejectWithReasonDecision.applicantIsTold": "يُبلَّغ مقدّم الطلب بما يلي",
  "screen.admin.applications.rejectWithReasonDecision.reapplyAfter":
    "يمكنه إعادة التقديم بعد 30 يومًا.",
  "screen.admin.applications.rejectWithReasonDecision.canAppeal":
    "ويمكنه أيضًا الطعن في هذا القرار.",
  "screen.admin.applications.rejectWithReasonDecision.currentState": "الحالة الحالية",
  "screen.admin.applications.rejectWithReasonDecision.savedAsRejected": "يُحفظ كمرفوض بمجرد تأكيدك.",
  "screen.admin.applications.rejectWithReasonDecision.submitted": "مُقدَّم",
  "screen.admin.applications.rejectWithReasonDecision.underReview": "قيد المراجعة",
  "screen.admin.applications.rejectWithReasonDecision.changesRequested": "مطلوب تعديلات",
  "screen.admin.applications.rejectWithReasonDecision.approved": "مقبول",
  "screen.admin.applications.rejectWithReasonDecision.rejected": "مرفوض",
  "screen.admin.applications.rejectWithReasonDecision.appealed": "مطعون فيه",
  "screen.admin.applications.rejectWithReasonDecision.closed": "مغلق",
  "screen.admin.applications.rejectWithReasonDecision.rejectFailed": "لم يُرفض الطلب",
  "screen.admin.applications.rejectWithReasonDecision.rejectFailedBody":
    "حاول مرة أخرى. إذا استمر الخطأ، أعد تحميل الصفحة.",
  "screen.admin.applications.rejectWithReasonDecision.loading": "جارٍ تحميل الطلب…",
  "screen.admin.applications.rejectWithReasonDecision.noApplication": "لم يتم اختيار طلب",
  "screen.admin.applications.rejectWithReasonDecision.noApplicationBody":
    "افتح طلبًا من قائمة الانتظار أولًا.",
  // apps/web/src/screens/admin/applications/request-changes-decision.tsx
  "screen.admin.applications.requestChangesDecision.title": "طلب تعديلات",
  "screen.admin.applications.requestChangesDecision.description":
    "اطلب من مقدّم الطلب تصحيحات محددة خلال 14 يومًا.",
  "screen.admin.applications.requestChangesDecision.cancel": "إلغاء",
  "screen.admin.applications.requestChangesDecision.sendRequest": "إرسال الطلب",
  "screen.admin.applications.requestChangesDecision.sending": "جارٍ الإرسال…",
  "screen.admin.applications.requestChangesDecision.itemsToFix": "العناصر المطلوب تصحيحها",
  "screen.admin.applications.requestChangesDecision.itemsToFixCaption":
    "اختر عنصرًا واحدًا على الأقل. يرى مقدّم الطلب كل عنصر كما هو مكتوب.",
  "screen.admin.applications.requestChangesDecision.fixIdentity":
    "مستند الهوية: أرسل نسخة واضحة وكاملة",
  "screen.admin.applications.requestChangesDecision.fixInsurance":
    "شهادة التأمين: أرسل وثيقة سارية لمدة 3 أشهر أو أكثر",
  "screen.admin.applications.requestChangesDecision.fixPortfolio":
    "معرض الأعمال: أضف 8 صور على الأقل",
  "screen.admin.applications.requestChangesDecision.messageTitle": "رسالة إلى مقدّم الطلب",
  "screen.admin.applications.requestChangesDecision.language": "اللغة",
  "screen.admin.applications.requestChangesDecision.english": "الإنجليزية",
  "screen.admin.applications.requestChangesDecision.arabic": "العربية",
  "screen.admin.applications.requestChangesDecision.message": "الرسالة",
  "screen.admin.applications.requestChangesDecision.defaultMessage":
    "يُرجى إرسال العناصر المذكورة أعلاه حتى نتمكن من إكمال مراجعة طلبك.",
  "screen.admin.applications.requestChangesDecision.messageTooShort": "اكتب 5 أحرف على الأقل.",
  "screen.admin.applications.requestChangesDecision.deadline": "الموعد النهائي",
  "screen.admin.applications.requestChangesDecision.deadlineDays": "14 يومًا من تاريخ الإرسال",
  "screen.admin.applications.requestChangesDecision.deadlineDate": "تاريخ الموعد النهائي: {date}",
  "screen.admin.applications.requestChangesDecision.afterSending": "بعد الإرسال",
  "screen.admin.applications.requestChangesDecision.changesRequested": "مطلوب تعديلات",
  "screen.admin.applications.requestChangesDecision.staysOpen":
    "يبقى الطلب مفتوحًا حتى الموعد النهائي.",
  "screen.admin.applications.requestChangesDecision.closesAutomatically":
    "إذا انقضى الموعد النهائي دون رد، يُغلق الطلب تلقائيًا.",
  "screen.admin.applications.requestChangesDecision.sendFailed": "لم يُرسل الطلب",
  "screen.admin.applications.requestChangesDecision.sendFailedBody":
    "حاول مرة أخرى. إذا استمر الخطأ، أعد تحميل الصفحة.",
  "screen.admin.applications.requestChangesDecision.loading": "جارٍ تحميل الطلب…",
  "screen.admin.applications.requestChangesDecision.noApplication": "لم يتم اختيار طلب",
  "screen.admin.applications.requestChangesDecision.noApplicationBody":
    "افتح طلبًا من قائمة الانتظار أولًا.",
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
  // apps/web/src/screens/admin/common/admin-states.tsx
  "screen.admin.common.adminStates.loading": "جارٍ التحميل. قد يستغرق ذلك بضع ثوانٍ.",
  "screen.admin.common.adminStates.didNotLoad": "تعذّر تحميل هذا القسم",
  "screen.admin.common.adminStates.retry": "إعادة المحاولة",
  "screen.admin.common.adminStates.retryHelp": "باقي الصفحة محدّث. أعد المحاولة لتحميل هذا القسم.",
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
  "screen.admin.home.adminHome.title": "الرئيسية للإدارة",
  "screen.admin.home.adminHome.description": "قوائم الانتظار التي تحتاج إلى إجراء الآن.",
  "screen.admin.home.adminHome.refreshQueues": "تحديث قوائم الانتظار",
  "screen.admin.home.adminHome.noValue": "—",
  "screen.admin.home.adminHome.applicationsWaiting": "طلبات بانتظار المراجعة",
  "screen.admin.home.adminHome.overdueAfterTwoDays": "{count} متأخرة بعد يومي عمل",
  "screen.admin.home.adminHome.openApplications": "فتح الطلبات",
  "screen.admin.home.adminHome.labTests": "التحاليل المخبرية",
  "screen.admin.home.adminHome.dueOrOverdue": "مستحقة أو متأخرة",
  "screen.admin.home.adminHome.openLabTests": "فتح التحاليل المخبرية",
  "screen.admin.home.adminHome.openDisputes": "النزاعات المفتوحة",
  "screen.admin.home.adminHome.awaitingAcknowledgement": "بانتظار الإقرار أو الحل",
  "screen.admin.home.adminHome.openDisputesLink": "فتح النزاعات",
  "screen.admin.home.adminHome.deletionRequests": "طلبات الحذف",
  "screen.admin.home.adminHome.withGraceEndDates": "مع تواريخ انتهاء فترة السماح",
  "screen.admin.home.adminHome.openRequests": "فتح الطلبات",
  "screen.admin.home.adminHome.couponAbuseFlags": "تنبيهات إساءة استخدام القسائم",
  "screen.admin.home.adminHome.raisedByAbuseRules": "أطلقتها قواعد منع الإساءة",
  "screen.admin.home.adminHome.openCoupons": "فتح القسائم",
  "screen.admin.home.adminHome.openSettlements": "التسويات المفتوحة",
  "screen.admin.home.adminHome.owedBetweenParties": "مبالغ مستحقة بين الأطراف",
  "screen.admin.home.adminHome.openSettlementsLink": "فتح التسويات",
  "screen.admin.home.adminHome.queueFailed": "تعذّر تحميل قائمة الانتظار: {queue}",
  "screen.admin.home.adminHome.queueFailedBody":
    "تعرض قوائم الانتظار الأخرى أعدادها الحالية. أعد المحاولة لتحميل عدد هذه القائمة.",
  "screen.admin.home.adminHome.retry": "إعادة المحاولة",
  "screen.admin.home.adminHome.sourceApplications": "الطلبات والتحاليل المخبرية وطلبات الحذف",
  "screen.admin.home.adminHome.sourceDisputes": "النزاعات المفتوحة",
  "screen.admin.home.adminHome.sourceCoupons": "تنبيهات إساءة استخدام القسائم",
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
  "screen.organization.accounting.ledgerAndExports.event": "الحدث",
  "screen.organization.accounting.ledgerAndExports.amount": "المبلغ",
  "screen.organization.accounting.ledgerAndExports.bookingOrDeal": "الحجز أو الاتفاقية",
  "screen.organization.accounting.ledgerAndExports.gatewayReference": "مرجع بوابة الدفع",
  "screen.organization.accounting.ledgerAndExports.date": "التاريخ",
  "screen.organization.accounting.ledgerAndExports.backToTripAccounting":
    "العودة إلى محاسبة الرحلات",
  "screen.organization.accounting.ledgerAndExports.ledgerAndExports": "دفتر الأستاذ والتصدير",
  "screen.organization.accounting.ledgerAndExports.from": "من",
  "screen.organization.accounting.ledgerAndExports.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.accounting.ledgerAndExports.to": "إلى",
  "screen.organization.accounting.ledgerAndExports.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.accounting.ledgerAndExports.filterByEvent": "تصفية حسب الحدث",
  "screen.organization.accounting.ledgerAndExports.clearFilter": "مسح التصفية",
  "screen.organization.accounting.ledgerAndExports.ledgerLines": "قيود دفتر الأستاذ",
  "screen.organization.accounting.ledgerAndExports.ledgerLinesCaption": "قيود دفتر الأستاذ",
  "screen.organization.accounting.ledgerAndExports.noLedgerLines": "لا توجد قيود",
  "screen.organization.accounting.ledgerAndExports.linesAppearHereAsPayments":
    "تظهر القيود هنا عند تسجيل المدفوعات والاستردادات والتكاليف.",
  "screen.organization.accounting.ledgerAndExports.export": "تصدير",
  "screen.organization.accounting.ledgerAndExports.csvAndPdfExportsThat":
    "تصدير CSV وPDF المتوافق مع دفتر الأستاذ متاح في خطة Enterprise.",
  // apps/web/src/screens/organization/accounting/settlements.tsx
  "screen.organization.accounting.settlements.allSettlements": "كل التسويات",
  "screen.organization.accounting.settlements.open": "مفتوحة",
  "screen.organization.accounting.settlements.settled": "مسوّاة",
  "screen.organization.accounting.settlements.counterparty": "الطرف المقابل",
  "screen.organization.accounting.settlements.amount": "المبلغ",
  "screen.organization.accounting.settlements.state": "الحالة",
  "screen.organization.accounting.settlements.openLabel": "مفتوحة",
  "screen.organization.accounting.settlements.settledLabel": "مسوّاة",
  "screen.organization.accounting.settlements.date": "التاريخ",
  "screen.organization.accounting.settlements.backToTripAccounting": "العودة إلى محاسبة الرحلات",
  "screen.organization.accounting.settlements.settlements": "التسويات",
  "screen.organization.accounting.settlements.providerPayoutsAreMadeWeekly":
    "تُدفع مستحقات المزوّدين أسبوعيًا يوم الاثنين الساعة 06:00.",
  "screen.organization.accounting.settlements.stateLabel": "الحالة",
  "screen.organization.accounting.settlements.settlementsCaption": "التسويات",
  "screen.organization.accounting.settlements.noSettlements": "لا تسويات",
  "screen.organization.accounting.settlements.amountsOwedBetweenTheOrganization":
    "تظهر هنا المبالغ المستحقة بين المؤسسة والمورّدين والمنصة.",
  // apps/web/src/screens/organization/accounting/trip-accounting.tsx
  "screen.organization.accounting.tripAccounting.baseRevenue": "الإيراد الأساسي",
  "screen.organization.accounting.tripAccounting.ticketRevenueForThisTrip":
    "إيراد التذاكر لهذه الرحلة",
  "screen.organization.accounting.tripAccounting.programRevenue": "إيراد البرامج",
  "screen.organization.accounting.tripAccounting.revenueFromPrograms": "الإيراد من البرامج",
  "screen.organization.accounting.tripAccounting.couponImpact": "أثر الكوبونات",
  "screen.organization.accounting.tripAccounting.discountsFromCoupons": "الخصومات من الكوبونات",
  "screen.organization.accounting.tripAccounting.supplierCosts": "تكاليف المورّدين",
  "screen.organization.accounting.tripAccounting.costsPaidToSuppliers":
    "التكاليف المدفوعة للمورّدين",
  "screen.organization.accounting.tripAccounting.gatewayFees": "رسوم بوابة الدفع",
  "screen.organization.accounting.tripAccounting.paymentGatewayFees": "رسوم بوابة الدفع",
  "screen.organization.accounting.tripAccounting.backToTrip": "العودة إلى الرحلة",
  "screen.organization.accounting.tripAccounting.tripAccounting": "محاسبة الرحلات",
  "screen.organization.accounting.tripAccounting.tripName": "[اسم الرحلة]",
  "screen.organization.accounting.tripAccounting.openLedger": "فتح دفتر الأستاذ",
  "screen.organization.accounting.tripAccounting.accountingLines": "قيود المحاسبة",
  "screen.organization.accounting.tripAccounting.reconciliation": "المطابقة",
  "screen.organization.accounting.tripAccounting.reconciliationStatus": "[حالة المطابقة]",
  "screen.organization.accounting.tripAccounting.invoices": "الفواتير",
  "screen.organization.accounting.tripAccounting.settlements": "التسويات",
  // apps/web/src/screens/organization/billing/invoices-list.tsx
  "screen.organization.billing.invoicesList.number": "الرقم",
  "screen.organization.billing.invoicesList.type": "النوع",
  "screen.organization.billing.invoicesList.buyer": "المشتري",
  "screen.organization.billing.invoicesList.amount": "المبلغ",
  "screen.organization.billing.invoicesList.status": "الحالة",
  "screen.organization.billing.invoicesList.issued": "تاريخ الإصدار",
  "screen.organization.billing.invoicesList.open": "مفتوحة",
  "screen.organization.billing.invoicesList.openInvoice": "فتح الفاتورة",
  "screen.organization.billing.invoicesList.invoicesList": "قائمة الفواتير",
  "screen.organization.billing.invoicesList.issueInvoice": "إصدار فاتورة",
  "screen.organization.billing.invoicesList.searchInvoices": "بحث في الفواتير",
  "screen.organization.billing.invoicesList.clearSearch": "مسح البحث",
  "screen.organization.billing.invoicesList.issuedInvoices": "الفواتير الصادرة",
  "screen.organization.billing.invoicesList.noInvoicesYet": "لا فواتير بعد",
  "screen.organization.billing.invoicesList.issueAnInvoiceForA": "أصدر فاتورة لرحلة أو حجز.",
  // apps/web/src/screens/organization/billing/issue-invoice-b2b-or-b2c.tsx
  "screen.organization.billing.issueInvoiceB2bOrB2c.businessB2b": "أعمال (B2B)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.consumerB2c": "أفراد (B2C)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.lineDescription": "[وصف البند]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.line": "البند",
  "screen.organization.billing.issueInvoiceB2bOrB2c.quantity": "الكمية",
  "screen.organization.billing.issueInvoiceB2bOrB2c.amount": "المبلغ",
  "screen.organization.billing.issueInvoiceB2bOrB2c.backToInvoices": "العودة إلى الفواتير",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoiceB2bOrB2c":
    "إصدار فاتورة (B2B أو B2C)",
  "screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoice": "إصدار فاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoice": "الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceType": "نوع الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceNumber": "رقم الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.generatedNumber": "[رقم مُولَّد]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyer": "المشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerName": "اسم المشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerNamePlaceholder": "[اسم المشتري]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.buyerTaxNumber": "الرقم الضريبي للمشتري",
  "screen.organization.billing.issueInvoiceB2bOrB2c.taxNumber": "[الرقم الضريبي]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.lines": "البنود",
  "screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines": "بنود الفاتورة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.noLines": "لا بنود",
  "screen.organization.billing.issueInvoiceB2bOrB2c.addLinesFromABooking":
    "أضف بنودًا من حجز أو رحلة.",
  "screen.organization.billing.issueInvoiceB2bOrB2c.tax": "الضريبة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.taxLabel": "الضريبة",
  "screen.organization.billing.issueInvoiceB2bOrB2c.taxAmount": "[مبلغ الضريبة]",
  "screen.organization.billing.issueInvoiceB2bOrB2c.total": "الإجمالي",
  "screen.organization.billing.issueInvoiceB2bOrB2c.totalAndCurrency": "[الإجمالي والعملة]",
  // apps/web/src/screens/organization/billing/subscription-and-billing.tsx
  "screen.organization.billing.subscriptionAndBilling.subscriptionAndBilling": "الاشتراك والفوترة",
  "screen.organization.billing.subscriptionAndBilling.currentPlan": "الخطة الحالية",
  "screen.organization.billing.subscriptionAndBilling.growth": "النمو",
  "screen.organization.billing.subscriptionAndBilling.currentPlan2": "الخطة الحالية",
  "screen.organization.billing.subscriptionAndBilling.renewsOnRenewalDate":
    "يتجدد في [تاريخ التجديد]",
  "screen.organization.billing.subscriptionAndBilling.annualBilling": "الفوترة السنوية",
  "screen.organization.billing.subscriptionAndBilling.annual": "سنوي",
  "screen.organization.billing.subscriptionAndBilling.monthly": "شهري",
  "screen.organization.billing.subscriptionAndBilling.annualBillingAppliesTheAnnual":
    "تُطبِّق الفوترة السنوية الخصم السنوي على الإجمالي الشهري. الخصم: [مفتوح: قيمة مؤقتة].",
  "screen.organization.billing.subscriptionAndBilling.paymentMethodPaymentMethod":
    "طريقة الدفع: [طريقة الدفع]",
  "screen.organization.billing.subscriptionAndBilling.updatePaymentMethod": "تحديث طريقة الدفع",
  "screen.organization.billing.subscriptionAndBilling.usage": "الاستخدام",
  "screen.organization.billing.subscriptionAndBilling.activeTripsThisMonth":
    "الرحلات النشطة هذا الشهر",
  "screen.organization.billing.subscriptionAndBilling.employees": "الموظفون",
  "screen.organization.billing.subscriptionAndBilling.vehiclesPerTrip": "المركبات لكل رحلة",
  "screen.organization.billing.subscriptionAndBilling.programsPerTrip": "البرامج لكل رحلة",
  "screen.organization.billing.subscriptionAndBilling.coupons": "الكوبونات",
  "screen.organization.billing.subscriptionAndBilling.changePlan": "تغيير الخطة",
  "screen.organization.billing.subscriptionAndBilling.currentPlan3": "الخطة الحالية",
  "screen.organization.billing.subscriptionAndBilling.price": "[السعر]",
  "screen.organization.billing.subscriptionAndBilling.upgradesTakeEffectNowAnd":
    "تُطبَّق الترقيات فورًا وتُحتسب بالتناسب. تُطبَّق التخفيضات في نهاية دورة الفوترة، في [التاريخ].",
  // apps/web/src/screens/organization/bookings/booking-detail.tsx
  "screen.organization.bookings.bookingDetail.traveler": "المسافر",
  "screen.organization.bookings.bookingDetail.program": "البرنامج",
  "screen.organization.bookings.bookingDetail.quantity": "الكمية",
  "screen.organization.bookings.bookingDetail.seat": "المقعد",
  "screen.organization.bookings.bookingDetail.backToBookings": "العودة إلى الحجوزات",
  "screen.organization.bookings.bookingDetail.bookingDetail": "تفاصيل الحجز",
  "screen.organization.bookings.bookingDetail.bookingReference": "[مرجع الحجز]",
  "screen.organization.bookings.bookingDetail.confirmed": "مؤكد",
  "screen.organization.bookings.bookingDetail.travelersAndPrograms": "المسافرون والبرامج",
  "screen.organization.bookings.bookingDetail.travelersAndProgramsOnThis":
    "المسافرون والبرامج في هذا الحجز",
  "screen.organization.bookings.bookingDetail.noTravelers": "لا مسافرون",
  "screen.organization.bookings.bookingDetail.travelersAppearHereOnceThey":
    "يظهر المسافرون هنا بعد إضافتهم إلى الحجز.",
  "screen.organization.bookings.bookingDetail.seatTitle": "المقعد",
  "screen.organization.bookings.bookingDetail.openSeatMap": "فتح خريطة المقاعد",
  "screen.organization.bookings.bookingDetail.seatLabel": "المقعد",
  "screen.organization.bookings.bookingDetail.seatPlaceholder": "[المقعد]",
  "screen.organization.bookings.bookingDetail.organizationAssignedSeatsOnly":
    "مقاعد مُخصَّصة من المؤسسة فقط.",
  "screen.organization.bookings.bookingDetail.coupon": "الكوبون",
  "screen.organization.bookings.bookingDetail.couponCode": "[رمز الكوبون]",
  "screen.organization.bookings.bookingDetail.payment": "الدفع",
  "screen.organization.bookings.bookingDetail.paymentStatusPaymentStatus":
    "حالة الدفع: [حالة الدفع]",
  "screen.organization.bookings.bookingDetail.reversalStateReversalState":
    "حالة العكس: [حالة العكس]",
  "screen.organization.bookings.bookingDetail.aPendingRefundShowsTo":
    "يظهر الاسترداد المعلّق للمسافر بعبارة «الاسترداد قيد التنفيذ». لا يُعكس الإيراد إلا بعد تأكيد بوابة الدفع للاسترداد.",
  "screen.organization.bookings.bookingDetail.issueRefund": "إصدار استرداد",
  "screen.organization.bookings.bookingDetail.saveChange": "حفظ التغيير",
  // apps/web/src/screens/organization/bookings/bookings-and-travelers.tsx
  "screen.organization.bookings.bookingsAndTravelers.booking": "الحجز",
  "screen.organization.bookings.bookingsAndTravelers.state": "الحالة",
  "screen.organization.bookings.bookingsAndTravelers.confirmed": "مؤكد",
  "screen.organization.bookings.bookingsAndTravelers.travelers": "المسافرون",
  "screen.organization.bookings.bookingsAndTravelers.programs": "البرامج",
  "screen.organization.bookings.bookingsAndTravelers.seat": "المقعد",
  "screen.organization.bookings.bookingsAndTravelers.payment": "الدفع",
  "screen.organization.bookings.bookingsAndTravelers.bookings": "الحجوزات",
  "screen.organization.bookings.bookingsAndTravelers.cancellationRequests": "طلبات الإلغاء",
  "screen.organization.bookings.bookingsAndTravelers.backToTrip": "العودة إلى الرحلة",
  "screen.organization.bookings.bookingsAndTravelers.bookingsAndTravelers": "الحجوزات والمسافرون",
  "screen.organization.bookings.bookingsAndTravelers.tripName": "[اسم الرحلة]",
  "screen.organization.bookings.bookingsAndTravelers.seatMap": "خريطة المقاعد",
  "screen.organization.bookings.bookingsAndTravelers.bookingViews": "عروض الحجز",
  "screen.organization.bookings.bookingsAndTravelers.searchTravelersOrBookings":
    "بحث عن مسافرين أو حجوزات",
  "screen.organization.bookings.bookingsAndTravelers.clearSearch": "مسح البحث",
  "screen.organization.bookings.bookingsAndTravelers.bookingsOnThisTrip": "الحجوزات في هذه الرحلة",
  "screen.organization.bookings.bookingsAndTravelers.noBookingsYet": "لا حجوزات بعد",
  "screen.organization.bookings.bookingsAndTravelers.bookingsAppearHereWhenTravelers":
    "تظهر الحجوزات هنا عندما يحجز المسافرون هذه الرحلة.",
  "screen.organization.bookings.bookingsAndTravelers.noCancellationRequests": "لا طلبات إلغاء",
  "screen.organization.bookings.bookingsAndTravelers.requestsFromTravelersAppearHere":
    "تظهر هنا طلبات المسافرين للموافقة أو الرفض.",
  // apps/web/src/screens/organization/bookings/program-enrollment-report.tsx
  "screen.organization.bookings.programEnrollmentReport.programName": "[اسم البرنامج]",
  "screen.organization.bookings.programEnrollmentReport.booking": "الحجز",
  "screen.organization.bookings.programEnrollmentReport.quantity": "الكمية",
  "screen.organization.bookings.programEnrollmentReport.revenue": "الإيراد",
  "screen.organization.bookings.programEnrollmentReport.backToAnalytics": "العودة إلى التحليلات",
  "screen.organization.bookings.programEnrollmentReport.programEnrollmentReport":
    "تقرير التسجيل في البرامج",
  "screen.organization.bookings.programEnrollmentReport.export": "تصدير",
  "screen.organization.bookings.programEnrollmentReport.program": "البرنامج",
  "screen.organization.bookings.programEnrollmentReport.totalQuantity": "إجمالي الكمية",
  "screen.organization.bookings.programEnrollmentReport.totalRevenue": "إجمالي الإيراد",
  "screen.organization.bookings.programEnrollmentReport.enrollments": "التسجيلات",
  "screen.organization.bookings.programEnrollmentReport.enrollmentsForTheSelectedProgram":
    "التسجيلات في البرنامج المحدد",
  "screen.organization.bookings.programEnrollmentReport.noEnrollmentsYet": "لا تسجيلات بعد",
  "screen.organization.bookings.programEnrollmentReport.travelersWhoSelectThisProgram":
    "يظهر هنا المسافرون الذين يختارون هذا البرنامج.",
  // apps/web/src/screens/organization/bookings/seat-map-and-seat-assignment.tsx
  "screen.organization.bookings.seatMapAndSeatAssignment.seat": "المقعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.state": "الحالة",
  "screen.organization.bookings.seatMapAndSeatAssignment.traveler": "المسافر",
  "screen.organization.bookings.seatMapAndSeatAssignment.program": "البرنامج",
  "screen.organization.bookings.seatMapAndSeatAssignment.action": "الإجراء",
  "screen.organization.bookings.seatMapAndSeatAssignment.map": "خريطة",
  "screen.organization.bookings.seatMapAndSeatAssignment.list": "قائمة",
  "screen.organization.bookings.seatMapAndSeatAssignment.backToBooking": "العودة إلى الحجز",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatMapAndSeatAssignment":
    "خريطة المقاعد وتخصيصها",
  "screen.organization.bookings.seatMapAndSeatAssignment.vehiclePlate": "[لوحة المركبة]",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatView": "عرض المقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatMap": "خريطة المقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.seatsOnThisVehicle":
    "المقاعد في هذه المركبة",
  "screen.organization.bookings.seatMapAndSeatAssignment.noSeats": "لا مقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.thisVehicleTypeHasNo":
    "لا تحتوي هذه المركبة على مقاعد.",
  "screen.organization.bookings.seatMapAndSeatAssignment.legend": "الدليل",
  "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelers": "مسافرون بلا مقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.unassignedTravelersCaption":
    "مسافرون بلا مقاعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.everyoneHasASeat": "الجميع لديه مقعد",
  "screen.organization.bookings.seatMapAndSeatAssignment.allTravelersOnThisVehicle":
    "كل المسافرين في هذه المركبة مُخصَّصون.",
  // apps/web/src/screens/organization/common/org-link.tsx
  "screen.organization.common.orgLink.backLinks": "روابط العودة",
  "screen.organization.common.orgLink.backToWorkspace": "العودة إلى مساحة العمل",
  // apps/web/src/screens/organization/common/org-shared.tsx
  "screen.organization.common.orgShared.step.basics": "الأساسيات",
  "screen.organization.common.orgShared.step.schedule": "الجدول والمسار",
  "screen.organization.common.orgShared.step.vehicles": "المركبات",
  "screen.organization.common.orgShared.step.staffing": "الطاقم",
  "screen.organization.common.orgShared.step.programs": "البرامج",
  "screen.organization.common.orgShared.step.seating": "المقاعد",
  "screen.organization.common.orgShared.step.pricing": "التسعير والسعة",
  "screen.organization.common.orgShared.step.publish": "نشر",
  "screen.organization.common.orgShared.tripWizardProgress": "تقدّم معالج الرحلة",
  "screen.organization.common.orgShared.back": "رجوع",
  // apps/web/src/screens/organization/common/organization-nav.tsx
  "screen.organization.nav.workspaceHome": "رئيسية مساحة العمل",
  "screen.organization.nav.tripsList": "الرحلات",
  "screen.organization.nav.bookingsAndTravelers": "الحجوزات",
  "screen.organization.nav.couponsList": "الكوبونات",
  "screen.organization.nav.tripAccounting": "المحاسبة",
  "screen.organization.nav.subscriptionAndBilling": "الاشتراك",
  "screen.organization.nav.employeesList": "الموظفون",
  "screen.organization.nav.invoicesList": "الفواتير",
  "screen.organization.nav.analyticsAndReports": "التحليلات",
  "screen.organization.nav.liveOperations": "العمليات المباشرة",
  "screen.organization.nav.organizationProfileSettingsAndBranding": "الإعدادات",
  "screen.organization.common.organizationNav.organizationAreas": "أقسام المؤسسة",
  // apps/web/src/screens/organization/common/organization-state-preview.tsx
  "screen.organization.common.organizationStatePreview.main": "الرئيسية",
  "screen.organization.common.organizationStatePreview.loading": "التحميل",
  "screen.organization.common.organizationStatePreview.empty": "الفراغ",
  "screen.organization.common.organizationStatePreview.error": "الخطأ",
  "screen.organization.common.organizationStatePreview.loading2": "التحميل",
  "screen.organization.common.organizationStatePreview.previewState": "معاينة الحالة",
  "screen.organization.common.organizationStatePreview.nothingHereYet": "لا شيء هنا بعد",
  "screen.organization.common.organizationStatePreview.thisAreaHasNoItems":
    "لا توجد عناصر لعرضها في هذا القسم.",
  // apps/web/src/screens/organization/coupons/coupon-analytics.tsx
  "screen.organization.coupons.couponAnalytics.coupon": "الكوبون",
  "screen.organization.coupons.couponAnalytics.redemptions": "مرات الاستخدام",
  "screen.organization.coupons.couponAnalytics.discountTotal": "إجمالي الخصم",
  "screen.organization.coupons.couponAnalytics.remainingUses": "الاستخدامات المتبقية",
  "screen.organization.coupons.couponAnalytics.backToCoupons": "العودة إلى الكوبونات",
  "screen.organization.coupons.couponAnalytics.couponAnalytics": "تحليلات الكوبونات",
  "screen.organization.coupons.couponAnalytics.export": "تصدير",
  "screen.organization.coupons.couponAnalytics.from": "من",
  "screen.organization.coupons.couponAnalytics.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.coupons.couponAnalytics.to": "إلى",
  "screen.organization.coupons.couponAnalytics.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.coupons.couponAnalytics.coupons": "الكوبونات",
  "screen.organization.coupons.couponAnalytics.redemptionsAndDiscountsPerCoupon":
    "الاستخدامات والخصومات لكل كوبون",
  "screen.organization.coupons.couponAnalytics.noRedemptions": "لا استخدامات",
  "screen.organization.coupons.couponAnalytics.redemptionsAppearHereOnceTravelers":
    "تظهر الاستخدامات هنا عندما يستخدم المسافرون كوبونًا.",
  "screen.organization.coupons.couponAnalytics.fullBreakdown": "التفصيل الكامل",
  "screen.organization.coupons.couponAnalytics.theFullCouponBreakdownIs":
    "التفصيل الكامل للكوبونات متاح في خطة Enterprise.",
  // apps/web/src/screens/organization/coupons/coupon-editor.tsx
  "screen.organization.coupons.couponEditor.fixedAmount": "مبلغ ثابت",
  "screen.organization.coupons.couponEditor.percentage": "نسبة مئوية",
  "screen.organization.coupons.couponEditor.programSpecific": "خاص ببرنامج",
  "screen.organization.coupons.couponEditor.freeProgram": "برنامج مجاني",
  "screen.organization.coupons.couponEditor.firstBooking": "أول حجز",
  "screen.organization.coupons.couponEditor.minimumSpend": "حد أدنى للإنفاق",
  "screen.organization.coupons.couponEditor.public": "عام",
  "screen.organization.coupons.couponEditor.targeted": "موجّه",
  "screen.organization.coupons.couponEditor.backToCoupons": "العودة إلى الكوبونات",
  "screen.organization.coupons.couponEditor.couponEditor": "محرّر الكوبون",
  "screen.organization.coupons.couponEditor.save": "حفظ",
  "screen.organization.coupons.couponEditor.codeAndType": "الرمز والنوع",
  "screen.organization.coupons.couponEditor.code": "الرمز",
  "screen.organization.coupons.couponEditor.codePlaceholder": "[الرمز]",
  "screen.organization.coupons.couponEditor.typeACustomCodeOr": "اكتب رمزًا مخصصًا أو أنشئ واحدًا.",
  "screen.organization.coupons.couponEditor.type": "النوع",
  "screen.organization.coupons.couponEditor.value": "القيمة",
  "screen.organization.coupons.couponEditor.valuePlaceholder": "[القيمة]",
  "screen.organization.coupons.couponEditor.scope": "النطاق",
  "screen.organization.coupons.couponEditor.couponsApplyOnlyToThis":
    "تُطبَّق الكوبونات على رحلات هذه المؤسسة فقط.",
  "screen.organization.coupons.couponEditor.limitsAndValidity": "الحدود والصلاحية",
  "screen.organization.coupons.couponEditor.totalLimit": "الحد الإجمالي",
  "screen.organization.coupons.couponEditor.totalUses": "[إجمالي الاستخدامات]",
  "screen.organization.coupons.couponEditor.perUserLimit": "الحد لكل مستخدم",
  "screen.organization.coupons.couponEditor.usesPerUser": "[الاستخدامات لكل مستخدم]",
  "screen.organization.coupons.couponEditor.validFrom": "ساري من",
  "screen.organization.coupons.couponEditor.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.coupons.couponEditor.validUntil": "ساري حتى",
  "screen.organization.coupons.couponEditor.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.coupons.couponEditor.minimumBookingValue": "الحد الأدنى لقيمة الحجز",
  "screen.organization.coupons.couponEditor.amount": "[المبلغ]",
  "screen.organization.coupons.couponEditor.programs": "البرامج",
  "screen.organization.coupons.couponEditor.programsPlaceholder": "[البرامج]",
  "screen.organization.coupons.couponEditor.audience": "الجمهور",
  "screen.organization.coupons.couponEditor.audienceLabel": "الجمهور",
  "screen.organization.coupons.couponEditor.canBeCombinedWithOther": "قابل للجمع مع كوبونات أخرى",
  "screen.organization.coupons.couponEditor.yes": "نعم",
  "screen.organization.coupons.couponEditor.no": "لا",
  // apps/web/src/screens/organization/coupons/coupons-list.tsx
  "screen.organization.coupons.couponsList.code": "الرمز",
  "screen.organization.coupons.couponsList.type": "النوع",
  "screen.organization.coupons.couponsList.value": "القيمة",
  "screen.organization.coupons.couponsList.status": "الحالة",
  "screen.organization.coupons.couponsList.active": "نشط",
  "screen.organization.coupons.couponsList.paused": "موقوف مؤقتًا",
  "screen.organization.coupons.couponsList.redemptions": "مرات الاستخدام",
  "screen.organization.coupons.couponsList.remainingUses": "الاستخدامات المتبقية",
  "screen.organization.coupons.couponsList.actions": "الإجراءات",
  "screen.organization.coupons.couponsList.pause": "إيقاف مؤقت",
  "screen.organization.coupons.couponsList.resume": "استئناف",
  "screen.organization.coupons.couponsList.revoke": "إلغاء",
  "screen.organization.coupons.couponsList.couponsList": "قائمة الكوبونات",
  "screen.organization.coupons.couponsList.analytics": "التحليلات",
  "screen.organization.coupons.couponsList.createCoupon": "إنشاء كوبون",
  "screen.organization.coupons.couponsList.coupons": "الكوبونات",
  "screen.organization.coupons.couponsList.countedTowardYourPlanLimit": "يُحتسب ضمن حد خطتك",
  "screen.organization.coupons.couponsList.searchCoupons": "بحث في الكوبونات",
  "screen.organization.coupons.couponsList.clearSearch": "مسح البحث",
  "screen.organization.coupons.couponsList.couponsCaption": "الكوبونات",
  "screen.organization.coupons.couponsList.noCouponsYet": "لا كوبونات بعد",
  "screen.organization.coupons.couponsList.createACouponToOffer":
    "أنشئ كوبونًا لتقديم خصم على رحلاتك.",
  "screen.organization.coupons.couponsList.revokeThisCoupon": "إلغاء هذا الكوبون؟",
  "screen.organization.coupons.couponsList.travelersCanNoLongerUse":
    "لن يتمكن المسافرون من استخدامه بعد الآن. تُحفظ الاستخدامات السابقة.",
  "screen.organization.coupons.couponsList.revokePrimaryLabel": "إلغاء",
  "screen.organization.coupons.couponsList.keepCoupon": "الإبقاء على الكوبون",
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
  "screen.organization.operations.analyticsAndReports.enrollment": "التسجيل",
  "screen.organization.operations.analyticsAndReports.couponRedemption": "استخدام الكوبون",
  "screen.organization.operations.analyticsAndReports.revenue": "الإيراد",
  "screen.organization.operations.analyticsAndReports.analyticsAndReports": "التحليلات والتقارير",
  "screen.organization.operations.analyticsAndReports.export": "تصدير",
  "screen.organization.operations.analyticsAndReports.from": "من",
  "screen.organization.operations.analyticsAndReports.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.operations.analyticsAndReports.to": "إلى",
  "screen.organization.operations.analyticsAndReports.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.operations.analyticsAndReports.reports": "التقارير",
  "screen.organization.operations.analyticsAndReports.openReport": "فتح التقرير",
  "screen.organization.operations.analyticsAndReports.fullAnalytics": "التحليلات الكاملة",
  "screen.organization.operations.analyticsAndReports.fullTrendAndRevenueAnalytics":
    "تحليلات الاتجاهات والإيرادات الكاملة متاحة في خطة Enterprise.",
  // apps/web/src/screens/organization/operations/child-safety-reports.tsx
  "screen.organization.operations.childSafetyReports.case": "الحالة",
  "screen.organization.operations.childSafetyReports.time": "الوقت",
  "screen.organization.operations.childSafetyReports.trip": "الرحلة",
  "screen.organization.operations.childSafetyReports.vehicle": "المركبة",
  "screen.organization.operations.childSafetyReports.status": "الحالة",
  "screen.organization.operations.childSafetyReports.caseOpen": "حالة مفتوحة",
  "screen.organization.operations.childSafetyReports.routedToEscalationContact":
    "أُحيلت إلى جهة التصعيد",
  "screen.organization.operations.childSafetyReports.backToLiveOperations":
    "العودة إلى العمليات المباشرة",
  "screen.organization.operations.childSafetyReports.childSafetyReports": "تقارير سلامة الأطفال",
  "screen.organization.operations.childSafetyReports.newReport": "تقرير جديد",
  "screen.organization.operations.childSafetyReports.escalationContact": "جهة التصعيد",
  "screen.organization.operations.childSafetyReports.reportsAreRoutedToEscalation":
    "تُحال التقارير إلى: [جهة التصعيد، قيد التحديد].",
  "screen.organization.operations.childSafetyReports.cases": "الحالات",
  "screen.organization.operations.childSafetyReports.childSafetyCases": "حالات سلامة الأطفال",
  "screen.organization.operations.childSafetyReports.noCases": "لا حالات",
  "screen.organization.operations.childSafetyReports.casesYouSubmitForTrips":
    "تظهر هنا الحالات التي ترسلها عن الرحلات التي تديرها.",
  // apps/web/src/screens/organization/operations/live-operations.tsx
  "screen.organization.operations.liveOperations.vehicle": "المركبة",
  "screen.organization.operations.liveOperations.checkedIn": "تم تسجيل الحضور",
  "screen.organization.operations.liveOperations.seats": "المقاعد",
  "screen.organization.operations.liveOperations.occupancy": "الإشغال",
  "screen.organization.operations.liveOperations.incidentSummary": "[ملخص الحادث]",
  "screen.organization.operations.liveOperations.backToTrip": "العودة إلى الرحلة",
  "screen.organization.operations.liveOperations.liveOperations": "العمليات المباشرة",
  "screen.organization.operations.liveOperations.tripName": "[اسم الرحلة]",
  "screen.organization.operations.liveOperations.tripStatus": "حالة الرحلة",
  "screen.organization.operations.liveOperations.travelersCheckedIn": "المسافرون المسجّل حضورهم",
  "screen.organization.operations.liveOperations.vehiclesOnTheRoad": "المركبات على الطريق",
  "screen.organization.operations.liveOperations.liveMap": "الخريطة المباشرة",
  "screen.organization.operations.liveOperations.liveVehiclePositions": "مواقع المركبات المباشرة",
  "screen.organization.operations.liveOperations.vehiclePositionAndArrivalTime":
    "[موقع المركبة ووقت الوصول]",
  "screen.organization.operations.liveOperations.occupancyPerVehicle": "الإشغال لكل مركبة",
  "screen.organization.operations.liveOperations.occupancyPerVehicleCaption": "الإشغال لكل مركبة",
  "screen.organization.operations.liveOperations.noVehiclesInProgress": "لا مركبات قيد التنفيذ",
  "screen.organization.operations.liveOperations.occupancyAppearsWhenATrip":
    "يظهر الإشغال عندما تكون الرحلة قيد التنفيذ.",
  "screen.organization.operations.liveOperations.travelerLookup": "البحث عن مسافر",
  "screen.organization.operations.liveOperations.findATraveler": "ابحث عن مسافر",
  "screen.organization.operations.liveOperations.clearSearch": "مسح البحث",
  "screen.organization.operations.liveOperations.theLookupShowsTheTraveler":
    "يعرض البحث مركبة المسافر فقط.",
  "screen.organization.operations.liveOperations.incidentFeed": "تدفّق الحوادث",
  "screen.organization.operations.liveOperations.incidentFeedAriaLabel": "تدفّق الحوادث",
  "screen.organization.operations.liveOperations.related": "ذو صلة",
  "screen.organization.operations.liveOperations.tripReportReview": "مراجعة تقرير الرحلة",
  "screen.organization.operations.liveOperations.bookingsAndTravelers": "الحجوزات والمسافرون",
  "screen.organization.operations.liveOperations.childSafetyReports": "تقارير سلامة الأطفال",
  // apps/web/src/screens/organization/operations/trip-report-review.tsx
  "screen.organization.operations.tripReportReview.vehicle": "المركبة",
  "screen.organization.operations.tripReportReview.finalHeadcount": "العدد النهائي",
  "screen.organization.operations.tripReportReview.checkedIn": "تم تسجيل الحضور",
  "screen.organization.operations.tripReportReview.headcount": "عدد الأفراد",
  "screen.organization.operations.tripReportReview.matchesCheckIn": "يطابق تسجيل الحضور",
  "screen.organization.operations.tripReportReview.mismatch": "غير مطابق",
  "screen.organization.operations.tripReportReview.incidents": "الحوادث",
  "screen.organization.operations.tripReportReview.submitted": "تاريخ التقديم",
  "screen.organization.operations.tripReportReview.backToTrip": "العودة إلى الرحلة",
  "screen.organization.operations.tripReportReview.tripReportReview": "مراجعة تقرير الرحلة",
  "screen.organization.operations.tripReportReview.tripName": "[اسم الرحلة]",
  "screen.organization.operations.tripReportReview.moderatorReports": "تقارير المشرفين",
  "screen.organization.operations.tripReportReview.moderatorReportsPerVehicle":
    "تقارير المشرفين لكل مركبة",
  "screen.organization.operations.tripReportReview.noReportsYet": "لا تقارير بعد",
  "screen.organization.operations.tripReportReview.reportsAppearHereAfterEach":
    "تظهر التقارير هنا بعد إرسال كل مشرف لتقريره.",
  "screen.organization.operations.tripReportReview.organizationNote": "ملاحظة المؤسسة",
  "screen.organization.operations.tripReportReview.note": "ملاحظة",
  "screen.organization.operations.tripReportReview.notePlaceholder": "[ملاحظة]",
  "screen.organization.operations.tripReportReview.youCanAddANote":
    "يمكنك إضافة ملاحظة. لا يمكن تعديل التقارير المرسلة.",
  "screen.organization.operations.tripReportReview.addNote": "إضافة ملاحظة",
  // apps/web/src/screens/organization/people/crm-and-webhooks.tsx
  "screen.organization.people.crmAndWebhooks.labels.bookingConfirmed": "تم تأكيد الحجز",
  "screen.organization.people.crmAndWebhooks.labels.bookingCancelled": "أُلغي الحجز",
  "screen.organization.people.crmAndWebhooks.labels.tripPublished": "نُشرت الرحلة",
  "screen.organization.people.crmAndWebhooks.labels.checkIn": "تسجيل الحضور",
  "screen.organization.people.crmAndWebhooks.labels.checkOut": "تسجيل المغادرة",
  "screen.organization.people.crmAndWebhooks.labels.signingStatus": "حالة التوقيع",
  "screen.organization.people.crmAndWebhooks.event": "الحدث",
  "screen.organization.people.crmAndWebhooks.time": "الوقت",
  "screen.organization.people.crmAndWebhooks.outcome": "النتيجة",
  "screen.organization.people.crmAndWebhooks.delivered": "تم التسليم",
  "screen.organization.people.crmAndWebhooks.backToSettings": "العودة إلى الإعدادات",
  "screen.organization.people.crmAndWebhooks.crmAndWebhooks": "إدارة العلاقات والويب هوك",
  "screen.organization.people.crmAndWebhooks.addEndpoint": "إضافة نقطة نهاية",
  "screen.organization.people.crmAndWebhooks.crmConnection": "اتصال إدارة العلاقات",
  "screen.organization.people.crmAndWebhooks.notConnected": "غير متصل",
  "screen.organization.people.crmAndWebhooks.connectCrm": "ربط إدارة العلاقات",
  "screen.organization.people.crmAndWebhooks.webhookEndpoint": "نقطة نهاية الويب هوك",
  "screen.organization.people.crmAndWebhooks.endpointUrl": "عنوان نقطة النهاية",
  "screen.organization.people.crmAndWebhooks.httpsYourEndpoint": "https://[نقطة النهاية الخاصة بك]",
  "screen.organization.people.crmAndWebhooks.sendTest": "إرسال اختبار",
  "screen.organization.people.crmAndWebhooks.rotateSecret": "تدوير المفتاح السري",
  "screen.organization.people.crmAndWebhooks.events": "الأحداث",
  "screen.organization.people.crmAndWebhooks.deliveryLog": "سجل التسليم",
  "screen.organization.people.crmAndWebhooks.webhookDeliveryLog": "سجل تسليم الويب هوك",
  "screen.organization.people.crmAndWebhooks.noDeliveriesYet": "لا عمليات تسليم بعد",
  "screen.organization.people.crmAndWebhooks.eachEventSentToYour":
    "يُدرَج هنا كل حدث يُرسل إلى نقطة النهاية الخاصة بك مع نتيجته.",
  // apps/web/src/screens/organization/people/employee-invitation-acceptance.tsx
  "screen.organization.people.employeeInvitationAcceptance.employeeInvitationAcceptance":
    "قبول دعوة الموظف",
  "screen.organization.people.employeeInvitationAcceptance.youHaveBeenInvitedTo":
    "تمت دعوتك للانضمام إلى مؤسسة.",
  "screen.organization.people.employeeInvitationAcceptance.acceptOnlyIfTheInvitation":
    "اقبل الدعوة فقط إذا أُرسلت إلى البريد الإلكتروني الذي سجّلت الدخول به.",
  "screen.organization.people.employeeInvitationAcceptance.organizationName": "[اسم المؤسسة]",
  "screen.organization.people.employeeInvitationAcceptance.permissionAreasGranted":
    "أقسام الصلاحيات الممنوحة",
  "screen.organization.people.employeeInvitationAcceptance.permissionArea": "[قسم الصلاحية]",
  "screen.organization.people.employeeInvitationAcceptance.invitationToken": "رمز الدعوة",
  "screen.organization.people.employeeInvitationAcceptance.pasteInvitationToken": "الصق رمز الدعوة",
  "screen.organization.people.employeeInvitationAcceptance.decline": "رفض",
  "screen.organization.people.employeeInvitationAcceptance.acceptInvitation": "قبول الدعوة",
  // apps/web/src/screens/organization/people/employee-invitation-and-permissions.tsx
  "screen.organization.people.employeeInvitationAndPermissions.labels.trips": "الرحلات",
  "screen.organization.people.employeeInvitationAndPermissions.labels.bookings": "الحجوزات",
  "screen.organization.people.employeeInvitationAndPermissions.labels.accounting": "المحاسبة",
  "screen.organization.people.employeeInvitationAndPermissions.labels.coupons": "الكوبونات",
  "screen.organization.people.employeeInvitationAndPermissions.labels.employees": "الموظفون",
  "screen.organization.people.employeeInvitationAndPermissions.labels.fleet": "الأسطول",
  "screen.organization.people.employeeInvitationAndPermissions.labels.subscription": "الاشتراك",
  "screen.organization.people.employeeInvitationAndPermissions.changedBy": "غيّره",
  "screen.organization.people.employeeInvitationAndPermissions.when": "متى",
  "screen.organization.people.employeeInvitationAndPermissions.before": "قبل",
  "screen.organization.people.employeeInvitationAndPermissions.after": "بعد",
  "screen.organization.people.employeeInvitationAndPermissions.backToEmployees":
    "العودة إلى الموظفين",
  "screen.organization.people.employeeInvitationAndPermissions.employeeInvitationAndPermissions":
    "دعوة الموظف والصلاحيات",
  "screen.organization.people.employeeInvitationAndPermissions.invite": "دعوة",
  "screen.organization.people.employeeInvitationAndPermissions.email": "البريد الإلكتروني",
  "screen.organization.people.employeeInvitationAndPermissions.emailPlaceholder":
    "[البريد الإلكتروني]",
  "screen.organization.people.employeeInvitationAndPermissions.roleTitle": "المسمى الوظيفي",
  "screen.organization.people.employeeInvitationAndPermissions.operationsCoordinator":
    "منسّق العمليات",
  "screen.organization.people.employeeInvitationAndPermissions.permissionAreas": "أقسام الصلاحيات",
  "screen.organization.people.employeeInvitationAndPermissions.changeHistory": "سجل التغييرات",
  "screen.organization.people.employeeInvitationAndPermissions.permissionChangeHistory":
    "سجل تغييرات الصلاحيات",
  "screen.organization.people.employeeInvitationAndPermissions.noChangesYet": "لا تغييرات بعد",
  "screen.organization.people.employeeInvitationAndPermissions.changesToPermissionAreasAre":
    "تُسجَّل هنا التغييرات على أقسام الصلاحيات.",
  "screen.organization.people.employeeInvitationAndPermissions.savePermissions": "حفظ الصلاحيات",
  "screen.organization.people.employeeInvitationAndPermissions.sendInvitation": "إرسال الدعوة",
  // apps/web/src/screens/organization/people/employees-list.tsx
  "screen.organization.people.employeesList.name": "الاسم",
  "screen.organization.people.employeesList.email": "البريد الإلكتروني",
  "screen.organization.people.employeesList.status": "الحالة",
  "screen.organization.people.employeesList.active": "نشط",
  "screen.organization.people.employeesList.invited": "مدعو",
  "screen.organization.people.employeesList.permissionAreas": "أقسام الصلاحيات",
  "screen.organization.people.employeesList.remove": "إزالة",
  "screen.organization.people.employeesList.remove2": "إزالة",
  "screen.organization.people.employeesList.employeesList": "قائمة الموظفين",
  "screen.organization.people.employeesList.inviteEmployee": "دعوة موظف",
  "screen.organization.people.employeesList.employees": "الموظفون",
  "screen.organization.people.employeesList.searchEmployees": "بحث في الموظفين",
  "screen.organization.people.employeesList.clearSearch": "مسح البحث",
  "screen.organization.people.employeesList.employeesCaption": "الموظفون",
  "screen.organization.people.employeesList.noEmployeesYet": "لا موظفون بعد",
  "screen.organization.people.employeesList.inviteEmployeesAndGiveThem":
    "ادعُ موظفين وامنحهم أقسام الصلاحيات التي يحتاجونها.",
  "screen.organization.people.employeesList.removeThisEmployee": "إزالة هذا الموظف؟",
  "screen.organization.people.employeesList.accessEndsAtOncePast":
    "ينتهي الوصول فورًا. تُحفظ قيود التدقيق السابقة.",
  "screen.organization.people.employeesList.removeEmployee": "إزالة الموظف",
  "screen.organization.people.employeesList.keepEmployee": "الإبقاء على الموظف",
  // apps/web/src/screens/organization/staffing/deal-detail-and-negotiation.tsx
  "screen.organization.staffing.dealDetailAndNegotiation.trip": "الرحلة",
  "screen.organization.staffing.dealDetailAndNegotiation.route": "المسار",
  "screen.organization.staffing.dealDetailAndNegotiation.date": "التاريخ",
  "screen.organization.staffing.dealDetailAndNegotiation.pay": "الأجر",
  "screen.organization.staffing.dealDetailAndNegotiation.proposedByTheOrganization":
    "مقترح من المؤسسة",
  "screen.organization.staffing.dealDetailAndNegotiation.backToStaffingBoard":
    "العودة إلى لوحة الطواقم",
  "screen.organization.staffing.dealDetailAndNegotiation.dealDetailAndNegotiation":
    "تفاصيل الاتفاقية والتفاوض",
  "screen.organization.staffing.dealDetailAndNegotiation.proposed": "مقترح",
  "screen.organization.staffing.dealDetailAndNegotiation.theDealExpires72Hours":
    "تنتهي الاتفاقية بعد 72 ساعة من آخر عرض مضاد.",
  "screen.organization.staffing.dealDetailAndNegotiation.offerHistory": "سجل العروض",
  "screen.organization.staffing.dealDetailAndNegotiation.offerHistoryAriaLabel": "سجل العروض",
  "screen.organization.staffing.dealDetailAndNegotiation.counterOffer": "عرض مضاد",
  "screen.organization.staffing.dealDetailAndNegotiation.counterAmount": "المبلغ المضاد",
  "screen.organization.staffing.dealDetailAndNegotiation.amount": "[المبلغ]",
  "screen.organization.staffing.dealDetailAndNegotiation.currency": "العملة",
  "screen.organization.staffing.dealDetailAndNegotiation.currencyCode": "[رمز العملة]",
  "screen.organization.staffing.dealDetailAndNegotiation.reject": "رفض",
  "screen.organization.staffing.dealDetailAndNegotiation.counter": "عرض مضاد",
  "screen.organization.staffing.dealDetailAndNegotiation.accept": "قبول",
  // apps/web/src/screens/organization/staffing/organization-owned-drivers-and-photographers.tsx
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.driver": "السائق",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.photographer": "مصوّر",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.name": "الاسم",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.type": "النوع",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.status": "الحالة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.vehicleAssignments":
    "تعيينات المركبات",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove": "إزالة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove2": "إزالة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.backToStaffingBoard":
    "العودة إلى لوحة الطواقم",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDriversAndPhotographers":
    "السائقون والمصورون التابعون للمؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer":
    "إضافة سائق أو مصوّر",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedStaffAreVisible":
    "الموظفون التابعون للمؤسسة مرئيون لمؤسستك فقط. ويُقبلون تلقائيًا عند تعيينهم في رحلة.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailed":
    "فشل الإجراء",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addOrganizationOwnedStaff":
    "إضافة موظف تابع للمؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.role": "الدور",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.fullName": "الاسم الكامل",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.phone": "الهاتف",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emailOptional":
    "البريد الإلكتروني (اختياري)",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.licenseNumber":
    "رقم الرخصة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cameraBody":
    "جسم الكاميرا",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saving": "جارٍ الحفظ...",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saveStaffMember":
    "حفظ الموظف",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cancel": "إلغاء",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedStaff":
    "الموظفون التابعون للمؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.capStaffCap":
    "الحد: [حد الموظفين]",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.staff": "الطاقم",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDriversAndPhotographersCaption":
    "السائقون والمصورون التابعون للمؤسسة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.noOrganizationOwnedStaffYet":
    "لا موظفون تابعون للمؤسسة بعد",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addADriverOrPhotographer":
    "أضف سائقًا أو مصوّرًا لتعيينه في الرحلات.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removeThisStaffMember":
    "إزالة هذا الموظف؟",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.futureAssignmentsAreAffectedTrips":
    "تتأثر التعيينات المستقبلية. تحتفظ الرحلات المعيَّنة بسجلها.",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removePrimaryLabel":
    "إزالة",
  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.keep": "الإبقاء",
  // apps/web/src/screens/organization/staffing/platform-supplier-search-and-deal-start.tsx
  "screen.organization.staffing.platformSupplierSearchAndDealStart.backToStaffingBoard":
    "العودة إلى لوحة الطواقم",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.platformSupplierSearchAndDeal":
    "البحث عن مورّد المنصة وبدء اتفاقية",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.theTripRouteDateAnd":
    "تُعرض الرحلة والمسار والتاريخ والأجر على المورّد.",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.findASupplier": "ابحث عن مورّد",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.searchSuppliers":
    "بحث في المورّدين",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.clearSearch": "مسح البحث",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.nameRoleOrArea":
    "[الاسم أو الدور أو المنطقة]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.supplierName": "[اسم المورّد]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.verified": "موثّق",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.availableOnDate":
    "متاح في [التاريخ]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.price": "السعر",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.amount": "[المبلغ]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.currency": "العملة",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.currencyCode": "[رمز العملة]",
  "screen.organization.staffing.platformSupplierSearchAndDealStart.sendProposal": "إرسال العرض",
  // apps/web/src/screens/organization/staffing/staffing-board.tsx
  "screen.organization.staffing.staffingBoard.organizationOwned": "تابع للمؤسسة",
  "screen.organization.staffing.staffingBoard.accepted": "مقبول",
  "screen.organization.staffing.staffingBoard.platformNegotiating": "المنصة تتفاوض",
  "screen.organization.staffing.staffingBoard.platformFinalized": "أبرمتها المنصة",
  "screen.organization.staffing.staffingBoard.missing": "مفقود",
  "screen.organization.staffing.staffingBoard.vehicle": "المركبة",
  "screen.organization.staffing.staffingBoard.driver": "السائق",
  "screen.organization.staffing.staffingBoard.moderator": "مشرف",
  "screen.organization.staffing.staffingBoard.photographer": "مصوّر",
  "screen.organization.staffing.staffingBoard.actions": "الإجراءات",
  "screen.organization.staffing.staffingBoard.manage": "إدارة",
  "screen.organization.staffing.staffingBoard.backToTrip": "العودة إلى الرحلة",
  "screen.organization.staffing.staffingBoard.staffingBoard": "لوحة الطواقم",
  "screen.organization.staffing.staffingBoard.tripName": "[اسم الرحلة]",
  "screen.organization.staffing.staffingBoard.organizationOwnedStaff": "الموظفون التابعون للمؤسسة",
  "screen.organization.staffing.staffingBoard.findPlatformSupplier": "البحث عن مورّد منصة",
  "screen.organization.staffing.staffingBoard.readyIsBlocked": "حالة «جاهزة» موقوفة",
  "screen.organization.staffing.staffingBoard.everyVehicleNeedsADriver":
    "تحتاج كل مركبة إلى سائق ومشرف قبل أن تصبح الرحلة جاهزة.",
  "screen.organization.staffing.staffingBoard.staffingForEachVehicle": "الطاقم لكل مركبة",
  "screen.organization.staffing.staffingBoard.noVehiclesOnThisTrip": "لا مركبات في هذه الرحلة",
  "screen.organization.staffing.staffingBoard.addVehiclesToTheTrip":
    "أضف مركبات إلى الرحلة لتعيين الطاقم.",
  // apps/web/src/screens/organization/trips/cancel-trip-decision.tsx
  "screen.organization.trips.cancelTripDecision.backToTrip": "العودة إلى الرحلة",
  "screen.organization.trips.cancelTripDecision.cancelTripDecision": "إلغاء الرحلة (قرار)",
  "screen.organization.trips.cancelTripDecision.thisCancelsTheTripFor": "هذا يلغي الرحلة لكل مسافر",
  "screen.organization.trips.cancelTripDecision.confirmedBookingsMoveToCancelled":
    "تنتقل الحجوزات المؤكدة إلى «ملغاة» ثم «مستردة». يُبلَّغ المسافرون وتُدرَج الاستردادات.",
  "screen.organization.trips.cancelTripDecision.affectedBookings": "الحجوزات المتأثرة",
  "screen.organization.trips.cancelTripDecision.refundPolicy": "سياسة الاسترداد",
  "screen.organization.trips.cancelTripDecision.reason": "السبب",
  "screen.organization.trips.cancelTripDecision.reasonForCancellation": "سبب الإلغاء",
  "screen.organization.trips.cancelTripDecision.reasonPlaceholder": "[السبب]",
  "screen.organization.trips.cancelTripDecision.requiredTheReasonIsRecorded":
    "مطلوب. يُسجَّل السبب مع الإلغاء.",
  "screen.organization.trips.cancelTripDecision.travelersAreNotifiedOfThe":
    "يُبلَّغ المسافرون بالإلغاء.",
  "screen.organization.trips.cancelTripDecision.refundsAreQueuedUnderThe":
    "تُدرَج الاستردادات وفق سياسة الاسترداد.",
  "screen.organization.trips.cancelTripDecision.keepTrip": "الإبقاء على الرحلة",
  "screen.organization.trips.cancelTripDecision.cancelTrip": "إلغاء الرحلة",
  "screen.organization.trips.cancelTripDecision.cancelThisTrip": "إلغاء هذه الرحلة؟",
  "screen.organization.trips.cancelTripDecision.confirmedBookingsMoveToCancelledDescription":
    "تنتقل الحجوزات المؤكدة إلى «ملغاة» ثم «مستردة». يُبلَّغ المسافرون.",
  "screen.organization.trips.cancelTripDecision.cancelTripPrimaryLabel": "إلغاء الرحلة",
  "screen.organization.trips.cancelTripDecision.keepTripSecondaryLabel": "الإبقاء على الرحلة",
  // apps/web/src/screens/organization/trips/program-editor.tsx
  "screen.organization.trips.programEditor.labels.optional": "اختياري",
  "screen.organization.trips.programEditor.labels.preRequired": "مطلوب مسبقًا",
  "screen.organization.trips.programEditor.labels.capacityLimitedWithCap": "محدود السعة (بحد أقصى)",
  "screen.organization.trips.programEditor.labels.vipOnly": "لكبار الشخصيات فقط",
  "screen.organization.trips.programEditor.free": "مجاني",
  "screen.organization.trips.programEditor.perPerson": "لكل شخص",
  "screen.organization.trips.programEditor.byQuantity": "حسب الكمية",
  "screen.organization.trips.programEditor.perGroup": "لكل مجموعة",
  "screen.organization.trips.programEditor.tiered": "متدرّج",
  "screen.organization.trips.programEditor.backToPrograms": "العودة إلى البرامج",
  "screen.organization.trips.programEditor.programEditor": "محرّر البرامج",
  "screen.organization.trips.programEditor.save": "حفظ",
  "screen.organization.trips.programEditor.details": "التفاصيل",
  "screen.organization.trips.programEditor.programName": "اسم البرنامج",
  "screen.organization.trips.programEditor.programNamePlaceholder": "[اسم البرنامج]",
  "screen.organization.trips.programEditor.pricingModel": "نموذج التسعير",
  "screen.organization.trips.programEditor.chooseExactlyOnePricingModel":
    "اختر نموذج تسعير واحدًا فقط.",
  "screen.organization.trips.programEditor.typeFlags": "أعلام النوع",
  "screen.organization.trips.programEditor.prices": "الأسعار",
  "screen.organization.trips.programEditor.price": "السعر",
  "screen.organization.trips.programEditor.amount": "[المبلغ]",
  "screen.organization.trips.programEditor.currency": "العملة",
  "screen.organization.trips.programEditor.currencyCode": "[رمز العملة]",
  // apps/web/src/screens/organization/trips/trip-command-view.tsx
  "screen.organization.trips.tripCommandView.vehicle": "المركبة",
  "screen.organization.trips.tripCommandView.driver": "السائق",
  "screen.organization.trips.tripCommandView.missing": "مفقود",
  "screen.organization.trips.tripCommandView.assigned": "مُعيَّن",
  "screen.organization.trips.tripCommandView.moderator": "مشرف",
  "screen.organization.trips.tripCommandView.missingLabel": "مفقود",
  "screen.organization.trips.tripCommandView.assignedLabel": "مُعيَّن",
  "screen.organization.trips.tripCommandView.openDeal": "فتح الاتفاقية",
  "screen.organization.trips.tripCommandView.staffing": "الطاقم",
  "screen.organization.trips.tripCommandView.seatMap": "خريطة المقاعد",
  "screen.organization.trips.tripCommandView.bookings": "الحجوزات",
  "screen.organization.trips.tripCommandView.programs": "البرامج",
  "screen.organization.trips.tripCommandView.enrollmentReport": "تقرير التسجيل",
  "screen.organization.trips.tripCommandView.liveOperations": "العمليات المباشرة",
  "screen.organization.trips.tripCommandView.accounting": "المحاسبة",
  "screen.organization.trips.tripCommandView.tripReports": "تقارير الرحلة",
  "screen.organization.trips.tripCommandView.tripCommandView": "عرض قيادة الرحلة",
  "screen.organization.trips.tripCommandView.cancelTrip": "إلغاء الرحلة",
  "screen.organization.trips.tripCommandView.lifecycle": "دورة الحياة",
  "screen.organization.trips.tripCommandView.seatsSold": "المقاعد المبيعة",
  "screen.organization.trips.tripCommandView.seatsHeld": "المقاعد المحجوزة مؤقتًا",
  "screen.organization.trips.tripCommandView.seatsReserved": "المقاعد المحجوزة",
  "screen.organization.trips.tripCommandView.occupancy": "الإشغال",
  "screen.organization.trips.tripCommandView.readyGaps": "نواقص الجاهزية",
  "screen.organization.trips.tripCommandView.readyGapsPerVehicle": "نواقص الجاهزية لكل مركبة",
  "screen.organization.trips.tripCommandView.noGaps": "لا نواقص",
  "screen.organization.trips.tripCommandView.everyVehicleHasADriver": "كل مركبة لديها سائق ومشرف.",
  "screen.organization.trips.tripCommandView.goTo": "الانتقال إلى",
  // apps/web/src/screens/organization/trips/trip-wizard-step-1-basics.tsx
  "screen.organization.trips.tripWizardStep1Basics.tripWizardStep1Basics":
    "معالج الرحلة، الخطوة 1: الأساسيات",
  "screen.organization.trips.tripWizardStep1Basics.activeTripsThisMonth": "الرحلات النشطة هذا الشهر",
  "screen.organization.trips.tripWizardStep1Basics.monthlyLimitPlanLimit":
    "الحد الشهري: [حد الخطة]",
  "screen.organization.trips.tripWizardStep1Basics.yourDraftIsSavedAs":
    "تُحفظ مسودتك أولًا بأول. وتبقى متاحة إذا انتهت جلستك.",
  "screen.organization.trips.tripWizardStep1Basics.tripName": "اسم الرحلة",
  "screen.organization.trips.tripWizardStep1Basics.tripNamePlaceholder": "[اسم الرحلة]",
  "screen.organization.trips.tripWizardStep1Basics.description": "الوصف",
  "screen.organization.trips.tripWizardStep1Basics.shortDescription": "[وصف قصير]",
  "screen.organization.trips.tripWizardStep1Basics.tripType": "نوع الرحلة",
  "screen.organization.trips.tripWizardStep1Basics.tripTypePlaceholder": "[نوع الرحلة]",
  "screen.organization.trips.tripWizardStep1Basics.language": "اللغة",
  "screen.organization.trips.tripWizardStep1Basics.languagePlaceholder": "[اللغة]",
  // apps/web/src/screens/organization/trips/trip-wizard-step-2-schedule-and-route.tsx
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripWizardStep2Schedule":
    "معالج الرحلة، الخطوة 2: الجدول والمسار",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startDate": "تاريخ البدء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.yyyyMmDd": "YYYY-MM-DD",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endDate": "تاريخ الانتهاء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.yyyyMmDdPlaceholder": "YYYY-MM-DD",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.startTime": "وقت البدء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.hhMm": "HH:MM",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.endTime": "وقت الانتهاء",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.hhMmPlaceholder": "HH:MM",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripTimeZone":
    "المنطقة الزمنية للرحلة",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.timeZone": "[المنطقة الزمنية]",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.origin": "نقطة الانطلاق",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.originPlaceholder": "[نقطة الانطلاق]",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops":
    "الوجهات والمحطات",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationOrStop":
    "[الوجهة أو المحطة]",
  "screen.organization.trips.tripWizardStep2ScheduleAndRoute.theMapPickerFromThe":
    "يحدد منتقي الخرائط من خدمة الخرائط نقطة الانطلاق والوجهات والمحطات.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-3-vehicles.tsx
  "screen.organization.trips.tripWizardStep3Vehicles.vehicle": "المركبة",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicleType": "نوع المركبة",
  "screen.organization.trips.tripWizardStep3Vehicles.seats": "المقاعد",
  "screen.organization.trips.tripWizardStep3Vehicles.remove": "إزالة",
  "screen.organization.trips.tripWizardStep3Vehicles.removeVehicle": "إزالة المركبة",
  "screen.organization.trips.tripWizardStep3Vehicles.tripWizardStep3Vehicles":
    "معالج الرحلة، الخطوة 3: المركبات",
  "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip": "المركبات في هذه الرحلة",
  "screen.organization.trips.tripWizardStep3Vehicles.0Of10": "0 من 10",
  "screen.organization.trips.tripWizardStep3Vehicles.growthPlanLimitPerTrip":
    "حد خطة Growth لكل رحلة",
  "screen.organization.trips.tripWizardStep3Vehicles.vehicles": "المركبات",
  "screen.organization.trips.tripWizardStep3Vehicles.addVehicle": "إضافة مركبة",
  "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTripCaption":
    "المركبات في هذه الرحلة",
  "screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet": "لا مركبات بعد",
  "screen.organization.trips.tripWizardStep3Vehicles.addAtLeastOneVehicle":
    "أضف مركبة واحدة على الأقل للمتابعة.",
  "screen.organization.trips.tripWizardStep3Vehicles.theSeatLayoutPreviewAppears":
    "تظهر معاينة تخطيط المقاعد بعد اختيار نوع المركبة. لكل مركبة نوع واحد.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-4-staffing.tsx
  "screen.organization.trips.tripWizardStep4Staffing.notAssigned": "غير معيَّن",
  "screen.organization.trips.tripWizardStep4Staffing.organizationOwned": "تابع للمؤسسة",
  "screen.organization.trips.tripWizardStep4Staffing.platformThroughADeal": "المنصة (عبر اتفاقية)",
  "screen.organization.trips.tripWizardStep4Staffing.notAssignedLabel": "غير معيَّن",
  "screen.organization.trips.tripWizardStep4Staffing.organizationOwnedLabel": "تابع للمؤسسة",
  "screen.organization.trips.tripWizardStep4Staffing.notAssigned2": "غير معيَّن",
  "screen.organization.trips.tripWizardStep4Staffing.organizationOwned2": "تابع للمؤسسة",
  "screen.organization.trips.tripWizardStep4Staffing.platformThroughADealLabel":
    "المنصة (عبر اتفاقية)",
  "screen.organization.trips.tripWizardStep4Staffing.ready": "جاهزة",
  "screen.organization.trips.tripWizardStep4Staffing.driver": "السائق",
  "screen.organization.trips.tripWizardStep4Staffing.moderator": "مشرف",
  "screen.organization.trips.tripWizardStep4Staffing.photographer": "مصوّر",
  "screen.organization.trips.tripWizardStep4Staffing.findPlatformSupplier": "البحث عن مورّد منصة",
  "screen.organization.trips.tripWizardStep4Staffing.tripWizardStep4Staffing":
    "معالج الرحلة، الخطوة 4: الطاقم",
  "screen.organization.trips.tripWizardStep4Staffing.aPlatformDriverOrPhotographer":
    "لا يُعيَّن سائق أو مصوّر من المنصة إلا بعد إبرام الاتفاقية.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-5-programs.tsx
  "screen.organization.trips.tripWizardStep5Programs.program": "البرنامج",
  "screen.organization.trips.tripWizardStep5Programs.pricingModel": "نموذج التسعير",
  "screen.organization.trips.tripWizardStep5Programs.typeFlags": "أعلام النوع",
  "screen.organization.trips.tripWizardStep5Programs.cap": "الحد",
  "screen.organization.trips.tripWizardStep5Programs.tripWizardStep5Programs":
    "معالج الرحلة، الخطوة 5: البرامج",
  "screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip": "البرامج في هذه الرحلة",
  "screen.organization.trips.tripWizardStep5Programs.0Of15": "0 من 15",
  "screen.organization.trips.tripWizardStep5Programs.growthPlanLimitPerTrip":
    "حد خطة Growth لكل رحلة",
  "screen.organization.trips.tripWizardStep5Programs.programs": "البرامج",
  "screen.organization.trips.tripWizardStep5Programs.addProgram": "إضافة برنامج",
  "screen.organization.trips.tripWizardStep5Programs.programsOnThisTripCaption":
    "البرامج في هذه الرحلة",
  "screen.organization.trips.tripWizardStep5Programs.noProgramsYet": "لا برامج بعد",
  "screen.organization.trips.tripWizardStep5Programs.addAProgramOrContinue":
    "أضف برنامجًا، أو تابع بدونه.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-6-seating.tsx
  "screen.organization.trips.tripWizardStep6Seating.tripWizardStep6Seating":
    "معالج الرحلة، الخطوة 6: المقاعد",
  "screen.organization.trips.tripWizardStep6Seating.travelersChooseTheirOwnSeats":
    "يختار المسافرون مقاعدهم بأنفسهم",
  "screen.organization.trips.tripWizardStep6Seating.selfSelect": "اختيار ذاتي",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssignsSeats":
    "المؤسسة تخصّص المقاعد",
  "screen.organization.trips.tripWizardStep6Seating.organizationAssignedSeatsAreThe":
    "المقاعد المخصَّصة من المؤسسة هي الافتراضي. يتبع تغيير نمط المقاعد بعد الحجز قواعد تغيير الرحلة.",
  "screen.organization.trips.tripWizardStep6Seating.priorityWindowForExplorerAnd":
    "نافذة أولوية لمسافري Explorer وVIP",
  "screen.organization.trips.tripWizardStep6Seating.windowLength": "[مدة النافذة]",
  "screen.organization.trips.tripWizardStep6Seating.theLengthOfTheWindow":
    "لم تُحدَّد مدة النافذة بعد.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-7-pricing-and-capacity.tsx
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.tripWizardStep7Pricing":
    "معالج الرحلة، الخطوة 7: التسعير والسعة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePrice": "السعر الأساسي",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.amount": "[المبلغ]",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.currency": "العملة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.currencyCode": "[رمز العملة]",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityPerVehicle":
    "السعة لكل مركبة",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.seatCount": "[عدد المقاعد]",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.setByTheSeatCount":
    "يُحدَّد بعدد مقاعد كل نوع مركبة.",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTracking": "تتبّع الأطفال",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.on": "مفعّل",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.off": "متوقف",
  "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingNeedsAParent":
    "يحتاج تتبّع الأطفال إلى ولي أمر على Explorer أو VIP ومؤسسة على Growth أو Enterprise.",
  // apps/web/src/screens/organization/trips/trip-wizard-step-8-publish.tsx
  "screen.organization.trips.tripWizardStep8Publish.basics": "الأساسيات",
  "screen.organization.trips.tripWizardStep8Publish.scheduleAndRoute": "الجدول والمسار",
  "screen.organization.trips.tripWizardStep8Publish.vehicles": "المركبات",
  "screen.organization.trips.tripWizardStep8Publish.staffing": "الطاقم",
  "screen.organization.trips.tripWizardStep8Publish.programs": "البرامج",
  "screen.organization.trips.tripWizardStep8Publish.seating": "المقاعد",
  "screen.organization.trips.tripWizardStep8Publish.pricingAndCapacity": "التسعير والسعة",
  "screen.organization.trips.tripWizardStep8Publish.saveAsDraft": "حفظ كمسودة",
  "screen.organization.trips.tripWizardStep8Publish.publishToEveryone": "النشر للجميع",
  "screen.organization.trips.tripWizardStep8Publish.publishToATargetedAudience":
    "النشر لقائمة جمهور موجّه",
  "screen.organization.trips.tripWizardStep8Publish.tripWizardStep8Publish":
    "معالج الرحلة، الخطوة 8: النشر",
  "screen.organization.trips.tripWizardStep8Publish.publish": "نشر",
  "screen.organization.trips.tripWizardStep8Publish.saveDraft": "حفظ المسودة",
  "screen.organization.trips.tripWizardStep8Publish.tripsPublishedThisMonth":
    "الرحلات المنشورة هذا الشهر",
  "screen.organization.trips.tripWizardStep8Publish.monthlyLimitPlanLimit":
    "الحد الشهري: [حد الخطة]",
  "screen.organization.trips.tripWizardStep8Publish.readiness": "الجاهزية",
  "screen.organization.trips.tripWizardStep8Publish.requiredSteps": "الخطوات المطلوبة",
  "screen.organization.trips.tripWizardStep8Publish.publishMode": "نمط النشر",
  "screen.organization.trips.tripWizardStep8Publish.publishModeLabel": "نمط النشر",
  "screen.organization.trips.tripWizardStep8Publish.audienceList": "قائمة الجمهور",
  "screen.organization.trips.tripWizardStep8Publish.audienceListPlaceholder": "[قائمة الجمهور]",
  "screen.organization.trips.tripWizardStep8Publish.usedOnlyWhenPublishingTo":
    "تُستخدم فقط عند النشر لجمهور موجّه.",
  // apps/web/src/screens/organization/trips/trips-list.tsx
  "screen.organization.trips.tripsList.trip": "الرحلة",
  "screen.organization.trips.tripsList.dates": "التواريخ",
  "screen.organization.trips.tripsList.vehicles": "المركبات",
  "screen.organization.trips.tripsList.seatsSold": "المقاعد المبيعة",
  "screen.organization.trips.tripsList.staffing": "الطاقم",
  "screen.organization.trips.tripsList.staffingGap": "نقص في الطاقم",
  "screen.organization.trips.tripsList.staffed": "مكتمل الطاقم",
  "screen.organization.trips.tripsList.state": "الحالة",
  "screen.organization.trips.tripsList.allStates": "كل الحالات",
  "screen.organization.trips.tripsList.tripsList": "قائمة الرحلات",
  "screen.organization.trips.tripsList.createTrip": "إنشاء رحلة",
  "screen.organization.trips.tripsList.activeTripsThisMonth": "الرحلات النشطة هذا الشهر",
  "screen.organization.trips.tripsList.monthlyLimitPlanLimit": "الحد الشهري: [حد الخطة]",
  "screen.organization.trips.tripsList.tripsWithStaffingGaps": "رحلات بها نواقص في الطاقم",
  "screen.organization.trips.tripsList.searchTrips": "بحث في الرحلات",
  "screen.organization.trips.tripsList.clearSearch": "مسح البحث",
  "screen.organization.trips.tripsList.stateLabel": "الحالة",
  "screen.organization.trips.tripsList.trips": "الرحلات",
  "screen.organization.trips.tripsList.noTripsMatch": "لا رحلات مطابقة",
  "screen.organization.trips.tripsList.changeTheSearchOrThe": "غيّر البحث أو تصفية الحالة.",
  // apps/web/src/screens/organization/vehicles/vehicle-editor.tsx
  "screen.organization.vehicles.vehicleEditor.confirmedBookingsCount":
    "هذه المركبة لديها {count} حجوزات مؤكدة. لا يمكن إزالة مركبة لديها حجوزات مؤكدة.",
  "screen.organization.vehicles.vehicleEditor.backToVehicles": "العودة إلى المركبات",
  "screen.organization.vehicles.vehicleEditor.vehicleEditor": "محرّر المركبة",
  "screen.organization.vehicles.vehicleEditor.save": "حفظ",
  "screen.organization.vehicles.vehicleEditor.vehicle": "المركبة",
  "screen.organization.vehicles.vehicleEditor.plate": "لوحة المركبة",
  "screen.organization.vehicles.vehicleEditor.platePlaceholder": "[لوحة المركبة]",
  "screen.organization.vehicles.vehicleEditor.model": "الطراز",
  "screen.organization.vehicles.vehicleEditor.modelPlaceholder": "[الطراز]",
  "screen.organization.vehicles.vehicleEditor.year": "السنة",
  "screen.organization.vehicles.vehicleEditor.yearPlaceholder": "[السنة]",
  "screen.organization.vehicles.vehicleEditor.vehicleType": "نوع المركبة",
  "screen.organization.vehicles.vehicleEditor.vehicleTypePlaceholder": "[نوع المركبة]",
  "screen.organization.vehicles.vehicleEditor.seatCount": "عدد المقاعد",
  "screen.organization.vehicles.vehicleEditor.seatCountPlaceholder": "[عدد المقاعد]",
  "screen.organization.vehicles.vehicleEditor.mustMatchTheSeatCount":
    "يجب أن يطابق عدد مقاعد نوع المركبة.",
  "screen.organization.vehicles.vehicleEditor.registrationStatus": "حالة التسجيل",
  "screen.organization.vehicles.vehicleEditor.registrationStatusPlaceholder": "[حالة التسجيل]",
  "screen.organization.vehicles.vehicleEditor.uploadVehiclePhoto": "رفع صورة المركبة",
  "screen.organization.vehicles.vehicleEditor.removeVehicle": "إزالة المركبة",
  "screen.organization.vehicles.vehicleEditor.removalIsBlockedWhileBookings":
    "الإزالة موقوفة ما دامت الحجوزات مؤكدة",
  "screen.organization.vehicles.vehicleEditor.removeVehicle2": "إزالة المركبة",
  "screen.organization.vehicles.vehicleEditor.removeThisVehicle": "إزالة هذه المركبة؟",
  "screen.organization.vehicles.vehicleEditor.theVehicleLeavesTheRegistry":
    "تخرج المركبة من السجل والرحلات المستقبلية. لا يمكن إزالتها ما دامت الحجوزات مؤكدة.",
  "screen.organization.vehicles.vehicleEditor.removeVehiclePrimaryLabel": "إزالة المركبة",
  "screen.organization.vehicles.vehicleEditor.keepVehicle": "الإبقاء على المركبة",
  // apps/web/src/screens/organization/vehicles/vehicle-registry.tsx
  "screen.organization.vehicles.vehicleRegistry.plate": "لوحة المركبة",
  "screen.organization.vehicles.vehicleRegistry.model": "الطراز",
  "screen.organization.vehicles.vehicleRegistry.year": "السنة",
  "screen.organization.vehicles.vehicleRegistry.vehicleType": "نوع المركبة",
  "screen.organization.vehicles.vehicleRegistry.seats": "المقاعد",
  "screen.organization.vehicles.vehicleRegistry.registration": "التسجيل",
  "screen.organization.vehicles.vehicleRegistry.allVehicleTypes": "كل أنواع المركبات",
  "screen.organization.vehicles.vehicleRegistry.vehicleTypeLabel": "[نوع المركبة]",
  "screen.organization.vehicles.vehicleRegistry.allVehicleTypesLabel": "كل أنواع المركبات",
  "screen.organization.vehicles.vehicleRegistry.vehicleRegistry": "سجل المركبات",
  "screen.organization.vehicles.vehicleRegistry.vehicleTypes": "أنواع المركبات",
  "screen.organization.vehicles.vehicleRegistry.addVehicle": "إضافة مركبة",
  "screen.organization.vehicles.vehicleRegistry.searchByPlate": "بحث بلوحة المركبة",
  "screen.organization.vehicles.vehicleRegistry.clearSearch": "مسح البحث",
  "screen.organization.vehicles.vehicleRegistry.vehicleType2": "نوع المركبة",
  "screen.organization.vehicles.vehicleRegistry.vehicles": "المركبات",
  "screen.organization.vehicles.vehicleRegistry.noVehiclesYet": "لا مركبات بعد",
  "screen.organization.vehicles.vehicleRegistry.addAVehicleToUse": "أضف مركبة لاستخدامها في الرحلات.",
  // apps/web/src/screens/organization/vehicles/vehicle-types-and-seat-layout.tsx
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.backToVehicles": "العودة إلى المركبات",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.vehicleTypesAndSeatLayout":
    "أنواع المركبات وتخطيط المقاعد",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.archiveType": "أرشفة النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.save": "حفظ",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.type": "النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.name": "الاسم",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.typeName": "[اسم النوع]",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCount": "عدد المقاعد",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCountPlaceholder": "[عدد المقاعد]",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayout": "تخطيط المقاعد",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayoutOfThisVehicle":
    "تخطيط مقاعد هذا النوع",
  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLabelsAppearOnThe":
    "تظهر تسميات المقاعد على خريطة المقاعد. لا تُعرض الأنواع المؤرشفة للرحلات الجديدة، وتحتفظ الرحلات القائمة بتخطيطها.",
  // apps/web/src/screens/organization/workspace/organization-profile-settings-and-branding.tsx
  "screen.organization.workspace.organizationProfileSettingsAndBranding.organizationProfileSettingsAndBranding":
    "ملف المؤسسة والإعدادات والهوية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.save": "حفظ",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalDetails":
    "البيانات القانونية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNameArabic":
    "الاسم القانوني (بالعربية)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalName":
    "[الاسم القانوني]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNameEnglish":
    "الاسم القانوني (بالإنجليزية)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNamePlaceholder":
    "[الاسم القانوني]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameArabic":
    "الاسم التجاري (بالعربية)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeName":
    "[الاسم التجاري]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameEnglish":
    "الاسم التجاري (بالإنجليزية)",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNamePlaceholder":
    "[الاسم التجاري]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.country": "الدولة",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.countryPlaceholder":
    "[الدولة]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZone":
    "المنطقة الزمنية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZonePlaceholder":
    "[المنطقة الزمنية]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumber":
    "رقم السجل التجاري",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumberPlaceholder":
    "[رقم السجل التجاري]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxNumber": "الرقم الضريبي",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxNumberPlaceholder":
    "[الرقم الضريبي]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceDetails":
    "بيانات الفاتورة",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddress":
    "عنوان الفاتورة",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddressPlaceholder":
    "[عنوان الفاتورة]",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.integrations": "التكاملات",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.crmConnectionAndOutboundWebhooks":
    "اتصال إدارة العلاقات والويب هوك الصادر",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.openCrmAndWebhooks":
    "فتح إدارة العلاقات والويب هوك",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.branding": "الهوية البصرية",
  "screen.organization.workspace.organizationProfileSettingsAndBranding.logoAndColorsAreAvailable":
    "الشعار والألوان متاحة في خطة Enterprise.",
  // apps/web/src/screens/organization/workspace/workspace-home.tsx
  "screen.organization.workspace.workspaceHome.organizationProfile": "ملف المؤسسة",
  "screen.organization.workspace.workspaceHome.accountingAndInvoiceDetails":
    "بيانات المحاسبة والفاتورة",
  "screen.organization.workspace.workspaceHome.crmConnectionOptional":
    "اتصال إدارة العلاقات (اختياري)",
  "screen.organization.workspace.workspaceHome.webhooksOptional": "الويب هوك (اختياري)",
  "screen.organization.workspace.workspaceHome.trip": "الرحلة",
  "screen.organization.workspace.workspaceHome.dates": "التواريخ",
  "screen.organization.workspace.workspaceHome.readyGaps": "نواقص الجاهزية",
  "screen.organization.workspace.workspaceHome.vehicleRegistry": "سجل المركبات",
  "screen.organization.workspace.workspaceHome.crmAndWebhooks": "إدارة العلاقات والويب هوك",
  "screen.organization.workspace.workspaceHome.childSafetyReports": "تقارير سلامة الأطفال",
  "screen.organization.workspace.workspaceHome.workspaceHome": "رئيسية مساحة العمل",
  "screen.organization.workspace.workspaceHome.yourOrganizationSStatusAnd":
    "حالة مؤسستك والخطوة التالية.",
  "screen.organization.workspace.workspaceHome.createTrip": "إنشاء رحلة",
  "screen.organization.workspace.workspaceHome.activeTripsThisMonth": "الرحلات النشطة هذا الشهر",
  "screen.organization.workspace.workspaceHome.monthlyLimitPlanLimit": "الحد الشهري: [حد الخطة]",
  "screen.organization.workspace.workspaceHome.upcomingTrips": "الرحلات القادمة",
  "screen.organization.workspace.workspaceHome.tripsWithReadyGaps": "رحلات بها نواقص جاهزية",
  "screen.organization.workspace.workspaceHome.alerts": "التنبيهات",
  "screen.organization.workspace.workspaceHome.tripNameChangesRequested":
    "[اسم الرحلة]: طُلبت تغييرات",
  "screen.organization.workspace.workspaceHome.reviewTheRequestedChangesAnd":
    "راجع التغييرات المطلوبة وردّ عليها.",
  "screen.organization.workspace.workspaceHome.pendingDealRequest": "طلب اتفاقية معلّق",
  "screen.organization.workspace.workspaceHome.vehicleOrSlotAPlatform":
    "[المركبة أو الموعد]: مورّد منصة في انتظار الرد.",
  "screen.organization.workspace.workspaceHome.upcomingTripsTitle": "الرحلات القادمة",
  "screen.organization.workspace.workspaceHome.upcomingTripsCaption": "الرحلات القادمة",
  "screen.organization.workspace.workspaceHome.noUpcomingTrips": "لا رحلات قادمة",
  "screen.organization.workspace.workspaceHome.createATripToSee": "أنشئ رحلة لتظهر هنا.",
  "screen.organization.workspace.workspaceHome.moreAreas": "أقسام أخرى",
  "screen.organization.workspace.workspaceHome.setupChecklist": "قائمة الإعداد",
  "screen.organization.workspace.workspaceHome.setupChecklistAriaLabel": "قائمة الإعداد",
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
