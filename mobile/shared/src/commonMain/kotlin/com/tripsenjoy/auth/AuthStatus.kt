package com.tripsenjoy.auth

/**
 * The four authentication states every surface renders (PRD §7.5 E1).
 *
 * [wire] is the string the shared contract uses on web and in `conventions.json`; it is the only
 * value ever compared against generated conventions, so the two platforms cannot drift.
 */
enum class AuthStatus(val wire: String) {
    /** The stored record is still being read. Nothing is rendered but a skeleton. */
    LOADING("loading"),

    /** A usable session record is in the store. */
    AUTHENTICATED("authenticated"),

    /** No session record. The sign-in screen is shown. */
    ANONYMOUS("anonymous"),

    /** The session ended (refresh failed or the maximum session duration was reached). */
    SESSION_EXPIRED("sessionExpired"),
    ;

    companion object {
        /** The wire values in declaration order, used by the parity test. */
        val wireValues: List<String> get() = entries.map(AuthStatus::wire)

        /** Resolves a wire value, defaulting to [ANONYMOUS] for anything unknown. */
        fun fromWire(value: String?): AuthStatus =
            entries.firstOrNull { it.wire == value } ?: ANONYMOUS
    }
}
