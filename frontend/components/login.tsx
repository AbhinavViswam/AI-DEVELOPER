"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/backend/query";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

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
          router.push("/");
          localStorage.setItem("token", e?.data?.token);
        },
        onError: (err) => {
          //@ts-ignore
          setLocalError(err?.response?.data?.e)
          console.error("Login error:", err);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          {/* Header with gradient text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="you@example.com"
                  aria-label="Email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Your password"
                  aria-label="Password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Log in
                </>
              )}
            </button>

            {/* Error Messages */}
            {(localError || isError) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">
                  {localError || "Login failed"}
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}