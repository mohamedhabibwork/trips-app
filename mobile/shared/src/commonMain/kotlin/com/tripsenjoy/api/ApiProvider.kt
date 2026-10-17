package com.tripsenjoy.api

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

/**
 * One API client per composition, pointing at this platform's apps/server.
 *
 * [accessToken] is read on every call, so the bearer token follows sign-in and sign-out without
 * rebuilding the client. The default keeps every existing no-argument call site compiling.
 */
@Composable
fun rememberApiClient(accessToken: () -> String? = { null }): ApiClient =
    remember(accessToken) {
        ApiClient(
            baseUrl = platformApiBaseUrl(),
            http = createHttpClient(),
            accessToken = accessToken,
        )
    }
