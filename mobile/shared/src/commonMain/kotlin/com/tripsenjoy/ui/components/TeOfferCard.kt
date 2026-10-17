package com.tripsenjoy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

enum class OfferStatus(val word: String) {
    Open("Open"),
    Accepted("Accepted"),
    Declined("Declined"),
    Countered("Countered"),
}

fun OfferStatus.icon(): IconName = when (this) {
    OfferStatus.Open -> IconName.Clock
    OfferStatus.Accepted -> IconName.Check
    OfferStatus.Declined -> IconName.Close
    OfferStatus.Countered -> IconName.Refresh
}

fun OfferStatus.tone(): BadgeTone = when (this) {
    OfferStatus.Open -> BadgeTone.Accent
    OfferStatus.Accepted -> BadgeTone.Success
    OfferStatus.Declined -> BadgeTone.Danger
    OfferStatus.Countered -> BadgeTone.Warning
}

private val OfferIconSize = 16.dp

// Deal offer to a driver or photographer. Amount is shown with its currency (TeMoney), and the status is a
// badge with a word and an icon. The response action appears only when onRespond is given.
@Composable
fun TeOfferCard(
    title: String,
    amountMinor: Long,
    currencyCode: String,
    status: OfferStatus,
    expires: String? = null,
    onRespond: (() -> Unit)? = null,
    respondLabel: String = "Respond",
    modifier: Modifier = Modifier,
) {
    val colors = TripsEnjoyTheme.colors
    val spacing = TripsEnjoyTheme.spacing
    val shape = RoundedCornerShape(TripsEnjoyTheme.radius.md)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.surfaceRaised, shape)
            .border(1.dp, colors.hairline, shape)
            .padding(spacing.space4),
        verticalArrangement = Arrangement.spacedBy(spacing.space3),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(spacing.space2),
        ) {
            Text(
                text = title,
                style = TripsEnjoyTheme.typography.h3,
                color = colors.ink,
                modifier = Modifier.weight(1f),
            )
            TeBadge(label = status.word, tone = status.tone(), icon = status.icon())
        }
        TeMoney(amountMinor = amountMinor, currencyCode = currencyCode)
        if (expires != null) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(spacing.space1),
            ) {
                TeIcon(name = IconName.Clock, contentDescription = null, tint = colors.inkMuted, size = OfferIconSize)
                Text(text = expires, style = TripsEnjoyTheme.typography.caption, color = colors.inkMuted)
            }
        }
        if (onRespond != null) {
            TeButton(text = respondLabel, onClick = onRespond, modifier = Modifier.fillMaxWidth())
        }
    }
}
