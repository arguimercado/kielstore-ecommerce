import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { ArrowIcon } from "@/components/icons";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your account | Kiel Store",
  robots: { index: false },
};

export default async function AccountPage() {
  const { user } = await requireUser();

  return (
    <main className="container-content section flex-1">
      <p className="eyebrow text-ink-muted">Account</p>
      <h1 className="mt-3 text-headline">Welcome, {user.name}</h1>

      <dl className="mt-10 max-w-reading divide-y divide-line border-y border-line">
        <div className="flex justify-between gap-6 py-4">
          <dt className="eyebrow text-ink-muted">Name</dt>
          <dd className="text-body">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-6 py-4">
          <dt className="eyebrow text-ink-muted">Email</dt>
          <dd className="text-body break-all">{user.email}</dd>
        </div>
      </dl>

      <Link
        href="/account/orders"
        className="group mt-10 flex max-w-reading items-center justify-between border-b border-line py-4"
      >
        <span className="eyebrow link-reveal group-hover:bg-size-[100%_1px]">Orders</span>
        <ArrowIcon className="transition-transform duration-500 ease-luxe group-hover:translate-x-1" />
      </Link>

      <Link
        href="/account/wishlist"
        className="group flex max-w-reading items-center justify-between border-b border-line py-4"
      >
        <span className="eyebrow link-reveal group-hover:bg-size-[100%_1px]">Wishlist</span>
        <ArrowIcon className="transition-transform duration-500 ease-luxe group-hover:translate-x-1" />
      </Link>

      <form action={signOut} className="mt-10">
        <button type="submit" className="btn btn-secondary">
          Sign out
        </button>
      </form>
    </main>
  );
}
