import type {
  LookupLocalizedText,
  LookupSeedDefinition,
  LookupTypeCode,
  LookupTypeSeedDefinition,
  SupportedLocale,
} from "./types";

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupRecord,
  LookupSeedDefinition,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeRecord,
  LookupTypeSeedDefinition,
  LookupTypeWithItemsDto,
} from "./types";

export const LOOKUP_TYPE_CODES = [
  "COUNTRY",
  "CURRENCY",
  "LANGUAGE",
  "USER_ROLE",
  "ADMIN_SUB_ROLE",
  "CLIENT_SURFACE",
  "PAYMENT_GATEWAY",
  "PAYOUT_METHOD",
  "ORG_PERMISSION_AREA",
  "ORG_PERMISSION_LEVEL",
  "APPLICATION_TYPE",
  "APPLICATION_STATE",
  "DOCUMENT_TYPE",
  "CONSENT_TYPE",
  "APPLICATION_DECISION_REASON",
  "DRIVER_LICENSE_CATEGORY",
  "SERVICE_REGION",
  "CAMERA_BODY",
  "CAMERA_LENS",
  "PHOTOGRAPHER_SPECIALTY",
  "TRIP_CATEGORY",
  "VEHICLE_TYPE",
  "CANCELLATION_REASON",
] as const satisfies readonly LookupTypeCode[];

export const DEFAULT_LOOKUP_TYPES: readonly LookupTypeSeedDefinition[] = [
  // 1. Core Platform Lists
  {
    code: "COUNTRY",
    value: "country",
    name: { en: "Countries & Markets", ar: "الدول والأسواق" },
    description: {
      en: "Supported operating countries and regional markets",
      ar: "الدول والأسواق الإقليمية المدعومة في المنصة",
    },
    parentTypeCode: null,
    sortBy: 1,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "CURRENCY",
    value: "currency",
    name: { en: "Currencies", ar: "العملات" },
    description: {
      en: "ISO 4217 currencies supported for pricing, billing, and payouts",
      ar: "العملات المعتمدة للتسعير والفوترة والتسويات المالية",
    },
    parentTypeCode: "COUNTRY",
    sortBy: 2,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "LANGUAGE",
    value: "language",
    name: { en: "Languages & Locales", ar: "اللغات" },
    description: {
      en: "Supported user interface and invoice languages",
      ar: "لغات واجهة المستخدم والفواتير المدعومة",
    },
    parentTypeCode: null,
    sortBy: 3,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "USER_ROLE",
    value: "user_role",
    name: { en: "User Roles", ar: "أدوار المستخدمين" },
    description: {
      en: "Platform actor roles across all web and mobile surfaces",
      ar: "أدوار المستخدمين عبر جميع تطبيقات الويب والموبايل",
    },
    parentTypeCode: null,
    sortBy: 4,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "ADMIN_SUB_ROLE",
    value: "admin_sub_role",
    name: { en: "Admin Sub-Roles", ar: "الأدوار الفرعية لإدارة المنصة" },
    description: {
      en: "Platform administration sub-roles (Super Admin, Operations, Finance)",
      ar: "الأدوار الفرعية لمسؤولي المنصة (مدير أعلى، عمليات، مالية)",
    },
    parentTypeCode: "USER_ROLE",
    sortBy: 5,
    isPublic: false,
    isSystem: true,
  },
  {
    code: "CLIENT_SURFACE",
    value: "client_surface",
    name: { en: "Client Surfaces", ar: "واجهات ومنصات الاستخدام" },
    description: {
      en: "Client application delivery surfaces (Web, Mobile, PWA)",
      ar: "قنوات ومنصات تشغيل التطبيقات (ويب، موبايل، تطبيق ويب تقدمي)",
    },
    parentTypeCode: null,
    sortBy: 6,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "PAYMENT_GATEWAY",
    value: "payment_gateway",
    name: { en: "Payment Gateways", ar: "بوابات الدفع الإلكتروني" },
    description: {
      en: "Supported payment processors for cards, wallets, and cash vouchers",
      ar: "مزودو خدمات الدفع الإلكتروني بالبطاقات والمحافظ وأكواد فوري",
    },
    parentTypeCode: null,
    sortBy: 7,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "PAYOUT_METHOD",
    value: "payout_method",
    name: { en: "Payout Methods", ar: "طرق تحويل المستحقات" },
    description: {
      en: "Supplier and organization settlement payout channels",
      ar: "وسائل تحويل المستحقات المالية للمنظمات والموردين",
    },
    parentTypeCode: null,
    sortBy: 8,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "ORG_PERMISSION_AREA",
    value: "org_permission_area",
    name: { en: "Organization Permission Areas", ar: "مجالات صلاحيات المنظمة" },
    description: {
      en: "Nine functional permission domains for organization employees",
      ar: "المجالات التسعة لصلاحيات موظفي المنظمات السياحية",
    },
    parentTypeCode: null,
    sortBy: 9,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "ORG_PERMISSION_LEVEL",
    value: "org_permission_level",
    name: { en: "Organization Permission Levels", ar: "مستويات صلاحيات الموظفين" },
    description: {
      en: "Access level granted per organization permission area",
      ar: "مستوى الصلاحية الممنوح للموظف في كل مجال",
    },
    parentTypeCode: "ORG_PERMISSION_AREA",
    sortBy: 10,
    isPublic: true,
    isSystem: true,
  },

  // 2. Onboarding & Supplier Lists
  {
    code: "APPLICATION_TYPE",
    value: "application_type",
    name: { en: "Supplier Application Types", ar: "أنواع طلبات انضمام الموردين" },
    description: {
      en: "Supplier onboarding application categories",
      ar: "فئات طلبات الانضمام للمنظمات والسائقين والمصورين",
    },
    parentTypeCode: null,
    sortBy: 11,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "APPLICATION_STATE",
    value: "application_state",
    name: { en: "Application Review States", ar: "حالات مراجعة طلبات الانضمام" },
    description: {
      en: "Lifecycle states for supplier onboarding applications (SRS 7.5)",
      ar: "مراحل دورة حياة مراجعة طلبات انضمام الموردين",
    },
    parentTypeCode: "APPLICATION_TYPE",
    sortBy: 12,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "DOCUMENT_TYPE",
    value: "document_type",
    name: { en: "Compliance Document Types", ar: "أنواع المستندات والوثائق الرسمية" },
    description: {
      en: "KYC, licensing, insurance, and compliance document types",
      ar: "أنواع مستندات التحقق والتراخيص والتأمين والامتثال",
    },
    parentTypeCode: null,
    sortBy: 13,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "CONSENT_TYPE",
    value: "consent_type",
    name: { en: "Legal Consent Types", ar: "أنواع الموافقات والإقرارات القانونية" },
    description: {
      en: "Signed legal and safety consent categories",
      ar: "فئات الموافقات القانونية وإقرارات السلامة وتحصيل البيانات",
    },
    parentTypeCode: null,
    sortBy: 14,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "APPLICATION_DECISION_REASON",
    value: "application_decision_reason",
    name: { en: "Application Decision Reasons", ar: "أسباب قرارات مراجعة الطلبات" },
    description: {
      en: "Standardized reason codes for approving, requesting changes, or rejecting applications",
      ar: "الأكواد المعيارية لأسباب قبول أو رفض أو طلب استكمال مستندات الانضمام",
    },
    parentTypeCode: "APPLICATION_STATE",
    sortBy: 15,
    isPublic: true,
    isSystem: true,
  },
  {
    code: "DRIVER_LICENSE_CATEGORY",
    value: "driver_license_category",
    name: { en: "Driver License Categories", ar: "درجات وفئات رخص القيادة" },
    description: {
      en: "Commercial and passenger transport driving license classifications",
      ar: "تصنيفات ودرجات رخص القيادة المهنية لنقل الركاب",
    },
    parentTypeCode: null,
    sortBy: 16,
    isPublic: true,
    isSystem: false,
  },
  {
    code: "SERVICE_REGION",
    value: "service_region",
    name: { en: "Service Regions & Governorates", ar: "المناطق والمحافظات السياحية" },
    description: {
      en: "Operating governorates, cities, and tourism destinations",
      ar: "المحافظات والمدن والوجهات السياحية المغطاة بالخدمة",
    },
    parentTypeCode: "COUNTRY",
    sortBy: 17,
    isPublic: true,
    isSystem: false,
  },
  {
    code: "CAMERA_BODY",
    value: "camera_body",
    name: { en: "Camera Bodies", ar: "طرازات الكاميرات الاحترافية" },
    description: {
      en: "Approved professional camera bodies for platform photographers",
      ar: "طرازات الكاميرات الاحترافية المعتمدة لمصوري المنصة",
    },
    parentTypeCode: null,
    sortBy: 18,
    isPublic: true,
    isSystem: false,
  },
  {
    code: "CAMERA_LENS",
    value: "camera_lens",
    name: { en: "Camera Lenses", ar: "عدسات التصوير الاحترافية" },
    description: {
      en: "Professional camera lenses for trip and portrait photography",
      ar: "العدسات الاحترافية لتغطية الرحلات والتصوير الخارجي",
    },
    parentTypeCode: "CAMERA_BODY",
    sortBy: 19,
    isPublic: true,
    isSystem: false,
  },
  {
    code: "PHOTOGRAPHER_SPECIALTY",
    value: "photographer_specialty",
    name: { en: "Photographer Specialties", ar: "تخصصات التصوير الفوتوغرافي" },
    description: {
      en: "Photography coverage styles and trip specialties",
      ar: "مجالات وتخصصات التصوير الفوتوغرافي للرحلات والفعاليات",
    },
    parentTypeCode: null,
    sortBy: 20,
    isPublic: true,
    isSystem: false,
  },

  // 3. Trip & Fleet Lists
  {
    code: "TRIP_CATEGORY",
    value: "trip_category",
    name: { en: "Trip Categories", ar: "تصنيفات الرحلات" },
    description: {
      en: "Categories of trips and tourism programs offered on the platform",
      ar: "فئات وتصنيفات الرحلات والبرامج السياحية المتاحة على المنصة",
    },
    parentTypeCode: null,
    sortBy: 21,
    isPublic: true,
    isSystem: false,
  },
  {
    code: "VEHICLE_TYPE",
    value: "vehicle_type",
    name: { en: "Vehicle Types", ar: "أنواع المركبات والحافلات" },
    description: {
      en: "Fleet vehicle classes and passenger transport capacities",
      ar: "فئات مركبات الأسطول السياحي وسعات الركاب",
    },
    parentTypeCode: null,
    sortBy: 22,
    isPublic: true,
    isSystem: false,
  },
  {
    code: "CANCELLATION_REASON",
    value: "cancellation_reason",
    name: { en: "Cancellation Reasons", ar: "أسباب إلغاء الحجوزات والرحلات" },
    description: {
      en: "Standardized reasons for booking or trip cancellation",
      ar: "الأسباب المعيارية لإلغاء الحجوزات أو الرحلات",
    },
    parentTypeCode: null,
    sortBy: 23,
    isPublic: true,
    isSystem: false,
  },
] as const;

export const DEFAULT_LOOKUPS: readonly LookupSeedDefinition[] = [
  // ==================== COUNTRY ====================
  {
    typeCode: "COUNTRY",
    code: "EG",
    value: "EG",
    name: { en: "Egypt", ar: "مصر" },
    description: { en: "Arab Republic of Egypt (Africa/Cairo)", ar: "جمهورية مصر العربية" },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "COUNTRY",
    code: "SA",
    value: "SA",
    name: { en: "Saudi Arabia", ar: "المملكة العربية السعودية" },
    description: { en: "Kingdom of Saudi Arabia (Asia/Riyadh)", ar: "المملكة العربية السعودية" },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "COUNTRY",
    code: "AE",
    value: "AE",
    name: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
    description: { en: "United Arab Emirates (Asia/Dubai)", ar: "الإمارات العربية المتحدة" },
    sortBy: 3,
    isPublic: true,
  },

  // ==================== CURRENCY (linked to COUNTRY) ====================
  {
    typeCode: "CURRENCY",
    code: "EGP",
    value: "EGP",
    name: { en: "Egyptian Pound (EGP)", ar: "جنيه مصري (EGP)" },
    description: { en: "Official currency of Egypt", ar: "العملة الرسمية لجمهورية مصر العربية" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "CURRENCY",
    code: "SAR",
    value: "SAR",
    name: { en: "Saudi Riyal (SAR)", ar: "ريال سعودي (SAR)" },
    description: {
      en: "Official currency of Saudi Arabia",
      ar: "العملة الرسمية للمملكة العربية السعودية",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "SA",
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "CURRENCY",
    code: "AED",
    value: "AED",
    name: { en: "UAE Dirham (AED)", ar: "درهم إماراتي (AED)" },
    description: {
      en: "Official currency of the United Arab Emirates",
      ar: "العملة الرسمية للإمارات العربية المتحدة",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "AE",
    sortBy: 3,
    isPublic: true,
  },

  // ==================== LANGUAGE ====================
  {
    typeCode: "LANGUAGE",
    code: "AR",
    value: "ar",
    name: { en: "Arabic", ar: "العربية" },
    description: { en: "Arabic (RTL)", ar: "اللغة العربية" },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "LANGUAGE",
    code: "EN",
    value: "en",
    name: { en: "English", ar: "الإنجليزية" },
    description: { en: "English (LTR)", ar: "اللغة الإنجليزية" },
    sortBy: 2,
    isPublic: true,
  },

  // ==================== USER_ROLE ====================
  {
    typeCode: "USER_ROLE",
    code: "TRAVELER",
    value: "traveler",
    name: { en: "Traveler", ar: "مسافر" },
    description: {
      en: "Discover and book trips, select seats, and access trip albums",
      ar: "استكشاف وحجز الرحلات واختيار المقاعد والوصول إلى ألبومات الصور",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "PARENT",
    value: "parent",
    name: { en: "Parent / Guardian", ar: "ولي أمر" },
    description: {
      en: "Track linked children on active trips with real-time safety updates",
      ar: "متابعة الأطفال المرتبطين في الرحلات النشطة مع تحديثات السلامة الفورية",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "PLATFORM_DRIVER",
    value: "platform_driver",
    name: { en: "Platform Driver", ar: "سائق مستقل على المنصة" },
    description: {
      en: "Independent driver available for organization trip negotiations and assignments",
      ar: "سائق مستقل متاح للتفاوض والتكليف برحلات المنظمات",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "ORG_DRIVER",
    value: "org_driver",
    name: { en: "Organization Driver", ar: "سائق تابع لمنظمة" },
    description: {
      en: "Driver onboarded directly by an organization for its own trips",
      ar: "سائق تم ضمه مباشرة بواسطة منظمة لتنفيذ رحلاتها الخاصة",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "PLATFORM_PHOTOGRAPHER",
    value: "platform_photographer",
    name: { en: "Platform Photographer", ar: "مصور مستقل على المنصة" },
    description: {
      en: "Independent photographer available for trip coverage and album delivery",
      ar: "مصور مستقل متاح لتغطية الرحلات وتسليم ألبومات الصور",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "ORG_PHOTOGRAPHER",
    value: "org_photographer",
    name: { en: "Organization Photographer", ar: "مصور تابع لمنظمة" },
    description: {
      en: "Photographer onboarded directly by an organization for its own trips",
      ar: "مصور تم ضمه مباشرة بواسطة منظمة لتغطية رحلاتها الخاصة",
    },
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "ORGANIZATION_OWNER",
    value: "organization_owner",
    name: { en: "Organization Owner", ar: "مالك منظمة سياحية" },
    description: {
      en: "Primary owner of a licensed trip organization with full tenant authority",
      ar: "المالك الرئيسي لمنظمة رحلات مرخصة بصلاحيات كاملة",
    },
    sortBy: 7,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "ORGANIZATION_EMPLOYEE",
    value: "organization_employee",
    name: { en: "Organization Employee", ar: "موظف منظمة" },
    description: {
      en: "Invited organization staff member with granular 9-area permissions",
      ar: "موظف مدعو في منظمة بصلاحيات مفصلة عبر 9 مجالات",
    },
    sortBy: 8,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "MODERATOR",
    value: "moderator",
    name: { en: "Vehicle Moderator", ar: "مشرف مركبة" },
    description: {
      en: "On-trip vehicle moderator scoped to a single assigned vehicle and trip",
      ar: "مشرف ميداني مخصص لمركبة ورحلة محددة",
    },
    sortBy: 9,
    isPublic: true,
  },
  {
    typeCode: "USER_ROLE",
    code: "ADMIN",
    value: "admin",
    name: { en: "Platform Admin", ar: "مسؤول المنصة" },
    description: {
      en: "Platform staff member with Super Admin, Operations, or Finance sub-role",
      ar: "عضو فريق إدارة المنصة بصلاحيات مدير أعلى أو عمليات أو مالية",
    },
    sortBy: 10,
    isPublic: false,
  },

  // ==================== ADMIN_SUB_ROLE ====================
  {
    typeCode: "ADMIN_SUB_ROLE",
    code: "SUPER_ADMIN",
    value: "super_admin",
    name: { en: "Super Admin", ar: "مدير النظام الأعلى" },
    description: {
      en: "Full platform administration, staff management, and system settings authority",
      ar: "صلاحيات الإدارة الكاملة للمنصة وإعدادات النظام والموظفين",
    },
    parentTypeCode: "USER_ROLE",
    parentLookupCode: "ADMIN",
    sortBy: 1,
    isPublic: false,
  },
  {
    typeCode: "ADMIN_SUB_ROLE",
    code: "OPERATIONS",
    value: "operations",
    name: { en: "Operations Admin", ar: "مدير العمليات" },
    description: {
      en: "Onboarding reviews, driver safety lab tests, and dispute moderation",
      ar: "مراجعة طلبات الانضمام وفحوصات السائقين وإدارة النزاعات",
    },
    parentTypeCode: "USER_ROLE",
    parentLookupCode: "ADMIN",
    sortBy: 2,
    isPublic: false,
  },
  {
    typeCode: "ADMIN_SUB_ROLE",
    code: "FINANCE",
    value: "finance",
    name: { en: "Finance Admin", ar: "المدير المالي" },
    description: {
      en: "Ledger reconciliation, payouts, refunds, and tax invoices",
      ar: "التسويات المالية والمدفوعات والمستردات والفواتير الضريبية",
    },
    parentTypeCode: "USER_ROLE",
    parentLookupCode: "ADMIN",
    sortBy: 3,
    isPublic: false,
  },

  // ==================== CLIENT_SURFACE ====================
  {
    typeCode: "CLIENT_SURFACE",
    code: "WEB",
    value: "web",
    name: { en: "Web Application", ar: "تطبيق الويب" },
    description: { en: "Responsive browser web application", ar: "تطبيق المتصفح المتجاوب" },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "CLIENT_SURFACE",
    code: "MOBILE",
    value: "mobile",
    name: { en: "Native Mobile App", ar: "تطبيق الهاتف الذكي" },
    description: { en: "Android and iOS mobile application", ar: "تطبيق أندرويد و iOS" },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "CLIENT_SURFACE",
    code: "PWA",
    value: "pwa",
    name: { en: "Progressive Web App (PWA)", ar: "تطبيق الويب التقدمي (PWA)" },
    description: {
      en: "Installable Progressive Web App for field operations",
      ar: "تطبيق ويب تقدمي قابل للتثبيت للعمليات الميدانية",
    },
    sortBy: 3,
    isPublic: true,
  },

  // ==================== PAYMENT_GATEWAY ====================
  {
    typeCode: "PAYMENT_GATEWAY",
    code: "STRIPE",
    value: "stripe",
    name: { en: "Stripe", ar: "سترايب (Stripe)" },
    description: {
      en: "International credit and debit card processing",
      ar: "بوابة الدفع بالبطاقات الائتمانية الدولية",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "PAYMENT_GATEWAY",
    code: "PAYMOB",
    value: "paymob",
    name: { en: "Paymob", ar: "باي موب (Paymob)" },
    description: {
      en: "Local cards and mobile wallets in MENA",
      ar: "بوابة الدفع بالبطاقات المحلية والمحافظ الإلكترونية",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "PAYMENT_GATEWAY",
    code: "FAWRY",
    value: "fawry",
    name: { en: "Fawry Reference Code", ar: "كود فوري المرجعي (Fawry)" },
    description: {
      en: "Cash voucher reference code payment at Fawry outlets",
      ar: "الدفع النقدي عبر الرقم المرجعي في منافذ فوري",
    },
    sortBy: 3,
    isPublic: true,
  },

  // ==================== PAYOUT_METHOD ====================
  {
    typeCode: "PAYOUT_METHOD",
    code: "BANK_TRANSFER",
    value: "bank_transfer",
    name: { en: "Bank Transfer (IBAN)", ar: "تحويل بنكي (IBAN)" },
    description: {
      en: "Direct settlement transfer to a verified corporate or personal IBAN",
      ar: "تحويل بنكي مباشر إلى رقم الحساب الدولي (IBAN)",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "PAYOUT_METHOD",
    code: "MOBILE_WALLET",
    value: "mobile_wallet",
    name: { en: "Mobile Wallet", ar: "محفظة إلكترونية للهاتف" },
    description: {
      en: "Instant payout to a verified mobile cash wallet",
      ar: "تحويل فوري إلى محفظة الهاتف المحمول المعتمدة",
    },
    sortBy: 2,
    isPublic: true,
  },

  // ==================== ORG_PERMISSION_AREA ====================
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "TRIPS",
    value: "trips",
    name: { en: "Trips & Programs", ar: "الرحلات والبرامج" },
    description: {
      en: "Create, edit, publish, and manage trips, programs, seats, and check-in",
      ar: "إنشاء وتعديل ونشر وإدارة الرحلات والبرامج والمقاعد وتسجيل الحضور",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "BOOKINGS",
    value: "bookings",
    name: { en: "Bookings & Refunds", ar: "الحجوزات والمستردات" },
    description: {
      en: "View traveler bookings, verify Fawry payments, and process cancellations",
      ar: "عرض حجوزات المسافرين والتحقق من مدفوعات فوري ومعالجة الإلغاءات",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "ACCOUNTING",
    value: "accounting",
    name: { en: "Accounting & Payouts", ar: "المحاسبة والمدفوعات" },
    description: {
      en: "Access financial ledger, revenue reports, invoices, and payout settlements",
      ar: "الوصول إلى دفتر الأستاذ المالي وتقارير الإيرادات والفواتير وتسويات المدفوعات",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "COUPONS",
    value: "coupons",
    name: { en: "Coupons & Promotions", ar: "الكوبونات والعروض" },
    description: {
      en: "Create, pause, and analyze promotional discount codes",
      ar: "إنشاء وإيقاف وتحليل أكواد الخصم الترويجية",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "EMPLOYEES",
    value: "employees",
    name: { en: "Employees & Access", ar: "الموظفون والصلاحيات" },
    description: {
      en: "Invite organization employees and manage their permission matrices",
      ar: "دعوة موظفي المنظمة وإدارة مصفوفة صلاحياتهم",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "FLEET",
    value: "fleet",
    name: { en: "Fleet & Suppliers", ar: "الأسطول والموردون" },
    description: {
      en: "Manage vehicles, org-owned drivers/photographers, and marketplace negotiations",
      ar: "إدارة المركبات والسائقين والمصورين التابعين للمنظمة ومفاوضات السوق",
    },
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "SUBSCRIPTION",
    value: "subscription",
    name: { en: "Subscription & Plan", ar: "الاشتراك والباقة" },
    description: {
      en: "Upgrade, downgrade, or manage organization subscription billing",
      ar: "ترقية أو تخفيض أو إدارة فواتير اشتراك المنظمة",
    },
    sortBy: 7,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "TRACKING",
    value: "tracking",
    name: { en: "Live Tracking & Safety", ar: "التتبع المباشر والسلامة" },
    description: {
      en: "Monitor live trip GPS feeds, child safety status, and moderator alerts",
      ar: "متابعة البث المباشر لمواقع الرحلات وحالة سلامة الأطفال وتنبيهات المشرفين",
    },
    sortBy: 8,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_AREA",
    code: "SETTINGS",
    value: "settings",
    name: { en: "Organization Settings", ar: "إعدادات المنظمة" },
    description: {
      en: "Configure organization profile, branding, timezone, contacts, and webhooks",
      ar: "ضبط ملف المنظمة والهوية البصرية والمنطقة الزمنية وجهات الاتصال والويب هوك",
    },
    sortBy: 9,
    isPublic: true,
  },

  // ==================== ORG_PERMISSION_LEVEL ====================
  {
    typeCode: "ORG_PERMISSION_LEVEL",
    code: "NONE",
    value: "none",
    name: { en: "No Access", ar: "بدون صلاحية" },
    description: { en: "Area is hidden and inaccessible", ar: "القسم مخفي وغير متاح للوصول" },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_LEVEL",
    code: "VIEW",
    value: "view",
    name: { en: "View Only", ar: "عرض فقط" },
    description: {
      en: "Read-only access without modification rights",
      ar: "صلاحية القراءة والعرض فقط",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "ORG_PERMISSION_LEVEL",
    code: "MANAGE",
    value: "manage",
    name: { en: "Full Manage", ar: "إدارة كاملة" },
    description: {
      en: "Full create, edit, and action authority in this area",
      ar: "صلاحية الإنشاء والتعديل والإدارة الكاملة في هذا القسم",
    },
    sortBy: 3,
    isPublic: true,
  },

  // ==================== APPLICATION_TYPE ====================
  {
    typeCode: "APPLICATION_TYPE",
    code: "ORGANIZATION",
    value: "organization",
    name: { en: "Tourism Organization Application", ar: "طلب انضمام منظمة سياحية" },
    description: {
      en: "Onboarding application for a licensed tourism company or organizer",
      ar: "طلب اعتماد وتسجيل شركة أو منظمة رحلات سياحية مرخصة",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_TYPE",
    code: "PLATFORM_DRIVER",
    value: "platform_driver",
    name: { en: "Platform Driver Application", ar: "طلب انضمام سائق مستقل" },
    description: {
      en: "Onboarding application for an independent commercial driver",
      ar: "طلب اعتماد سائق مستقل للعمل مع المنظمات عبر المنصة",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_TYPE",
    code: "PLATFORM_PHOTOGRAPHER",
    value: "platform_photographer",
    name: { en: "Platform Photographer Application", ar: "طلب انضمام مصور مستقل" },
    description: {
      en: "Onboarding application for an independent professional photographer",
      ar: "طلب اعتماد مصور محترف مستقل لتغطية الرحلات",
    },
    sortBy: 3,
    isPublic: true,
  },

  // ==================== APPLICATION_STATE ====================
  {
    typeCode: "APPLICATION_STATE",
    code: "SUBMITTED",
    value: "Submitted",
    name: { en: "Submitted", ar: "تم التقديم" },
    description: {
      en: "Application received and queued for initial verification",
      ar: "تم استلام الطلب وإدراجه في قائمة المراجعة",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_STATE",
    code: "PENDING_REVIEW",
    value: "Pending Review",
    name: { en: "Pending Review", ar: "قيد المراجعة" },
    description: {
      en: "Under active review by Platform Operations within the 2-working-day SLA",
      ar: "قيد الفحص والمراجعة من فريق العمليات خلال يومي عمل",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_STATE",
    code: "CHANGES_REQUESTED",
    value: "Changes Requested",
    name: { en: "Changes Requested", ar: "مطلوب استكمال أو تعديل" },
    description: {
      en: "Additional documents or corrections requested within 14 days",
      ar: "مطلوب تعديل البيانات أو إعادة رفع المستندات خلال 14 يوماً",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_STATE",
    code: "APPROVED",
    value: "Approved",
    name: { en: "Approved", ar: "تمت الموافقة" },
    description: {
      en: "Application approved and supplier account provisioned",
      ar: "تمت الموافقة على الطلب وتفعيل حساب المورد",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_STATE",
    code: "REJECTED",
    value: "Rejected",
    name: { en: "Rejected", ar: "مرفوض" },
    description: {
      en: "Application rejected with a 30-day re-application cooldown or appeal option",
      ar: "تم رفض الطلب مع إمكانية التظلم أو إعادة التقديم بعد 30 يوماً",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_STATE",
    code: "APPEALED",
    value: "Appealed",
    name: { en: "Appealed", ar: "تم تقديم تظلم" },
    description: {
      en: "Applicant submitted an appeal awaiting Operations decision",
      ar: "قدم المتقدم تظلماً مع مستندات داعمة بانتظار قرار المراجعة",
    },
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_STATE",
    code: "CLOSED",
    value: "Closed",
    name: { en: "Closed", ar: "مغلق" },
    description: {
      en: "Application closed after expired changes window or final appeal denial",
      ar: "تم إغلاق الطلب لانتهاء مهلة التعديل أو رفض التظلم النهائي",
    },
    sortBy: 7,
    isPublic: true,
  },

  // ==================== DOCUMENT_TYPE ====================
  {
    typeCode: "DOCUMENT_TYPE",
    code: "IDENTITY_AND_LICENSE_BUNDLE",
    value: "identity_and_license_bundle",
    name: { en: "Identity & License Bundle", ar: "ملف الهوية والتراخيص المجمع" },
    description: {
      en: "Combined onboarding verification document bundle",
      ar: "ملف المستندات والتراخيص الرسمية المجمع للتحقق",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "COMMERCIAL_REGISTRATION",
    value: "commercial_registration",
    name: { en: "Commercial Registration", ar: "السجل التجاري" },
    description: {
      en: "Official Commercial Registry extract",
      ar: "مستخرج رسمي حديث من السجل التجاري",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "TAX_CARD",
    value: "tax_card",
    name: { en: "Tax Card / Registration", ar: "البطاقة الضريبية" },
    description: {
      en: "Valid corporate tax registration certificate",
      ar: "شهادة التسجيل الضريبي أو البطاقة الضريبية السارية",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "TOURISM_LICENSE",
    value: "tourism_license",
    name: { en: "Ministry of Tourism License", ar: "ترخيص وزارة السياحة" },
    description: {
      en: "Unexpired tourism operating license",
      ar: "ترخيص مزاولة النشاط السياحي الساري",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "NATIONAL_ID",
    value: "national_id",
    name: { en: "National ID Card", ar: "بطاقة الرقم القومي / الهوية الوطنية" },
    description: {
      en: "Front and back scan of government-issued national ID",
      ar: "صورة الوجهين لبطاقة الرقم القومي أو الهوية الوطنية السارية",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "DRIVING_LICENSE",
    value: "driving_license",
    name: { en: "Commercial Driving License", ar: "رخصة القيادة المهنية" },
    description: {
      en: "Unexpired commercial passenger transport driving license",
      ar: "رخصة قيادة مهنية سارية لنقل الركاب",
    },
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "LAB_TEST_RESULT",
    value: "lab_test_result",
    name: { en: "Drug & Safety Lab Test Result", ar: "نتيجة التحليل الطبي وفحص المخدرات" },
    description: {
      en: "Accredited medical and drug screening report dated within 30 days",
      ar: "تقرير فحص طبي وتحليل مخدرات معتمد صادر خلال آخر 30 يوماً",
    },
    sortBy: 7,
    isPublic: true,
  },
  {
    typeCode: "DOCUMENT_TYPE",
    code: "VEHICLE_INSURANCE",
    value: "vehicle_insurance",
    name: { en: "Vehicle Insurance Policy", ar: "وثيقة تأمين المركبة" },
    description: {
      en: "Vehicle insurance policy valid for at least 6 months",
      ar: "وثيقة تأمين سارية على المركبة لمدة لا تقل عن 6 أشهر",
    },
    sortBy: 8,
    isPublic: true,
  },

  // ==================== CONSENT_TYPE ====================
  {
    typeCode: "CONSENT_TYPE",
    code: "DRIVER_LAB_TEST",
    value: "driver_lab_test",
    name: {
      en: "Driver Random Lab-Test Consent",
      ar: "إقرار الموافقة على التحليل العشوائي للسائق",
    },
    description: {
      en: "Mandatory consent for initial and random drug/safety lab testing (FR-ONB-08)",
      ar: "إقرار إلزامي بالموافقة على الفحص الطبي المبدئي والعشوائي للسلامة",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "CONSENT_TYPE",
    code: "CHILD_TRACKING_GUARDIAN",
    value: "child_tracking_guardian",
    name: { en: "Guardian Child-Tracking Consent", ar: "موافقة ولي الأمر على تتبع الطفل" },
    description: {
      en: "Explicit parent/guardian consent for live trip location tracking of a minor",
      ar: "موافقة صريحة من ولي الأمر لمتابعة الموقع المباشر للطفل أثناء الرحلة",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "CONSENT_TYPE",
    code: "TERMS_OF_SERVICE",
    value: "terms_of_service",
    name: { en: "Platform Terms of Service", ar: "شروط وأحكام استخدام المنصة" },
    description: {
      en: "Agreement to the Trips Enjoy platform terms and conditions",
      ar: "الموافقة على الشروط والأحكام العامة لمنصة رحلات",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "CONSENT_TYPE",
    code: "PRIVACY_POLICY",
    value: "privacy_policy",
    name: { en: "Privacy & Data Protection Policy", ar: "سياسة الخصوصية وحماية البيانات" },
    description: {
      en: "Acknowledgement of data handling and child data protection rules (CON-08)",
      ar: "الإقرار بسياسة الخصوصية وحماية بيانات المستخدمين والأطفال",
    },
    sortBy: 4,
    isPublic: true,
  },

  // ==================== APPLICATION_DECISION_REASON ====================
  {
    typeCode: "APPLICATION_DECISION_REASON",
    code: "VERIFIED_COMPLETE",
    value: "verified_complete",
    name: {
      en: "All Documents Verified & Complete",
      ar: "تم التحقق من اكتمال وصحة جميع المستندات",
    },
    description: {
      en: "All licenses, identity documents, and compliance checks passed",
      ar: "اجتياز كافة فحوصات التراخيص والهوية والامتثال بنجاح",
    },
    parentTypeCode: "APPLICATION_STATE",
    parentLookupCode: "APPROVED",
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_DECISION_REASON",
    code: "BLURRED_DOCUMENT",
    value: "blurred_document",
    name: { en: "Blurred or Unreadable Document Scan", ar: "صورة المستند غير واضحة أو غير مقروءة" },
    description: {
      en: "Uploaded document scan is low-resolution or cropped; re-upload required",
      ar: "المستند المرفوع غير واضح ويلزم إعادة رفعه بجودة عالية",
    },
    parentTypeCode: "APPLICATION_STATE",
    parentLookupCode: "CHANGES_REQUESTED",
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_DECISION_REASON",
    code: "INELIGIBLE_LICENSE_CLASS",
    value: "ineligible_license_class",
    name: { en: "Ineligible Driving License Class", ar: "درجة رخصة القيادة غير مؤهلة لنقل الركاب" },
    description: {
      en: "Submitted license is private-car only rather than commercial passenger transport",
      ar: "رخصة القيادة المقدمة ملاكي وليست رخصة مهنية لنقل الركاب",
    },
    parentTypeCode: "APPLICATION_STATE",
    parentLookupCode: "REJECTED",
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_DECISION_REASON",
    code: "PORTFOLIO_QUALITY",
    value: "portfolio_quality",
    name: { en: "Portfolio Quality Below Standard", ar: "نماذج الأعمال لا تستوفي معايير الجودة" },
    description: {
      en: "Submitted portfolio lacks required outdoor trip lighting and composition quality",
      ar: "نماذج الصور المقدمة تحتاج إلى أمثلة أوضح لتغطية الرحلات الخارجية",
    },
    parentTypeCode: "APPLICATION_STATE",
    parentLookupCode: "APPEALED",
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "APPLICATION_DECISION_REASON",
    code: "CHANGES_WINDOW_EXPIRED",
    value: "changes_window_expired",
    name: { en: "14-Day Changes Window Expired", ar: "انتهاء مهلة الـ 14 يوماً لاستكمال التعديلات" },
    description: {
      en: "Application closed automatically after 14 days without applicant response",
      ar: "أُغلق الطلب تلقائياً لعدم استكمال التعديلات المطلوبة خلال المهلة المحددة",
    },
    parentTypeCode: "APPLICATION_STATE",
    parentLookupCode: "CLOSED",
    sortBy: 5,
    isPublic: true,
  },

  // ==================== DRIVER_LICENSE_CATEGORY ====================
  {
    typeCode: "DRIVER_LICENSE_CATEGORY",
    code: "FIRST_DEGREE_BUS",
    value: "First Degree Bus",
    name: { en: "First Degree Bus", ar: "رخصة مهنية درجة أولى - أتوبيس سياحي" },
    description: {
      en: "Commercial First Degree license for full-size coaches and tour buses",
      ar: "رخصة قيادة مهنية درجة أولى للحافلات والأتوبيسات السياحية",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "DRIVER_LICENSE_CATEGORY",
    code: "FIRST_DEGREE_HEAVY_BUS",
    value: "First Degree Heavy Bus",
    name: { en: "First Degree Heavy Bus", ar: "رخصة مهنية درجة أولى - حافلات ثقيلة" },
    description: {
      en: "Commercial First Degree license for heavy long-distance passenger coaches",
      ar: "رخصة قيادة مهنية درجة أولى للحافلات الثقيلة والسفر الطويل",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "DRIVER_LICENSE_CATEGORY",
    code: "SECOND_DEGREE_COASTER",
    value: "Second Degree Coaster",
    name: { en: "Second Degree Coaster", ar: "رخصة مهنية درجة ثانية - كوستر وميني باص" },
    description: {
      en: "Commercial Second Degree license for mid-size Coasters and minibuses",
      ar: "رخصة قيادة مهنية درجة ثانية لمركبات الكوستر والميني باص",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "DRIVER_LICENSE_CATEGORY",
    code: "THIRD_DEGREE_VAN",
    value: "Third Degree Van",
    name: { en: "Third Degree Passenger Van", ar: "رخصة مهنية درجة ثالثة - فان وميكروباص" },
    description: {
      en: "Commercial Third Degree license for HiAce vans and shuttle vehicles",
      ar: "رخصة قيادة مهنية درجة ثالثة لمركبات الفان والهاي إيس",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "DRIVER_LICENSE_CATEGORY",
    code: "PRIVATE_CAR_ONLY",
    value: "Private Car Only",
    name: { en: "Private Car Only", ar: "رخصة قيادة خاصة (ملاكي فقط)" },
    description: {
      en: "Non-commercial private passenger vehicle license",
      ar: "رخصة قيادة خاصة غير مهنية",
    },
    sortBy: 5,
    isPublic: true,
  },

  // ==================== SERVICE_REGION (linked to COUNTRY) ====================
  {
    typeCode: "SERVICE_REGION",
    code: "CAIRO",
    value: "Cairo",
    name: { en: "Cairo", ar: "القاهرة" },
    description: { en: "Greater Cairo Governorate", ar: "محافظة القاهرة الكبرى" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "GIZA",
    value: "Giza",
    name: { en: "Giza", ar: "الجيزة" },
    description: { en: "Giza, Pyramids, and October City", ar: "محافظة الجيزة والأهرامات" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "ALEXANDRIA",
    value: "Alexandria",
    name: { en: "Alexandria", ar: "الإسكندرية" },
    description: { en: "Alexandria and Mediterranean Coast", ar: "محافظة الإسكندرية والساحل" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "LUXOR",
    value: "Luxor",
    name: { en: "Luxor", ar: "الأقصر" },
    description: { en: "Luxor & Ancient Thebes", ar: "محافظة الأقصر والمعابد الأثرية" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "ASWAN",
    value: "Aswan",
    name: { en: "Aswan", ar: "أسوان" },
    description: { en: "Aswan, Nubia, and Abu Simbel", ar: "محافظة أسوان والنوبة وأبو سمبل" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "RED_SEA",
    value: "Red Sea",
    name: { en: "Red Sea (Hurghada & Marsa Alam)", ar: "البحر الأحمر (الغردقة ومرسى علم)" },
    description: {
      en: "Hurghada, El Gouna, Safaga, and Marsa Alam",
      ar: "الغردقة والجونة وسفاجا ومرسى علم",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "SOUTH_SINAI",
    value: "South Sinai",
    name: { en: "South Sinai (Sharm & Dahab)", ar: "جنوب سيناء (شرم الشيخ ودهب)" },
    description: {
      en: "Sharm El-Sheikh, Dahab, Nuweiba, Taba, and St. Catherine",
      ar: "شرم الشيخ ودهب ونويبع وطابا وسانت كاترين",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 7,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "AIN_SOKHNA",
    value: "Ain Sokhna",
    name: { en: "Ain Sokhna & Galala", ar: "العين السخنة والجلالة" },
    description: {
      en: "Suez Gulf resorts and Galala Plateau",
      ar: "منتجعات العين السخنة وهضبة الجلالة",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 8,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "SIWA",
    value: "Siwa",
    name: { en: "Siwa Oasis", ar: "واحة سيوة" },
    description: { en: "Siwa Oasis and Western Desert", ar: "واحة سيوة والصحراء الغربية" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 9,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "MATROUH",
    value: "Matrouh",
    name: { en: "Marsa Matrouh & North Coast", ar: "مرسى مطروح والساحل الشمالي" },
    description: {
      en: "Marsa Matrouh, Alamein, and North Coast",
      ar: "مرسى مطروح والعلمين والساحل الشمالي",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 10,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "FAYOUM",
    value: "Fayoum",
    name: { en: "Fayoum & Wadi El-Rayan", ar: "الفيوم ووادي الريان" },
    description: {
      en: "Fayoum Oasis, Tunis Village, and Wadi El-Hitan",
      ar: "واحة الفيوم وقرية تونس ووادي الحيتان",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "EG",
    sortBy: 11,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "RIYADH",
    value: "Riyadh",
    name: { en: "Riyadh", ar: "الرياض" },
    description: {
      en: "Riyadh Province, Saudi Arabia",
      ar: "منطقة الرياض - المملكة العربية السعودية",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "SA",
    sortBy: 12,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "JEDDAH",
    value: "Jeddah",
    name: { en: "Jeddah & Makkah Region", ar: "جدة ومنطقة مكة المكرمة" },
    description: {
      en: "Jeddah and Red Sea Coast, Saudi Arabia",
      ar: "جدة وساحل البحر الأحمر - السعودية",
    },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "SA",
    sortBy: 13,
    isPublic: true,
  },
  {
    typeCode: "SERVICE_REGION",
    code: "DUBAI",
    value: "Dubai",
    name: { en: "Dubai", ar: "دبي" },
    description: { en: "Emirate of Dubai, UAE", ar: "إمارة دبي - الإمارات العربية المتحدة" },
    parentTypeCode: "COUNTRY",
    parentLookupCode: "AE",
    sortBy: 14,
    isPublic: true,
  },

  // ==================== CAMERA_BODY ====================
  {
    typeCode: "CAMERA_BODY",
    code: "SONY_A7_IV",
    value: "Sony A7 IV",
    name: { en: "Sony A7 IV", ar: "سوني Sony A7 IV" },
    description: {
      en: "Full-frame hybrid mirrorless camera (33MP)",
      ar: "كاميرا سوني فل فريم 33 ميجابكسل",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_BODY",
    code: "SONY_A7R_V",
    value: "Sony A7R V",
    name: { en: "Sony A7R V", ar: "سوني Sony A7R V" },
    description: {
      en: "High-resolution full-frame mirrorless (61MP)",
      ar: "كاميرا سوني عالية الدقة 61 ميجابكسل",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_BODY",
    code: "SONY_A7C_II",
    value: "Sony A7C II",
    name: { en: "Sony A7C II", ar: "سوني Sony A7C II" },
    description: {
      en: "Compact full-frame travel mirrorless camera",
      ar: "كاميرا سوني فل فريم مدمجة للرحلات",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_BODY",
    code: "CANON_EOS_R5",
    value: "Canon EOS R5",
    name: { en: "Canon EOS R5", ar: "كانون Canon EOS R5" },
    description: {
      en: "Professional full-frame mirrorless (45MP)",
      ar: "كاميرا كانون الاحترافية 45 ميجابكسل",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_BODY",
    code: "CANON_EOS_R6_MARK_II",
    value: "Canon EOS R6 Mark II",
    name: { en: "Canon EOS R6 Mark II", ar: "كانون Canon EOS R6 Mark II" },
    description: {
      en: "Fast action & outdoor full-frame mirrorless",
      ar: "كاميرا كانون السريعة للتغطيات الخارجية",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_BODY",
    code: "NIKON_Z8",
    value: "Nikon Z8",
    name: { en: "Nikon Z8", ar: "نيكون Nikon Z8" },
    description: {
      en: "Flagship-class stacked CMOS mirrorless (45.7MP)",
      ar: "كاميرا نيكون الاحترافية Z8",
    },
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_BODY",
    code: "NIKON_Z9",
    value: "Nikon Z9",
    name: { en: "Nikon Z9", ar: "نيكون Nikon Z9" },
    description: {
      en: "Pro flagship mirrorless body for outdoor & wildlife",
      ar: "كاميرا نيكون الفئة العليا Z9",
    },
    sortBy: 7,
    isPublic: true,
  },

  // ==================== CAMERA_LENS ====================
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_24_70_F28_GM_II",
    value: "24-70mm f/2.8 GM II",
    name: { en: "24-70mm f/2.8 GM II", ar: "عدسة 24-70mm f/2.8 GM II" },
    description: { en: "Standard professional zoom lens", ar: "عدسة زووم قياسية احترافية" },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "SONY_A7_IV",
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_70_200_F28_GM_II",
    value: "70-200mm f/2.8 GM II",
    name: { en: "70-200mm f/2.8 GM II", ar: "عدسة 70-200mm f/2.8 GM II" },
    description: {
      en: "Telephoto zoom lens for outdoor action and portraits",
      ar: "عدسة تليفوتو للتغطيات الخارجية والبورتريه",
    },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "SONY_A7R_V",
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_35_F14_GM",
    value: "35mm f/1.4 GM",
    name: { en: "35mm f/1.4 GM", ar: "عدسة 35mm f/1.4 GM" },
    description: {
      en: "Wide prime lens for travel storytelling",
      ar: "عدسة برايم واسعة لتوثيق الرحلات",
    },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "SONY_A7C_II",
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_85_F18",
    value: "85mm f/1.8",
    name: { en: "85mm f/1.8", ar: "عدسة 85mm f/1.8" },
    description: { en: "Portrait prime lens", ar: "عدسة بورتريه احترافية" },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "SONY_A7C_II",
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_24_105_F4L",
    value: "24-105mm f/4L",
    name: { en: "24-105mm f/4L", ar: "عدسة 24-105mm f/4L" },
    description: { en: "Versatile all-day travel zoom lens", ar: "عدسة زووم شاملة للرحلات اليومية" },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "CANON_EOS_R6_MARK_II",
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_50_F18",
    value: "50mm f/1.8",
    name: { en: "50mm f/1.8", ar: "عدسة 50mm f/1.8" },
    description: { en: "Standard prime lens", ar: "عدسة برايم قياسية" },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "CANON_EOS_R6_MARK_II",
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_14_24_F28",
    value: "14-24mm f/2.8",
    name: { en: "14-24mm f/2.8", ar: "عدسة 14-24mm f/2.8" },
    description: {
      en: "Ultra-wide landscape & architecture zoom",
      ar: "عدسة فائقة الاتساع للمناظر الطبيعية والمعالم",
    },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "NIKON_Z8",
    sortBy: 7,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_24_70_F28",
    value: "24-70mm f/2.8",
    name: { en: "24-70mm f/2.8", ar: "عدسة 24-70mm f/2.8" },
    description: { en: "Pro standard zoom", ar: "عدسة زووم احترافية" },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "NIKON_Z8",
    sortBy: 8,
    isPublic: true,
  },
  {
    typeCode: "CAMERA_LENS",
    code: "LENS_70_200_F28",
    value: "70-200mm f/2.8",
    name: { en: "70-200mm f/2.8", ar: "عدسة 70-200mm f/2.8" },
    description: { en: "Pro telephoto zoom", ar: "عدسة تليفوتو احترافية" },
    parentTypeCode: "CAMERA_BODY",
    parentLookupCode: "NIKON_Z9",
    sortBy: 9,
    isPublic: true,
  },

  // ==================== PHOTOGRAPHER_SPECIALTY ====================
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "DESERT_SAFARIS",
    value: "Desert Safaris",
    name: { en: "Desert Safaris", ar: "رحلات السفاري والتخييم الصحراوي" },
    description: {
      en: "Dune adventures, oasis expeditions, and starry campfires",
      ar: "تصوير رحلات السفاري والواحات والصحراء",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "MARINE_DIVING",
    value: "Marine & Diving",
    name: { en: "Marine & Diving", ar: "الرحلات البحرية والغوص" },
    description: {
      en: "Yacht cruises, snorkeling, and underwater reef photography",
      ar: "تصوير اليخوت والأنشطة البحرية والشعاب المرجانية",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "FAMILY_PORTRAITS",
    value: "Family Portraits",
    name: { en: "Family Portraits", ar: "التصوير العائلي والبورتريه" },
    description: {
      en: "Candid and posed family vacation moments",
      ar: "توثيق اللحظات العائلية والصور التذكارية",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "CULTURAL_HERITAGE",
    value: "Cultural Heritage",
    name: { en: "Cultural Heritage", ar: "المعالم الأثرية والتراث الثقافي" },
    description: {
      en: "Temples, museums, and historical landmarks coverage",
      ar: "تصوير المعابد والمتاحف والمزارات التاريخية",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "DAY_TRIPS",
    value: "Day Trips",
    name: { en: "Day Trips", ar: "رحلات اليوم الواحد" },
    description: {
      en: "Fast-paced single-day excursion coverage",
      ar: "التغطية المصورة السريعة لرحلات اليوم الواحد",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "LUXURY_CRUISES",
    value: "Luxury Cruises",
    name: { en: "Luxury Cruises", ar: "الرحلات النيلية والبحرية الفاخرة" },
    description: {
      en: "Multi-day Nile cruise and luxury hospitality photography",
      ar: "تصوير البواخر النيلية والرحلات الفاخرة",
    },
    sortBy: 6,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "AERIAL_LANDSCAPES",
    value: "Aerial Landscapes",
    name: { en: "Aerial Landscapes", ar: "التصوير الجوي بالدرون" },
    description: {
      en: "Licensed drone aerial and landscape perspectives",
      ar: "التصوير الجوي للمناظر الطبيعية والرحلات",
    },
    sortBy: 7,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "EVENTS",
    value: "Events",
    name: { en: "Events & Retreats", ar: "الفعاليات ومؤتمرات الشركات" },
    description: {
      en: "Corporate retreats and group event documentary",
      ar: "توثيق فعاليات الشركات والمجموعات",
    },
    sortBy: 8,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "GROUP_TRIPS",
    value: "Group Trips",
    name: { en: "Group Trips", ar: "الرحلات الجماعية" },
    description: { en: "Large group tour coverage", ar: "تغطية المجموعات السياحية الكبيرة" },
    sortBy: 9,
    isPublic: true,
  },
  {
    typeCode: "PHOTOGRAPHER_SPECIALTY",
    code: "KIDS_SCHOOL_TRIPS",
    value: "Kids & School Trips",
    name: { en: "Kids & School Trips", ar: "الرحلات المدرسية ورحلات الأطفال" },
    description: {
      en: "Child-safe school and youth camp photography",
      ar: "تغطية الرحلات المدرسية والأنشطة الطلابية",
    },
    sortBy: 10,
    isPublic: true,
  },

  // ==================== TRIP_CATEGORY ====================
  {
    typeCode: "TRIP_CATEGORY",
    code: "DAY_EXCURSION",
    value: "day_excursion",
    name: { en: "Day Excursion", ar: "رحلة يوم واحد" },
    description: {
      en: "Single-day guided excursion with same-day return",
      ar: "رحلة سياحية ليوم واحد شاملة الذهاب والعودة",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "TRIP_CATEGORY",
    code: "MULTI_DAY_TOUR",
    value: "multi_day_tour",
    name: { en: "Multi-Day Tour Package", ar: "برنامج سياحي متعدد الأيام" },
    description: {
      en: "Multi-day itinerary with accommodation and daily programs",
      ar: "برنامج سياحي متكامل لعدة أيام شامل الإقامة والمزارات",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "TRIP_CATEGORY",
    code: "SCHOOL_EDUCATIONAL",
    value: "school_educational",
    name: { en: "School & Educational Trip", ar: "رحلة مدرسية وتعليمية" },
    description: {
      en: "Supervised educational trip with live parent tracking and vehicle moderators",
      ar: "رحلة مدرسية بإشراف كامل وتتبع مباشر لأولياء الأمور",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "TRIP_CATEGORY",
    code: "DESERT_SAFARI_CAMP",
    value: "desert_safari_camp",
    name: { en: "Desert Safari & Camping", ar: "سفاري وتخييم صحراوي" },
    description: {
      en: "4x4 desert expedition and oasis camping",
      ar: "مغامرات السفاري والتخييم في الواحات والصحراء",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "TRIP_CATEGORY",
    code: "NILE_AND_SEA_CRUISE",
    value: "nile_and_sea_cruise",
    name: { en: "Nile & Red Sea Cruise", ar: "رحلة بحرية أو كروز نيلي" },
    description: {
      en: "Yacht sea trip or Luxor-Aswan Nile cruise",
      ar: "رحلات اليخوت البحرية والبواخر النيلية",
    },
    sortBy: 5,
    isPublic: true,
  },
  {
    typeCode: "TRIP_CATEGORY",
    code: "CORPORATE_RETREAT",
    value: "corporate_retreat",
    name: { en: "Corporate Retreat & Team Building", ar: "رحلات الشركات وبناء الفرق" },
    description: {
      en: "B2B corporate events, conferences, and staff retreats",
      ar: "رحلات وفعاليات الشركات والمؤسسات",
    },
    sortBy: 6,
    isPublic: true,
  },

  // ==================== VEHICLE_TYPE ====================
  {
    typeCode: "VEHICLE_TYPE",
    code: "LUXURY_COACH_49",
    value: "Mercedes-Benz Tourismo",
    name: { en: "Luxury Tour Coach (49 Seats)", ar: "أتوبيس سياحي فاخر (49 مقعداً)" },
    description: {
      en: "Full-size air-conditioned tour coach (e.g. Mercedes-Benz Tourismo / MCV)",
      ar: "حافلة سياحية كبيرة مكيفة للمسافات الطويلة (49 مقعداً)",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "VEHICLE_TYPE",
    code: "COASTER_MINIBUS_28",
    value: "Toyota Coaster 2025",
    name: { en: "Toyota Coaster Minibus (25-28 Seats)", ar: "ميني باص تويوتا كوستر (25-28 مقعداً)" },
    description: {
      en: "Mid-size tourist minibus ideal for group excursions",
      ar: "ميني باص سياحي متوسط مثالي للرحلات الجماعية",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "VEHICLE_TYPE",
    code: "HIACE_PASSENGER_VAN_14",
    value: "Toyota HiAce Van",
    name: { en: "Passenger Van (13-15 Seats)", ar: "فان سياحي هاي إيس (13-15 مقعداً)" },
    description: {
      en: "Comfortable passenger van for small groups and transfers",
      ar: "مركبة فان سياحية مريحة للمجموعات الصغيرة والتنقلات",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "VEHICLE_TYPE",
    code: "SAFARI_4X4_LAND_CRUISER",
    value: "Toyota Land Cruiser 4x4",
    name: { en: "Desert Safari 4x4 SUV (6-7 Seats)", ar: "سيارة دفع رباعي سفاري 4x4 (6-7 مقاعد)" },
    description: {
      en: "Off-road 4x4 vehicle equipped for desert and oasis terrain",
      ar: "سيارة دفع رباعي مجهزة لرحلات السفاري والواحات",
    },
    sortBy: 4,
    isPublic: true,
  },

  // ==================== CANCELLATION_REASON ====================
  {
    typeCode: "CANCELLATION_REASON",
    code: "SCHEDULE_CHANGE",
    value: "schedule_change",
    name: { en: "Personal Schedule Change", ar: "تغيير في المواعيد الشخصية" },
    description: {
      en: "Traveler schedule conflict before departure",
      ar: "تعارض في مواعيد المسافر قبل موعد الانطلاق",
    },
    sortBy: 1,
    isPublic: true,
  },
  {
    typeCode: "CANCELLATION_REASON",
    code: "WEATHER_CONDITIONS",
    value: "weather_conditions",
    name: { en: "Severe Weather or Road Closure", ar: "سوء الأحوال الجوية أو إغلاق الطرق" },
    description: {
      en: "Force majeure weather or safety advisory",
      ar: "ظروف جوية طارئة أو تعليمات سلامة الطرق",
    },
    sortBy: 2,
    isPublic: true,
  },
  {
    typeCode: "CANCELLATION_REASON",
    code: "MINIMUM_PASSENGERS_NOT_MET",
    value: "minimum_passengers_not_met",
    name: { en: "Minimum Group Size Not Reached", ar: "عدم اكتمال الحد الأدنى لعدد المشتركين" },
    description: {
      en: "Trip cancelled by organizer due to low occupancy",
      ar: "إلغاء الرحلة من قِبل المنظم لعدم اكتمال العدد",
    },
    sortBy: 3,
    isPublic: true,
  },
  {
    typeCode: "CANCELLATION_REASON",
    code: "MEDICAL_OR_EMERGENCY",
    value: "medical_or_emergency",
    name: { en: "Medical or Family Emergency", ar: "ظرف طبي أو عائلي طارئ" },
    description: {
      en: "Unexpected medical or family emergency",
      ar: "حالة طبية أو ظرف عائلي طارئ",
    },
    sortBy: 4,
    isPublic: true,
  },
  {
    typeCode: "CANCELLATION_REASON",
    code: "DUPLICATE_BOOKING",
    value: "duplicate_booking",
    name: { en: "Accidental Duplicate Booking", ar: "حجز مكرر بالخطأ" },
    description: {
      en: "Duplicate booking created for the same trip",
      ar: "تم إنشاء حجز مكرر لنفس الرحلة بالخطأ",
    },
    sortBy: 5,
    isPublic: true,
  },
] as const;

export function normalizeLookupCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

export function localizeLookupText(
  text: LookupLocalizedText | null | undefined,
  locale: SupportedLocale = "ar",
): string {
  if (!text) return "";
  return locale === "en" ? text.en || text.ar : text.ar || text.en;
}

export function getStaticLookupTypeByCode(typeCode: string): LookupTypeSeedDefinition | undefined {
  const normalized = normalizeLookupCode(typeCode);
  return DEFAULT_LOOKUP_TYPES.find((t) => normalizeLookupCode(t.code) === normalized);
}

export function getStaticLookupsByTypeCode(
  typeCode: string,
  options?: {
    parentLookupCode?: string | null;
    onlyPublic?: boolean;
  },
): LookupSeedDefinition[] {
  const normalizedType = normalizeLookupCode(typeCode);
  const normalizedParent = options?.parentLookupCode
    ? normalizeLookupCode(options.parentLookupCode)
    : undefined;

  return DEFAULT_LOOKUPS.filter((item) => {
    if (normalizeLookupCode(item.typeCode) !== normalizedType) return false;
    if (options?.onlyPublic && !item.isPublic) return false;
    if (
      normalizedParent !== undefined &&
      normalizeLookupCode(item.parentLookupCode ?? "") !== normalizedParent
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => a.sortBy - b.sortBy);
}

export function getStaticLookupByCode(
  code: string,
  typeCode?: string,
): LookupSeedDefinition | undefined {
  const normalizedCode = normalizeLookupCode(code);
  const normalizedType = typeCode ? normalizeLookupCode(typeCode) : undefined;

  return DEFAULT_LOOKUPS.find((item) => {
    const codeMatch =
      normalizeLookupCode(item.code) === normalizedCode ||
      item.value.toLowerCase() === code.trim().toLowerCase();
    if (!codeMatch) return false;
    if (normalizedType && normalizeLookupCode(item.typeCode) !== normalizedType) {
      return false;
    }
    return true;
  });
}

export function getStaticLookupValuesByTypeCode(
  typeCode: string,
  options?: {
    parentLookupCode?: string | null;
    codes?: readonly string[];
  },
): string[] {
  const items = getStaticLookupsByTypeCode(typeCode, {
    parentLookupCode: options?.parentLookupCode,
  });
  if (!options?.codes || options.codes.length === 0) {
    return items.map((item) => item.value);
  }
  const byCode = new Map(items.map((item) => [normalizeLookupCode(item.code), item.value]));
  return options.codes
    .map((c) => byCode.get(normalizeLookupCode(c)))
    .filter((v): v is string => v !== undefined);
}
