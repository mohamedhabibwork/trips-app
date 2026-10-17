package com.tripsenjoy.lookups

import com.tripsenjoy.api.ApiClient
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

class LookupsTest {

    private val jsonHeaders = headersOf(HttpHeaders.ContentType, "application/json")

    @Test
    fun `getTypeByCode fetches lookup type and items by code and resolves localized labels`() = runTest {
        var requestUrl = ""
        var requestBody = ""
        var callCount = 0
        val engine = MockEngine { request ->
            callCount += 1
            requestUrl = request.url.toString()
            requestBody = (request.body as TextContent).text
            respond(
                content = """
                {
                  "json": {
                    "lookupType": {
                      "id": 1,
                      "uuid": "0195a5e0-0000-7000-8000-000000000001",
                      "code": "COUNTRY",
                      "value": "country",
                      "name": { "ar": "الدولة", "en": "Country" },
                      "description": { "ar": "الدول المدعومة", "en": "Supported countries" },
                      "parentId": null,
                      "parentCode": null,
                      "sortBy": 10,
                      "isPublic": true,
                      "isSystem": true,
                      "items": [
                        {
                          "id": 101,
                          "uuid": "0195a5e0-0000-7000-8000-000000000101",
                          "lookupTypeId": 1,
                          "typeCode": "COUNTRY",
                          "code": "COUNTRY_EG",
                          "value": "EG",
                          "name": { "ar": "مصر", "en": "Egypt" },
                          "description": null,
                          "parentId": null,
                          "parentCode": null,
                          "sortBy": 10,
                          "isPublic": true
                        }
                      ]
                    }
                  }
                }
                """.trimIndent(),
                headers = jsonHeaders,
            )
        }
        val repo = LookupsRepository(ApiClient("http://localhost:3000", HttpClient(engine)))

        val typeWithItems = repo.getTypeByCode(LookupTypeCodes.COUNTRY)
        assertNotNull(typeWithItems)
        assertEquals("http://localhost:3000/rpc/lookups/getTypeByCode", requestUrl)
        assertEquals("""{"json":{"code":"COUNTRY"},"meta":[]}""", requestBody)
        assertEquals("الدولة", typeWithItems.localizedName("ar"))
        assertEquals("Country", typeWithItems.localizedName("en"))

        val egypt = typeWithItems.findItemByCode("country_eg")
        assertNotNull(egypt)
        assertEquals("EG", egypt.value)
        assertEquals("مصر", egypt.localizedName("ar"))
        assertEquals("Egypt", egypt.localizedName("en"))

        // Second call uses in-memory cache unless forceRefresh = true
        val cached = repo.getItemsByTypeCode("country")
        assertEquals(1, cached.size)
        assertEquals(1, callCount)
    }

    @Test
    fun `getByCode fetches a lookup item and its child lookups by code`() = runTest {
        var requestUrl = ""
        val engine = MockEngine { request ->
            requestUrl = request.url.toString()
            respond(
                content = """
                {
                  "json": {
                    "lookup": {
                      "id": 101,
                      "uuid": "0195a5e0-0000-7000-8000-000000000101",
                      "lookupTypeId": 1,
                      "typeCode": "COUNTRY",
                      "code": "COUNTRY_EG",
                      "value": "EG",
                      "name": { "ar": "مصر", "en": "Egypt" },
                      "description": null,
                      "parentId": null,
                      "parentCode": null,
                      "sortBy": 10,
                      "isPublic": true
                    },
                    "childLookups": [
                      {
                        "id": 201,
                        "uuid": "0195a5e0-0000-7000-8000-000000000201",
                        "lookupTypeId": 17,
                        "typeCode": "SERVICE_REGION",
                        "code": "REGION_CAIRO",
                        "value": "Cairo",
                        "name": { "ar": "القاهرة", "en": "Cairo" },
                        "description": null,
                        "parentId": 101,
                        "parentCode": "COUNTRY_EG",
                        "sortBy": 10,
                        "isPublic": true
                      }
                    ]
                  }
                }
                """.trimIndent(),
                headers = jsonHeaders,
            )
        }
        val repo = LookupsRepository(ApiClient("http://localhost:3000", HttpClient(engine)))

        val result = repo.getByCode("COUNTRY_EG", LookupTypeCodes.COUNTRY)
        assertEquals("http://localhost:3000/rpc/lookups/getByCode", requestUrl)
        assertNotNull(result.lookup)
        assertEquals("EG", result.lookup?.value)
        assertEquals(1, result.childLookups.size)
        assertEquals("REGION_CAIRO", result.childLookups.first().code)
        assertEquals("القاهرة", result.childLookups.first().localizedName("ar"))
    }
}
