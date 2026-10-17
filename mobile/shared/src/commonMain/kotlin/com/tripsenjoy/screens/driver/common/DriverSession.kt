package com.tripsenjoy.screens.driver.common

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import com.tripsenjoy.ui.components.OfferStatus

// What the driver changes during this session: offer answers, the trip run, lab booking and upload, profile,
// plan change and coupons. Screens reach it through LocalDriverSession. Nothing here calls a server.
internal class DriverSession {
    val offers = mutableStateListOf<DrvOffer>().apply { addAll(DriverSampleData.offers) }
    val coupons = mutableStateListOf<DrvCoupon>().apply { addAll(DriverSampleData.coupons) }
    var selectedOfferId: String? by mutableStateOf(null)
    var plan: DrvPlan by mutableStateOf(DriverSampleData.plan)
    var planChange: DrvPlanChange? by mutableStateOf(null)
    var profile: DrvProfile by mutableStateOf(DriverSampleData.profile)
    var labBooking: DrvLabBooking? by mutableStateOf(null)
    var labResultUploaded: Boolean by mutableStateOf(false)
    var runState: DrvRunState by mutableStateOf(DrvRunState.Assigned)
    var stopsReached: Int by mutableIntStateOf(0)
    val activeBookings: Int = DriverSampleData.ACTIVE_BOOKINGS

    fun selectedOffer(): DrvOffer? = offers.firstOrNull { it.id == selectedOfferId }

    fun canAcceptOffer(): Boolean = plan.bookingLimit?.let { activeBookings < it } ?: true

    fun canCreateCoupon(): Boolean = plan.couponLimit?.let { coupons.size < it } ?: true

    fun openOfferCount(): Int = offers.count { it.status == OfferStatus.Open }

    // A counter-offer keeps its amount; any other answer clears it.
    fun answerOffer(id: String, status: OfferStatus, counterMinor: Long? = null) {
        val index = offers.indexOfFirst { it.id == id }
        if (index >= 0) {
            val counter = if (status == OfferStatus.Countered) counterMinor else null
            offers[index] = offers[index].copy(status = status, counterMinor = counter)
        }
    }

    fun addCoupon(coupon: DrvCoupon) {
        coupons.add(coupon)
    }

    fun bookLab(booking: DrvLabBooking) {
        labBooking = booking
    }

    fun uploadLabResult() {
        labResultUploaded = true
    }

    fun saveProfile(updated: DrvProfile) {
        profile = updated
    }

    fun requestPlanChange(target: DrvPlan) {
        planChange = if (target == plan) null else DrvPlanChange(target = target, upgrade = target > plan)
    }

    fun startTrip() {
        if (runState == DrvRunState.Assigned) runState = DrvRunState.InProgress
    }

    fun reachStop() {
        if (runState == DrvRunState.InProgress) stopsReached += 1
    }

    fun endTrip() {
        if (runState == DrvRunState.InProgress) runState = DrvRunState.Ended
    }
}

internal val LocalDriverSession = staticCompositionLocalOf<DriverSession> {
    error("DriverSession not provided. Wrap the driver screens in DriverApp.")
}
