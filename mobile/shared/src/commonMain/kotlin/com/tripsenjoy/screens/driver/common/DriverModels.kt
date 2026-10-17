package com.tripsenjoy.screens.driver.common

import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.OfferStatus

private const val MAX_SEATS = 60
private const val YEAR_DIGITS = 4

// Plan limits (SCR-DRV-11). A null limit means unlimited.
internal enum class DrvPlan(val label: String, val bookingLimit: Int?, val couponLimit: Int?) {
    Basic(label = "Basic", bookingLimit = 3, couponLimit = 3),
    Professional(label = "Professional", bookingLimit = 10, couponLimit = 10),
    Premium(label = "Premium", bookingLimit = null, couponLimit = null),
}

internal fun limitWord(limit: Int?): String = limit?.toString() ?: "Unlimited"

internal enum class DrvRunState(val word: String) {
    Assigned("Assigned"),
    InProgress("In progress"),
    Ended("Ended"),
}

internal fun DrvRunState.tone(): BadgeTone = when (this) {
    DrvRunState.Assigned -> BadgeTone.Neutral
    DrvRunState.InProgress -> BadgeTone.Accent
    DrvRunState.Ended -> BadgeTone.Success
}

internal data class DrvOffer(
    val id: String,
    val tripName: String,
    val route: String,
    val date: String,
    val organization: String,
    val amountMinor: Long,
    val currencyCode: String,
    val status: OfferStatus,
    val expires: String,
    val receivedAt: String,
    val counterMinor: Long? = null,
)

internal data class DrvAssignment(
    val tripName: String,
    val route: String,
    val departure: String,
    val vehicle: String,
    val source: String,
    val organization: String,
    val travelerCount: Int,
)

internal data class DrvCoupon(
    val code: String,
    val discountPercent: Int,
    val active: Boolean,
    val redemptions: Int,
)

internal data class DrvPayout(val date: String, val amountMinor: Long, val paid: Boolean)

internal data class DrvDocument(val name: String, val detail: String, val expiringSoon: Boolean)

internal data class DrvProfile(
    val fullName: String,
    val phone: String,
    val country: String,
    val plate: String,
    val model: String,
    val year: String,
    val seats: String,
) {
    fun isComplete(): Boolean =
        fullName.isNotBlank() && phone.isNotBlank() && plate.isNotBlank() && model.isNotBlank() &&
            isValidYear(year) && isValidSeats(seats)
}

internal fun isValidYear(value: String): Boolean = value.length == YEAR_DIGITS && value.all { it.isDigit() }

internal fun isValidSeats(value: String): Boolean = value.toIntOrNull()?.let { it in 1..MAX_SEATS } ?: false

internal fun isIsoDate(value: String): Boolean = Regex("\\d{4}-\\d{2}-\\d{2}").matches(value)

internal data class DrvLabBooking(val lab: String, val slot: String)

internal data class DrvPlanChange(val target: DrvPlan, val upgrade: Boolean)
