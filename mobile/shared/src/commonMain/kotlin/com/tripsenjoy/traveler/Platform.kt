package com.tripsenjoy.traveler

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform