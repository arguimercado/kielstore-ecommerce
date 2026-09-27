import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin | Kiel Store",
  robots: { index: false },
};

// Guards the whole segment on first load. Layouts don't re-run on client
// navigation, so every admin page, action and route handler also calls requireAdmin().
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return children;
}
