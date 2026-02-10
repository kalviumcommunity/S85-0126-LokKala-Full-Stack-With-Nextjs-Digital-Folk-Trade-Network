"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/schemas/signupSchema";
import FormInput from "@/components/FormInput";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const text = await res.text();
        let body: Record<string, unknown> = {};
        try {
          body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
        } catch {}
        const message = typeof body.message === "string" ? body.message : undefined;
        throw new Error(message || `Request failed (${res.status})`);
      }
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (json.success === true) {
        window.location.href = "/login";
        return;
      }
      // fallback
      window.location.href = "/login";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Sign up failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-medium text-slate-800">Sign up</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormInput label="Name" name="name" register={register} error={errors.name?.message} />
          <FormInput label="Email" name="email" type="email" register={register} error={errors.email?.message} />
          <FormInput label="Password" name="password" type="password" register={register} error={errors.password?.message} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}