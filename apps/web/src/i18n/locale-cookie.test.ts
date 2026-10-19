import { describe, expect, test } from "bun:test";

import { localeFromCookieHeader, readLocaleCookie, serializeLocaleCookie } from "./locale-cookie";

describe("Unit: locale cookie", () => {
  test("defaults to Arabic when the request has no cookie", () => {
    // Arrange
    const header = null;

    // Act
    const locale = localeFromCookieHeader(header);

    // Assert
    expect(locale).toBe("ar");
  });

  test("reads English from a cookie header with other cookies", () => {
    // Arrange
    const header = "theme=dark; trips.locale=en; session=abc";

    // Act
    const locale = readLocaleCookie(header);

    // Assert
    expect(locale).toBe("en");
  });

  test("ignores an unsupported locale value", () => {
    // Arrange
    const header = "trips.locale=fr";

    // Act
    const locale = localeFromCookieHeader(header);

    // Assert
    expect(locale).toBe("ar");
  });

  test("serializes a site-wide cookie that the parser reads back", () => {
    // Arrange
    const written = serializeLocaleCookie("en");

    // Act
    const locale = readLocaleCookie(written.split(";")[0]);

    // Assert
    expect(written).toContain("Path=/");
    expect(locale).toBe("en");
  });
});
