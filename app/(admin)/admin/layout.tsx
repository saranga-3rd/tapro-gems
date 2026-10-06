import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import LoginForm from "@/components/admin/LoginForm";
import { signOut } from "@/lib/admin/actions";
import { isAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin | Tapro Gems",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Every /admin route shows the sign-in form until a valid session exists.
  if (!(await isAdmin())) return <LoginForm />;

  return (
    <div className="min-h-screen bg-ivory-100">
      <header className="bg-navy-950 text-ivory">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="font-display text-lg tracking-wide">
            Tapro Gems <span className="text-gold-400">Admin</span>
          </Link>
          <AdminNav />
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
    </div>
  );
}
