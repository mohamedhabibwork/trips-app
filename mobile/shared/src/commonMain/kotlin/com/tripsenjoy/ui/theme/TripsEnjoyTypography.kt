package com.tripsenjoy.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.remember
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import org.jetbrains.compose.resources.Font
import trips_enjoy_mobile.shared.generated.resources.Res
import trips_enjoy_mobile.shared.generated.resources.cairo_bold
import trips_enjoy_mobile.shared.generated.resources.cairo_medium
import trips_enjoy_mobile.shared.generated.resources.cairo_semibold
import trips_enjoy_mobile.shared.generated.resources.outfit_bold
import trips_enjoy_mobile.shared.generated.resources.outfit_medium
import trips_enjoy_mobile.shared.generated.resources.outfit_regular
import trips_enjoy_mobile.shared.generated.resources.outfit_semibold

// Text styles from the Trips Enjoy type tokens: English (Outfit) and Arabic (Cairo) groups.
// Material's typography slots carry the same Outfit family, so Material components match.
@Immutable
class TripsEnjoyTextStyles internal constructor(
    val display: TextStyle,
    val h1: TextStyle,
    val h2: TextStyle,
    val h3: TextStyle,
    val body: TextStyle,
    val bodyMedium: TextStyle,
    val label: TextStyle,
    val caption: TextStyle,
    val arDisplay: TextStyle,
    val arH1: TextStyle,
    val arH2: TextStyle,
    val arBody: TextStyle,
    val arCaption: TextStyle,
    val material: Typography,
)

// Builds the styles from the bundled fonts. Font() is composable, so this must run in composition.
@Composable
fun rememberTripsEnjoyTextStyles(): TripsEnjoyTextStyles {
    val outfitRegular = Font(Res.font.outfit_regular, FontWeight.Normal)
    val outfitMedium = Font(Res.font.outfit_medium, FontWeight.Medium)
    val outfitSemibold = Font(Res.font.outfit_semibold, FontWeight.SemiBold)
    val outfitBold = Font(Res.font.outfit_bold, FontWeight.Bold)
    val cairoMedium = Font(Res.font.cairo_medium, FontWeight.Medium)
    val cairoSemibold = Font(Res.font.cairo_semibold, FontWeight.SemiBold)
    val cairoBold = Font(Res.font.cairo_bold, FontWeight.Bold)
    val latin = remember(outfitRegular, outfitMedium, outfitSemibold, outfitBold) {
        FontFamily(outfitRegular, outfitMedium, outfitSemibold, outfitBold)
    }
    val arabic = remember(cairoMedium, cairoSemibold, cairoBold) {
        FontFamily(cairoMedium, cairoSemibold, cairoBold)
    }
    return remember(latin, arabic) { tripsEnjoyTextStyles(latin, arabic) }
}

private fun tripsEnjoyTextStyles(latin: FontFamily, arabic: FontFamily): TripsEnjoyTextStyles {
    val display = TextStyle(
        fontFamily = latin,
        fontSize = 56.sp,
        lineHeight = 60.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = (-0.5).sp,
    )
    val h1 = TextStyle(fontFamily = latin, fontSize = 40.sp, lineHeight = 48.sp, fontWeight = FontWeight.Bold)
    val h2 = TextStyle(fontFamily = latin, fontSize = 28.sp, lineHeight = 36.sp, fontWeight = FontWeight.SemiBold)
    val h3 = TextStyle(fontFamily = latin, fontSize = 20.sp, lineHeight = 28.sp, fontWeight = FontWeight.SemiBold)
    val body = TextStyle(fontFamily = latin, fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight.Normal)
    val bodyMedium = TextStyle(fontFamily = latin, fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight.Medium)
    val label = TextStyle(fontFamily = latin, fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.SemiBold)
    val caption = TextStyle(fontFamily = latin, fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight.Medium)

    val arDisplay = TextStyle(fontFamily = arabic, fontSize = 48.sp, lineHeight = 68.sp, fontWeight = FontWeight.Bold)
    val arH1 = TextStyle(fontFamily = arabic, fontSize = 32.sp, lineHeight = 48.sp, fontWeight = FontWeight.Bold)
    val arH2 = TextStyle(fontFamily = arabic, fontSize = 24.sp, lineHeight = 36.sp, fontWeight = FontWeight.SemiBold)
    val arBody = TextStyle(fontFamily = arabic, fontSize = 16.sp, lineHeight = 28.sp, fontWeight = FontWeight.Medium)
    val arCaption = TextStyle(fontFamily = arabic, fontSize = 13.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium)

    // Maps the English scale onto Material's slots. Unmapped slots keep Material sizes in the Outfit family.
    val material = Typography().withFontFamily(latin).copy(
        displayLarge = display,
        headlineLarge = h1,
        headlineMedium = h2,
        titleLarge = h3,
        bodyLarge = body,
        bodyMedium = bodyMedium,
        labelLarge = label,
        bodySmall = caption,
    )
    return TripsEnjoyTextStyles(
        display = display,
        h1 = h1,
        h2 = h2,
        h3 = h3,
        body = body,
        bodyMedium = bodyMedium,
        label = label,
        caption = caption,
        arDisplay = arDisplay,
        arH1 = arH1,
        arH2 = arH2,
        arBody = arBody,
        arCaption = arCaption,
        material = material,
    )
}

private fun Typography.withFontFamily(family: FontFamily): Typography = copy(
    displayLarge = displayLarge.copy(fontFamily = family),
    displayMedium = displayMedium.copy(fontFamily = family),
    displaySmall = displaySmall.copy(fontFamily = family),
    headlineLarge = headlineLarge.copy(fontFamily = family),
    headlineMedium = headlineMedium.copy(fontFamily = family),
    headlineSmall = headlineSmall.copy(fontFamily = family),
    titleLarge = titleLarge.copy(fontFamily = family),
    titleMedium = titleMedium.copy(fontFamily = family),
    titleSmall = titleSmall.copy(fontFamily = family),
    bodyLarge = bodyLarge.copy(fontFamily = family),
    bodyMedium = bodyMedium.copy(fontFamily = family),
    bodySmall = bodySmall.copy(fontFamily = family),
    labelLarge = labelLarge.copy(fontFamily = family),
    labelMedium = labelMedium.copy(fontFamily = family),
    labelSmall = labelSmall.copy(fontFamily = family),
    displayLargeEmphasized = displayLargeEmphasized.copy(fontFamily = family),
    displayMediumEmphasized = displayMediumEmphasized.copy(fontFamily = family),
    displaySmallEmphasized = displaySmallEmphasized.copy(fontFamily = family),
    headlineLargeEmphasized = headlineLargeEmphasized.copy(fontFamily = family),
    headlineMediumEmphasized = headlineMediumEmphasized.copy(fontFamily = family),
    headlineSmallEmphasized = headlineSmallEmphasized.copy(fontFamily = family),
    titleLargeEmphasized = titleLargeEmphasized.copy(fontFamily = family),
    titleMediumEmphasized = titleMediumEmphasized.copy(fontFamily = family),
    titleSmallEmphasized = titleSmallEmphasized.copy(fontFamily = family),
    bodyLargeEmphasized = bodyLargeEmphasized.copy(fontFamily = family),
    bodyMediumEmphasized = bodyMediumEmphasized.copy(fontFamily = family),
    bodySmallEmphasized = bodySmallEmphasized.copy(fontFamily = family),
    labelLargeEmphasized = labelLargeEmphasized.copy(fontFamily = family),
    labelMediumEmphasized = labelMediumEmphasized.copy(fontFamily = family),
    labelSmallEmphasized = labelSmallEmphasized.copy(fontFamily = family),
)
