import { useEffect, useState } from "react";

const TICK_MS = 1000;

/** Seconds left, counting down once a second to zero; the setter restarts it. */
export function useCountdown(initialSeconds = 0): [number, (seconds: number) => void] {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), TICK_MS);
    return () => clearTimeout(timer);
  }, [seconds]);
  return [seconds, setSeconds];
}
