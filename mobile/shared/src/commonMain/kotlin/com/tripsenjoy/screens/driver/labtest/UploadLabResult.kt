package com.tripsenjoy.screens.driver.labtest

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.tripsenjoy.screens.LocalScreenNavigator
import com.tripsenjoy.screens.driver.DriverRoutes
import com.tripsenjoy.screens.driver.common.DrvLoadingBlock
import com.tripsenjoy.screens.driver.common.DrvNote
import com.tripsenjoy.screens.driver.common.DrvScreen
import com.tripsenjoy.screens.driver.common.LocalDriverSession
import com.tripsenjoy.screens.driver.common.StatePreview
import com.tripsenjoy.screens.driver.common.isIsoDate
import com.tripsenjoy.screens.driver.common.tone
import com.tripsenjoy.screens.driver.common.withPlaceholderFile
import com.tripsenjoy.ui.components.AlertTone
import com.tripsenjoy.ui.components.TeButton
import com.tripsenjoy.ui.components.TeFileUpload
import com.tripsenjoy.ui.components.TeInlineAlert
import com.tripsenjoy.ui.components.TeInput
import com.tripsenjoy.ui.components.TeKeyboardType
import com.tripsenjoy.ui.components.TeUploadFile

// SCR-DRV-04 Upload lab result. A fallback for when the partner lab does not send the result itself.
@Composable
fun UploadLabResult() {
    DrvScreen(
        title = "Upload lab result",
        description = "Use this only when the partner lab did not send the result to the platform.",
    ) {
        StatePreview(
            main = { UploadLabResultForm() },
            loading = { DrvLoadingBlock("Uploading your result") },
            error = {
                TeInlineAlert(
                    tone = AlertTone.Error,
                    title = "Upload failed",
                    message = "Check your connection. Your file is still selected, so you can submit again.",
                )
            },
        )
    }
}

@Composable
private fun UploadLabResultForm() {
    val nav = LocalScreenNavigator.current
    val session = LocalDriverSession.current
    var files by remember { mutableStateOf(listOf<TeUploadFile>()) }
    var resultDate by remember { mutableStateOf("") }
    val dateError = if (resultDate.isNotBlank() && !isIsoDate(resultDate)) "Use the format YYYY-MM-DD." else null
    TeFileUpload(
        label = "Choose result file",
        onPick = { files = files.withPlaceholderFile(prefix = "lab-result") },
        files = files,
        onRemove = { name -> files = files.filterNot { it.name == name } },
        hint = "PDF or photo of the lab report. One file is enough.",
    )
    TeInput(
        value = resultDate,
        onValueChange = { value -> resultDate = value },
        label = "Result date",
        supportingText = "Date printed on the lab report, as YYYY-MM-DD.",
        error = dateError,
        keyboardType = TeKeyboardType.Text,
    )
    TeButton(
        text = "Submit result",
        enabled = files.isNotEmpty() && isIsoDate(resultDate),
        onClick = {
            session.uploadLabResult()
            nav.replace(DriverRoutes.LAB_STATUS_HISTORY)
        },
    )
    DrvNote("Partner labs normally send results directly. Uploads after the deadline are refused.")
}
