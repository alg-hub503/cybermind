import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GraduationCap, Users, FileText, CreditCard, Shield, ArrowRight, Check, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-black/80 px-6 backdrop-blur-xl lg:px-12">
        <span className="text-xl font-bold tracking-tight">Cyber<span className="text-blue-500">Mind</span></span>
        <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <Link href="/login" className="rounded-xl border border-white/10 px-4 py-2 text-white hover:bg-white/5 transition">Log In</Link>
          <Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 transition">Start Free</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center lg:px-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Production Ready SaaS Platform
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight lg:text-7xl">
            Smart School
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 lg:text-xl">
            Manage schools, users, clients, and invoices — all in one place.
            Built with Stripe billing, role-based access, and a modern dashboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold hover:bg-blue-500 transition">
              Start Free <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold hover:bg-white/10 transition">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/5 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">Why CyberMind?</h2>
            <p className="mt-4 text-gray-400 text-lg">Everything you need to run your school management platform.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: GraduationCap, title: "School Management", desc: "Create and manage schools with full CRUD. Organize your educational institutions in one dashboard." },
              { icon: Users, title: "User & Role Management", desc: "Role-based access control with ADMIN and USER roles. Manage who sees what." },
              { icon: Users, title: "Client Management", desc: "Track clients per school. Add, edit, and delete client records with ease." },
              { icon: FileText, title: "Invoice Management", desc: "Create and manage invoices per school. Track payments and revenue." },
              { icon: CreditCard, title: "Billing & Subscriptions", desc: "Stripe-powered subscription billing with Customer Portal, invoices, and webhook sync." },
              { icon: Shield, title: "Secure Admin Dashboard", desc: "Full system overview with user management, subscription status, and global statistics." },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition hover:border-white/20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-white/5 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">How It Works</h2>
            <p className="mt-4 text-gray-400 text-lg">Get started in minutes.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-blue-500/50 to-purple-500/50 hidden md:block" />
            <div className="space-y-12">
              {[
                { step: "1", title: "Create Your Account", desc: "Sign up with your email and password. No credit card required to start." },
                { step: "2", title: "Create a School", desc: "Set up your first school organization. Add details and configure settings." },
                { step: "3", title: "Invite Users", desc: "Add team members with appropriate roles. ADMIN for full access, USER for scoped access." },
                { step: "4", title: "Manage Clients & Invoices", desc: "Add clients to your schools, create invoices, and track payments." },
                { step: "5", title: "Monitor Everything", desc: "Use the dashboard to monitor schools, users, clients, invoices, and subscription status." },
              ].map((item) => (
                <div key={item.step} className="relative flex items-start gap-6 md:pl-16">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-xl font-bold text-blue-400">
                    {item.step}
                  </div>
                  <div className="pt-3">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/5 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold lg:text-4xl">Simple Pricing</h2>
            <p className="mt-4 text-gray-400 text-lg">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="mt-2 text-gray-400">Get started with basic features.</p>
              <p className="mt-6">
                <span className="text-5xl font-black">$0</span>
                <span className="text-gray-400"> /month</span>
              </p>
              <ul className="mt-8 space-y-3">
                {["School management", "User management", "Client management", "Invoice management", "Basic dashboard"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={18} className="text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10 transition">
                Get Started <ChevronRight size={18} />
              </Link>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent p-8 backdrop-blur-2xl">
              <div className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 mb-4">Most Popular</div>
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="mt-2 text-gray-400">Full features for growing teams.</p>
              <p className="mt-6">
                <span className="text-5xl font-black">$29</span>
                <span className="text-gray-400"> /month</span>
              </p>
              <ul className="mt-8 space-y-3">
                {["Everything in Free", "Stripe subscription billing", "Customer portal access", "Invoice PDF downloads", "Billing history & export", "Premium support"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={18} className="text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition">
                Upgrade Now <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <h2 className="text-3xl font-bold lg:text-4xl">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-gray-400">Create your account now and start managing your schools in minutes.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold hover:bg-blue-500 transition">
              Start Free <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold hover:bg-white/10 transition">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="text-lg font-bold">Cyber<span className="text-blue-500">Mind</span></span>
              <p className="mt-1 text-sm text-gray-500">Smart School Management Platform</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="#pricing" className="hover:text-white transition">Pricing</a>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} CyberMind. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
