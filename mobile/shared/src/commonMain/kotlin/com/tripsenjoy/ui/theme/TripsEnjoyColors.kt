package com.tripsenjoy.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

// Colour palettes built from the Trips Enjoy design tokens (tokens.json).
// Token names map to camelCase: brand-navy -> brandNavy, primary-text -> primaryText.
// Tokens with one value keep it in both palettes. Themed tokens take their light or dark value.
// Status colours (danger, success, warning) are PROPOSED in the token file: always pair them with an icon and a word.

@Immutable
data class TripsEnjoyColors(
    // Brand, the same in both themes.
    val brandNavy: Color,
    val brandOrange: Color,
    val brandCoral: Color,
    val brandAmber: Color,
    val brandCream: Color,
    val white: Color,
    val primary: Color,
    val onPrimary: Color,
    val accent: Color,
    val highlight: Color,
    val glassTint: Color,
    // Surfaces and text.
    val surface: Color,
    val surfaceRaised: Color,
    val surfaceInverse: Color,
    val ink: Color,
    val inkMuted: Color,
    val inkInverse: Color,
    val hairline: Color,
    val primaryText: Color,
    val focusRing: Color,
    val controlBorder: Color,
    // Status.
    val danger: Color,
    val onDanger: Color,
    val dangerSoft: Color,
    val success: Color,
    val successSoft: Color,
    val warning: Color,
    val warningSoft: Color,
    val infoSoft: Color,
    val tabActive: Color,
    // Map.
    val mapGround: Color,
    val mapRoad: Color,
    val mapRoute: Color,
    // Liquid Glass and card shadows.
    val glassFillRegular: Color,
    val glassFillClear: Color,
    val glassDim: Color,
    val glassStroke: Color,
    val glassHighlight: Color,
    val glassSheen: Color,
    val glassSelection: Color,
    val glassShadow: Color,
    val cardShadow: Color,
)

private object BrandTokens {
    val navy = Color(0xFF262A67)
    val orange = Color(0xFFFF6527)
    val coral = Color(0xFFFB8030)
    val amber = Color(0xFFF89E23)
    val cream = Color(0xFFF6F3E4)
    val white = Color(0xFFFFFFFF)
    val primary = Color(0xFFFF6C2E)
}

private fun rgba(red: Int, green: Int, blue: Int, alpha: Float): Color =
    Color(red = red / 255f, green = green / 255f, blue = blue / 255f, alpha = alpha)

val TripsEnjoyLightColors = TripsEnjoyColors(
    brandNavy = BrandTokens.navy,
    brandOrange = BrandTokens.orange,
    brandCoral = BrandTokens.coral,
    brandAmber = BrandTokens.amber,
    brandCream = BrandTokens.cream,
    white = BrandTokens.white,
    primary = BrandTokens.primary,
    onPrimary = BrandTokens.navy,
    accent = BrandTokens.coral,
    highlight = BrandTokens.amber,
    glassTint = BrandTokens.primary,
    surface = BrandTokens.cream,
    surfaceRaised = BrandTokens.white,
    surfaceInverse = BrandTokens.navy,
    ink = BrandTokens.navy,
    inkMuted = Color(0xFF5B5F86),
    inkInverse = BrandTokens.cream,
    hairline = Color(0xFFE3DFC9),
    primaryText = Color(0xFFC93A00),
    focusRing = BrandTokens.navy,
    controlBorder = Color(0xFF7B7FA6),
    danger = Color(0xFFB42318),
    onDanger = Color(0xFFFFFFFF),
    dangerSoft = Color(0xFFFDE8E6),
    success = Color(0xFF1F7A4D),
    successSoft = Color(0xFFE3F3EA),
    warning = Color(0xFF8A4B00),
    warningSoft = Color(0xFFFFF1D6),
    infoSoft = Color(0xFFE6E8F5),
    tabActive = BrandTokens.navy,
    mapGround = Color(0xFFECEBD9),
    mapRoad = Color(0xFFFFFFFF),
    mapRoute = BrandTokens.navy,
    glassFillRegular = rgba(255, 255, 255, 0.62f),
    glassFillClear = rgba(255, 255, 255, 0.16f),
    glassDim = rgba(16, 18, 48, 0.35f),
    glassStroke = rgba(255, 255, 255, 0.7f),
    glassHighlight = rgba(255, 255, 255, 0.95f),
    glassSheen = rgba(255, 255, 255, 0.45f),
    glassSelection = rgba(38, 42, 103, 0.1f),
    glassShadow = rgba(38, 42, 103, 0.16f),
    cardShadow = rgba(38, 42, 103, 0.08f),
)

val TripsEnjoyDarkColors = TripsEnjoyColors(
    brandNavy = BrandTokens.navy,
    brandOrange = BrandTokens.orange,
    brandCoral = BrandTokens.coral,
    brandAmber = BrandTokens.amber,
    brandCream = BrandTokens.cream,
    white = BrandTokens.white,
    primary = BrandTokens.primary,
    onPrimary = BrandTokens.navy,
    accent = BrandTokens.coral,
    highlight = BrandTokens.amber,
    glassTint = BrandTokens.primary,
    surface = BrandTokens.navy,
    surfaceRaised = Color(0xFF31367A),
    surfaceInverse = BrandTokens.cream,
    ink = BrandTokens.cream,
    inkMuted = Color(0xFFB8BAD6),
    inkInverse = BrandTokens.navy,
    hairline = Color(0xFF454A8C),
    primaryText = Color(0xFFFF8655),
    focusRing = BrandTokens.amber,
    controlBorder = Color(0xFF8E92C8),
    danger = Color(0xFFFF9B8F),
    onDanger = BrandTokens.navy,
    dangerSoft = Color(0xFF4A2340),
    success = Color(0xFF6FD6A0),
    successSoft = Color(0xFF1D3F45),
    warning = Color(0xFFFFC46B),
    warningSoft = Color(0xFF4A3A1C),
    infoSoft = Color(0xFF3A3F85),
    tabActive = BrandTokens.amber,
    mapGround = Color(0xFF2B3070),
    mapRoad = Color(0xFF3A3F85),
    mapRoute = BrandTokens.cream,
    glassFillRegular = rgba(49, 54, 122, 0.75f),
    glassFillClear = rgba(255, 255, 255, 0.10f),
    glassDim = rgba(0, 0, 0, 0.4f),
    glassStroke = rgba(255, 255, 255, 0.18f),
    glassHighlight = rgba(255, 255, 255, 0.28f),
    glassSheen = rgba(255, 255, 255, 0.1f),
    glassSelection = rgba(255, 255, 255, 0.14f),
    glassShadow = rgba(0, 0, 0, 0.4f),
    cardShadow = rgba(0, 0, 0, 0.25f),
)
