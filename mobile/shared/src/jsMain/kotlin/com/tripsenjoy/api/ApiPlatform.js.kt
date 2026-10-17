package com.tripsenjoy.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.js.Js

actual fun platformApiBaseUrl(): String = "http://localhost:3000"

actual fun createHttpClient(): HttpClient = newHttpClient(Js)
