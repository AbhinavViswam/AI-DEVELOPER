"use client";
import { authCheck } from "@/backend/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await authCheck();
      if (res?.data?.o) {
        router.push("/main");
      } else {
        router.replace("/login");
      }
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // ✅ runs only once

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      Redirecting...
    </div>
  );
}
