"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignup } from "@/backend/query";
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const signupMutation = useSignup();

  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setLocalError("Please fill in all fields.");
      return false;
    }
    if (form.name.trim().length < 2) {
      setLocalError("Name must be at least 2 characters.");
      return false;
    }
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(form.email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return false;
    }
    setLocalError("");
    return true;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!validate()) return;

    signupMutation.mutate(form, {
      onSuccess: (e) => {
        router.push("/");
        localStorage.setItem("token", e?.data?.token);
      },
      onError: (err) => {
        //@ts-ignore
        setLocalError(err?.response?.data?.e)
        console.error("Signup error:", err);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          {/* Header with gradient text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-gray-600 mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Your full name"
                  aria-label="Name"
                />
              </div>
            </div>

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
                  name="email"
                  value={form.email}
                  onChange={handleChange}
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
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Create a password"
                  aria-label="Password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full py-3 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {signupMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </>
              )}
            </button>

            {/* Error Messages */}
            {(localError || signupMutation.isError) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">
                  {localError || "Signup failed"}
                </p>
              </div>
            )}

            {/* Success Message */}
            {signupMutation.isSuccess && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg" role="alert">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-green-600 text-sm">
                  Signup successful! Redirecting...
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}