package com.tripsenjoy.auth

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

/**
 * Wasm storage: memory only (ARCHITECTURE §5.4, corrected).
 *
 * `localStorage` is **not** reachable from `wasmJsMain` in this build: `kotlinx.browser` is only on
 * the `jsMain` classpath (`libs.wrappers.browser`), and adding it here is not allowed. The wasm
 * target is a harness, not a shipping app, so persistence is the web app's job — the record lives
 * for as long as the page is open, which is exactly what the PRD asks of the web/wasm build
 * (PRD §7.1: "Mobile web/wasm build — memory only").
 */
@Composable
actual fun rememberAuthStorage(): AuthStorage = remember { InMemoryAuthStorage() }
