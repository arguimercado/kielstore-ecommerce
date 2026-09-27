import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession, safeCallbackURL } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account | Kiel Store",
  robots: { index: false },
};

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const callbackURL = safeCallbackURL((await props.searchParams).callbackURL);
  if (await getSession()) redirect(callbackURL);

  return (
    <main className="container-reading section flex-1">
      <div className="mx-auto max-w-sm">
        <p className="eyebrow text-ink-muted">Account</p>
        <h1 className="mt-3 text-headline">Create an account</h1>
        <div className="mt-10">
          <AuthForm mode="sign-up" callbackURL={callbackURL} />
        </div>
        <p className="mt-8 text-body text-ink-muted">
          Already have an account?{" "}
          <Link href={`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`} className="link text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
