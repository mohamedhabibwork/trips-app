package com.tripsenjoy.screens.shared

import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.shared.common.SharedScreenId
import com.tripsenjoy.screens.shared.documents.DocumentAndPhotoUpload
import com.tripsenjoy.screens.shared.documents.ReceiptAndInvoiceView
import com.tripsenjoy.screens.shared.forms.OtpEntry
import com.tripsenjoy.screens.shared.forms.SeatMap
import com.tripsenjoy.screens.shared.prompts.ConfirmationDialog
import com.tripsenjoy.screens.shared.prompts.OfflineBanner
import com.tripsenjoy.screens.shared.prompts.PlanLimitUpgradePrompt
import com.tripsenjoy.screens.shared.settings.LanguageSwitchAndRtl
import com.tripsenjoy.screens.shared.settings.NotificationCentre
import com.tripsenjoy.screens.shared.settings.RoleAndOrganizationSwitcher
import com.tripsenjoy.screens.shared.states.MaintenancePage
import com.tripsenjoy.screens.shared.states.NotFound404
import com.tripsenjoy.screens.shared.states.PermissionDenied403
import com.tripsenjoy.screens.shared.states.ServerError500
import com.tripsenjoy.screens.shared.states.ServiceUnavailable503
import com.tripsenjoy.screens.shared.states.Unauthorized401

// The 16 shared screens (docs/screens/08-shared-components-and-states.md), in ID order.
// Titles are the spec headings. Each composable is named after its heading in PascalCase.
val SHARED_SCREENS: List<ScreenEntry> = listOf(
    ScreenEntry(
        id = SharedScreenId.PLAN_LIMIT_PROMPT,
        title = "Plan-limit upgrade prompt",
        content = { PlanLimitUpgradePrompt() },
    ),
    ScreenEntry(id = SharedScreenId.PERMISSION_DENIED, title = "Permission denied (403)", content = { PermissionDenied403() }),
    ScreenEntry(id = SharedScreenId.NOT_FOUND, title = "Not found (404)", content = { NotFound404() }),
    ScreenEntry(id = SharedScreenId.UNAUTHORIZED, title = "Unauthorized (401)", content = { Unauthorized401() }),
    ScreenEntry(id = SharedScreenId.SERVER_ERROR, title = "Server error (500)", content = { ServerError500() }),
    ScreenEntry(
        id = SharedScreenId.SERVICE_UNAVAILABLE,
        title = "Service unavailable (503)",
        content = { ServiceUnavailable503() },
    ),
    ScreenEntry(id = SharedScreenId.MAINTENANCE, title = "Maintenance page", content = { MaintenancePage() }),
    ScreenEntry(id = SharedScreenId.OFFLINE_BANNER, title = "Offline banner", content = { OfflineBanner() }),
    ScreenEntry(
        id = SharedScreenId.CONFIRMATION_DIALOG,
        title = "Confirmation dialog",
        content = { ConfirmationDialog() },
    ),
    ScreenEntry(
        id = SharedScreenId.LANGUAGE_RTL,
        title = "Language switch and RTL",
        content = { LanguageSwitchAndRtl() },
    ),
    ScreenEntry(
        id = SharedScreenId.NOTIFICATION_CENTRE,
        title = "Notification centre",
        content = { NotificationCentre() },
    ),
    ScreenEntry(
        id = SharedScreenId.RECEIPT_INVOICE,
        title = "Receipt and invoice view",
        content = { ReceiptAndInvoiceView() },
    ),
    ScreenEntry(
        id = SharedScreenId.ROLE_ORG_SWITCHER,
        title = "Role and organization switcher",
        content = { RoleAndOrganizationSwitcher() },
    ),
    ScreenEntry(id = SharedScreenId.OTP_ENTRY, title = "OTP entry", content = { OtpEntry() }),
    ScreenEntry(id = SharedScreenId.SEAT_MAP, title = "Seat map", content = { SeatMap() }),
    ScreenEntry(
        id = SharedScreenId.DOCUMENT_UPLOAD,
        title = "Document and photo upload",
        content = { DocumentAndPhotoUpload() },
    ),
)
