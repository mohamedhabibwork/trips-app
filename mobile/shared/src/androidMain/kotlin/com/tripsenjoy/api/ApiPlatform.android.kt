package com.tripsenjoy.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp

// The Android emulator reaches the development machine at 10.0.2.2.
actual fun platformApiBaseUrl(): String = "http://10.0.2.2:3000"

actual fun createHttpClient(): HttpClient = newHttpClient(OkHttp)
