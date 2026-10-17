package com.tripsenjoy.lookups

import com.tripsenjoy.api.ApiClient
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Canonical lookup type codes matching `@trips-app/domain` (`LOOKUP_TYPE_CODES`).
 */
object LookupTypeCodes {
    const val COUNTRY = "COUNTRY"
    const val CURRENCY = "CURRENCY"
    const val LANGUAGE = "LANGUAGE"
    const val USER_ROLE = "USER_ROLE"
    const val ADMIN_SUB_ROLE = "ADMIN_SUB_ROLE"
    const val CLIENT_SURFACE = "CLIENT_SURFACE"
    const val PAYMENT_GATEWAY = "PAYMENT_GATEWAY"
    const val PAYOUT_METHOD = "PAYOUT_METHOD"
    const val ORG_PERMISSION_AREA = "ORG_PERMISSION_AREA"
    const val ORG_PERMISSION_LEVEL = "ORG_PERMISSION_LEVEL"
    const val APPLICATION_TYPE = "APPLICATION_TYPE"
    const val APPLICATION_STATE = "APPLICATION_STATE"
    const val DOCUMENT_TYPE = "DOCUMENT_TYPE"
    const val CONSENT_TYPE = "CONSENT_TYPE"
    const val APPLICATION_DECISION_REASON = "APPLICATION_DECISION_REASON"
    const val DRIVER_LICENSE_CATEGORY = "DRIVER_LICENSE_CATEGORY"
    const val SERVICE_REGION = "SERVICE_REGION"
    const val CAMERA_BODY = "CAMERA_BODY"
    const val CAMERA_LENS = "CAMERA_LENS"
    const val PHOTOGRAPHER_SPECIALTY = "PHOTOGRAPHER_SPECIALTY"
    const val TRIP_CATEGORY = "TRIP_CATEGORY"
    const val VEHICLE_TYPE = "VEHICLE_TYPE"
    const val CANCELLATION_REASON = "CANCELLATION_REASON"
}

/** Bilingual Arabic + English text stored in `lookup_types.name` / `lookups.name`. */
@Serializable
data class LookupLocalizedText(
    @SerialName("ar") val ar: String = "",
    @SerialName("en") val en: String = "",
) {
    fun resolve(locale: String = "ar"): String =
        if (locale.lowercase().startsWith("ar")) {
            ar.ifBlank { en }
        } else {
            en.ifBlank { ar }
        }
}

/** A single lookup item from `lookups` resolved by `lookup_types.code` or `lookups.code`. */
@Serializable
data class LookupItem(
    @SerialName("id") val id: Long,
    @SerialName("uuid") val uuid: String,
    @SerialName("lookupTypeId") val lookupTypeId: Long,
    @SerialName("typeCode") val typeCode: String,
    @SerialName("code") val code: String,
    @SerialName("value") val value: String,
    @SerialName("name") val name: LookupLocalizedText,
    @SerialName("description") val description: LookupLocalizedText? = null,
    @SerialName("parentId") val parentId: Long? = null,
    @SerialName("parentCode") val parentCode: String? = null,
    @SerialName("sortBy") val sortBy: Int = 0,
    @SerialName("isPublic") val isPublic: Boolean = true,
) {
    fun localizedName(locale: String = "ar"): String = name.resolve(locale)

    fun localizedDescription(locale: String = "ar"): String? = description?.resolve(locale)
}

/** Metadata for a lookup category in `lookup_types`. */
@Serializable
data class LookupType(
    @SerialName("id") val id: Long,
    @SerialName("uuid") val uuid: String,
    @SerialName("code") val code: String,
    @SerialName("value") val value: String,
    @SerialName("name") val name: LookupLocalizedText,
    @SerialName("description") val description: LookupLocalizedText? = null,
    @SerialName("parentId") val parentId: Long? = null,
    @SerialName("parentCode") val parentCode: String? = null,
    @SerialName("sortBy") val sortBy: Int = 0,
    @SerialName("isPublic") val isPublic: Boolean = true,
    @SerialName("isSystem") val isSystem: Boolean = true,
) {
    fun localizedName(locale: String = "ar"): String = name.resolve(locale)
}

/** A lookup type together with its sorted lookup items. */
@Serializable
data class LookupTypeWithItems(
    @SerialName("id") val id: Long,
    @SerialName("uuid") val uuid: String,
    @SerialName("code") val code: String,
    @SerialName("value") val value: String,
    @SerialName("name") val name: LookupLocalizedText,
    @SerialName("description") val description: LookupLocalizedText? = null,
    @SerialName("parentId") val parentId: Long? = null,
    @SerialName("parentCode") val parentCode: String? = null,
    @SerialName("sortBy") val sortBy: Int = 0,
    @SerialName("isPublic") val isPublic: Boolean = true,
    @SerialName("isSystem") val isSystem: Boolean = true,
    @SerialName("items") val items: List<LookupItem> = emptyList(),
) {
    /** Same contract as [LookupType.localizedName] and [LookupItem.localizedName]. */
    fun localizedName(locale: String = "ar"): String = name.resolve(locale)

    fun findItemByCode(itemCode: String): LookupItem? {
        val target = normalizeLookupCode(itemCode)
        return items.firstOrNull { normalizeLookupCode(it.code) == target }
    }
}

@Serializable
data class ListLookupTypesResponse(
    @SerialName("lookupTypes") val lookupTypes: List<LookupType> = emptyList(),
)

@Serializable
data class GetLookupTypeByCodeResponse(
    @SerialName("lookupType") val lookupType: LookupTypeWithItems? = null,
)

@Serializable
data class GetLookupsByTypeCodesResponse(
    @SerialName("lookupTypes") val lookupTypes: Map<String, LookupTypeWithItems> = emptyMap(),
    @SerialName("list") val list: List<LookupTypeWithItems> = emptyList(),
)

@Serializable
data class GetLookupByCodeResponse(
    @SerialName("lookup") val lookup: LookupItem? = null,
    @SerialName("childLookups") val childLookups: List<LookupItem> = emptyList(),
)

fun normalizeLookupCode(code: String): String =
    code
        .trim()
        .uppercase()
        .replace(Regex("[^A-Z0-9]+"), "_")
        .trim('_')

/**
 * Shared mobile client repository for querying `lookup_types` and `lookups` by `code`
 * across all four mobile apps (Traveler, Driver, Organization, Moderator).
 */
class LookupsRepository(
    private val api: ApiClient,
) {
    private val cacheByTypeCode = mutableMapOf<String, LookupTypeWithItems>()
    private val cacheByLookupCode = mutableMapOf<String, GetLookupByCodeResponse>()

    /** Lists public lookup types, optionally filtered by [codes] or [parentCode]. */
    suspend fun listTypes(
        codes: List<String>? = null,
        parentCode: String? = null,
    ): List<LookupType> {
        val input = buildJsonObject {
            if (!codes.isNullOrEmpty()) {
                put(
                    "codes",
                    JsonArray(codes.map { JsonPrimitive(normalizeLookupCode(it)) }),
                )
            }
            if (!parentCode.isNullOrBlank()) {
                put("parentCode", normalizeLookupCode(parentCode))
            }
        }
        return api.call("lookups/listTypes", input, ListLookupTypesResponse.serializer()).lookupTypes
    }

    /**
     * Fetches a lookup type and its ordered lookup items by `lookup_types.code`
     * (and optional [parentLookupCode] filter).
     */
    suspend fun getTypeByCode(
        code: String,
        parentLookupCode: String? = null,
        forceRefresh: Boolean = false,
    ): LookupTypeWithItems? {
        val normalizedCode = normalizeLookupCode(code)
        val normalizedParent = parentLookupCode?.let { normalizeLookupCode(it) }
        val cacheKey = if (normalizedParent != null) "$normalizedCode::$normalizedParent" else normalizedCode

        if (!forceRefresh) {
            cacheByTypeCode[cacheKey]?.let { return it }
        }

        val input = buildJsonObject {
            put("code", normalizedCode)
            if (normalizedParent != null) {
                put("parentLookupCode", normalizedParent)
            }
        }
        val response = api.call(
            "lookups/getTypeByCode",
            input,
            GetLookupTypeByCodeResponse.serializer(),
        )
        response.lookupType?.let { cacheByTypeCode[cacheKey] = it }
        return response.lookupType
    }

    /** Convenience helper returning the ordered list of [LookupItem] for a `lookup_types.code`. */
    suspend fun getItemsByTypeCode(
        code: String,
        parentLookupCode: String? = null,
        forceRefresh: Boolean = false,
    ): List<LookupItem> =
        getTypeByCode(code, parentLookupCode, forceRefresh)?.items ?: emptyList()

    /** Batch-fetches multiple lookup types and their items by a list of `lookup_types.code` values. */
    suspend fun getByTypeCodes(
        codes: List<String>,
        forceRefresh: Boolean = false,
    ): Map<String, LookupTypeWithItems> {
        val normalizedCodes = codes.map { normalizeLookupCode(it) }.distinct()
        if (normalizedCodes.isEmpty()) return emptyMap()

        if (!forceRefresh && normalizedCodes.all { it in cacheByTypeCode }) {
            return normalizedCodes.associateWith { cacheByTypeCode.getValue(it) }
        }

        val input = buildJsonObject {
            put("codes", JsonArray(normalizedCodes.map { JsonPrimitive(it) }))
        }
        val response = api.call(
            "lookups/getByTypeCodes",
            input,
            GetLookupsByTypeCodesResponse.serializer(),
        )
        response.lookupTypes.forEach { (key, value) ->
            cacheByTypeCode[normalizeLookupCode(key)] = value
        }
        return response.lookupTypes
    }

    /**
     * Fetches a single lookup item and its child lookups by `lookups.code`
     * (and optional `lookup_types.code` disambiguator).
     */
    suspend fun getByCode(
        code: String,
        typeCode: String? = null,
        forceRefresh: Boolean = false,
    ): GetLookupByCodeResponse {
        val normalizedCode = normalizeLookupCode(code)
        val normalizedType = typeCode?.let { normalizeLookupCode(it) }
        val cacheKey = if (normalizedType != null) "$normalizedType::$normalizedCode" else normalizedCode

        if (!forceRefresh) {
            cacheByLookupCode[cacheKey]?.let { return it }
        }

        val input = buildJsonObject {
            put("code", normalizedCode)
            if (normalizedType != null) {
                put("typeCode", normalizedType)
            }
        }
        val response = api.call(
            "lookups/getByCode",
            input,
            GetLookupByCodeResponse.serializer(),
        )
        if (response.lookup != null) {
            cacheByLookupCode[cacheKey] = response
        }
        return response
    }

    fun clearCache() {
        cacheByTypeCode.clear()
        cacheByLookupCode.clear()
    }
}
