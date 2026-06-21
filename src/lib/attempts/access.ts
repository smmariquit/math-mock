"use client";

import { useEffect, useState } from "react";

export const ATTEMPTS_ACCESS_KEY = process.env.NEXT_PUBLIC_ATTEMPTS_KEY;
export const ATTEMPTS_STORAGE_KEY = "mathquiz_attempts_key";

export function useAttemptsAccess() {
  const [unlocked, setUnlocked] = useState(!ATTEMPTS_ACCESS_KEY);
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ATTEMPTS_ACCESS_KEY) return;
    const stored = sessionStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (stored === ATTEMPTS_ACCESS_KEY) setUnlocked(true);
  }, []);

  const unlock = () => {
    if (accessKey === ATTEMPTS_ACCESS_KEY) {
      sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, accessKey);
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Invalid access key.");
  };

  return { unlocked, accessKey, setAccessKey, error, unlock, requiresKey: Boolean(ATTEMPTS_ACCESS_KEY) };
}
