import groovy.json.JsonSlurper
import java.io.File
import org.jetbrains.kotlin.gradle.ExperimentalWasmDsl
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidMultiplatformLibrary)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
    alias(libs.plugins.kotlinxSerialization)
}

// ---------------------------------------------------------------------------------------------
// Auth contract codegen (ARCHITECTURE-auth.md §6, D8).
//
// Two JSON files are the single sources of truth for cross-app authentication: the conventions
// (`packages/auth`) and the auth copy (`packages/i18n`). Web reads them through TypeScript; Kotlin
// reads them through this task, so no value is ever copied by hand and drift fails the build
// instead of shipping.
//
// Everything that touches the project model is resolved here, at configuration time, into plain
// `File` values, and the task action below only reads those files. That keeps the task compatible
// with Gradle's configuration cache.
// ---------------------------------------------------------------------------------------------

/** The monorepo root that owns `packages/`; `mobile/` is a sibling of `packages/`. */
val monorepoPackages = rootProject.layout.projectDirectory.dir("../packages").asFile

/** A tolerated second location, in case a package is created one level above the monorepo root. */
val siblingPackages = rootProject.layout.projectDirectory.dir("../../packages").asFile

/** Candidate locations, so a package that has not been created yet fails with a readable message. */
val authConventionsCandidates = listOf(
    File(monorepoPackages, "auth/src/conventions/conventions.json"),
    File(siblingPackages, "auth/src/conventions/conventions.json"),
)
val authMessagesCandidates = listOf(
    File(monorepoPackages, "i18n/src/auth/messages.json"),
    File(siblingPackages, "i18n/src/auth/messages.json"),
)

/**
 * Picks the first candidate that exists, else the primary one.
 *
 * Resolution stays lazy on purpose: a missing file must fail `generateAuthContract`, not every
 * Gradle invocation in the project.
 */
fun resolveContractFile(candidates: List<File>): File =
    candidates.firstOrNull { it.isFile } ?: candidates.first()

val authConventionsFile = resolveContractFile(authConventionsCandidates)
val authMessagesFile = resolveContractFile(authMessagesCandidates)

val generateAuthContract by tasks.registering {
    group = "build"
    description = "Generates AuthConventions.kt and AuthStrings.kt from the shared JSON contract files."
    inputs.files(authConventionsFile, authMessagesFile)
    val outputDirectory = layout.buildDirectory.dir("generated/authContract")
    outputs.dir(outputDirectory)

    doLast {
        val inputFiles = inputs.files.files.toList()
        val conventionsFile = inputFiles.firstOrNull { it.name == "conventions.json" }
            ?: error(
                "generateAuthContract: conventions.json is missing. " +
                    "Expected packages/auth/src/conventions/conventions.json next to mobile/. " +
                    "packages/auth owns this file; the mobile module never edits it.",
            )
        val messagesFile = inputFiles.firstOrNull { it.name == "messages.json" }
            ?: error(
                "generateAuthContract: messages.json is missing. " +
                    "Expected packages/i18n/src/auth/messages.json next to mobile/. " +
                    "packages/i18n owns this file; the mobile module never edits it.",
            )
        val outputRoot = outputs.files.files.first()

        /** The generated package. Same package as the hand-written auth code, so no imports. */
        val authContractPackage = "com.tripsenjoy.auth"

        /** The locales the auth copy ships. Arabic is the product default (PRD §7.7 I2). */
        val authLocales = listOf("en", "ar")

        /** Escapes a value for a Kotlin string literal. Arabic is kept as-is; the source is UTF-8. */
        fun kotlinString(value: String): String {
            val builder = StringBuilder(value.length + 8)
            builder.append('"')
            for (character in value) {
                when (character) {
                    '\\' -> builder.append("\\\\")
                    '"' -> builder.append("\\\"")
                    '$' -> builder.append("\\$")
                    '\n' -> builder.append("\\n")
                    '\r' -> builder.append("\\r")
                    '\t' -> builder.append("\\t")
                    else -> builder.append(character)
                }
            }
            builder.append('"')
            return builder.toString()
        }

        fun kotlinStringList(values: List<*>): String =
            values.joinToString(", ") { kotlinString(it?.toString() ?: "") }

        fun kotlinStringMap(values: Map<*, *>): String =
            values.entries.joinToString(", ") { (key, value) ->
                "${kotlinString(key.toString())} to ${kotlinString(value?.toString() ?: "")}"
            }

        /** Reads one locale-major branch: `{"auth.signIn.title": "Sign in", …}` or a nested map. */
        fun collectLocaleMajor(
            node: Map<*, *>,
            locale: String,
            prefix: String,
            out: MutableMap<String, MutableMap<String, String>>,
        ) {
            for ((rawKey, value) in node) {
                val key = rawKey?.toString() ?: continue
                if (key.startsWith("$")) continue
                val full = if (prefix.isEmpty()) key else "$prefix.$key"
                when (value) {
                    is String -> out.getOrPut(full) { mutableMapOf() }[locale] = value
                    is Map<*, *> -> collectLocaleMajor(value, locale, full, out)
                    else -> Unit
                }
            }
        }

        /** Reads one key-major branch: `{"auth": {"signIn": {"title": {"en": …, "ar": …}}}}`. */
        fun collectKeyMajor(
            node: Map<*, *>,
            path: List<String>,
            out: MutableMap<String, MutableMap<String, String>>,
        ) {
            val keys = node.keys.filterIsInstance<String>()
            val isLeaf = path.isNotEmpty() &&
                keys.isNotEmpty() &&
                keys.all { it in authLocales } &&
                keys.all { node[it] is String }
            if (isLeaf) {
                val entry = out.getOrPut(path.joinToString(".")) { mutableMapOf() }
                for (key in keys) {
                    entry[key] = node[key] as String
                }
                return
            }
            for (key in keys) {
                if (key.startsWith("$")) continue
                val child = node[key] as? Map<*, *> ?: continue
                collectKeyMajor(child, path + key, out)
            }
        }

        /** Flattens `messages.json` into `key -> (locale -> copy)`, accepting either shape. */
        fun collectMessages(
            root: Map<*, *>,
            out: MutableMap<String, MutableMap<String, String>>,
        ) {
            val topKeys = root.keys.filterIsInstance<String>().filter { !it.startsWith("$") }
            val isLocaleMajor = topKeys.isNotEmpty() &&
                topKeys.all { it in authLocales } &&
                topKeys.all { root[it] is Map<*, *> }
            if (isLocaleMajor) {
                for (locale in topKeys) {
                    val branch = root[locale] as? Map<*, *> ?: continue
                    collectLocaleMajor(branch, locale, "", out)
                }
                return
            }
            collectKeyMajor(root, emptyList(), out)
        }

        @Suppress("UNCHECKED_CAST")
        val conventions = JsonSlurper().parse(conventionsFile) as Map<String, Any?>
        @Suppress("UNCHECKED_CAST")
        val messagesRoot = JsonSlurper().parse(messagesFile) as Map<String, Any?>

        val messages = linkedMapOf<String, MutableMap<String, String>>()
        collectMessages(messagesRoot, messages)
        if (messages.isEmpty()) {
            error(
                "generateAuthContract: ${messagesFile.absolutePath} produced no messages. Expected " +
                    "{\"en\": {\"auth.x\": \"…\"}, \"ar\": {…}} or {\"auth.x\": {\"en\": …, \"ar\": …}}.",
            )
        }

        val errorRows = (conventions["errorRows"] as? List<*>).orEmpty().mapNotNull { row ->
            if (row !is Map<*, *>) return@mapNotNull null
            val codes = (row["codes"] as? List<*>).orEmpty().map { it.toString() }
            val key = row["key"]?.toString() ?: return@mapNotNull null
            val recovery = row["recovery"]?.toString() ?: "stay"
            val field = row["field"]?.toString()
            listOf(codes, key, recovery, field)
        }
        val surfacePlatforms: Map<*, *> =
            (conventions["surfacePlatforms"] as? Map<*, *>) ?: emptyMap<Any?, Any?>()
        val signInPaths: Map<*, *> =
            (conventions["signInPaths"] as? Map<*, *>) ?: emptyMap<Any?, Any?>()

        // PRD §7.10 G6: the registration country list must be byte-identical on web and mobile, so
        // it is generated rather than copied. An empty list is a contract error, not a silent no-op.
        val registrationCountries = (conventions["registrationCountries"] as? List<*>).orEmpty()
            .mapNotNull { entry ->
                if (entry !is Map<*, *>) return@mapNotNull null
                val code = entry["code"]?.toString() ?: return@mapNotNull null
                listOf(
                    code,
                    entry["nameEn"]?.toString() ?: "",
                    entry["nameAr"]?.toString() ?: "",
                    (entry["enabled"] as? Boolean) ?: false,
                )
            }
        if (registrationCountries.isEmpty()) {
            error(
                "generateAuthContract: conventions.json has no registrationCountries. PRD §7.10 G6 " +
                    "requires the registration country list to come from the single source; the mobile " +
                    "app must not hardcode it.",
            )
        }

        // The default selection is DATA, not logic: web and mobile must resolve the same locale to the
        // same market, so the rule is a map in the contract rather than a rule re-implemented per side.
        val defaultCountryByLocale: Map<*, *> =
            (conventions["defaultCountryByLocale"] as? Map<*, *>) ?: emptyMap<Any?, Any?>()
        if (defaultCountryByLocale.isEmpty()) {
            error(
                "generateAuthContract: conventions.json has no defaultCountryByLocale. PRD §7.10 G2 " +
                    "requires the default market per locale to come from the single source.",
            )
        }

        val outDir = File(outputRoot, "com/tripsenjoy/auth")
        outDir.mkdirs()

        // ---- AuthConventions.kt ----------------------------------------------------------------
        val conventionsText = buildString {
            appendLine("package $authContractPackage")
            appendLine()
            appendLine("// GENERATED by :shared:generateAuthContract from")
            appendLine("// packages/auth/src/conventions/conventions.json — do not edit.")
            appendLine("// The Gradle build fails when this file and the JSON disagree.")
            appendLine()
            appendLine("/** One row of the shared error table: server codes -> message key + recovery. */")
            appendLine("data class AuthErrorRow(")
            appendLine("    val codes: List<String>,")
            appendLine("    val key: String,")
            appendLine("    val recovery: String,")
            appendLine("    val field: String? = null,")
            appendLine(")")
            appendLine()
            appendLine("/**")
            appendLine(" * One market the registration form offers (PRD §7.10 G1/G2, contract `RegistrationCountry`).")
            appendLine(" *")
            appendLine(" * A disabled market is shown but cannot be selected; it is never hidden.")
            appendLine(" */")
            appendLine("data class AuthCountry(")
            appendLine("    val code: String,")
            appendLine("    val nameEn: String,")
            appendLine("    val nameAr: String,")
            appendLine("    val enabled: Boolean,")
            appendLine(")")
            appendLine()
            appendLine("/**")
            appendLine(" * Every cross-app authentication convention, generated from the JSON single source.")
            appendLine(" *")
            appendLine(" * Web reads the same file through `packages/auth/src/conventions/index.ts`, so the two")
            appendLine(" * platforms cannot disagree about the storage key, the refresh window or the error table.")
            appendLine(" */")
            appendLine("object AuthConventions {")
            appendLine("    const val version: Int = ${(conventions["version"] as? Number)?.toInt() ?: 1}")
            appendLine(
                "    const val storageKey: String = " +
                    kotlinString(conventions["storageKey"]?.toString() ?: "trips.auth.v1"),
            )
            appendLine(
                "    const val refreshLeadMs: Long = " +
                    "${(conventions["refreshLeadMs"] as? Number)?.toLong() ?: 60_000L}L",
            )
            appendLine(
                "    const val accessTokenTtlSeconds: Long = " +
                    "${(conventions["accessTokenTtlSeconds"] as? Number)?.toLong() ?: 900L}L",
            )
            appendLine(
                "    const val webSessionMaxSeconds: Long = " +
                    "${(conventions["webSessionMaxSeconds"] as? Number)?.toLong() ?: 43_200L}L",
            )
            appendLine(
                "    const val otpCodeLength: Int = " +
                    "${(conventions["otpCodeLength"] as? Number)?.toInt() ?: 6}",
            )
            appendLine(
                "    const val otpMaxWrongAttempts: Int = " +
                    "${(conventions["otpMaxWrongAttempts"] as? Number)?.toInt() ?: 5}",
            )
            appendLine(
                "    const val maxSessionReason: String = " +
                    kotlinString(conventions["maxSessionReason"]?.toString() ?: ""),
            )
            appendLine(
                "    const val fallbackErrorKey: String = " +
                    kotlinString(
                        conventions["fallbackErrorKey"]?.toString() ?: "auth.error.unexpected",
                    ),
            )
            appendLine()
            appendLine(
                "    val statuses: List<String> = listOf(" +
                    kotlinStringList((conventions["statuses"] as? List<*>).orEmpty()) + ")",
            )
            appendLine(
                "    val surfaces: List<String> = listOf(" +
                    kotlinStringList((conventions["surfaces"] as? List<*>).orEmpty()) + ")",
            )
            appendLine(
                "    val noRefreshProcedures: List<String> = listOf(" +
                    kotlinStringList((conventions["noRefreshProcedures"] as? List<*>).orEmpty()) + ")",
            )
            appendLine(
                "    val signInProcedures: List<String> = listOf(" +
                    kotlinStringList((conventions["signInProcedures"] as? List<*>).orEmpty()) + ")",
            )
            appendLine(
                "    val otpProcedures: List<String> = listOf(" +
                    kotlinStringList((conventions["otpProcedures"] as? List<*>).orEmpty()) + ")",
            )
            appendLine(
                "    val refreshableCodes: List<String> = listOf(" +
                    kotlinStringList((conventions["refreshableCodes"] as? List<*>).orEmpty()) + ")",
            )
            appendLine(
                "    val fieldNames: List<String> = listOf(" +
                    kotlinStringList((conventions["fieldNames"] as? List<*>).orEmpty()) + ")",
            )
            appendLine()
            appendLine("    val surfacePlatforms: Map<String, String> = mapOf(")
            appendLine("        " + kotlinStringMap(surfacePlatforms))
            appendLine("    )")
            appendLine()
            appendLine("    val signInPaths: Map<String, String> = mapOf(")
            appendLine("        " + kotlinStringMap(signInPaths))
            appendLine("    )")
            appendLine()
            appendLine("    /**")
            appendLine("     * The registration country options, in the order the form renders them (G6).")
            appendLine("     *")
            appendLine("     * Web reads the same array from `packages/auth/src/conventions/conventions.json`, so the")
            appendLine("     * two platforms cannot drift.")
            appendLine("     */")
            appendLine("    val AuthCountries: List<AuthCountry> = listOf(")
            for (country in registrationCountries) {
                appendLine("        AuthCountry(")
                appendLine("            code = ${kotlinString(country[0] as String)},")
                appendLine("            nameEn = ${kotlinString(country[1] as String)},")
                appendLine("            nameAr = ${kotlinString(country[2] as String)},")
                appendLine("            enabled = ${country[3] as Boolean},")
                appendLine("        ),")
            }
            appendLine("    )")
            appendLine()
            appendLine("    /**")
            appendLine("     * The market the registration form selects for each locale (PRD §7.10 G2).")
            appendLine("     *")
            appendLine("     * A map rather than a rule, so web and mobile cannot resolve the same locale differently.")
            appendLine("     */")
            appendLine("    val AuthDefaultCountryByLocale: Map<String, String> = mapOf(")
            appendLine("        " + kotlinStringMap(defaultCountryByLocale))
            appendLine("    )")
            appendLine()
            appendLine("    /** The contract's default market, used to validate the map and the list agree. */")
            appendLine(
                "    const val AuthDefaultRegistrationCountry: String = " +
                    kotlinString(conventions["defaultRegistrationCountry"]?.toString() ?: ""),
            )
            appendLine()
            appendLine("    val errorRows: List<AuthErrorRow> = listOf(")
            for (row in errorRows) {
                val codes = row[0] as List<*>
                val key = row[1] as String
                val recovery = row[2] as String
                val field = row[3] as String?
                appendLine("        AuthErrorRow(")
                appendLine("            codes = listOf(${kotlinStringList(codes)}),")
                appendLine("            key = ${kotlinString(key)},")
                appendLine("            recovery = ${kotlinString(recovery)},")
                appendLine(
                    if (field != null) "            field = ${kotlinString(field)}," else "            field = null,",
                )
                appendLine("        ),")
            }
            appendLine("    )")
            appendLine()
            appendLine("    private val rowsByCode: Map<String, AuthErrorRow> =")
            appendLine("        errorRows.flatMap { row -> row.codes.map { code -> code to row } }.toMap()")
            appendLine()
            appendLine("    /** The shared table row for [code], or `null` when the table does not list it. */")
            appendLine("    fun errorRowFor(code: String): AuthErrorRow? = rowsByCode[code]")
            appendLine("}")
        }

        // ---- AuthStrings.kt --------------------------------------------------------------------
        val sortedKeys = messages.keys.sorted()
        val stringsText = buildString {
            appendLine("package $authContractPackage")
            appendLine()
            appendLine("// GENERATED by :shared:generateAuthContract from")
            appendLine("// packages/i18n/src/auth/messages.json — do not edit.")
            appendLine("// This object is the ONLY source of user-facing auth copy in Kotlin (PRD §7.7 I1).")
            appendLine()
            appendLine("/**")
            appendLine(" * The auth copy, in every shipped locale.")
            appendLine(" *")
            appendLine(" * Screens never hold an Arabic or English literal: they ask this object for a key. A key")
            appendLine(" * that is missing from the JSON renders as the key itself, so a gap is visible in review")
            appendLine(" * instead of silently showing English to an Arabic user.")
            appendLine(" */")
            appendLine("object AuthStrings {")
            appendLine("    const val defaultLocale: String = ${kotlinString(authLocales.first())}")
            appendLine()
            appendLine("    val locales: List<String> = listOf(${kotlinStringList(authLocales)})")
            appendLine()
            appendLine("    /** Every key the JSON defines, sorted, so a parity test can compare the two sides. */")
            appendLine("    val keys: List<String> = listOf(")
            for (key in sortedKeys) {
                appendLine("        ${kotlinString(key)},")
            }
            appendLine("    )")
            appendLine()
            appendLine("    private val messages: Map<String, Map<String, String>> = mapOf(")
            for (key in sortedKeys) {
                val byLocale = messages.getValue(key)
                val pairs = authLocales.mapNotNull { locale ->
                    byLocale[locale]?.let { "${kotlinString(locale)} to ${kotlinString(it)}" }
                }
                appendLine("        ${kotlinString(key)} to mapOf(${pairs.joinToString(", ")}),")
            }
            appendLine("    )")
            appendLine()
            appendLine("    /** True when [key] exists in [locale]. */")
            appendLine("    fun has(key: String, locale: String = defaultLocale): Boolean =")
            appendLine("        messages[key]?.containsKey(locale) == true")
            appendLine()
            appendLine("    /** The copy for [key] in [locale], falling back to the default locale, then to the key. */")
            appendLine("    fun t(key: String, locale: String = defaultLocale): String {")
            appendLine("        val byLocale = messages[key] ?: return key")
            appendLine("        return byLocale[locale] ?: byLocale[defaultLocale] ?: key")
            appendLine("    }")
            appendLine()
            appendLine("    /**")
            appendLine("     * The copy for [key] with `{name}` placeholders replaced by [params].")
            appendLine("     *")
            appendLine("     * An unknown placeholder is left untouched rather than blanked, so a copy mistake is")
            appendLine("     * visible in the UI instead of producing a sentence with a hole in it.")
            appendLine("     */")
            appendLine("    fun format(")
            appendLine("        key: String,")
            appendLine("        locale: String = defaultLocale,")
            appendLine("        params: Map<String, String> = emptyMap(),")
            appendLine("    ): String {")
            appendLine("        var text = t(key, locale)")
            appendLine("        for ((name, value) in params) {")
            appendLine("            text = text.replace(\"{\$name}\", value)")
            appendLine("        }")
            appendLine("        return text")
            appendLine("    }")
            appendLine("}")
        }

        File(outDir, "AuthConventions.kt").writeText(conventionsText)
        File(outDir, "AuthStrings.kt").writeText(stringsText)
    }
}

kotlin {
    listOf(
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "Shared"
            isStatic = true
        }
    }
    
    js {
        browser()
        binaries.executable()
    }
    
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs {
        browser()
        binaries.executable()
    }
    
    android {
       namespace = "com.tripsenjoy.shared"
       compileSdk = libs.versions.android.compileSdk.get().toInt()
       minSdk = libs.versions.android.minSdk.get().toInt()
    
       compilerOptions {
           jvmTarget = JvmTarget.JVM_11
       }
       androidResources {
           enable = true
       }
       withHostTest {
           isIncludeAndroidResources = true
       }
       withDeviceTestBuilder {
           sourceSetTreeName = "test"
       }.configure {
           instrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
       }
    }
    
    sourceSets {
        commonMain {
            // The generated auth contract is compiled as part of commonMain. Passing the provider
            // (not a plain File) is what makes every compile task depend on the codegen task.
            kotlin.srcDir(generateAuthContract.map { task -> task.outputs.files.singleFile })
        }
        androidMain.dependencies {
            implementation(libs.compose.uiToolingPreview)
            implementation(libs.compose.uiTooling)
        }
        commonMain.dependencies {
            implementation(libs.compose.runtime)
            implementation(libs.compose.foundation)
            implementation(libs.compose.material3)
            implementation(libs.compose.ui)
            implementation(libs.compose.components.resources)
            implementation(libs.compose.uiToolingPreview)
            implementation(libs.androidx.lifecycle.viewmodelCompose)
            implementation(libs.androidx.lifecycle.runtimeCompose)
        }
        commonMain.dependencies {
            // API client: Ktor for HTTP, kotlinx for the oRPC JSON envelope.
            implementation(libs.ktor.client.core)
            implementation(libs.kotlinx.serialization.json)
            implementation(libs.kotlinx.coroutines.core)
        }
        commonTest.dependencies {
            implementation(libs.kotlin.test)
            implementation(libs.ktor.client.mock)
            implementation(libs.kotlinx.coroutines.test)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.okhttp)
            // Firebase Analytics for com.tripsenjoy.analytics.AnalyticsTracker. The BoM platform
            // pins the version (same BoM as :androidApp); the analytics artifact itself has no
            // version in the catalog on purpose.
            implementation(project.dependencies.platform(libs.firebase.bom))
            implementation(libs.firebase.analytics)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
        }
        jsMain.dependencies {
            implementation(libs.wrappers.browser)
            implementation(libs.ktor.client.js)
        }
        wasmJsMain.dependencies {
            implementation(libs.ktor.client.js)
        }
    }
}

dependencies {
    androidRuntimeClasspath(libs.compose.uiTooling)
}
