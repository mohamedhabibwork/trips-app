package com.tripsenjoy.auth.components

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.ui.TripsApp
import com.tripsenjoy.ui.TripsSideGutter
import com.tripsenjoy.ui.components.LogoVariant
import com.tripsenjoy.ui.components.TripsLogo
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

/**
 * The frame every auth screen shares: the Trips theme, the correct text direction, the surface-raised
 * brand header bar (SCR-PUB-08), and one scrolling column so a small phone never clips the primary action.
 *
 * It lives in `components/` rather than in each screen because all four apps must look identical
 * (success criterion G2) and because the direction comes from the locale, not from the app.
 */
@Composable
fun AuthScaffold(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    locale: String = AuthStrings.defaultLocale,
    content: @Composable ColumnScope.() -> Unit,
) {
    val spacing = TripsEnjoyTheme.spacing
    val colors = TripsEnjoyTheme.colors
    val isDark = isSystemInDarkTheme()
    TripsApp(rtl = locale == "ar") {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(colors.surface)
                .safeDrawingPadding(),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.surfaceRaised)
                    .padding(horizontal = TripsSideGutter, vertical = spacing.space3),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                TripsLogo(
                    variant = if (isDark) LogoVariant.HorizontalReversed else LogoVariant.HorizontalFullColor,
                    contentDescription = AuthStrings.t(APP_NAME_KEY, locale),
                    modifier = Modifier.height(30.dp),
                )
            }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(colors.hairline),
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = TripsSideGutter)
                    .padding(top = spacing.space6, bottom = spacing.space6),
                verticalArrangement = Arrangement.spacedBy(spacing.space4),
            ) {
                Text(
                    text = title,
                    style = TripsEnjoyTheme.typography.h1,
                    color = colors.ink,
                    modifier = Modifier.semantics { heading() },
                )
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        style = TripsEnjoyTheme.typography.body,
                        color = colors.inkMuted,
                    )
                }
                Spacer(Modifier.height(spacing.space1))
                content()
            }
        }
    }
}

/** A single full-width row of content, so screens do not repeat the fill/padding idiom. */
@Composable
fun AuthField(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Column(modifier = modifier.fillMaxWidth()) { content() }
}

/** The key of the product name; the copy itself comes from `messages.json`. */
private const val APP_NAME_KEY = "auth.app.name"

