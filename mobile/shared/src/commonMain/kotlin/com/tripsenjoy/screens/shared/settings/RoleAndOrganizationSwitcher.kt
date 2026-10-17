package com.tripsenjoy.screens.shared.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.moderator.common.icon
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.ScreenNote
import com.tripsenjoy.ui.components.BadgeTone
import com.tripsenjoy.ui.components.IconName
import com.tripsenjoy.ui.components.TeBadge
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeButtonVariant
import com.tripsenjoy.ui.components.TeCard
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeRoleBadge
import com.tripsenjoy.ui.components.UserRole
import com.tripsenjoy.ui.theme.TripsEnjoyTheme

private val LINKED_ROLES = listOf(UserRole.Traveler, UserRole.Photographer)
private val LINKED_ORGANIZATIONS = listOf("Organization A", "Organization B")

// SCR-SHR-13 Role and organization switcher. Lists only the roles approved for this person and the organizations
// linked to this staff email. Switching shows only the chosen role's data (FR-AUTH-06, FR-AUTH-07).
// Continue returns to the screen that opened the switcher.
@Composable
fun RoleAndOrganizationSwitcher() {
    val nav = LocalScreenNavigator.current
    var activeRole by remember { mutableStateOf(LINKED_ROLES.first()) }
    var activeOrganization by remember { mutableStateOf(LINKED_ORGANIZATIONS.first()) }
    ScreenBody {
        TePageHeader(title = "Role and organization switcher", description = "Only roles and organizations linked to you")
        TeCard(header = "Roles") {
            LINKED_ROLES.forEach { role ->
                Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
                    TeRoleBadge(role = role)
                    if (role == activeRole) {
                        TeBadge(label = "Current", tone = BadgeTone.Success, icon = IconName.Check)
                    } else {
                        TeButton(
                            text = "Switch",
                            onClick = { activeRole = role },
                            variant = TeButtonVariant.Secondary,
                        )
                    }
                }
            }
        }
        TeCard(header = "Organizations") {
            LINKED_ORGANIZATIONS.forEach { organization ->
                Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
                    ScreenNote(text = organization)
                    if (organization == activeOrganization) {
                        TeBadge(label = "Current", tone = BadgeTone.Success, icon = IconName.Check)
                    } else {
                        TeButton(
                            text = "Switch",
                            onClick = { activeOrganization = organization },
                            variant = TeButtonVariant.Secondary,
                        )
                    }
                }
            }
        }
        TeButton(text = "Continue", onClick = { nav.back() })
    }
}
