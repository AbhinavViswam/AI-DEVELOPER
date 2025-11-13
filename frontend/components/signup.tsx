"use client";
import { useSignup } from "@/backend/query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function SignupPage() {
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const signupMutation = useSignup();
  const router = useRouter();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const res = signupMutation.mutate(form, {
      onSuccess: (e) => {
        // redirect after successful login
        router.push("/");
        localStorage.setItem("token", e?.data?.token);
      },
    });
    // console.log(res)
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
      />
      <button type="submit" disabled={signupMutation.isPending}>
        {signupMutation.isPending ? "Signing up..." : "Sign Up"}
      </button>

      {signupMutation.isError && <p>{signupMutation.error.message}</p>}
      {signupMutation.isSuccess && <p>Signup successful!</p>}
    </form>
  );
}

export default SignupPage;
