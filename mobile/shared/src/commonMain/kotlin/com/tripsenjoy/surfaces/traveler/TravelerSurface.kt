package com.tripsenjoy.surfaces.traveler

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.screens.ScreenEntry
import com.tripsenjoy.screens.ScreenHost
import com.tripsenjoy.screens.parent.PARENT_SCREENS
import com.tripsenjoy.screens.public.PUBLIC_SCREENS
import com.tripsenjoy.screens.traveler.TRAVELER_SCREENS
import com.tripsenjoy.surfaces.SurfaceScreen
import com.tripsenjoy.ui.components.TeRetryBanner
import kotlin.coroutines.cancellation.CancellationException

// Traveler, parent, and public/onboarding screens in one host. The home screen (SCR-TRV-01) is the start.
private val TRAVELER_APP_SCREENS: List<ScreenEntry> = TRAVELER_SCREENS + PARENT_SCREENS + PUBLIC_SCREENS

/** The traveler surface. Every app offers it (D-124). The API check sits in the header; the screens fill the rest. */
@Composable
fun TravelerSurface(api: ApiClient) {
    SurfaceScreen(title = "Traveler", subtitle = "Trips Enjoy traveler app") {
        ApiStatusView(api)
        ScreenHost(
            startId = "SCR-TRV-01",
            screens = TRAVELER_APP_SCREENS,
            modifier = Modifier.weight(1f).fillMaxSize(),
        )
    }
}

private sealed interface ApiState {
    data object Loading : ApiState
    data class Connected(val message: String) : ApiState
    data class Failed(val message: String) : ApiState
}

/** Calls the API's healthCheck. Shows one status line, or a retry banner when the API cannot be reached. */
@Composable
fun ApiStatusView(api: ApiClient) {
    var attempt by remember { mutableIntStateOf(0) }
    var state by remember { mutableStateOf<ApiState>(ApiState.Loading) }

    LaunchedEffect(api, attempt) {
        state = ApiState.Loading
        state = try {
            ApiState.Connected(api.healthCheck())
        } catch (error: CancellationException) {
            throw error
        } catch (error: Exception) {
            ApiState.Failed(error.message ?: "The API could not be reached.")
        }
    }

    when (val current = state) {
        ApiState.Loading -> Text(
            text = "Checking the API connection",
            style = MaterialTheme.typography.labelMedium,
        )
        is ApiState.Connected -> Text(
            text = "API connected: ${current.message}",
            style = MaterialTheme.typography.labelMedium,
        )
        is ApiState.Failed -> TeRetryBanner(
            message = "API unavailable: ${current.message}",
            onRetry = { attempt++ },
            retrying = false,
        )
    }
}
