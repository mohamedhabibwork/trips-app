package com.tripsenjoy.auth

import kotlin.time.Clock
import kotlin.time.ExperimentalTime

/**
 * Wall-clock milliseconds for every expiry decision.
 *
 * A wall clock, not a monotonic one: `accessTokenExpiresAt` and `sessionMaxExpiresAt` come from the
 * server as absolute instants, so a monotonic source would be meaningless here. `Clock.System` is
 * in the Kotlin standard library for every target this module builds, which is why no extra
 * dependency and no `expect`/`actual` pair is needed.
 */
@OptIn(ExperimentalTime::class)
fun platformNowMillis(): Long = Clock.System.now().toEpochMilliseconds()
