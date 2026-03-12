import Link from "next/link";
import { Scale, Search, BarChart3, Flame, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Scale className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CalScale</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Scale className="size-3" />
            Weigh food with your MacBook trackpad
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Weigh. Search.{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
              Track.
            </span>{" "}
            Done.
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            The calorie tracker that uses your MacBook&apos;s Force Touch trackpad as a
            weighing scale. Search 300,000+ US foods including Great Value, Kirkland,
            and all your grocery favorites.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/register"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/20 px-6 py-20">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                icon: Scale,
                title: "Trackpad Scale",
                description:
                  "Place items on your MacBook trackpad and get instant weight readings up to 3.5kg. Calibrate for better accuracy.",
              },
              {
                icon: Search,
                title: "300K+ Foods",
                description:
                  "Search the USDA database with branded products — Great Value, Kirkland, store brands, and everything in between.",
              },
              {
                icon: BarChart3,
                title: "Full Macro Tracking",
                description:
                  "Track calories, protein, carbs, fat, and fiber with beautiful charts showing your weekly and monthly trends.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center px-6 py-20 text-center">
          <Flame className="mb-4 size-8 text-orange-500" />
          <h2 className="text-2xl font-bold tracking-tight">
            Start tracking today
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Free forever. No credit card required.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create Free Account
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex h-14 items-center justify-center border-t border-border text-xs text-muted-foreground">
        CalScale — Built with Next.js, USDA FoodData Central, and Force Touch
      </footer>
    </div>
  );
}
