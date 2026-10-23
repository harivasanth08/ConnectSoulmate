"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import {
  Crown,
  Check,
  Lock,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type SubscriptionPlan = {
  id: string;
  name: string;
  pricePaise: number;
  priceRupees: number;
  currency: string;
  durationDays: number;
  features: string;
};

type UserSubscription = {
  subscriptionId: number | null;
  userId: number;
  planId: string;
  planName: string;
  status: string;
  startsAt: string | null;
  expiresAt: string | null;
  pricePaise: number;
  currency: string;
  durationDays: number;
  features: string;
  isPremium: boolean;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("connectsoulmate_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    loadSubscriptionData(token);
    loadRazorpayScript();
  }, [router]);

  async function loadSubscriptionData(token: string) {
    try {
      setLoading(true);
      setError(null);

      const [plansRes, subRes] = await Promise.all([
        fetch(`${API_URL}/api/subscriptions/plans`),
        fetch(`${API_URL}/api/subscriptions/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (subRes.status === 401) {
        localStorage.removeItem("connectsoulmate_token");
        localStorage.removeItem("connectsoulmate_user");
        router.replace("/login");
        return;
      }

      const plansData = await plansRes.json();
      const subData = await subRes.json();

      if (!plansRes.ok || !plansData.success) {
        throw new Error(plansData.message || "Failed to load subscription plans");
      }

      if (!subRes.ok || !subData.success) {
        throw new Error(subData.message || "Failed to load subscription status");
      }

      setPlans(plansData.plans || []);
      setSubscription(subData.subscription || null);
    } catch (err: any) {
      setError(err.message || "Unable to load subscription data");
    } finally {
      setLoading(false);
    }
  }

  async function refreshSubscriptionStatus() {
    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) return;

    try {
      const subRes = await fetch(`${API_URL}/api/subscriptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subData = await subRes.json();
      if (subRes.ok && subData.success) {
        setSubscription(subData.subscription || null);
      }
    } catch (err) {
      console.error("Failed to refresh subscription status:", err);
    }
  }

  async function handleSubscribe(planId: string) {
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("connectsoulmate_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const sdkReady = await loadRazorpayScript();
    if (!sdkReady) {
      setError("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    setProcessingPlanId(planId);

    try {
      // 1. Create order on backend
      const orderRes = await fetch(`${API_URL}/api/subscriptions/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success || !orderData.order) {
        throw new Error(orderData.message || "Failed to initiate payment order");
      }

      const order = orderData.order;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ConnectSoulmate",
        description: `${order.plan.name} Subscription`,
        order_id: order.orderId,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            setProcessingPlanId(planId);
            setSuccess("Payment authorized. Verifying payment signature...");

            // 3. Send payment signature to backend for verification
            const verifyRes = await fetch(`${API_URL}/api/subscriptions/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment signature verification failed. Please contact support if debited."
              );
            }

            setSuccess("🎉 Premium Membership Activated Successfully!");
            await refreshSubscriptionStatus();
          } catch (verifyErr: any) {
            setError(verifyErr.message || "Payment verification failed.");
          } finally {
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPlanId(null);
          },
        },
        theme: {
          color: "#e0567b",
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (resp: any) {
        setError(resp.error?.description || "Payment failed on Razorpay checkout.");
        setProcessingPlanId(null);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setError(err.message || "Failed to launch Razorpay checkout.");
      setProcessingPlanId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
        <p className="text-xs text-[var(--text-muted)] animate-pulse">Loading subscription plans...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Premium Membership Plans
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Upgrade your membership to unlock direct messaging with accepted matches, priority search placement, and AI compatibility evaluations.
          </p>
        </div>

        {/* Banner Alert Messages */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="font-bold text-red-400">✕</button>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="font-bold text-emerald-400">✕</button>
          </div>
        )}

        {/* Current Subscription Status Card */}
        <section>
          <Interactive3DCard>
            <div className="surface-card p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                      Active Membership
                    </span>
                    {subscription?.isPremium ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary)] px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                        <Crown className="h-3.5 w-3.5" /> PREMIUM ACTIVE
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--surface-soft)] px-3 py-0.5 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)]">
                        FREE PLAN
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                    {subscription?.planName || "Free Plan"}
                  </h2>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                    {subscription?.features}
                  </p>

                  {subscription?.isPremium && subscription.expiresAt && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Valid until {new Date(subscription.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {!subscription?.isPremium && (
                  <div className="shrink-0">
                    <a
                      href="#plans"
                      className="btn-primary text-xs px-6 py-3 shadow-md"
                    >
                      Upgrade Membership
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Interactive3DCard>
        </section>

        {/* Plans Grid Section (Free, Premium Monthly, Premium Yearly) */}
        <section id="plans">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
              Choose the Membership Option for You
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Reflecting actual platform plans (`Free`, `Premium Monthly`, `Premium Yearly`)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = subscription?.planId === plan.id;
              const isPopular = plan.id === "premium_monthly";
              const isPaid = plan.pricePaise > 0;
              const isProcessing = processingPlanId === plan.id;

              return (
                <Interactive3DCard key={plan.id} className="h-full">
                  <div
                    className={`surface-card p-6 flex flex-col justify-between relative h-full ${
                      isPopular ? "border-[var(--brand-primary)]/60 shadow-xl" : ""
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-primary)] px-3.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                        MOST POPULAR
                      </div>
                    )}

                    <div>
                      <div className="mb-4">
                        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                            {isPaid ? `₹${plan.priceRupees}` : "Free"}
                          </span>
                          {isPaid && (
                            <span className="text-xs text-[var(--text-muted)]">
                              / {plan.durationDays} days
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border)] pt-4 mb-6">
                        <p>{plan.features}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)]">
                      {isCurrentPlan ? (
                        <button
                          disabled
                          className="w-full btn-secondary text-xs py-2.5 opacity-50 cursor-not-allowed text-[var(--text-muted)]"
                        >
                          Current Plan
                        </button>
                      ) : isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={processingPlanId !== null}
                          className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Opening Razorpay...</span>
                            </>
                          ) : (
                            <>
                              <Crown className="h-3.5 w-3.5" />
                              <span>Subscribe ({plan.name})</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full btn-secondary text-xs py-2.5 opacity-50 cursor-not-allowed"
                        >
                          Default Free Plan
                        </button>
                      )}
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>

        {/* Security & Support Note */}
        <footer className="text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-6 flex items-center justify-center gap-1">
          <Lock className="h-3.5 w-3.5" /> Payments are securely processed via Razorpay (TEST Mode). Official receipt and instant membership activation upon signature verification.
        </footer>
      </div>
    </main>
  );
}
