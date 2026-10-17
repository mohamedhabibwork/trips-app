package com.tripsenjoy.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf

private val LocalTripsEnjoyColors = staticCompositionLocalOf<TripsEnjoyColors> {
    error("TripsEnjoyColors not provided. Wrap the content in TripsEnjoyTheme.")
}

private val LocalTripsEnjoyTextStyles = staticCompositionLocalOf<TripsEnjoyTextStyles> {
    error("TripsEnjoyTextStyles not provided. Wrap the content in TripsEnjoyTheme.")
}

// Access point for the design tokens inside TripsEnjoyTheme.
object TripsEnjoyTheme {
    val colors: TripsEnjoyColors
        @Composable
        @ReadOnlyComposable
        get() = LocalTripsEnjoyColors.current

    val spacing: TripsEnjoySpacing
        get() = TripsEnjoySpacing

    val radius: TripsEnjoyRadius
        get() = TripsEnjoyRadius

    val typography: TripsEnjoyTextStyles
        @Composable
        @ReadOnlyComposable
        get() = LocalTripsEnjoyTextStyles.current
}

// Provides the Trips Enjoy palette and bundled type, and wraps MaterialTheme so Material components pick them up.
@Composable
fun TripsEnjoyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val palette = if (darkTheme) TripsEnjoyDarkColors else TripsEnjoyLightColors
    val textStyles = rememberTripsEnjoyTextStyles()
    CompositionLocalProvider(
        LocalTripsEnjoyColors provides palette,
        LocalTripsEnjoyTextStyles provides textStyles,
    ) {
        MaterialTheme(
            colorScheme = palette.toMaterialColorScheme(isDark = darkTheme),
            typography = textStyles.material,
            content = content,
        )
    }
}

private fun TripsEnjoyColors.toMaterialColorScheme(isDark: Boolean): ColorScheme {
    val base = if (isDark) darkColorScheme() else lightColorScheme()
    return base.copy(
        primary = primary,
        onPrimary = onPrimary,
        secondary = accent,
        onSecondary = brandNavy,
        tertiary = highlight,
        onTertiary = brandNavy,
        background = surface,
        onBackground = ink,
        surface = surface,
        onSurface = ink,
        surfaceVariant = surfaceRaised,
        onSurfaceVariant = inkMuted,
        inverseSurface = surfaceInverse,
        inverseOnSurface = inkInverse,
        outline = controlBorder,
        outlineVariant = hairline,
        error = danger,
        onError = onDanger,
        errorContainer = dangerSoft,
        onErrorContainer = danger,
    )
}
