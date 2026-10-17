package com.tripsenjoy.ui.components

// Calendar date with no time zone: year, month (1 to 12) and day (1 to the length of the month).
// kotlinx-datetime is not on this module's classpath, so the arithmetic lives here.
data class TeDate(val year: Int, val month: Int, val day: Int) : Comparable<TeDate> {
    init {
        require(month in 1..MONTHS_IN_YEAR) { "month must be 1 to 12, was $month" }
        require(day in 1..daysInMonth(year, month)) { "day $day is out of range for $year-$month" }
    }

    override fun compareTo(other: TeDate): Int =
        compareValuesBy(this, other, TeDate::year, TeDate::month, TeDate::day)
}

private const val MONTHS_IN_YEAR = 12
private const val DAYS_IN_WEEK = 7
private const val SUNDAY = 0
private const val SATURDAY = 6
private const val FIRST_DAY = 1
private const val EPOCH_WEEKDAY = 4 // 1970-01-01 was a Thursday; Sunday is 0.
private const val DAYS_PER_400_YEARS = 146097L
private const val EPOCH_OFFSET_DAYS = 719468L

private val MonthNames = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)

private val WeekdayShortNames = listOf("Su", "Mo", "Tu", "We", "Th", "Fr", "Sa")

fun isLeapYear(year: Int): Boolean =
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0

fun daysInMonth(year: Int, month: Int): Int = when (month) {
    2 -> if (isLeapYear(year)) 29 else 28
    4, 6, 9, 11 -> 30
    else -> 31
}

// Days since 1970-01-01 in the proleptic Gregorian calendar (civil-from-days, Howard Hinnant's method).
internal fun TeDate.epochDay(): Long {
    val shiftedYear = year.toLong() - if (month <= 2) 1L else 0L
    val era = shiftedYear.floorDiv(400L)
    val yearOfEra = shiftedYear - era * 400L
    val marchBasedMonth = (month + 9) % 12
    val dayOfYear = (153 * marchBasedMonth + 2) / 5 + day - 1
    val dayOfEra = yearOfEra * 365L + yearOfEra / 4L - yearOfEra / 100L + dayOfYear
    return era * DAYS_PER_400_YEARS + dayOfEra - EPOCH_OFFSET_DAYS
}

// 0 for Sunday through 6 for Saturday.
internal fun TeDate.weekday(): Int {
    val days = epochDay() + EPOCH_WEEKDAY
    return days.mod(DAYS_IN_WEEK.toLong()).toInt()
}

// Column index in the month grid: which slot the given weekday occupies when the week starts on Saturday or Sunday.
internal fun gridColumn(weekday: Int, weekStartsOnSaturday: Boolean): Int =
    if (weekStartsOnSaturday) (weekday + 1) % DAYS_IN_WEEK else weekday

// Returns the first day of the month that is `months` away from this one.
fun TeDate.shiftMonth(months: Int): TeDate {
    val monthIndex = year * MONTHS_IN_YEAR + (month - 1) + months
    val shiftedYear = monthIndex.floorDiv(MONTHS_IN_YEAR)
    val shiftedMonth = monthIndex.mod(MONTHS_IN_YEAR) + 1
    return TeDate(shiftedYear, shiftedMonth, FIRST_DAY)
}

// Weeks of the month as rows of seven cells. Cells outside the month are null, so they can be left empty.
fun buildMonthGrid(year: Int, month: Int, weekStartsOnSaturday: Boolean): List<List<TeDate?>> {
    val firstDay = TeDate(year, month, FIRST_DAY)
    val leadingBlanks = gridColumn(firstDay.weekday(), weekStartsOnSaturday)
    val days: List<TeDate?> = (FIRST_DAY..daysInMonth(year, month)).map { TeDate(year, month, it) }
    val cells: List<TeDate?> = List(leadingBlanks) { null } + days
    val trailingBlanks = (DAYS_IN_WEEK - cells.size % DAYS_IN_WEEK) % DAYS_IN_WEEK
    return (cells + List(trailingBlanks) { null }).chunked(DAYS_IN_WEEK)
}

// Column headers in grid order.
fun weekdayHeaders(weekStartsOnSaturday: Boolean): List<String> {
    val first = if (weekStartsOnSaturday) SATURDAY else SUNDAY
    return List(DAYS_IN_WEEK) { WeekdayShortNames[(first + it) % DAYS_IN_WEEK] }
}

fun monthName(month: Int): String {
    require(month in 1..MONTHS_IN_YEAR) { "month must be 1 to 12, was $month" }
    return MonthNames[month - 1]
}

// A day is enabled when it falls inside the optional bounds (both ends included).
fun isDateEnabled(date: TeDate, minDate: TeDate?, maxDate: TeDate?): Boolean =
    (minDate == null || date >= minDate) && (maxDate == null || date <= maxDate)

// Spoken name for a day, for example "15 October 2026, selected".
fun dayDescription(date: TeDate, selected: Boolean): String {
    val full = "${date.day} ${monthName(date.month)} ${date.year}"
    return if (selected) "$full, selected" else full
}
