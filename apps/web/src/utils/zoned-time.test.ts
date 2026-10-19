import { describe, expect, test } from "bun:test";

import { utcToZoned, zonedToUtcIso } from "./zoned-time";

describe("zonedToUtcIso", () => {
  test("reads the wall clock in the trip's zone, not the browser's", () => {
    // Arrange
    const wall = { date: "2027-01-15", time: "08:00" };

    // Act
    const cairo = zonedToUtcIso(wall, "Africa/Cairo");
    const riyadh = zonedToUtcIso(wall, "Asia/Riyadh");

    // Assert
    expect(cairo).toBe("2027-01-15T06:00:00.000Z");
    expect(riyadh).toBe("2027-01-15T05:00:00.000Z");
  });

  test("returns null for a missing date, a malformed time or an unknown zone", () => {
    expect(zonedToUtcIso({ date: "", time: "08:00" }, "Africa/Cairo")).toBeNull();
    expect(zonedToUtcIso({ date: "2027-01-15", time: "8" }, "Africa/Cairo")).toBeNull();
    expect(zonedToUtcIso({ date: "2027-01-15", time: "08:00" }, "Mars/Base")).toBeNull();
  });
});

describe("utcToZoned", () => {
  test("shows a stored instant as the wall clock of the trip's zone", () => {
    expect(utcToZoned("2027-01-15T06:00:00.000Z", "Africa/Cairo")).toEqual({
      date: "2027-01-15",
      time: "08:00",
    });
  });

  test("round-trips with zonedToUtcIso", () => {
    // Arrange
    const wall = { date: "2027-07-01", time: "23:30" };

    // Act
    const iso = zonedToUtcIso(wall, "Asia/Dubai");

    // Assert
    expect(iso).not.toBeNull();
    expect(utcToZoned(iso as string, "Asia/Dubai")).toEqual(wall);
  });

  test("returns null for an invalid instant", () => {
    expect(utcToZoned("not a date", "Africa/Cairo")).toBeNull();
  });
});
