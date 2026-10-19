package com.tripsenjoy.traveler

import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.media.MediaRepository
import com.tripsenjoy.trips.TripsBrowseRepository
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpHeaders
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class TravelerAndTripsRepositoryTest {

    private val jsonHeaders = headersOf(HttpHeaders.ContentType, "application/json")

    @Test
    fun `TravelerRepository fetches and updates profile notifications plan overview and privacy action`() = runTest {
        val requestedUrls = mutableListOf<String>()
        val engine = MockEngine { request ->
            val url = request.url.toString()
            requestedUrls += url
            when {
                url.endsWith("/rpc/traveler/getProfile") -> respond(
                    content = """
                    {
                      "json": {
                        "accountId": "usr-01",
                        "fullName": "Layla Mansour",
                        "email": "layla@example.com",
                        "phoneE164": "+201012345678",
                        "countryCode": "EG",
                        "preferredLanguage": "ar",
                        "avatarUrl": "https://cdn.tripsenjoy.test/avatars/layla.jpg",
                        "travelerPlanTier": "plus",
                        "notificationPreferences": {
                          "bookingsPush": true,
                          "bookingsSms": true,
                          "bookingsEmail": true,
                          "tripUpdatesPush": true,
                          "tripUpdatesSms": true,
                          "tripUpdatesEmail": true,
                          "promotionsPush": false,
                          "promotionsSms": false,
                          "promotionsEmail": false,
                          "quietHoursNotice": "22:00-08:00"
                        },
                        "quietHoursNotice": "22:00-08:00"
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/traveler/updateProfile") -> respond(
                    content = """
                    {
                      "json": {
                        "accountId": "usr-01",
                        "fullName": "Layla M.",
                        "email": "layla@example.com",
                        "phoneE164": "+201012345678",
                        "countryCode": "EG",
                        "preferredLanguage": "en",
                        "avatarUrl": "https://cdn.tripsenjoy.test/avatars/layla-2.jpg",
                        "travelerPlanTier": "plus",
                        "notificationPreferences": {
                          "bookingsPush": true,
                          "bookingsSms": true,
                          "bookingsEmail": true,
                          "tripUpdatesPush": true,
                          "tripUpdatesSms": true,
                          "tripUpdatesEmail": true,
                          "promotionsPush": true,
                          "promotionsSms": false,
                          "promotionsEmail": false,
                          "quietHoursNotice": "22:00-08:00"
                        },
                        "quietHoursNotice": "22:00-08:00"
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/traveler/getNotificationPreferences") -> respond(
                    content = """
                    {
                      "json": {
                        "bookingsPush": true,
                        "bookingsSms": true,
                        "bookingsEmail": true,
                        "tripUpdatesPush": true,
                        "tripUpdatesSms": true,
                        "tripUpdatesEmail": true,
                        "promotionsPush": false,
                        "promotionsSms": false,
                        "promotionsEmail": false,
                        "quietHoursNotice": "22:00-08:00"
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/traveler/updateNotificationPreferences") -> respond(
                    content = """
                    {
                      "json": {
                        "bookingsPush": true,
                        "bookingsSms": true,
                        "bookingsEmail": true,
                        "tripUpdatesPush": true,
                        "tripUpdatesSms": true,
                        "tripUpdatesEmail": true,
                        "promotionsPush": true,
                        "promotionsSms": false,
                        "promotionsEmail": false,
                        "quietHoursNotice": "22:00-08:00"
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/traveler/getPlanOverview") -> respond(
                    content = """
                    {
                      "json": {
                        "currentPlanTier": "free",
                        "annualDiscountBps": 1500,
                        "plans": [
                          {
                            "id": "plan-free",
                            "role": "traveler",
                            "tier": "free",
                            "nameEn": "Free",
                            "nameAr": "مجاني",
                            "monthlyPriceMinor": 0,
                            "annualPriceMinor": 0,
                            "currencyCode": "EGP",
                            "annualDiscountBps": 1500
                          },
                          {
                            "id": "plan-plus",
                            "role": "traveler",
                            "tier": "plus",
                            "nameEn": "Plus",
                            "nameAr": "بلس",
                            "monthlyPriceMinor": 9900,
                            "annualPriceMinor": 100980,
                            "currencyCode": "EGP",
                            "annualDiscountBps": 1500
                          }
                        ]
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/traveler/requestPrivacyAction") -> respond(
                    content = """
                    {
                      "json": {
                        "id": "prv-01",
                        "accountId": "usr-01",
                        "requestType": "data_export",
                        "status": "pending",
                        "reason": "Personal archive",
                        "downloadUrl": null,
                        "scheduledPurgeAt": null,
                        "completedAt": null,
                        "createdAt": "2026-04-17T12:00:00Z"
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                else -> error("Unexpected URL: $url")
            }
        }

        val repo = TravelerRepository(ApiClient("http://localhost:3000", HttpClient(engine)))

        val profile = repo.getProfile()
        assertEquals("Layla Mansour", profile.fullName)
        assertEquals("ar", profile.preferredLanguage)

        val updatedProfile = repo.updateProfile(
            fullName = "Layla M.",
            countryCode = "EG",
            preferredLanguage = "en",
            avatarUrl = "https://cdn.tripsenjoy.test/avatars/layla-2.jpg",
            fileIds = listOf("med-avatar-02"),
        )
        assertEquals("Layla M.", updatedProfile.fullName)
        assertEquals("en", updatedProfile.preferredLanguage)
        assertEquals("https://cdn.tripsenjoy.test/avatars/layla-2.jpg", updatedProfile.avatarUrl)

        val prefs = repo.getNotificationPreferences()
        assertEquals(false, prefs.promotionsPush)

        val updatedPrefs = repo.updateNotificationPreferences(
            promotionsPush = true,
        )
        assertTrue(updatedPrefs.promotionsPush)

        val planOverview = repo.getPlanOverview()
        assertEquals("free", planOverview.currentPlanTier)
        assertEquals(2, planOverview.plans.size)

        val privacyReq = repo.requestPrivacyAction(
            requestType = TravelerRepository.PRIVACY_DATA_EXPORT,
            confirmedUnderstood = true,
            reason = "Personal archive",
        )
        assertEquals("prv-01", privacyReq.id)
        assertEquals("data_export", privacyReq.requestType)
        assertEquals("pending", privacyReq.status)
        assertEquals(6, requestedUrls.size)
    }

    @Test
    fun `MediaRepository executes getUploadPurposes createUploadIntent confirmUploadIntent and uploadFile`() = runTest {
        val engine = MockEngine { request ->
            val url = request.url.toString()
            when {
                url.endsWith("/rpc/media/getUploadPurposes") -> respond(
                    content = """
                    {
                      "json": {
                        "purposes": [
                          {
                            "purpose": "avatar",
                            "allowedMimeTypes": ["image/jpeg", "image/png"],
                            "allowedExtensions": [".jpg", ".png"],
                            "maxSizeBytes": 5242880,
                            "unlinkedTtlHours": 12
                          }
                        ]
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/media/createUploadIntent") -> respond(
                    content = """
                    {
                      "json": {
                        "intent": {
                          "id": "intent-01",
                          "purpose": "avatar",
                          "storageKey": "avatars/2026/avatar.jpg",
                          "mimeType": "image/jpeg",
                          "sizeBytes": 1024,
                          "status": "pending",
                          "expiresAt": "2026-04-18T00:00:00Z"
                        },
                        "uploadUrl": "https://storage.tripsenjoy.test/upload/intent-01"
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/media/confirmUploadIntent") -> respond(
                    content = """
                    {
                      "json": {
                        "file": {
                          "id": "file-01",
                          "purpose": "avatar",
                          "storageKey": "avatars/2026/avatar.jpg",
                          "url": "https://cdn.tripsenjoy.test/avatars/2026/avatar.jpg",
                          "originalFilename": "avatar.jpg",
                          "mimeType": "image/jpeg",
                          "sizeBytes": 1024,
                          "status": "unlinked",
                          "linkedEntityType": null,
                          "linkedEntityId": null,
                          "expiresAt": "2026-04-18T00:00:00Z"
                        }
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                url.endsWith("/rpc/media/uploadFile") -> respond(
                    content = """
                    {
                      "json": {
                        "file": {
                          "id": "file-02",
                          "purpose": "avatar",
                          "storageKey": "avatars/2026/avatar2.jpg",
                          "url": "https://cdn.tripsenjoy.test/avatars/2026/avatar2.jpg",
                          "originalFilename": "avatar2.jpg",
                          "mimeType": "image/jpeg",
                          "sizeBytes": 4,
                          "status": "unlinked",
                          "linkedEntityType": null,
                          "linkedEntityId": null,
                          "expiresAt": "2026-04-18T00:00:00Z"
                        }
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                else -> error("Unexpected URL: $url")
            }
        }

        val repo = MediaRepository(ApiClient("http://localhost:3000", HttpClient(engine)))

        val purposes = repo.getUploadPurposes("avatar")
        assertEquals(1, purposes.purposes.size)
        assertEquals("avatar", purposes.purposes.first().purpose)

        val intentResp = repo.createUploadIntent(
            purpose = "avatar",
            originalFilename = "avatar.jpg",
            mimeType = "image/jpeg",
            sizeBytes = 1024,
        )
        assertEquals("intent-01", intentResp.intent.id)
        assertEquals("https://storage.tripsenjoy.test/upload/intent-01", intentResp.uploadUrl)

        val confirmed = repo.confirmUploadIntent("intent-01")
        assertEquals("file-01", confirmed.id)
        assertEquals("https://cdn.tripsenjoy.test/avatars/2026/avatar.jpg", confirmed.url)

        val uploaded = repo.uploadFile(
            originalFilename = "avatar2.jpg",
            mimeType = "image/jpeg",
            contentBase64 = "AQIDBA==",
            purpose = "avatar",
        )
        assertEquals("file-02", uploaded.id)
        assertEquals("https://cdn.tripsenjoy.test/avatars/2026/avatar2.jpg", uploaded.url)
    }

    @Test
    fun `TripsBrowseRepository browses public trips and fetches public trip detail`() = runTest {
        var lastBrowseBody = ""
        val engine = MockEngine { request ->
            val url = request.url.toString()
            when {
                url.endsWith("/rpc/trips/browsePublicTrips") -> {
                    lastBrowseBody = (request.body as TextContent).text
                    respond(
                        content = """
                        {
                          "json": {
                            "items": [
                              {
                                "id": "trip-01",
                                "tenantId": "org-01",
                                "organizerNameAr": "رحلات النيل",
                                "organizerNameEn": "Nile Expeditions",
                                "titleAr": "واحة سيوة",
                                "titleEn": "Siwa Oasis Escape",
                                "descriptionAr": "رحلة تخييم",
                                "descriptionEn": "Camping trip",
                                "categoryLookupCode": "DESERT",
                                "language": "ar",
                                "coverImageUrl": "https://cdn.tripsenjoy.test/trips/siwa.jpg",
                                "galleryImageUrls": [],
                                "startsAt": "2026-05-01T06:00:00Z",
                                "endsAt": "2026-05-04T20:00:00Z",
                                "timezone": "Africa/Cairo",
                                "origin": {
                                  "nameAr": "القاهرة",
                                  "nameEn": "Cairo",
                                  "regionLookupCode": "REGION_CAIRO"
                                },
                                "destinations": [
                                  {
                                    "nameAr": "سيوة",
                                    "nameEn": "Siwa",
                                    "regionLookupCode": "REGION_MATROUH"
                                  }
                                ],
                                "seatAssignmentMode": "traveler_choice",
                                "basePrice": {
                                  "amountMinor": 450000,
                                  "currency": "EGP"
                                },
                                "basePriceMinor": 450000,
                                "currencyCode": "EGP",
                                "totalCapacity": 28,
                                "confirmedSeatsCount": 14,
                                "remainingSeatsCount": 14,
                                "childTrackingEnabled": true,
                                "state": "published"
                              }
                            ]
                          }
                        }
                        """.trimIndent(),
                        headers = jsonHeaders,
                    )
                }
                url.endsWith("/rpc/trips/getPublicTripDetail") -> respond(
                    content = """
                    {
                      "json": {
                        "trip": {
                          "id": "trip-01",
                          "tenantId": "org-01",
                          "organizerNameAr": "رحلات النيل",
                          "organizerNameEn": "Nile Expeditions",
                          "titleAr": "واحة سيوة",
                          "titleEn": "Siwa Oasis Escape",
                          "descriptionAr": "رحلة تخييم",
                          "descriptionEn": "Camping trip",
                          "categoryLookupCode": "DESERT",
                          "language": "ar",
                          "coverImageUrl": "https://cdn.tripsenjoy.test/trips/siwa.jpg",
                          "galleryImageUrls": [],
                          "startsAt": "2026-05-01T06:00:00Z",
                          "endsAt": "2026-05-04T20:00:00Z",
                          "timezone": "Africa/Cairo",
                          "origin": {
                            "nameAr": "القاهرة",
                            "nameEn": "Cairo",
                            "regionLookupCode": "REGION_CAIRO"
                          },
                          "destinations": [
                            {
                              "nameAr": "سيوة",
                              "nameEn": "Siwa",
                              "regionLookupCode": "REGION_MATROUH"
                            }
                          ],
                          "seatAssignmentMode": "traveler_choice",
                          "basePrice": {
                            "amountMinor": 450000,
                            "currency": "EGP"
                          },
                          "basePriceMinor": 450000,
                          "currencyCode": "EGP",
                          "totalCapacity": 28,
                          "confirmedSeatsCount": 14,
                          "remainingSeatsCount": 14,
                          "childTrackingEnabled": true,
                          "state": "published"
                        }
                      }
                    }
                    """.trimIndent(),
                    headers = jsonHeaders,
                )
                else -> error("Unexpected URL: $url")
            }
        }

        val repo = TripsBrowseRepository(ApiClient("http://localhost:3000", HttpClient(engine)))

        val items = repo.browsePublicTrips(
            search = "Siwa",
            categoryLookupCode = "DESERT",
            regionLookupCode = "REGION_MATROUH",
        )
        assertTrue(lastBrowseBody.contains("DESERT"))
        assertEquals(1, items.size)
        assertEquals("trip-01", items.first().id)
        assertEquals("Siwa Oasis Escape", items.first().titleEn)
        assertEquals("واحة سيوة", items.first().titleAr)

        val detail = repo.getPublicTripDetail("trip-01")
        assertNotNull(detail)
        assertEquals("trip-01", detail.id)
        assertEquals(14, detail.remainingSeatsCount)
        assertTrue(detail.childTrackingEnabled)
    }
}
