"use client";

import { useActionState } from "react";
import { type AuthFormState, signIn, signUp } from "@/app/(auth)/actions";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  callbackURL: string;
};

export function AuthForm({ mode, callbackURL }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    mode === "sign-in" ? signIn : signUp,
    {},
  );
  const invalid = state.error ? true : undefined;
  const describedBy = state.error ? "auth-error" : undefined;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="callbackURL" value={callbackURL} />

      {mode === "sign-up" && (
        <div>
          <label htmlFor="name" className="eyebrow text-ink-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={state.name}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="field"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="eyebrow text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="eyebrow text-ink-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={mode === "sign-up" ? 8 : undefined}
          maxLength={128}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="field"
        />
        {mode === "sign-up" && <p className="mt-2 text-caption text-ink-muted">At least 8 characters.</p>}
      </div>

      {state.error && (
        <p id="auth-error" role="alert" className="text-caption text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? "Please wait" : mode === "sign-in" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
