package com.tripsenjoy.api

import io.ktor.client.HttpClient
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

/** Health of one service, as returned by its `status` procedure. */
@Serializable
data class ServiceStatus(val service: String, val status: String)

/**
 * A failed call. [code] is the oRPC error code (for example NOT_FOUND), or HTTP_<status>
 * when the server answered with something other than an oRPC envelope.
 *
 * [details] is the `data` object of the oRPC error, or `null` when the server did not send one.
 * The auth layer reads it for `status`, `lockedUntil`, `reason`, `retryAfterSeconds` and
 * `wrongAttempts`; nothing else uses it. It is a defaulted parameter, so every existing call site
 * and every existing assertion keeps working unchanged.
 */
class ApiException(
    val code: String,
    val status: Int,
    override val message: String,
    val details: JsonObject? = null,
) : Exception(message)

/**
 * Typed client for the oRPC endpoint that apps/server serves at `/rpc`.
 *
 * Wire format (oRPC's RPC protocol): the request body is `{"json": <input>, "meta": []}`,
 * and a successful response body is `{"json": <output>}`. When [accessToken] returns a value,
 * the call is sent with `Authorization: Bearer <token>`, which the server reads as the signed-in account.
 */
class ApiClient(
    baseUrl: String,
    private val http: HttpClient,
    private val accessToken: () -> String? = { null },
) {
    private val baseUrl = baseUrl.trimEnd('/')
    private val json = Json { ignoreUnknownKeys = true }

    /** Calls the procedure at [procedure] (for example "healthCheck" or "checkIn/status") and decodes its output. */
    suspend fun <O> call(procedure: String, input: JsonElement, output: KSerializer<O>): O {
        val response = http.post("$baseUrl/rpc/$procedure") {
            contentType(ContentType.Application.Json)
            accessToken()?.let { header(HttpHeaders.Authorization, "Bearer $it") }
            setBody(envelope(input))
        }
        val text = response.bodyAsText()
        val root = parseObject(text)
        if (!response.status.isSuccess()) throw errorOf(response, root, text)
        val result = root?.get("json")
            ?: throw ApiException("INVALID_RESPONSE", response.status.value, "The response has no json field.")
        return json.decodeFromJsonElement(output, result)
    }

    /** Calls `healthCheck`, which answers "OK" when the API is up. */
    suspend fun healthCheck(): String = call("healthCheck", JsonNull, String.serializer())

    /** Calls the `status` procedure of one service, for example `serviceStatus("checkIn")`. */
    suspend fun serviceStatus(serviceKey: String): ServiceStatus =
        call("$serviceKey/status", JsonNull, ServiceStatus.serializer())

    private fun envelope(input: JsonElement): String =
        buildJsonObject {
            put("json", input)
            put("meta", JsonArray(emptyList()))
        }.toString()

    private fun parseObject(text: String): JsonObject? =
        runCatching { json.parseToJsonElement(text).jsonObject }.getOrNull()

    private fun errorOf(response: HttpResponse, root: JsonObject?, text: String): ApiException {
        val error = root?.get("json") as? JsonObject
        val code = error?.get("code")?.jsonPrimitive?.content ?: "HTTP_${response.status.value}"
        val message = error?.get("message")?.jsonPrimitive?.content
            ?: text.ifBlank { response.status.description }
        // oRPC puts the ApiErrorResponse envelope in `data`; `toORPCError` spreads the service
        // details into it, so the auth mapper can read them without a second request.
        val details = error?.get("data") as? JsonObject
        return ApiException(code, response.status.value, message, details)
    }
}
