package com.tripsenjoy.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.darwin.Darwin

// The iOS simulator shares the development machine's network, so localhost works.
actual fun platformApiBaseUrl(): String = "http://localhost:3000"

actual fun createHttpClient(): HttpClient = newHttpClient(Darwin)
