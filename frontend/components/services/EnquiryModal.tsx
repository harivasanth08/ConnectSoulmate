"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { submitServiceEnquiry, ServiceProvider } from "@/lib/servicesApi";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceProvider;
}

export function EnquiryModal({ isOpen, onClose, service }: EnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "Hi, I'm interested in your wedding services. Please share more details about your packages and availability."
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);

      const storedUser = localStorage.getItem("connectsoulmate_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.fullName) setName(u.fullName);
          if (u.mobileNumber) setPhone(u.mobileNumber);
          if (u.email) setEmail(u.email);
        } catch (e) {
          // ignore json parse error
        }
      }
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }

    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
    if (!cleanPhone || cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit phone number so the provider can reach you.");
      return;
    }

    const trimmedMsg = message.trim();
    if (!trimmedMsg || trimmedMsg.length < 5) {
      setError("Please enter an enquiry message with your requirements.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("connectsoulmate_token");

      await submitServiceEnquiry(
        service.id,
        {
          name: trimmedName,
          phone: cleanPhone,
          email: email.trim() || undefined,
          message: trimmedMsg,
        },
        token
      );

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-2xl p-6 sm:p-7 overflow-hidden transition-all max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
      >
        {/* Close Button */}
        {!loading && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)] flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Enquiry Sent</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                Your enquiry has been sent successfully to <span className="font-semibold text-[var(--text-primary)]">{service.name}</span>. The service provider can contact you regarding your requirements.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto min-w-[140px] rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="mb-5 pr-8">
              <span className="text-[11px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
                {service.category?.name || "Wedding Service"}
              </span>
              <h2 id="enquiry-modal-title" className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                Interested in this service?
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Enquire with <span className="font-semibold text-[var(--text-primary)]">{service.name}</span> in {service.location}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Your Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Varma"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Contact Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9848012345"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Email Address <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Enquiry Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:border-[var(--brand-primary)] transition resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:shadow-pink-500/35 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
                  🔒 Your contact information is shared safely with this service provider.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
