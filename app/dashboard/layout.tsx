import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FileStack, MessageSquare, CreditCard } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: FileStack },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex">
      <aside className="w-56 border-r border-white/10 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <Link href="/" className="font-display text-xl text-paper block mb-8 px-2">
            Corpus
          </Link>
          <nav className="space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 text-paper-dim hover:text-paper hover:bg-white/5 rounded-md px-2.5 py-2 text-sm transition-colors"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
