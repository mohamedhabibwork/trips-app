package com.tripsenjoy.auth

import com.tripsenjoy.api.ApiClient
import com.tripsenjoy.api.ApiException
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf
import kotlinx.coroutines.async
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * The refresh rules, driven through a Ktor `MockEngine` so the wire format is real.
 *
 * Each test asserts a numbered rule from PRD §7.2/§7.3/§7.4 rather than an implementation detail.
 */
class AuthRepositoryTest {

    private val jsonHeaders = headersOf(HttpHeaders.ContentType, "application/json")
    private val issuedAt = 1_700_000_000_000L
    private val accessTtlMs = 900_000L
    private val sessionCapMs = 43_200_000L

    /** A JWT-shaped token whose payload is `{"sub":"acct-1","sid":"s1"}`. */
    private val jwt =
        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhY2N0LTEiLCJzaWQiOiJzMSJ9.sig"

    private fun sessionPayload(
        accessToken: String = jwt,
        refreshToken: String = "refresh-1",
    ): String = """
        {
          "sessionId": "s1",
          "accessToken": "$accessToken",
          "refreshToken": "$refreshToken",
          "accessTokenExpiresInSeconds": 900,
          "sessionMaxExpiresAt": "2023-11-15T10:13:20.000Z",
          "activeRole": "traveler",
          "adminSubRole": null,
          "activeTenantId": null,
          "planTier": null,
          "permissions": null,
          "moderatorVehicleId": null,
          "moderatorTripId": null,
          "newDeviceAlertTriggered": false
        }
    """.trimIndent()

    private fun record(
        accessTokenExpiresAt: Long = issuedAt + accessTtlMs,
        sessionMaxExpiresAt: Long = issuedAt + sessionCapMs,
    ) = SessionRecord(
        accessToken = jwt,
        refreshToken = "refresh-1",
        accessTokenExpiresAt = accessTokenExpiresAt,
        sessionMaxExpiresAt = sessionMaxExpiresAt,
        actor = AuthActor(accountId = "acct-1", sessionId = "s1", activeRole = "traveler"),
    )

    /** One recorded request: the procedure path and the decoded body text. */
    private data class Call(val path: String, val body: String)

    private class Harness(
        val store: AuthTokenStore,
        val repository: AuthRepository,
        val calls: MutableList<Call>,
    ) {
        fun paths(): List<String> = calls.map { it.path }

        fun callsTo(procedure: String): List<Call> = calls.filter { it.path.endsWith("/rpc/$procedure") }
    }

    private fun harness(
        now: Long = issuedAt,
        initial: SessionRecord? = null,
        handler: (Call) -> Pair<String, HttpStatusCode>,
    ): Harness {
        val calls = mutableListOf<Call>()
        val engine = MockEngine { request ->
            val call = Call(
                path = request.url.encodedPath,
                body = (request.body as? TextContent)?.text.orEmpty(),
            )
            calls += call
            val (content, status) = handler(call)
            respond(content = content, status = status, headers = jsonHeaders)
        }
        val storage = FakeAuthStorage(initial?.let(SessionRecord::serialize))
        val store = AuthTokenStore(storage)
        val api = ApiClient("http://localhost:3000", HttpClient(engine))
        val repository = AuthRepository(api, store, now = { now })
        return Harness(store, repository, calls)
    }

    private fun authenticatedResponse(): Pair<String, HttpStatusCode> =
        """{"json":{"step":"authenticated","autoRestoredFromDeletion":false,"roleStatus":"active",
        "rolePauseReason":null,"availableRoles":[],"session":${sessionPayload()}}}"""
            .replace("\n", "") to HttpStatusCode.OK

    // -------------------------------------------------------------------------------------
    // Sign-in
    // -------------------------------------------------------------------------------------

    @Test
    fun `signIn stores the record and sends the documented input field names`() = runTest {
        val harness = harness { authenticatedResponse() }

        val outcome = harness.repository.signIn(identifier = "sara@trips-enjoy.com", method = "password", password = "secret")

        assertTrue(outcome is SignInOutcome.Authenticated)
        assertEquals(jwt, harness.store.accessToken())
        val call = harness.callsTo("auth/signIn").single()
        assertTrue(call.body.contains("\"identifier\":\"sara@trips-enjoy.com\""), call.body)
        assertTrue(call.body.contains("\"method\":\"password\""), call.body)
        assertTrue(call.body.contains("\"password\":\"secret\""), call.body)
        assertTrue(call.body.contains("\"surface\":\"mobile\""), call.body)
    }

    @Test
    fun `signIn on the OTP step stores nothing`() = runTest {
        val harness = harness {
            """{"json":{"step":"otp_required","otpDispatch":{"channel":"sms","targetIdentifier":"+201500000000","expiresAt":"2023-11-14T22:20:00.000Z","resendAvailableInSeconds":45,"fallbackChannelAvailable":true,"devCodePreview":"123456"}}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.signIn(identifier = "+201500000000", method = "otp")

        assertTrue(outcome is SignInOutcome.OtpRequired)
        assertEquals(45, (outcome as SignInOutcome.OtpRequired).otpDispatch.resendAvailableInSeconds)
        assertNull(harness.store.accessToken())
    }

    @Test
    fun `signIn on a pending application stores nothing`() = runTest {
        val harness = harness {
            """{"json":{"step":"application_pending_approval","accountId":"acct-9","role":"platform_driver","status":"pending_approval"}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.signIn(identifier = "driver@trips-enjoy.com", method = "password", password = "secret")

        assertTrue(outcome is SignInOutcome.PendingApproval)
        assertEquals("acct-9", (outcome as SignInOutcome.PendingApproval).accountId)
        assertNull(harness.store.accessToken())
    }

    @Test
    fun `verifyOtp signs the user in when the account becomes active`() = runTest {
        val harness = harness {
            """{"json":{"verified":true,"channel":"sms","accountId":"acct-1","accountActivated":true,"allRequiredChannelsVerified":true,"session":${sessionPayload()}}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.verifyOtp(
            targetIdentifier = "+201500000000",
            purpose = "registration",
            code = "123456",
        )

        assertTrue(outcome.verified)
        assertEquals("acct-1", outcome.record?.actor?.accountId)
        val call = harness.callsTo("auth/verifyOtp").single()
        assertTrue(call.body.contains("\"targetIdentifier\":\"+201500000000\""), call.body)
        assertTrue(call.body.contains("\"purpose\":\"registration\""), call.body)
        assertTrue(call.body.contains("\"code\":\"123456\""), call.body)
    }

    @Test
    fun `moderatorSignIn sends the staff code and the configured surface`() = runTest {
        val harness = harness {
            """{"json":{"step":"authenticated","assignment":{"id":"a1","tenantId":"t1","tripId":"trip1","vehicleId":"v1","validUntil":"2023-11-15T00:00:00.000Z"},"session":${sessionPayload()}}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }
        harness.repository.surface = AuthRepository.SURFACE_PWA

        harness.repository.moderatorSignIn(identifier = "mod@trips-enjoy.com", staffCode = "849201")

        val call = harness.callsTo("auth/moderatorSignIn").single()
        assertTrue(call.body.contains("\"identifier\":\"mod@trips-enjoy.com\""), call.body)
        assertTrue(call.body.contains("\"staffCode\":\"849201\""), call.body)
        assertTrue(call.body.contains("\"surface\":\"pwa\""), call.body)
    }

    @Test
    fun `adminSignIn returns the challenge and stores nothing`() = runTest {
        val harness = harness {
            """{"json":{"step":"totp_verification_required","challengeToken":"challenge-1","subRole":"super_admin"}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.adminSignIn("admin@trips-enjoy.com", "password")

        assertEquals("challenge-1", (outcome as AdminSignInOutcome.TotpRequired).challengeToken)
        assertNull(harness.store.accessToken())
    }

    @Test
    fun `staffSignIn returns the second-factor challenge`() = runTest {
        val harness = harness {
            """{"json":{"step":"staff_2fa_verification_required","method":"totp","challengeToken":"challenge-2"}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.staffSignIn("owner@trips-enjoy.com", "password")

        val required = outcome as StaffSignInOutcome.SecondFactorRequired
        assertEquals("challenge-2", required.challengeToken)
        assertEquals("totp", required.method)
    }

    @Test
    fun `a driver registration posts to registerSupplierAccount and stores no session`() = runTest {
        val harness = harness {
            """{"json":{"accountId":"acct-7","role":"platform_driver","status":"pending_approval",
            "verificationRequired":"both_email_and_phone","otpDispatches":[
              {"channel":"email","targetIdentifier":"driver@trips-enjoy.com","expiresAt":"2023-11-14T22:20:00.000Z","resendAvailableInSeconds":45,"fallbackChannelAvailable":false},
              {"channel":"sms","targetIdentifier":"+201500000000","expiresAt":"2023-11-14T22:20:00.000Z","resendAvailableInSeconds":45,"fallbackChannelAvailable":false}
            ]}}""".replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.registerSupplierAccount(
            role = AuthRepository.ROLE_PLATFORM_DRIVER,
            fullName = "Omar Hassan",
            email = "driver@trips-enjoy.com",
            phone = "+201500000000",
            password = "averylongpassword",
        )

        // The driver must go through the supplier procedure, never registerTraveler.
        assertTrue(harness.callsTo("auth/registerTraveler").isEmpty(), "a driver is not a traveler account")
        val call = harness.callsTo("auth/registerSupplierAccount").single()
        assertTrue(call.body.contains("\"role\":\"platform_driver\""), call.body)
        assertTrue(call.body.contains("\"surface\":\"mobile\""), call.body)
        assertTrue(call.body.contains("\"email\":\"driver@trips-enjoy.com\""), call.body)
        assertTrue(call.body.contains("\"phone\":\"+201500000000\""), call.body)
        assertTrue(call.body.contains("\"password\":\"averylongpassword\""), call.body)

        // Pending approval means no session: nothing may be persisted (D5, AC-1).
        assertEquals("pending_approval", outcome.status)
        assertEquals("acct-7", outcome.accountId)
        assertEquals(2, outcome.otpDispatches.size, "a supplier verifies both channels")
        assertNull(harness.store.accessToken())
        assertNull(harness.store.current())
    }

    @Test
    fun `a photographer registration uses the photographer role`() = runTest {
        val harness = harness {
            """{"json":{"accountId":"acct-8","role":"platform_photographer","status":"pending_approval","otpDispatches":[]}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        harness.repository.registerSupplierAccount(
            role = AuthRepository.ROLE_PLATFORM_PHOTOGRAPHER,
            fullName = "Nour Adel",
            email = "photo@trips-enjoy.com",
            phone = "+201500000001",
            password = "averylongpassword",
        )

        assertTrue(
            harness.callsTo("auth/registerSupplierAccount").single().body
                .contains("\"role\":\"platform_photographer\""),
        )
    }

    @Test
    fun `a traveler registration still uses registerTraveler and omits the country`() = runTest {
        val harness = harness {
            """{"json":{"accountId":"acct-9","status":"pending_verification","roles":["traveler"],"defaultPlanTier":"free","verificationRequired":"either_email_or_phone","otpDispatches":[{"channel":"sms","targetIdentifier":"+201500000002","expiresAt":"2023-11-14T22:20:00.000Z","resendAvailableInSeconds":45,"fallbackChannelAvailable":false}]}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        harness.repository.registerTraveler(
            fullName = "Sara Ahmed",
            phone = "+201500000002",
            countryCode = "EG",
        )

        assertTrue(harness.callsTo("auth/registerSupplierAccount").isEmpty())
        val call = harness.callsTo("auth/registerTraveler").single()
        assertTrue(call.body.contains("\"surface\":\"mobile\""), call.body)
        // Gap G1: the country is collected by the form but the schema strips it, so it is not sent.
        assertTrue(!call.body.contains("countryCode"), call.body)
        assertTrue(!call.body.contains("country"), call.body)
    }

    @Test
    fun `organization registration is refused on mobile`() = runTest {
        val harness = harness { authenticatedResponse() }

        assertFailsWith<IllegalArgumentException> {
            harness.repository.registerSupplierAccount(
                role = AuthRepository.ROLE_ORGANIZATION_OWNER,
                fullName = "Org Owner",
                email = "owner@trips-enjoy.com",
                phone = "+201500000000",
                password = "averylongpassword",
            )
        }
        assertTrue(harness.calls.isEmpty(), "no request may leave the device")
    }

    @Test
    fun `the error data object reaches ApiException details and the mapper reads it`() = runTest {
        // Pins the wire shape the mapper depends on: `toORPCError` builds
        // `data: { ...serviceError.details, ...envelope }`, so the details are an OBJECT at the top
        // level of `data`, not a string. If this ever changes, this test fails before the UI does.
        val harness = harness {
            """{"json":{"defined":false,"code":"FORBIDDEN","status":403,"message":"Account suspended.",
            "data":{"status":"suspended","reason":"Policy breach","success":false,"data":null,
            "requestId":"req_9","meta":{"requestId":"req_9","timestamp":"2023-11-14T22:13:20.000Z","locale":"en"}}}}"""
                .replace("\n", "") to HttpStatusCode.Forbidden
        }

        val error = assertFailsWith<ApiException> {
            harness.repository.signIn(identifier = "sara@trips-enjoy.com", method = "password", password = "secret")
        }

        val details = error.details
        assertNotNull(details, "ApiException.details must carry the data object")
        assertTrue(details["status"] is kotlinx.serialization.json.JsonPrimitive, "status must be a JSON primitive, not a string blob")

        val view = AuthErrorMapper.fromException(error, procedure = AuthRepository.PROC_SIGN_IN)
        assertEquals(AuthErrorMapper.Keys.SUSPENDED, view.key)
        assertEquals("Policy breach", view.params[AuthErrorMapper.PARAM_REASON])
        assertEquals("req_9", view.requestId)
    }

    // -------------------------------------------------------------------------------------
    // R1 / R2 / R3 / R4 / R6
    // -------------------------------------------------------------------------------------

    @Test
    fun `R2 a 401 refreshes once and replays the original call exactly once`() = runTest {
        var sessionCalls = 0
        val harness = harness(initial = record()) { call ->
            when {
                call.path.endsWith("/rpc/auth/refreshSession") ->
                    """{"json":{"sessionId":"s1","accessToken":"$jwt","refreshToken":"refresh-2","accessTokenExpiresInSeconds":900,"sessionMaxExpiresAt":"2023-11-15T10:13:20.000Z","draftsRetained":true}}"""
                        .replace("\n", "") to HttpStatusCode.OK

                call.path.endsWith("/rpc/auth/getSession") -> {
                    sessionCalls++
                    if (sessionCalls == 1) {
                        """{"json":{"defined":false,"code":"AUTH_TOKEN_EXPIRED","status":401,"message":"Expired.","data":{"success":false,"requestId":"req_1"}}}"""
                            .replace("\n", "") to HttpStatusCode.Unauthorized
                    } else {
                        """{"json":{"authenticated":true,"actor":{"accountId":"acct-1","sessionId":"s1","activeRole":"traveler"}}}"""
                            .replace("\n", "") to HttpStatusCode.OK
                    }
                }

                else -> """{"json":null}""" to HttpStatusCode.OK
            }
        }

        val result = harness.repository.authed("trips/list") {
            harness.repository.getSession()
        }

        assertEquals("acct-1", result.accountId)
        assertEquals(1, harness.callsTo("auth/refreshSession").size)
        assertEquals(2, harness.callsTo("auth/getSession").size)
        assertEquals("refresh-2", harness.store.current()?.refreshToken)
    }

    @Test
    fun `R3 two concurrent authed calls share one refresh`() = runTest {
        val harness = harness(
            initial = record(accessTokenExpiresAt = issuedAt + 30_000L),
        ) { call ->
            when {
                call.path.endsWith("/rpc/auth/refreshSession") ->
                    """{"json":{"sessionId":"s1","accessToken":"$jwt","refreshToken":"refresh-2","accessTokenExpiresInSeconds":900,"sessionMaxExpiresAt":"2023-11-15T10:13:20.000Z","draftsRetained":true}}"""
                        .replace("\n", "") to HttpStatusCode.OK

                else ->
                    """{"json":{"authenticated":true,"actor":{"accountId":"acct-1","sessionId":"s1","activeRole":"traveler"}}}"""
                        .replace("\n", "") to HttpStatusCode.OK
            }
        }

        val first = async { harness.repository.getSession() }
        val second = async { harness.repository.getSession() }
        first.await()
        second.await()

        assertEquals(1, harness.callsTo("auth/refreshSession").size, harness.paths().toString())
        assertEquals(2, harness.callsTo("auth/getSession").size)
    }

    @Test
    fun `R1 a token inside the window is refreshed before the call`() = runTest {
        val harness = harness(
            initial = record(accessTokenExpiresAt = issuedAt + 30_000L),
        ) { call ->
            if (call.path.endsWith("/rpc/auth/refreshSession")) {
                """{"json":{"sessionId":"s1","accessToken":"$jwt","refreshToken":"refresh-2","accessTokenExpiresInSeconds":900,"sessionMaxExpiresAt":"2023-11-15T10:13:20.000Z","draftsRetained":true}}"""
                    .replace("\n", "") to HttpStatusCode.OK
            } else {
                """{"json":{"authenticated":true,"actor":{"accountId":"acct-1","sessionId":"s1","activeRole":"traveler"}}}"""
                    .replace("\n", "") to HttpStatusCode.OK
            }
        }

        harness.repository.getSession()

        assertEquals(
            listOf("/rpc/auth/refreshSession", "/rpc/auth/getSession"),
            harness.paths(),
        )
    }

    @Test
    fun `R4 a sign-in failure never refreshes`() = runTest {
        val harness = harness(initial = record()) {
            """{"json":{"defined":false,"code":"UNAUTHORIZED","status":401,"message":"Bad credentials.","data":{"requestId":"req_2"}}}"""
                .replace("\n", "") to HttpStatusCode.Unauthorized
        }

        val error = assertFailsWith<ApiException> {
            harness.repository.authed(AuthRepository.PROC_SIGN_IN) {
                harness.repository.signIn(identifier = "sara@trips-enjoy.com", method = "password", password = "wrong")
            }
        }

        assertEquals("UNAUTHORIZED", error.code)
        assertTrue(harness.callsTo("auth/refreshSession").isEmpty(), harness.paths().toString())
    }

    @Test
    fun `R6 past the session cap there is no network call`() = runTest {
        val harness = harness(
            now = issuedAt + sessionCapMs + 1L,
            initial = record(),
        ) { """{"json":null}""" to HttpStatusCode.OK }

        assertFailsWith<SessionExpiredException> { harness.repository.ensureFresh() }
        assertTrue(harness.calls.isEmpty(), harness.paths().toString())
        assertNull(harness.store.accessToken())
    }

    @Test
    fun `R5 a refresh response without a new refresh token is a hard failure`() = runTest {
        val harness = harness(initial = record()) {
            """{"json":{"sessionId":"s1","accessToken":"$jwt","refreshToken":"","accessTokenExpiresInSeconds":900,"sessionMaxExpiresAt":"2023-11-15T10:13:20.000Z","draftsRetained":true}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        assertFailsWith<SessionExpiredException> { harness.repository.refreshOnce() }
        assertNull(harness.store.accessToken())
    }

    @Test
    fun `F1 a refresh 401 clears the store and reports an expired session`() = runTest {
        val harness = harness(initial = record()) {
            """{"json":{"defined":false,"code":"UNAUTHORIZED","status":401,"message":"Revoked.","data":{"reason":"MAX_SESSION_DURATION_REACHED","draftsRetained":true,"requestId":"req_3"}}}"""
                .replace("\n", "") to HttpStatusCode.Unauthorized
        }

        val failure = assertFailsWith<SessionExpiredException> { harness.repository.refreshOnce() }

        assertEquals(AuthRefreshPolicy.maxSessionReason, failure.reason)
        assertNull(harness.store.accessToken())
        assertEquals(1, harness.callsTo("auth/refreshSession").size)
    }

    @Test
    fun `F3 the call that triggered a failed refresh is not replayed`() = runTest {
        var listCalls = 0
        val harness = harness(initial = record()) { call ->
            when {
                call.path.endsWith("/rpc/auth/refreshSession") ->
                    """{"json":{"defined":false,"code":"UNAUTHORIZED","status":401,"message":"Revoked.","data":{"requestId":"req_4"}}}"""
                        .replace("\n", "") to HttpStatusCode.Unauthorized

                call.path.endsWith("/rpc/auth/getSession") -> {
                    listCalls++
                    """{"json":{"defined":false,"code":"AUTH_TOKEN_EXPIRED","status":401,"message":"Expired.","data":{"requestId":"req_5"}}}"""
                        .replace("\n", "") to HttpStatusCode.Unauthorized
                }

                else -> """{"json":null}""" to HttpStatusCode.OK
            }
        }

        assertFailsWith<SessionExpiredException> {
            harness.repository.authed("trips/list") { harness.repository.getSession() }
        }

        assertEquals(1, harness.callsTo("auth/getSession").size, "the original call must not be replayed")
        assertEquals(1, harness.callsTo("auth/refreshSession").size)
    }

    // -------------------------------------------------------------------------------------
    // Sign-out (S1-S5)
    // -------------------------------------------------------------------------------------

    @Test
    fun `signOut calls the procedure with the refresh token and clears the store`() = runTest {
        val harness = harness(initial = record()) { """{"json":{"signedOut":true,"allDevices":false}}""" to HttpStatusCode.OK }

        harness.repository.signOut(allDevices = false)

        val call = harness.callsTo("auth/signOut").single()
        assertTrue(call.body.contains("\"refreshToken\":\"refresh-1\""), call.body)
        assertTrue(call.body.contains("\"allDevices\":false"), call.body)
        assertNull(harness.store.accessToken())
    }

    @Test
    fun `S3 signOut clears the store even when the network fails`() = runTest {
        val harness = harness(initial = record()) {
            """{"json":{"defined":false,"code":"INTERNAL_ERROR","status":500,"message":"Down.","data":{}}}"""
                .replace("\n", "") to HttpStatusCode.InternalServerError
        }

        harness.repository.signOut(allDevices = true)

        assertNull(harness.store.accessToken())
        assertNull(harness.store.current())
    }

    @Test
    fun `S3 signOut clears the store when the call throws`() = runTest {
        val calls = mutableListOf<String>()
        val engine = MockEngine { request ->
            calls += request.url.encodedPath
            error("network down")
        }
        val storage = FakeAuthStorage(SessionRecord.serialize(record()))
        val store = AuthTokenStore(storage)
        val repository = AuthRepository(
            ApiClient("http://localhost:3000", HttpClient(engine)),
            store,
            now = { issuedAt },
        )

        repository.signOut(allDevices = false)

        assertNull(store.accessToken())
        assertEquals(1, calls.size)
    }

    @Test
    fun `signOut of all devices sends allDevices true`() = runTest {
        val harness = harness(initial = record()) { """{"json":{"signedOut":true,"allDevices":true}}""" to HttpStatusCode.OK }

        harness.repository.signOut(allDevices = true)

        assertTrue(harness.callsTo("auth/signOut").single().body.contains("\"allDevices\":true"))
    }

    @Test
    fun `signOut with no session makes no request`() = runTest {
        val harness = harness { """{"json":null}""" to HttpStatusCode.OK }

        harness.repository.signOut(allDevices = false)

        assertTrue(harness.calls.isEmpty())
    }

    @Test
    fun `ensureFresh returns null when nothing is stored`() = runTest {
        val harness = harness { """{"json":null}""" to HttpStatusCode.OK }
        assertNull(harness.repository.ensureFresh())
        assertTrue(harness.calls.isEmpty())
    }

    @Test
    fun `no token is ever sent in a URL`() = runTest {
        val harness = harness { authenticatedResponse() }
        harness.repository.signIn(identifier = "sara@trips-enjoy.com", method = "password", password = "secret")

        for (call in harness.calls) {
            assertTrue(!call.path.contains("refresh-1"), "refresh token leaked into the path")
            assertTrue(!call.path.contains("secret"), "password leaked into the path")
        }
    }

    // -------------------------------------------------------------------------------------
    // Supplier onboarding (`onboarding/*` procedures)
    // -------------------------------------------------------------------------------------

    @Test
    fun `signIn on a pending application stores the session when returned by the server`() = runTest {
        val harness = harness {
            """{"json":{"step":"application_pending_approval","accountId":"acct-1","role":"platform_driver","status":"pending_approval","session":${sessionPayload()}}}"""
                .replace("\n", "") to HttpStatusCode.OK
        }

        val outcome = harness.repository.signIn(identifier = "driver@trips-enjoy.com", method = "password", password = "secret")

        assertTrue(outcome is SignInOutcome.PendingApproval)
        assertEquals("acct-1", (outcome as SignInOutcome.PendingApproval).accountId)
        assertEquals("platform_driver", outcome.role)
        assertEquals(jwt, harness.store.accessToken())
    }

    @Test
    fun `submitDriverApplication sends payload and documents through authed`() = runTest {
        val harness = harness(initial = record()) {
            """{"json":{"application":{"id":"app-1","applicantAccountId":"acct-1","applicationType":"platform_driver","state":"submitted"},"duplicateHold":false}}""" to HttpStatusCode.OK
        }

        val result = harness.repository.submitDriverApplication(
            fullName = "Karim Driver",
            email = "karim@trips-enjoy.com",
            phone = "+201012345678",
            ownsVehicle = true,
            vehiclePlateNumber = "ABC-1234",
            vehicleModel = "Toyota HiAce",
            vehicleSeatCapacity = 14,
            driverLicenseNumber = "DL-123",
            driverLicenseExpiry = "2028-12-31T00:00:00.000Z",
            insurancePolicyExpiry = "2027-06-30T00:00:00.000Z",
            initialLabTestCompletedAt = "2026-10-10T00:00:00.000Z",
            labTestConsentSigned = true,
            backgroundCheckConsentSigned = true,
            documents = listOf(
                OnboardingDocumentInput(
                    documentType = "driver_license",
                    storageKey = "onboarding/driver/license.pdf",
                    expiresAt = "2028-12-31T00:00:00.000Z",
                ),
            ),
        )

        assertEquals("app-1", result.application.id)
        assertEquals("submitted", result.application.state)
        val call = harness.callsTo("onboarding/submitDriverApplication").single()
        assertTrue(call.body.contains("\"driverLicenseNumber\":\"DL-123\""), call.body)
        assertTrue(call.body.contains("\"backgroundCheckConsentSigned\":true"), call.body)
        assertTrue(call.body.contains("\"documentType\":\"driver_license\""), call.body)
    }

    @Test
    fun `submitPhotographerApplication sends portfolio count and documents`() = runTest {
        val harness = harness(initial = record()) {
            """{"json":{"application":{"id":"app-2","applicantAccountId":"acct-1","applicationType":"platform_photographer","state":"submitted"},"duplicateHold":false}}""" to HttpStatusCode.OK
        }

        val docs = (1..8).map { idx ->
            OnboardingDocumentInput(
                documentType = "portfolio_sample",
                storageKey = "onboarding/photographer/p-$idx.jpg",
                mimeType = "image/jpeg",
            )
        }
        val result = harness.repository.submitPhotographerApplication(
            fullName = "Nour Studio",
            email = "nour@trips-enjoy.com",
            phone = "+201099887766",
            portfolioPhotoCount = 8,
            cameraEquipmentSummary = "Sony A7 IV",
            documents = docs,
        )

        assertEquals("app-2", result.application.id)
        val call = harness.callsTo("onboarding/submitPhotographerApplication").single()
        assertTrue(call.body.contains("\"portfolioPhotoCount\":8"), call.body)
        assertTrue(call.body.contains("\"cameraEquipmentSummary\":\"Sony A7 IV\""), call.body)
    }

    @Test
    fun `getApplicationStatus requestChangesExtension resubmitApplication and submitAppeal call onboarding procedures`() = runTest {
        val harness = harness(initial = record()) { call ->
            when {
                call.path.endsWith("/rpc/onboarding/getApplicationStatus") ->
                    """{"json":{"hasApplication":true,"application":{"id":"app-3","applicantAccountId":"acct-1","applicationType":"platform_driver","state":"changes_requested","changesRequestedChecklist":[{"field":"insurance_policy","instruction":"Upload clearer scan","resolved":false}],"changesExtensionUsed":false},"documents":[]}}""" to HttpStatusCode.OK
                call.path.endsWith("/rpc/onboarding/requestChangesExtension") ->
                    """{"json":{"id":"app-3","applicantAccountId":"acct-1","applicationType":"platform_driver","state":"changes_requested","changesExtensionUsed":true}}""" to HttpStatusCode.OK
                call.path.endsWith("/rpc/onboarding/resubmitApplication") ->
                    """{"json":{"id":"app-3","applicantAccountId":"acct-1","applicationType":"platform_driver","state":"submitted"}}""" to HttpStatusCode.OK
                call.path.endsWith("/rpc/onboarding/submitAppeal") ->
                    """{"json":{"appealed":true,"application":{"id":"app-3","applicantAccountId":"acct-1","applicationType":"platform_driver","state":"rejected","appealStatement":"Updated policy attached."}}}""" to HttpStatusCode.OK
                else -> error("unexpected path: ${call.path}")
            }
        }

        val status = harness.repository.getApplicationStatus()
        assertTrue(status.hasApplication)
        assertEquals("changes_requested", status.application?.state)
        assertEquals(1, status.application?.changesRequestedChecklist?.size)

        val extended = harness.repository.requestChangesExtension("app-3", "Need 7 more days")
        assertTrue(extended.changesExtensionUsed)

        val resubmitted = harness.repository.resubmitApplication("app-3")
        assertEquals("submitted", resubmitted.state)

        val appealed = harness.repository.submitAppeal("app-3", "Updated policy attached.")
        assertTrue(appealed.appealed)
        assertEquals("Updated policy attached.", appealed.application?.appealStatement)
    }
}
