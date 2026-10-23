"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import {
  LifeBuoy,
  UserCheck,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  Mail,
  ChevronDown,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Lock,
  Headphones,
} from "lucide-react";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@connectsoulmate.com";

const SUPPORT_TOPICS = [
  {
    icon: UserCheck,
    title: "Account & Profile Setup",
    desc: "Assistance with sign in, profile details, education, occupation, or photo privacy settings.",
    category: "Account",
  },
  {
    icon: ShieldCheck,
    title: "Verification & Security",
    desc: "Email confirmation links, account access, and profile security.",
    category: "Verification",
  },
  {
    icon: CreditCard,
    title: "Premium & Subscriptions",
    desc: "Information about Monthly/Yearly plans, payment methods, or billing questions.",
    category: "Billing",
  },
  {
    icon: Sparkles,
    title: "AI Compatibility & Matching",
    desc: "How AI Compatibility scores work, partner expectations, and match recommendations.",
    category: "Matching",
  },
];

const FAQS = [
  {
    question: "How do I update my profile and family background information?",
    answer: "Go to 'My Profile' from the top right Menu dropdown. You can update your bio, education, occupation, lifestyle preferences, and family background details directly on that page.",
  },
  {
    question: "How does the Premium subscription work?",
    answer: "Premium subscriptions grant you unlimited direct messaging, priority match listing, and full access to detailed partner profiles. You can explore available plans under the 'Premium' section.",
  },
  {
    question: "How do I change my privacy or photo visibility settings?",
    answer: "Your photo and contact information are protected by default. Only verified members can view your full details. You can manage photo uploads and details in 'My Profile'.",
  },
  {
    question: "What should I do if I experience a technical issue?",
    answer: "You can submit a ticket using the 'Contact Us' button in the Menu or email our support team directly at support@connectsoulmate.com. We usually respond within 24 hours.",
  },
];

export default function AuthenticatedSupportPage() {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [token, router]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--foreground)] transition-colors">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Support Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-primary)]">
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>MEMBER HELP CENTER</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl font-serif">
            ConnectSoulmate <span className="text-gradient">Support Center</span>
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Find quick answers to common questions or reach out to our dedicated support team.
          </p>
        </div>

        {/* Support Topics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORT_TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <Interactive3DCard key={topic.title} className="p-5 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {topic.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">{topic.title}</h3>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)] leading-relaxed">{topic.desc}</p>
                  </div>
                </div>
              </Interactive3DCard>
            );
          })}
        </div>

        {/* FAQ Section & Direct Contact Box */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* FAQ Accordion (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="surface-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <HelpCircle className="h-4 w-4 text-[var(--brand-primary)]" /> Frequently Asked Questions
              </h2>

              <div className="space-y-3 text-xs">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full p-3.5 text-left font-semibold text-[var(--text-primary)] flex items-center justify-between gap-3 hover:bg-[var(--surface-hover)] transition"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[var(--brand-primary)]" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 pt-1 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border)]/50 leading-relaxed bg-[var(--surface)]/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Direct Support CTA Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Interactive3DCard>
              <div className="surface-card p-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-serif">
                    Still need assistance?
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Our support team is available to assist you with any questions or account issues.
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="btn-primary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Submit Support Ticket</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[var(--brand-primary)]" /> Support Email
                    </span>
                    <span className="font-mono text-[11px]">{SUPPORT_EMAIL}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] pt-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Protected Member Help Desk</span>
                  </div>
                </div>
              </div>
            </Interactive3DCard>
          </div>
        </div>
      </main>
    </div>
  );
}
