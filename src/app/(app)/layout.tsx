import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <AppSidebar />

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <ThemeToggle />
        </header>

        <main className="min-h-[calc(100vh-3.5rem)] p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
