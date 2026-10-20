package com.tripsenjoy.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import com.tripsenjoy.analytics.AnalyticsTracker

// Moves between screens of one app. Screens read it with LocalScreenNavigator.current.
interface ScreenNavigator {
    val currentId: String
    val canGoBack: Boolean
    fun open(id: String)
    fun replace(id: String)
    fun back()
}

val LocalScreenNavigator = staticCompositionLocalOf<ScreenNavigator> {
    error("ScreenNavigator not provided. Wrap the screens in ScreenHost.")
}

// Hosts one screen at a time with a back stack. The start screen is the first entry.
@Composable
fun ScreenHost(
    startId: String,
    screens: List<ScreenEntry>,
    modifier: Modifier = Modifier,
    bottomBar: (@Composable (ScreenNavigator) -> Unit)? = null,
) {
    var stack by remember(startId) { mutableStateOf(listOf(startId)) }
    val navigator = object : ScreenNavigator {
        override val currentId: String get() = stack.last()
        override val canGoBack: Boolean get() = stack.size > 1
        override fun open(id: String) {
            stack = stack + id
        }

        override fun replace(id: String) {
            stack = stack.dropLast(1) + id
        }

        override fun back() {
            if (stack.size > 1) stack = stack.dropLast(1)
        }
    }
    val screen = screens.firstOrNull { it.id == navigator.currentId }
    // Central screen tracking: every screen change in every app that uses ScreenHost emits one
    // screen_view here, so individual screen files never need their own analytics call.
    LaunchedEffect(navigator.currentId) {
        AnalyticsTracker.trackScreen(
            screenName = navigator.currentId,
            params = screen?.let { mapOf("screen_title" to it.title) } ?: emptyMap(),
        )
    }
    CompositionLocalProvider(LocalScreenNavigator provides navigator) {
        if (bottomBar != null) {
            Column(modifier = modifier) {
                Box(modifier = Modifier.weight(1f).fillMaxSize()) {
                    if (screen != null) {
                        screen.content()
                    } else {
                        Text("No screen matches ${navigator.currentId}.")
                    }
                }
                bottomBar(navigator)
            }
        } else {
            Box(modifier = modifier) {
                if (screen != null) {
                    screen.content()
                } else {
                    Text("No screen matches ${navigator.currentId}.")
                }
            }
        }
    }
}

