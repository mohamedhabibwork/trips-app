package com.tripsenjoy.media

import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.auth.AuthRepository
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/** Purpose policy returned by `media/getUploadPurposes`. */
@Serializable
data class UploadPurposePolicy(
    @SerialName("purpose") val purpose: String = "",
    @SerialName("allowedMimeTypes") val allowedMimeTypes: List<String> = emptyList(),
    @SerialName("allowedExtensions") val allowedExtensions: List<String> = emptyList(),
    @SerialName("maxSizeBytes") val maxSizeBytes: Int = 0,
    @SerialName("unlinkedTtlHours") val unlinkedTtlHours: Int = 12,
)

/** Response of `media/getUploadPurposes`. */
@Serializable
data class UploadPurposesResponse(
    @SerialName("purposes") val purposes: List<UploadPurposePolicy> = emptyList(),
)

/** Upload intent record returned by `media/createUploadIntent`. */
@Serializable
data class UploadIntentRecord(
    @SerialName("id") val id: String = "",
    @SerialName("purpose") val purpose: String = "",
    @SerialName("storageKey") val storageKey: String = "",
    @SerialName("mimeType") val mimeType: String = "",
    @SerialName("sizeBytes") val sizeBytes: Int = 0,
    @SerialName("status") val status: String = "",
    @SerialName("expiresAt") val expiresAt: String = "",
)

/** Response of `media/createUploadIntent`. */
@Serializable
data class CreateUploadIntentResponse(
    @SerialName("intent") val intent: UploadIntentRecord,
    @SerialName("uploadUrl") val uploadUrl: String = "",
)

/** Stored file metadata returned by `media` procedures. */
@Serializable
data class UploadedFileRecord(
    @SerialName("id") val id: String = "",
    @SerialName("purpose") val purpose: String = "",
    @SerialName("storageKey") val storageKey: String = "",
    @SerialName("url") val url: String = "",
    @SerialName("originalFilename") val originalFilename: String = "",
    @SerialName("mimeType") val mimeType: String = "",
    @SerialName("sizeBytes") val sizeBytes: Int = 0,
    @SerialName("status") val status: String = "",
    @SerialName("linkedEntityType") val linkedEntityType: String? = null,
    @SerialName("linkedEntityId") val linkedEntityId: String? = null,
    @SerialName("expiresAt") val expiresAt: String? = null,
)

/** Response of `media/uploadFile`, `media/confirmUploadIntent`, and `media/getFile`. */
@Serializable
data class UploadedFileEnvelope(
    @SerialName("file") val file: UploadedFileRecord,
)

/**
 * Typed client for the `media` oRPC procedures (purpose-based validation + 12h unlinked TTL).
 */
class MediaRepository(
    private val api: ApiClient,
    private val auth: AuthRepository? = null,
) {
    private suspend fun <T> runAuthed(procedure: String, block: suspend () -> T): T {
        val repo = auth
        return if (repo != null) repo.authed(procedure, block) else block()
    }

    /** `media/getUploadPurposes`. */
    suspend fun getUploadPurposes(purpose: String? = null): UploadPurposesResponse =
        runAuthed(PROC_GET_UPLOAD_PURPOSES) {
            val input = buildJsonObject {
                if (purpose != null) put("purpose", purpose)
            }
            api.call(PROC_GET_UPLOAD_PURPOSES, input, UploadPurposesResponse.serializer())
        }

    /** `media/createUploadIntent`. */
    suspend fun createUploadIntent(
        purpose: String,
        originalFilename: String,
        mimeType: String,
        sizeBytes: Int,
        sha256: String? = null,
    ): CreateUploadIntentResponse = runAuthed(PROC_CREATE_UPLOAD_INTENT) {
        val input = buildJsonObject {
            put("purpose", purpose)
            put("originalFilename", originalFilename)
            put("mimeType", mimeType)
            put("sizeBytes", sizeBytes)
            if (sha256 != null) put("sha256", sha256)
        }
        api.call(PROC_CREATE_UPLOAD_INTENT, input, CreateUploadIntentResponse.serializer())
    }

    /** `media/confirmUploadIntent`. */
    suspend fun confirmUploadIntent(intentId: String): UploadedFileRecord =
        runAuthed(PROC_CONFIRM_UPLOAD_INTENT) {
            val input = buildJsonObject {
                put("intentId", intentId)
            }
            api.call(PROC_CONFIRM_UPLOAD_INTENT, input, UploadedFileEnvelope.serializer()).file
        }

    /** `media/uploadFile` — direct base64 upload with purpose validation. */
    suspend fun uploadFile(
        originalFilename: String,
        mimeType: String,
        contentBase64: String,
        purpose: String = "document",
        intentId: String? = null,
    ): UploadedFileRecord = runAuthed(PROC_UPLOAD_FILE) {
        val input = buildJsonObject {
            put("originalFilename", originalFilename)
            put("mimeType", mimeType)
            put("contentBase64", contentBase64)
            put("purpose", purpose)
            if (intentId != null) put("intentId", intentId)
        }
        api.call(PROC_UPLOAD_FILE, input, UploadedFileEnvelope.serializer()).file
    }

    /** `media/getFile`. */
    suspend fun getFile(fileId: String): UploadedFileRecord = runAuthed(PROC_GET_FILE) {
        val input = buildJsonObject {
            put("fileId", fileId)
        }
        api.call(PROC_GET_FILE, input, UploadedFileEnvelope.serializer()).file
    }

    companion object {
        const val PROC_GET_UPLOAD_PURPOSES = "media/getUploadPurposes"
        const val PROC_CREATE_UPLOAD_INTENT = "media/createUploadIntent"
        const val PROC_CONFIRM_UPLOAD_INTENT = "media/confirmUploadIntent"
        const val PROC_UPLOAD_FILE = "media/uploadFile"
        const val PROC_GET_FILE = "media/getFile"
    }
}
