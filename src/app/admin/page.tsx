import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  const { user } = await requireAdmin();

  return (
    <main className="container-content section flex-1">
      <p className="eyebrow text-ink-muted">Admin</p>
      <h1 className="mt-3 text-headline">Store admin</h1>
      <p className="mt-4 text-body-lg text-ink-muted">Signed in as {user.email}.</p>
    </main>
  );
}
