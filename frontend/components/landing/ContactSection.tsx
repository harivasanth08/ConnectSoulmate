"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  UserCheck,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  ArrowUpRight,
  LifeBuoy,
} from "lucide-react";
import Interactive3DCard from "@/components/ui/Interactive3DCard";

// Configurable fallback support email from environment or default
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@connectsoulmate.com";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const SUPPORT_TOPICS = [
  {
    icon: UserCheck,
    title: "Account & Login",
    desc: "Assistance with sign in, password recovery, and profile setup.",
    tag: "Account",
  },
  {
    icon: ShieldCheck,
    title: "Email & Mobile Verification",
    desc: "Didn't receive verification email or OTP code?",
    tag: "Verification",
  },
  {
    icon: CreditCard,
    title: "Premium & Payments",
    desc: "Questions about Monthly/Yearly plans or Razorpay debits.",
    tag: "Payments",
  },
  {
    icon: HelpCircle,
    title: "Privacy & Safety",
    desc: "Photo visibility settings, blocking, and profile security.",
    tag: "Privacy",
  },
];

export default function ContactSection() {
  const shouldReduceMotion = useReducedMotion();

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: "success" | "error" | "backend_missing" | null;
    message: string;
  }>({ type: null, message: "" });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 60) {
      newErrors.name = "Name cannot exceed 60 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject) {
      newErrors.subject = "Please select a subject";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message content is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = "Message cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult({ type: null, message: "" });

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitResult({
          type: "success",
          message:
            data.message ||
            "Thank you for contacting us! Our support team will get back to you shortly.",
        });
        setFormData({
          name: "",
          email: "",
          subject: "General Inquiry",
          message: "",
        });
      } else if (response.status === 404) {
        setSubmitResult({
          type: "backend_missing",
          message: "Contact form requires a backend endpoint.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitResult({
          type: "error",
          message:
            errorData.message ||
            "Failed to send message. Please try again later.",
        });
      }
    } catch {
      setSubmitResult({
        type: "backend_missing",
        message: "Contact form requires a backend endpoint.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectTopic = (topicTitle: string) => {
    setFormData((prev) => ({ ...prev, subject: topicTitle }));
    const formElement = document.getElementById("contact-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fadeIn = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 },
      };

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 py-20 lg:py-28 overflow-hidden"
    >
      {/* Soft Ambient Radial Glow for Stories -> Contact Transition */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-5xl rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-500/06 via-purple-600/04 to-transparent blur-[140px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)]/60 px-4 py-1.5 text-xs font-semibold text-[var(--brand-primary)] backdrop-blur-md">
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>SUPPORT & INQUIRIES</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl font-serif">
            Let's stay <span className="text-gradient">connected</span>.
          </h2>

          <p className="text-base text-[var(--text-secondary)] sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question about ConnectSoulmate or need help with your account? We're here to assist you.
          </p>
        </motion.div>

        {/* Desktop Two-Column Grid */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Support Categories & Info (6 Cols on LG) */}
          <motion.div {...fadeIn} className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-serif">
                How can we help you today?
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Select a topic below to auto-fill your subject, or reach out to our support team directly.
              </p>
            </div>

            {/* Support Topic Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {SUPPORT_TOPICS.map((topic) => {
                const IconComponent = topic.icon;
                return (
                  <Interactive3DCard
                    key={topic.title}
                    accentGlow="rgba(224, 86, 123, 0.3)"
                    accentLight="rgba(244, 63, 94, 0.15)"
                    onClick={() => handleSelectTopic(topic.title)}
                    className="p-5 flex flex-col justify-between cursor-pointer group h-full"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] group-hover:scale-105 transition-transform"
                          style={{ transform: "translateZ(14px)" }}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors"
                          style={{ transform: "translateZ(10px)" }}
                        >
                          {topic.tag}
                        </span>
                      </div>
                      <div style={{ transform: "translateZ(8px)" }}>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                          {topic.title}
                        </h4>
                        <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                          {topic.desc}
                        </p>
                      </div>
                    </div>
                    <div
                      className="mt-4 flex items-center text-xs font-semibold text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ transform: "translateZ(12px)" }}
                    >
                      <span>Select topic</span>
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </Interactive3DCard>
                );
              })}
            </div>

            {/* Direct Contact Info Box */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/30 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Official Support Email
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Direct correspondence for member inquiries
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {SUPPORT_EMAIL}
                </span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                >
                  Write Email <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Trust Note */}
            <p className="text-xs text-[var(--text-muted)] leading-relaxed flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Your privacy matters. Inquiries are handled securely by authorized ConnectSoulmate staff.
              </span>
            </p>
          </motion.div>

          {/* Right Column: Contact Form (6 Cols on LG) */}
          <motion.div
            {...fadeIn}
            id="contact-form"
            className="lg:col-span-6 scroll-mt-28"
          >
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-6 sm:p-8 backdrop-blur-md shadow-xl relative">
              <div className="mb-6 space-y-1">
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-serif flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[var(--brand-primary)]" />
                  Send us a message
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Fill out the form below and our team will get in touch with you.
                </p>
              </div>

              {/* Status Alert Messages */}
              {submitResult.type === "backend_missing" && (
                <div
                  role="alert"
                  className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-xs space-y-2"
                >
                  <div className="flex items-center gap-2 font-semibold text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Contact form requires a backend endpoint.</span>
                  </div>
                  <p className="leading-relaxed">
                    Form input validated successfully. Sending messages requires mounting a backend POST handler at{" "}
                    <code className="bg-black/30 px-1.5 py-0.5 rounded text-[11px]">/api/support/contact</code>.
                  </p>
                </div>
              )}

              {submitResult.type === "error" && (
                <div
                  role="alert"
                  className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{submitResult.message}</span>
                </div>
              )}

              {submitResult.type === "success" && (
                <div
                  role="alert"
                  className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{submitResult.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    maxLength={60}
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    placeholder="Enter your name"
                    className={`w-full rounded-xl border bg-[var(--background)]/80 px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:outline-none ${
                      errors.name
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
                    }`}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-xs text-rose-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={100}
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    placeholder="your.email@example.com"
                    className={`w-full rounded-xl border bg-[var(--background)]/80 px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:outline-none ${
                      errors.email
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
                    }`}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-rose-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
                  >
                    Topic / Subject <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)]/80 px-4 py-3 text-sm text-[var(--text-primary)] transition-all focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Account & Login">Account & Login</option>
                    <option value="Email & Mobile Verification">
                      Email / Mobile Verification
                    </option>
                    <option value="Profile & Photos">Profile & Photos</option>
                    <option value="Interests & Shortlist">
                      Interests & Shortlist
                    </option>
                    <option value="Premium & Payments">
                      Premium & Payments
                    </option>
                    <option value="AI Compatibility">AI Compatibility</option>
                    <option value="Privacy Concern">Privacy Concern</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {formData.message.length} / 1000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    maxLength={1000}
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    placeholder="Describe how we can help you..."
                    className={`w-full rounded-xl border bg-[var(--background)]/80 px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:outline-none resize-none ${
                      errors.message
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
                    }`}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-xs text-rose-400">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-[var(--brand-primary)]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
