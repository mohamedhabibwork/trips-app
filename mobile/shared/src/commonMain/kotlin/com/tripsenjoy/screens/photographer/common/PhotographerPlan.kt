package com.tripsenjoy.screens.photographer.common


// Plan allowances from docs/screens/05-photographer-studio.md. Pro is unlimited.
const val UNLIMITED_ALLOWANCE = Int.MAX_VALUE

enum class PhotographerPlan(
    val label: String,
    val portfolioImages: Int,
    val albumsPerTrip: Int,
    val coupons: Int,
    val bookingsPerMonth: Int,
) {
    Basic(label = "Basic", portfolioImages = 10, albumsPerTrip = 1, coupons = 3, bookingsPerMonth = 3),
    Studio(label = "Studio", portfolioImages = 50, albumsPerTrip = 5, coupons = 10, bookingsPerMonth = 10),
    Pro(
        label = "Pro",
        portfolioImages = UNLIMITED_ALLOWANCE,
        albumsPerTrip = UNLIMITED_ALLOWANCE,
        coupons = UNLIMITED_ALLOWANCE,
        bookingsPerMonth = UNLIMITED_ALLOWANCE,
    ),
}

// Plan of the signed-in photographer. The gallery uses Studio until the account service supplies the plan.
val CURRENT_PLAN: PhotographerPlan = PhotographerPlan.Studio

// True when the current plan includes a feature that needs the required plan (Basic < Studio < Pro).
fun PhotographerPlan.includes(required: PhotographerPlan): Boolean = ordinal >= required.ordinal

// True when one more item fits the allowance. An unlimited allowance always fits.
fun isWithinAllowance(used: Int, allowance: Int): Boolean = allowance == UNLIMITED_ALLOWANCE || used < allowance

fun allowanceText(allowance: Int): String = if (allowance == UNLIMITED_ALLOWANCE) "Unlimited" else allowance.toString()

fun usageText(used: Int, allowance: Int): String = "$used of ${allowanceText(allowance)}"
