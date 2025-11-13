"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/backend/query";

export default function LoginPage() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const validate = () => {
    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return false;
    }
    // basic email pattern
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }
    setLocalError("");
    return true;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!validate()) return;

    mutate(
      { email, password },
      {
        onSuccess: (e) => {
          // redirect after successful login
          router.push("/");
          localStorage.setItem("token", e?.data?.token);
        },
        onError: (err) => {
          // server error message will be in err.message
          // we don't need to set anything here because isError && error will show it
          console.error("Login error:", err);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow"
        autoComplete="on"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center">Log in</h1>

        <label className="block mb-2 text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          placeholder="you@example.com"
          aria-label="Email"
        />

        <label className="block mb-2 text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          placeholder="Your password"
          aria-label="Password"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 rounded bg-blue-600 text-white font-medium disabled:opacity-60"
        >
          {isPending ? "Logging in..." : "Log in"}
        </button>

        {/* client-side validation error */}
        {localError && (
          <p className="text-red-600 text-sm mt-3" role="alert">
            {localError}
          </p>
        )}

        {/* server error from mutation */}
        {isError && (
          <p className="text-red-600 text-sm mt-3" role="alert">
            {error?.message || "Login failed"}
          </p>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
