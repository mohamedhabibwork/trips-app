package com.tripsenjoy.auth

/**
 * Minimal ISO-8601 UTC parsing and formatting without an extra dependency.
 *
 * The auth procedures return `sessionMaxExpiresAt` as an ISO-8601 string (for example
 * `2026-10-17T13:02:06.123Z`) while the persisted [SessionRecord] stores epoch milliseconds
 * (PRD §7.1, T2). `kotlinx-datetime` is not in the version catalog and this module may not add
 * third-party dependencies, so the conversion lives here: two pure functions, fully unit-tested.
 *
 * Only the shapes the server actually emits are accepted; anything else returns `null` so the
 * caller can fall back to a value it already trusts instead of guessing.
 */
object AuthInstant {

    private const val MILLIS_PER_SECOND = 1_000L
    private const val SECONDS_PER_MINUTE = 60L
    private const val SECONDS_PER_HOUR = 3_600L
    private const val MILLIS_PER_DAY = 86_400_000L

    /**
     * Parses an ISO-8601 UTC timestamp into epoch milliseconds.
     *
     * Accepted: `YYYY-MM-DDTHH:MM:SSZ`, `YYYY-MM-DDTHH:MM:SS.sssZ`, the same with a `+00:00` /
     * `-00:00` / `+HH:MM` offset, and a space instead of `T`. Returns `null` when [value] is
     * `null`, blank, or not one of those shapes.
     */
    fun parseIsoUtc(value: String?): Long? {
        if (value == null) return null
        val text = value.trim()
        // "YYYY-MM-DDTHH:MM:SS" is 19 characters; anything shorter cannot be a timestamp.
        if (text.length < 19) return null
        if (text[4] != '-' || text[7] != '-' || text[10] != 'T' && text[10] != ' ') return null
        if (text[13] != ':' || text[16] != ':') return null

        val year = text.substring(0, 4).toIntOrNull() ?: return null
        val month = text.substring(5, 7).toIntOrNull() ?: return null
        val day = text.substring(8, 10).toIntOrNull() ?: return null
        val hour = text.substring(11, 13).toIntOrNull() ?: return null
        val minute = text.substring(14, 16).toIntOrNull() ?: return null
        val second = text.substring(17, 19).toIntOrNull() ?: return null
        if (month !in 1..12 || day !in 1..31 || hour !in 0..23 || minute !in 0..59 || second !in 0..60) {
            return null
        }

        var cursor = 19
        var millis = 0L
        if (cursor < text.length && text[cursor] == '.') {
            cursor++
            val fractionStart = cursor
            while (cursor < text.length && text[cursor].isDigit()) cursor++
            val digits = text.substring(fractionStart, cursor)
            if (digits.isEmpty()) return null
            // Keep the first three digits, pad when fewer are present ("5" means 500 ms).
            val padded = (digits + "000").substring(0, 3)
            millis = padded.toLongOrNull() ?: return null
        }

        val offsetMinutes = parseOffsetMinutes(text, cursor) ?: return null

        val epochDays = daysFromCivil(year, month, day)
        val secondsOfDay = hour * SECONDS_PER_HOUR + minute * SECONDS_PER_MINUTE + second
        val localMillis = epochDays * MILLIS_PER_DAY + secondsOfDay * MILLIS_PER_SECOND + millis
        return localMillis - offsetMinutes * SECONDS_PER_MINUTE * MILLIS_PER_SECOND
    }

    /**
     * Formats epoch milliseconds as `YYYY-MM-DDTHH:MM:SS.sssZ`.
     *
     * Used by tests and debug output only; nothing user-facing is built from it.
     */
    fun formatIsoUtc(epochMillis: Long): String {
        val days = floorDiv(epochMillis, MILLIS_PER_DAY)
        var remainder = epochMillis - days * MILLIS_PER_DAY
        val (year, month, day) = civilFromDays(days)
        val hour = remainder / (SECONDS_PER_HOUR * MILLIS_PER_SECOND)
        remainder -= hour * SECONDS_PER_HOUR * MILLIS_PER_SECOND
        val minute = remainder / (SECONDS_PER_MINUTE * MILLIS_PER_SECOND)
        remainder -= minute * SECONDS_PER_MINUTE * MILLIS_PER_SECOND
        val second = remainder / MILLIS_PER_SECOND
        val millis = remainder - second * MILLIS_PER_SECOND
        return buildString {
            append(pad(year, 4))
            append('-')
            append(pad(month, 2))
            append('-')
            append(pad(day, 2))
            append('T')
            append(pad(hour, 2))
            append(':')
            append(pad(minute, 2))
            append(':')
            append(pad(second, 2))
            append('.')
            append(pad(millis, 3))
            append('Z')
        }
    }

    /** Reads the trailing `Z` or `±HH:MM` offset and returns it in minutes, or `null` if invalid. */
    private fun parseOffsetMinutes(text: String, start: Int): Long? {
        if (start >= text.length) return null
        when (text[start]) {
            'Z', 'z' -> return if (start + 1 == text.length) 0L else null
            '+', '-' -> Unit
            else -> return null
        }
        val sign = if (text[start] == '-') -1L else 1L
        // Accept "+HH:MM" and "+HHMM".
        val rest = text.substring(start + 1)
        val hours: Int
        val minutes: Int
        if (rest.length == 5 && rest[2] == ':') {
            hours = rest.substring(0, 2).toIntOrNull() ?: return null
            minutes = rest.substring(3, 5).toIntOrNull() ?: return null
        } else if (rest.length == 4) {
            hours = rest.substring(0, 2).toIntOrNull() ?: return null
            minutes = rest.substring(2, 4).toIntOrNull() ?: return null
        } else {
            return null
        }
        if (hours !in 0..23 || minutes !in 0..59) return null
        return sign * (hours * 60L + minutes)
    }

    /** Days since 1970-01-01 for a proleptic Gregorian date (Howard Hinnant's `days_from_civil`). */
    private fun daysFromCivil(year: Int, month: Int, day: Int): Long {
        val adjustedYear = year - if (month <= 2) 1 else 0
        val era = (if (adjustedYear >= 0) adjustedYear else adjustedYear - 399) / 400
        val yearOfEra = adjustedYear - era * 400
        val monthShifted = if (month > 2) month - 3 else month + 9
        val dayOfYear = (153 * monthShifted + 2) / 5 + day - 1
        val dayOfEra = yearOfEra * 365 + yearOfEra / 4 - yearOfEra / 100 + dayOfYear
        return era.toLong() * 146_097L + dayOfEra.toLong() - 719_468L
    }

    /** Inverse of [daysFromCivil] (Howard Hinnant's `civil_from_days`). */
    private fun civilFromDays(days: Long): Triple<Int, Int, Int> {
        val shifted = days + 719_468L
        val era = (if (shifted >= 0) shifted else shifted - 146_096L) / 146_097L
        val dayOfEra = shifted - era * 146_097L
        val yearOfEra =
            (dayOfEra - dayOfEra / 1_460L + dayOfEra / 36_524L - dayOfEra / 146_096L) / 365L
        var year = yearOfEra + era * 400L
        val dayOfYear = dayOfEra - (365L * yearOfEra + yearOfEra / 4L - yearOfEra / 100L)
        val monthPrime = (5L * dayOfYear + 2L) / 153L
        val day = dayOfYear - (153L * monthPrime + 2L) / 5L + 1L
        val month = if (monthPrime < 10L) monthPrime + 3L else monthPrime - 9L
        if (month <= 2L) year += 1L
        return Triple(year.toInt(), month.toInt(), day.toInt())
    }

    private fun floorDiv(value: Long, divisor: Long): Long {
        val quotient = value / divisor
        return if (value % divisor != 0L && (value xor divisor) < 0L) quotient - 1 else quotient
    }

    private fun pad(value: Int, width: Int): String {
        val text = value.toString()
        return if (text.length >= width) text else "0".repeat(width - text.length) + text
    }

    private fun pad(value: Long, width: Int): String = pad(value.toInt(), width)
}
