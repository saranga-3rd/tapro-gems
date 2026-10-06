"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/lib/admin/actions";
import { inputClasses, labelClasses, primaryButton } from "./ui";

const initialState: FormState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-ivory p-8 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="font-display text-2xl text-ink">Admin Sign In</h1>
          <p className="mt-1 text-sm text-ink-muted">Tapro Gems dashboard</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Username</span>
          <input
            name="username"
            autoComplete="username"
            required
            autoFocus
            className={inputClasses}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClasses}>Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClasses}
          />
        </label>

        {state.error ? (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
