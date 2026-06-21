"use client";

import Link from "next/link";
import { useAttemptsAccess } from "@/lib/attempts/access";

interface AttemptsAccessGateProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function AttemptsAccessGate({
  children,
  backHref = "/",
  backLabel = "Home",
}: AttemptsAccessGateProps) {
  const { unlocked, accessKey, setAccessKey, error, unlock, requiresKey } = useAttemptsAccess();

  if (!requiresKey || unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
      <div className="mx-auto max-w-sm">
        <Link href={backHref} className="text-sm text-blue-400 hover:underline">
          {backLabel}
        </Link>
        <h1 className="mt-6 text-xl font-semibold">Attempts</h1>
        <p className="mt-2 text-sm text-slate-400">Enter the access key to view attempts.</p>
        <input
          type="password"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && unlock()}
          className="mt-4 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
          placeholder="Access key"
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={unlock}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium"
        >
          View
        </button>
      </div>
    </div>
  );
}
