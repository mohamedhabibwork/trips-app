package com.tripsenjoy.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import com.tripsenjoy.auth.AuthStrings
import com.tripsenjoy.ui.TripsApp
import com.tripsenjoy.ui.TripsSideGutter
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

/**
 * The frame every auth screen shares: the Trips theme, the correct text direction, and one
 * scrolling column so a small phone never clips the primary action.
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
    TripsApp(rtl = locale == "ar") {
        Column(
            modifier = modifier
                .fillMaxSize()
                .safeContentPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = TripsSideGutter)
                .padding(top = spacing.space8, bottom = spacing.space6),
            verticalArrangement = Arrangement.spacedBy(spacing.space4),
        ) {
            Text(
                text = AuthStrings.t(APP_NAME_KEY, locale),
                style = TripsEnjoyTheme.typography.label,
                color = TripsEnjoyTheme.colors.primaryText,
            )
            Text(
                text = title,
                style = TripsEnjoyTheme.typography.h1,
                color = TripsEnjoyTheme.colors.ink,
                modifier = Modifier.semantics { heading() },
            )
            if (subtitle != null) {
                Text(
                    text = subtitle,
                    style = TripsEnjoyTheme.typography.body,
                    color = TripsEnjoyTheme.colors.inkMuted,
                )
            }
            Spacer(Modifier.height(spacing.space2))
            content()
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
