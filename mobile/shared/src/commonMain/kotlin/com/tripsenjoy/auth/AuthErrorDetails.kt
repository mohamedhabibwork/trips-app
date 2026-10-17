package com.tripsenjoy.auth

import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull

/** One field-level validation issue, as the `ApiErrorResponse` envelope carries it. */
data class AuthFieldError(
    val field: String,
    val code: String,
    val message: String,
)

/**
 * A read-only view over the `data` object of an oRPC error, with the lookup order the server's
 * envelope actually needs.
 *
 * `toORPCError` builds `data` as `{...serviceError.details, ...envelope}`, so a detail such as
 * `status: "suspended"` lands at the **top level** of `data`, while `requestId` and `meta` also sit
 * there. `retryAfterSeconds` and `fieldErrors` live inside `data.error`, and a duplicate copy of the
 * details lives inside `data.error.details`. Reading top level first and falling back covers all
 * three placements without the mapper caring which one the server used.
 */
class AuthErrorDetails(val raw: JsonObject? = null) {

    private val error: JsonObject? = raw.objectAt("error")
    private val nested: JsonObject? = error.objectAt("details")

    /** `details.status` — for example `"suspended"` on a suspended sign-in (FORBIDDEN). */
    val status: String? get() = string("status")

    /** `details.reason` — for example `"MAX_SESSION_DURATION_REACHED"` (F2). */
    val reason: String? get() = string("reason")

    /** `details.draftsRetained` — set with the maximum-session-duration failure. */
    val draftsRetained: Boolean? get() = boolean("draftsRetained")

    /** `details.wrongAttempts` — how many OTP attempts failed on this challenge. */
    val wrongAttempts: Int? get() = number("wrongAttempts")?.toInt()

    /** `details.remainingAttempts` — how many OTP attempts are left. */
    val remainingAttempts: Int? get() = number("remainingAttempts")?.toInt()

    /** `details.remainingLockoutSeconds` — present only when the account is already locked. */
    val remainingLockoutSeconds: Long? get() = number("remainingLockoutSeconds")?.toLong()

    /** `details.retryAfterSeconds` — the OTP resend cooldown, or a lockout hint. */
    val retryAfterSeconds: Long? get() = number("retryAfterSeconds")?.toLong()

    /** `details.lockedUntil` — an ISO timestamp or epoch milliseconds; `null` when absent. */
    val lockedUntil: Long?
        get() = raw.instantAt("lockedUntil") ?: nested.instantAt("lockedUntil") ?: error.instantAt("lockedUntil")

    /** `details.pausedUntil` — an ISO timestamp or epoch milliseconds; `null` when absent. */
    val pausedUntil: Long?
        get() = raw.instantAt("pausedUntil") ?: nested.instantAt("pausedUntil") ?: error.instantAt("pausedUntil")

    /** `data.requestId` — always present, so an unmapped error can show something actionable. */
    val requestId: String? get() = string("requestId")

    /** `data.error.fieldErrors` — the per-input validation issues. */
    val fieldErrors: List<AuthFieldError>
        get() {
            val array = error.arrayAt("fieldErrors") ?: raw.arrayAt("fieldErrors") ?: return emptyList()
            return array.mapNotNull { element ->
                val item = element as? JsonObject ?: return@mapNotNull null
                val field = item.stringAt("field") ?: return@mapNotNull null
                AuthFieldError(
                    field = field,
                    code = item.stringAt("code") ?: "",
                    message = item.stringAt("message") ?: "",
                )
            }
        }

    /** Reads a string, preferring the top level and falling back to the two nested placements. */
    private fun string(key: String): String? =
        raw.stringAt(key) ?: nested.stringAt(key) ?: error.stringAt(key)

    /** Reads a number, preferring the top level and falling back to the two nested placements. */
    private fun number(key: String): Double? =
        raw.numberAt(key) ?: nested.numberAt(key) ?: error.numberAt(key)

    /** Reads a boolean, preferring the top level and falling back to the two nested placements. */
    private fun boolean(key: String): Boolean? =
        raw.booleanAt(key) ?: nested.booleanAt(key) ?: error.booleanAt(key)
}

/** Reads a string member, or `null` when the object, member or type does not match. */
internal fun JsonObject?.stringAt(key: String): String? {
    val primitive = primitiveAt(key) ?: return null
    return primitive.contentOrNull
}

/** Reads a numeric member, or `null` when the object, member or type does not match. */
internal fun JsonObject?.numberAt(key: String): Double? {
    val primitive = primitiveAt(key) ?: return null
    return primitive.doubleOrNull
}

/** Reads a boolean member, or `null` when the object, member or type does not match. */
internal fun JsonObject?.booleanAt(key: String): Boolean? {
    val primitive = primitiveAt(key) ?: return null
    return primitive.booleanOrNull
}

/** Reads a nested object member, or `null` when the member is absent or not an object. */
internal fun JsonObject?.objectAt(key: String): JsonObject? = this?.get(key) as? JsonObject

/** Reads an array member, or `null` when the member is absent or not an array. */
internal fun JsonObject?.arrayAt(key: String): JsonArray? = this?.get(key) as? JsonArray

/**
 * Reads an instant member: a number is taken as epoch milliseconds, a string is parsed as ISO-8601.
 * Anything else is `null`, so a malformed hint degrades to "no countdown" instead of crashing.
 */
internal fun JsonObject?.instantAt(key: String): Long? {
    val element: JsonElement = this?.get(key) ?: return null
    if (element is JsonNull) return null
    val primitive = element as? JsonPrimitive ?: return null
    if (primitive.isString) return AuthInstant.parseIsoUtc(primitive.contentOrNull)
    return primitive.doubleOrNull?.toLong()
}

/** The primitive behind [key], treating an explicit `null` as absent. */
private fun JsonObject?.primitiveAt(key: String): JsonPrimitive? {
    val element = this?.get(key) ?: return null
    if (element is JsonNull) return null
    val primitive = element as? JsonPrimitive ?: return null
    return if (primitive.isString && primitive.contentOrNull == null) null else primitive
}

/** `contentOrNull` for a primitive, guarding against JSON `null`. */
private val JsonPrimitive.contentOrNull: String?
    get() = if (this is JsonNull) null else content
