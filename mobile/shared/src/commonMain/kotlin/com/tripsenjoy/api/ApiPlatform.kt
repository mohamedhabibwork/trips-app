package com.tripsenjoy.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngineConfig
import io.ktor.client.engine.HttpClientEngineFactory
import io.ktor.client.plugins.HttpTimeout

// Give up on a request after 15 seconds, so a stuck connection shows an error instead of hanging.
private const val REQUEST_TIMEOUT_MILLIS = 15_000L

/** The apps/server base URL for this platform. The Android emulator reaches the host machine at 10.0.2.2. */
expect fun platformApiBaseUrl(): String

/** A Ktor client that uses this platform's HTTP engine. */
expect fun createHttpClient(): HttpClient

/** Client setup shared by every platform's [createHttpClient]. */
fun <T : HttpClientEngineConfig> newHttpClient(engine: HttpClientEngineFactory<T>): HttpClient =
    HttpClient(engine) {
        install(HttpTimeout) {
            requestTimeoutMillis = REQUEST_TIMEOUT_MILLIS
        }
    }
