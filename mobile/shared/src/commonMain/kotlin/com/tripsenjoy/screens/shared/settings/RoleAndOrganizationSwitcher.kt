package com.tripsenjoy.screens.shared.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
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
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

private val DEFAULT_LINKED_ROLES = listOf(UserRole.Traveler, UserRole.Photographer)

private data class LinkedOrganization(val tenantId: String, val displayName: String)

private fun wireRoleName(role: UserRole): String = when (role) {
    UserRole.Traveler -> "traveler"
    UserRole.Parent -> "parent"
    UserRole.Driver -> "platform_driver"
    UserRole.Photographer -> "platform_photographer"
    UserRole.Organization -> "organization_owner"
    UserRole.Admin -> "admin"
}

private fun parseUserRole(raw: String): UserRole? = when (raw.lowercase()) {
    "traveler" -> UserRole.Traveler
    "parent" -> UserRole.Parent
    "platform_driver", "org_driver", "driver" -> UserRole.Driver
    "platform_photographer", "org_photographer", "photographer" -> UserRole.Photographer
    "organization_owner", "organization_employee", "organization" -> UserRole.Organization
    "admin" -> UserRole.Admin
    else -> null
}

@Composable
fun RoleAndOrganizationSwitcher() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var linkedRoles by remember { mutableStateOf(DEFAULT_LINKED_ROLES) }
    var linkedOrganizations by remember { mutableStateOf<List<LinkedOrganization>>(emptyList()) }
    var activeRole by remember { mutableStateOf(DEFAULT_LINKED_ROLES.first()) }
    var activeOrganization by remember { mutableStateOf("") }

    LaunchedEffect(api) {
        val client = api ?: return@LaunchedEffect
        runCatching {
            val res = client.call("auth/listMyRolesAndOrganizations", JsonNull, JsonElement.serializer()).jsonObject
            val parsedRoles = res["roles"]?.jsonArray?.mapNotNull { el ->
                el.jsonObject["role"]?.jsonPrimitive?.contentOrNull?.let(::parseUserRole)
            }?.distinct().orEmpty()
            if (parsedRoles.isNotEmpty()) {
                linkedRoles = parsedRoles
                activeRole = parsedRoles.first()
            }
            val parsedOrgs = res["organizations"]?.jsonArray?.mapNotNull { el ->
                val obj = el.jsonObject
                val tId = obj["tenantId"]?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null
                val name = obj["displayNameEn"]?.jsonPrimitive?.contentOrNull
                    ?: obj["displayNameAr"]?.jsonPrimitive?.contentOrNull
                    ?: tId
                LinkedOrganization(tenantId = tId, displayName = name)
            }.orEmpty()
            if (parsedOrgs.isNotEmpty()) {
                linkedOrganizations = parsedOrgs
                if (activeOrganization.isBlank()) {
                    activeOrganization = parsedOrgs.first().tenantId
                }
            }
        }
    }

    ScreenBody {
        TePageHeader(title = "Role and organization switcher", description = "Only roles and organizations linked to you")
        TeCard(header = "Roles") {
            linkedRoles.forEach { role ->
                Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
                    TeRoleBadge(role = role)
                    if (role == activeRole) {
                        TeBadge(label = "Current", tone = BadgeTone.Success, icon = IconName.Check)
                    } else {
                        TeButton(
                            text = "Switch",
                            onClick = {
                                activeRole = role
                                val client = api
                                if (client != null) {
                                    scope.launch {
                                        runCatching {
                                            client.call(
                                                "auth/switchRole",
                                                buildJsonObject {
                                                    put("targetRole", wireRoleName(role))
                                                    if (activeOrganization.isNotBlank()) {
                                                        put("tenantId", activeOrganization)
                                                    }
                                                },
                                                JsonElement.serializer(),
                                            )
                                        }
                                    }
                                }
                            },
                            variant = TeButtonVariant.Secondary,
                        )
                    }
                }
            }
        }
        TeCard(header = "Organizations") {
            if (linkedOrganizations.isEmpty()) {
                ScreenNote(text = "No linked organizations.")
            }
            linkedOrganizations.forEach { organization ->
                Row(horizontalArrangement = Arrangement.spacedBy(TripsEnjoyTheme.spacing.space2)) {
                    ScreenNote(text = organization.displayName)
                    if (organization.tenantId == activeOrganization) {
                        TeBadge(label = "Current", tone = BadgeTone.Success, icon = IconName.Check)
                    } else {
                        TeButton(
                            text = "Switch",
                            onClick = {
                                activeOrganization = organization.tenantId
                                val client = api
                                if (client != null) {
                                    scope.launch {
                                        runCatching {
                                            client.call(
                                                "auth/switchOrganization",
                                                buildJsonObject { put("targetTenantId", organization.tenantId) },
                                                JsonElement.serializer(),
                                            )
                                        }
                                    }
                                }
                            },
                            variant = TeButtonVariant.Secondary,
                        )
                    }
                }
            }
        }
        TeButton(text = "Continue", onClick = { nav.back() })
    }
}
