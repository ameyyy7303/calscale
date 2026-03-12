"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Scale,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Log Food", href: "/log" },
  { icon: Scale, label: "Scale", href: "/scale" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Scale className="size-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          CalScale
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-[10px] text-muted-foreground text-center">
          Free to use — no account needed
        </p>
      </div>
    </aside>
  );
}
