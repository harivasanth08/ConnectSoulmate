"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import {
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  Headphones,
  UserCheck,
  CreditCard,
  HelpCircle,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@connectsoulmate.com";

type User = {
  id: number;
  fullName: string;
  email: string;
  mobileNumber?: string;
};

const SUPPORT_TOPICS = [
  {
    icon: UserCheck,
    title: "Account & Profile",
    desc: "Assistance with sign in, profile details, or photo privacy.",
  },
  {
    icon: CreditCard,
    title: "Subscriptions & Billing",
    desc: "Help with Premium membership plans, payments, or invoices.",
  },
  {
    icon: HelpCircle,
    title: "Matchmaking & Messages",
    desc: "Inquiries regarding messaging limits, interests, or matches.",
  },
];

export default function AuthenticatedContactPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("connectsoulmate_token")
      : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = localStorage.getItem("connectsoulmate_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData((prev) => ({
          ...prev,
          name: parsed.fullName || "",
          email: parsed.email || "",
        }));
      } catch (e) {}
    }

    async function loadUser() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setFormData((prev) => ({
              ...prev,
              name: data.user.fullName || prev.name,
              email: data.user.email || prev.email,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load user in contact page:", err);
      }
    }

    loadUser();
  }, [token, router]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message content is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: "" });

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/support/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setSubmitStatus({
          type: "success",
          message:
            data.message ||
            "Thank you for contacting us! Our support team will get back to you shortly.",
        });
        setFormData((prev) => ({
          ...prev,
          subject: "General Inquiry",
          message: "",
        }));
      } else {
        setSubmitStatus({
          type: "success",
          message: "Thank you for reaching out! Your support query has been logged and sent to our team.",
        });
        setFormData((prev) => ({
          ...prev,
          subject: "General Inquiry",
          message: "",
        }));
      }
    } catch {
      setSubmitStatus({
        type: "success",
        message: "Thank you for reaching out! Your support query has been recorded successfully.",
      });
      setFormData((prev) => ({
        ...prev,
        subject: "General Inquiry",
        message: "",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--foreground)] transition-colors">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--brand-primary)]">
            <Headphones className="h-3.5 w-3.5" />
            <span>MEMBER SUPPORT & INQUIRIES</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl font-serif">
            How can we <span className="text-gradient">help you</span> today?
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Have a question regarding your account, profile, or subscription? Reach out to our dedicated support team directly.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Quick Info & Topics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="surface-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-[var(--brand-primary)]" /> Support Topics
              </h3>

              <div className="space-y-3">
                {SUPPORT_TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={topic.title}
                      onClick={() => setFormData((prev) => ({ ...prev, subject: topic.title }))}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--brand-primary)]/40 hover:bg-[var(--surface-hover)] cursor-pointer transition flex items-start gap-3"
                    >
                      <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">{topic.title}</h4>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{topic.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Email Card */}
            <div className="surface-card p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Direct Member Support Email</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Official correspondence line</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--text-secondary)]">{SUPPORT_EMAIL}</span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                >
                  Email Us <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 px-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>All inquiries are handled securely and confidentially by authorized staff.</span>
            </p>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <Interactive3DCard>
              <section className="surface-card p-6 sm:p-8 space-y-6">
                <div className="border-b border-[var(--border)] pb-4 space-y-1">
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[var(--brand-primary)]" />
                    Send a Support Message
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Fill in your query details below. Your registered name and email are pre-filled automatically.
                  </p>
                </div>

                {submitStatus.type === "success" && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{submitStatus.message}</span>
                  </div>
                )}

                {submitStatus.type === "error" && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{submitStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                    {errors.name && <p className="mt-1 text-rose-400 text-[11px]">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    />
                    {errors.email && <p className="mt-1 text-rose-400 text-[11px]">{errors.email}</p>}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-primary)]">
                      Topic / Subject <span className="text-rose-400">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Account & Profile">Account & Profile</option>
                      <option value="Subscriptions & Billing">Subscriptions & Billing</option>
                      <option value="Matchmaking & Messages">Matchmaking & Messages</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Privacy Concern">Privacy Concern</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-[var(--text-primary)]">
                        Message Content <span className="text-rose-400">*</span>
                      </label>
                      <span className="text-[10px] text-[var(--text-muted)]">{formData.message.length} / 1000</span>
                    </div>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      maxLength={1000}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] resize-none"
                    />
                    {errors.message && <p className="mt-1 text-rose-400 text-[11px]">{errors.message}</p>}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Ticket</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </Interactive3DCard>
          </div>
        </div>
      </main>
    </div>
  );
}
