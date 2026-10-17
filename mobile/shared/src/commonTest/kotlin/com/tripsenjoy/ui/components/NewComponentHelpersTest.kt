package com.tripsenjoy.ui.components

import androidx.compose.ui.geometry.Offset
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class NewComponentHelpersTest {

    @Test
    fun `JPY has no fraction digits by default`() {
        assertEquals(0, currencyFractionDigits("JPY"))
        assertEquals("1,500 JPY", formatMoney(1500, "JPY"))
    }

    @Test
    fun `KWD and BHD have three fraction digits by default`() {
        assertEquals(3, currencyFractionDigits("KWD"))
        assertEquals(3, currencyFractionDigits("BHD"))
        assertEquals("1.250 KWD", formatMoney(1250, "KWD"))
    }

    @Test
    fun `most currencies including SAR and USD use two fraction digits`() {
        assertEquals(2, currencyFractionDigits("SAR"))
        assertEquals(2, currencyFractionDigits("USD"))
        assertEquals("12.50 SAR", formatMoney(1250, "SAR"))
    }

    @Test
    fun `currency lookup ignores the case of the code`() {
        assertEquals(0, currencyFractionDigits("jpy"))
    }

    @Test
    fun `available and selected seats are selectable so a choice can be undone`() {
        assertTrue(SeatState.Available.isSelectable())
        assertTrue(SeatState.Selected.isSelectable())
        SeatState.entries.filter { it != SeatState.Available && it != SeatState.Selected }.forEach { state ->
            assertFalse(state.isSelectable(), "$state should not be selectable")
        }
    }

    @Test
    fun `seat description names the seat and its state word`() {
        assertEquals("Seat 1B, Checked in", TeSeat(id = "1B", label = "1B", state = SeatState.CheckedIn).accessibleDescription())
        assertEquals("Seat 4C, Cancelled", TeSeat(id = "4C", label = "4C", state = SeatState.Cancelled).accessibleDescription())
    }

    @Test
    fun `every seat state has its own word for the legend`() {
        assertEquals(9, SeatState.entries.map { it.word }.toSet().size)
    }

    @Test
    fun `seat states map to their icons`() {
        assertEquals(IconName.Seat, SeatState.Available.icon())
        assertEquals(IconName.Check, SeatState.Selected.icon())
        assertEquals(IconName.User, SeatState.Taken.icon())
        assertEquals(IconName.Lock, SeatState.Blocked.icon())
    }

    @Test
    fun `up delta turns the arrow a quarter turn anticlockwise`() {
        assertEquals(IconName.Arrow, TrendDirection.Up.iconName())
        assertEquals(-90f, TrendDirection.Up.rotationDegrees())
    }

    @Test
    fun `down delta turns the arrow a quarter turn clockwise`() {
        assertEquals(IconName.Arrow, TrendDirection.Down.iconName())
        assertEquals(90f, TrendDirection.Down.rotationDegrees())
    }

    @Test
    fun `flat delta shows a minus icon without rotation`() {
        assertEquals(IconName.Minus, TrendDirection.Flat.iconName())
        assertEquals(0f, TrendDirection.Flat.rotationDegrees())
    }

    @Test
    fun `current step wins over completion`() {
        val step = TeStep(id = "pay", label = "Pay")
        assertEquals(TeStepState.Current, stepStateFor(step, currentId = "pay", completedIds = setOf("pay")))
    }

    @Test
    fun `completed step that is not current shows as completed`() {
        val step = TeStep(id = "details", label = "Details")
        assertEquals(TeStepState.Completed, stepStateFor(step, currentId = "pay", completedIds = setOf("details")))
    }

    @Test
    fun `step after the current one shows as upcoming`() {
        val step = TeStep(id = "review", label = "Review")
        assertEquals(TeStepState.Upcoming, stepStateFor(step, currentId = "pay", completedIds = setOf("details")))
    }

    @Test
    fun `checklist rows show Checked or Not yet as words`() {
        assertEquals("Checked", checklistStateWord(true))
        assertEquals("Not yet", checklistStateWord(false))
    }

    @Test
    fun `failed upload shows the word Failed with an alert icon`() {
        assertEquals("Failed", UploadStatus.Failed.word())
        assertEquals(IconName.Alert, UploadStatus.Failed.icon())
    }

    @Test
    fun `declined offer uses the danger tone and its word`() {
        assertEquals("Declined", OfferStatus.Declined.word)
        assertEquals(BadgeTone.Danger, OfferStatus.Declined.tone())
    }

    @Test
    fun `not verified document shows the words Not verified`() {
        assertEquals("Verified", TeDocument(label = "Passport", verified = true).verificationWord())
        assertEquals("Not verified", TeDocument(label = "Passport", verified = false).verificationWord())
    }

    @Test
    fun `initials come from the first letters of the first two words`() {
        assertEquals("OA", avatarInitials("Omar Al Harbi"))
        assertEquals("S", avatarInitials("  salma  "))
    }

    @Test
    fun `empty name gives a question mark for initials`() {
        assertEquals("?", avatarInitials("   "))
    }

    @Test
    fun `map point scales from the unit box to canvas pixels`() {
        assertEquals(Offset(100f, 50f), mapPointToCanvas(Offset(0.5f, 0.5f), 200f, 100f))
    }

    @Test
    fun `map point outside the unit box is clamped to the edge`() {
        assertEquals(Offset(0f, 50f), mapPointToCanvas(Offset(-1f, 0.5f), 200f, 100f))
        assertEquals(Offset(200f, 100f), mapPointToCanvas(Offset(3f, 2f), 200f, 100f))
    }
}
