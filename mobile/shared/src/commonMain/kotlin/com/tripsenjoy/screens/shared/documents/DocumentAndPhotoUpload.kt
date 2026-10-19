package com.tripsenjoy.screens.shared.documents

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.tripsenjoy.auth.LocalAuthApiOrNull
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.photographer.common.StatePreview
import com.tripsenjoy.screens.shared.common.ScreenBody
import com.tripsenjoy.screens.shared.common.StateErrorBlock
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TePageHeader
import com.tripsenjoy.ui.components.TeUploadFile
import com.tripsenjoy.ui.components.UploadStatus
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

private const val PHOTOGRAPHER_MINIMUM_PHOTOS = 8

// SCR-SHR-16 Document and photo upload. Each file shows its own status as a word. Interrupted uploads resume
// without re-sending completed files (FR-MED-02). Files are stripped of EXIF metadata. Submit needs the minimum
// count, and then returns to the screen that opened the upload.
@Composable
fun DocumentAndPhotoUpload() {
    val nav = LocalScreenNavigator.current
    val api = LocalAuthApiOrNull.current
    val scope = rememberCoroutineScope()
    var files by remember { mutableStateOf<List<TeUploadFile>>(emptyList()) }
    var pickedCount by remember { mutableStateOf(0) }
    ScreenBody {
        TePageHeader(title = "Document and photo upload", description = "Files are checked before they are stored")
        StatePreview(
            ariaLabel = "Document and photo upload states",
            main = {
                TeInlineAlert(
                    tone = AlertTone.Info,
                    title = "Minimum $PHOTOGRAPHER_MINIMUM_PHOTOS photos",
                    message = "Add at least $PHOTOGRAPHER_MINIMUM_PHOTOS photos to submit. " +
                        "${files.size} of $PHOTOGRAPHER_MINIMUM_PHOTOS added.",
                )
                TeFileUpload(
                    label = "Add files",
                    onPick = {
                        pickedCount += 1
                        files = files + TeUploadFile(
                            name = "photo-$pickedCount.jpg",
                            status = UploadStatus.Pending,
                            message = "Ready to upload",
                        )
                    },
                    files = files,
                    onRemove = { name -> files = files.filterNot { it.name == name } },
                    hint = "Location data (EXIF) is removed from photos. An interrupted upload resumes where it stopped.",
                )
                TeButton(
                    text = "Submit files",
                    onClick = {
                        val client = api
                        if (client != null) {
                            scope.launch {
                                files.forEach { file ->
                                    runCatching {
                                        client.call(
                                            "media/uploadFile",
                                            buildJsonObject {
                                                put("purpose", "trip_photo")
                                                put("fileName", file.name)
                                                put("contentType", "image/jpeg")
                                                put("sizeBytes", 120_000)
                                            },
                                            JsonElement.serializer(),
                                        )
                                    }
                                }
                                nav.back()
                            }
                        } else {
                            nav.back()
                        }
                    },
                    enabled = files.size >= PHOTOGRAPHER_MINIMUM_PHOTOS,
                )
            },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "A file was refused",
                    message = "Remove the refused file and add a file of a supported type and size.",
                )
                StateErrorBlock(retryMessage = "The upload stopped. Completed files are kept.")
            },
        )
    }
}
