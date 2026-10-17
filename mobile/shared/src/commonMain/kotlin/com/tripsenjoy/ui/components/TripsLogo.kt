package com.tripsenjoy.ui.components

import androidx.compose.foundation.Image
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.jetbrains.compose.resources.DrawableResource
import org.jetbrains.compose.resources.painterResource
import trips_enjoy_mobile.shared.generated.resources.Res
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_horizontal_fullcolor
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_horizontal_reversed
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_stacked_ar_fullcolor
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_stacked_fullcolor
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_symbol_fullcolor
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_symbol_mono_navy
import trips_enjoy_mobile.shared.generated.resources.trips_enjoy_symbol_te_fullcolor

// Brand logo variants. Artwork keeps its exact colours: never pass a tint or colour filter.
enum class LogoVariant {
    HorizontalFullColor,
    HorizontalReversed,
    StackedFullColor,
    StackedArabic,
    Symbol,
    SymbolCompact,
    SymbolMonoNavy,
}

// Size the logo with modifier, for example Modifier.height(...) or Modifier.width(...).
// The logo is not mirrored in RTL layouts. contentDescription = null hides a logo that sits beside its name.
@Composable
fun TripsLogo(
    variant: LogoVariant,
    contentDescription: String?,
    modifier: Modifier = Modifier,
) {
    Image(
        painter = painterResource(variant.drawable()),
        contentDescription = contentDescription,
        modifier = modifier,
    )
}

private fun LogoVariant.drawable(): DrawableResource = when (this) {
    LogoVariant.HorizontalFullColor -> Res.drawable.trips_enjoy_horizontal_fullcolor
    LogoVariant.HorizontalReversed -> Res.drawable.trips_enjoy_horizontal_reversed
    LogoVariant.StackedFullColor -> Res.drawable.trips_enjoy_stacked_fullcolor
    LogoVariant.StackedArabic -> Res.drawable.trips_enjoy_stacked_ar_fullcolor
    LogoVariant.Symbol -> Res.drawable.trips_enjoy_symbol_fullcolor
    LogoVariant.SymbolCompact -> Res.drawable.trips_enjoy_symbol_te_fullcolor
    LogoVariant.SymbolMonoNavy -> Res.drawable.trips_enjoy_symbol_mono_navy
}
