"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const oauthError = searchParams.get("error");
    const token = searchParams.get("token");
    const setup = searchParams.get("setup");

    if (oauthError) {
      const messages: Record<string, string> = {
        oauth_denied: "OAuth login was cancelled",
        no_code: "No authorization code received",
        oauth_failed: "OAuth authentication failed",
        invalid_provider: "Invalid OAuth provider",
        not_configured: "This login method is not configured yet",
      };
      const msg = messages[oauthError] || "Authentication failed";
      queueMicrotask(() => setError(msg));
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (token) {
      const userId = searchParams.get("userId");
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify({ id: userId }));
      router.push(setup ? "/company-setup" : "/dashboard");
      return;
    }

    queueMicrotask(() => setError("No authentication token received"));
    setTimeout(() => router.push("/login"), 3000);
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <p className="text-neutral-500 text-xs">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-neutral-400 text-sm">Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-white tracking-tight">
            Flow<span className="text-indigo-400">Forge</span>
          </span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <Suspense
            fallback={
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-400 text-sm">Loading...</p>
              </div>
            }
          >
            <CallbackHandler />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
