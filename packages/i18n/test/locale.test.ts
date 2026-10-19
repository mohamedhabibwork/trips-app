// The host locale resolver lets a server answer `getLocale()` per request (UI-01).
import { afterEach, describe, expect, test } from "bun:test";

import { getLocale, resetLocale, setLocaleResolver, t } from "@trips-app/i18n";

afterEach(() => {
  setLocaleResolver(null);
  resetLocale();
});

describe("Unit: locale resolver", () => {
  test("getLocale answers from the registered resolver", () => {
    // Arrange
    setLocaleResolver(() => "en");

    // Act
    const locale = getLocale();

    // Assert
    expect(locale).toBe("en");
  });

  test("a resolver returning null falls through to the Arabic default", () => {
    // Arrange
    setLocaleResolver(() => null);

    // Act
    const locale = getLocale();

    // Assert
    expect(locale).toBe("ar");
  });

  test("t() without a locale renders in the resolver's language", () => {
    // Arrange
    setLocaleResolver(() => "en");
    const key = "route.root.tripsEnjoy";

    // Act
    const text = t(key);

    // Assert
    expect(text).toBe(t(key, "en"));
  });
});
