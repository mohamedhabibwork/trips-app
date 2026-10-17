package com.tripsenjoy.api

import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class ApiClientTest {

    private val jsonHeaders = headersOf(HttpHeaders.ContentType, "application/json")

    @Test
    fun `healthCheck posts the oRPC envelope to the procedure path and decodes the output`() = runTest {
        var url = ""
        var body = ""
        val engine = MockEngine { request ->
            url = request.url.toString()
            body = (request.body as TextContent).text
            respond(content = """{"json":"OK"}""", headers = jsonHeaders)
        }
        val api = ApiClient("http://localhost:3000/", HttpClient(engine))

        assertEquals("OK", api.healthCheck())
        assertEquals("http://localhost:3000/rpc/healthCheck", url)
        assertEquals("""{"json":null,"meta":[]}""", body)
    }

    @Test
    fun `serviceStatus decodes the status procedure output`() = runTest {
        val engine = MockEngine {
            respond(content = """{"json":{"service":"accounting","status":"ok"}}""", headers = jsonHeaders)
        }
        val status = ApiClient("http://localhost:3000", HttpClient(engine)).serviceStatus("accounting")

        assertEquals(ServiceStatus("accounting", "ok"), status)
    }

    @Test
    fun `sends the bearer token when one is set`() = runTest {
        var authorization: String? = null
        val engine = MockEngine { request ->
            authorization = request.headers[HttpHeaders.Authorization]
            respond(content = """{"json":"OK"}""", headers = jsonHeaders)
        }
        val api = ApiClient("http://localhost:3000", HttpClient(engine), accessToken = { "token-123" })

        api.healthCheck()

        assertEquals("Bearer token-123", authorization)
    }

    @Test
    fun `turns an oRPC error envelope into an ApiException with its code`() = runTest {
        val engine = MockEngine {
            respond(
                content = """{"json":{"defined":false,"code":"NOT_FOUND","status":404,"message":"Organization resource not found.","data":{}}}""",
                status = HttpStatusCode.NotFound,
                headers = jsonHeaders,
            )
        }
        val error = assertFailsWith<ApiException> {
            ApiClient("http://localhost:3000", HttpClient(engine)).healthCheck()
        }

        assertEquals("NOT_FOUND", error.code)
        assertEquals(404, error.status)
        assertEquals("Organization resource not found.", error.message)
    }

    @Test
    fun `reports a plain HTTP error when the body is not an oRPC envelope`() = runTest {
        val engine = MockEngine { respond(content = "Not Found", status = HttpStatusCode.NotFound) }
        val error = assertFailsWith<ApiException> {
            ApiClient("http://localhost:3000", HttpClient(engine)).healthCheck()
        }

        assertEquals("HTTP_404", error.code)
        assertEquals("Not Found", error.message)
    }
}
