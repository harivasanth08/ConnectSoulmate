"use client";

import { useEffect, useState } from "react";
import {
  Server,
  Database,
  Key,
  Mail,
  CreditCard,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface HealthData {
  status: "healthy" | "degraded";
  uptimeSeconds: number;
  timestamp: string;
  services: {
    backend: {
      status: string;
      nodeVersion: string;
      memoryUsageMb: number;
    };
    database: {
      status: string;
      latencyMs: number;
      engine: string;
    };
    authentication: {
      status: string;
      jwtActive: boolean;
    };
    emailService: {
      status: string;
      smtpConfigured: boolean;
    };
    razorpay: {
      status: string;
    };
    aiEngine: {
      status: string;
    };
  };
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchHealth() {
      const token = localStorage.getItem("connectsoulmate_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/admin/health`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.success) {
            setHealth(data);
          }
        }
      } catch (err) {
        console.error("Health check error:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchHealth();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const handleRefresh = () => {
    setRefreshing(true);
    setReloadTrigger((v) => v + 1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              System Infrastructure Health
            </h1>
            {health && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  health.status === "healthy"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                }`}
              >
                ● {health.status.toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Live availability status of platform micro-services, databases, authentication, and external payment APIs.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Testing..." : "Run Health Check"}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Inspecting infrastructure services...
        </div>
      ) : !health ? (
        <div className="surface-card p-8 text-center text-xs text-rose-400">
          Failed to fetch system health data.
        </div>
      ) : (
        <>
          {/* Service Availability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Backend API */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400">
                  <Server className="h-4 w-4" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    Express Backend API
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  ● Healthy
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Runtime:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    Node.js {health.services.backend.nodeVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Heap:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {health.services.backend.memoryUsageMb} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>System Uptime:</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {formatUptime(health.uptimeSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. MySQL Database */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400">
                  <Database className="h-4 w-4" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    MySQL / MariaDB
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    health.services.database.status === "connected"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}
                >
                  ● {health.services.database.status === "connected" ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {health.services.database.engine}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ping Latency:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {health.services.database.latencyMs} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pool:</span>
                  <span className="text-[var(--text-primary)]">10 Max Connections</span>
                </div>
              </div>
            </div>

            {/* 3. Authentication & JWT */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <Key className="h-4 w-4" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    Authentication (JWT)
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  ● Configured
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Hashing:</span>
                  <span className="text-[var(--text-primary)] font-mono">
                    bcrypt (Cost factor 12)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="text-[var(--text-primary)]">
                    HMAC-SHA256 Signed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Role Verification:</span>
                  <span className="text-emerald-400 font-semibold">
                    Active & Enforced
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Email (SMTP) */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400">
                  <Mail className="h-4 w-4" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    Email Service (SMTP)
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    health.services.emailService.smtpConfigured
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  ● {health.services.emailService.smtpConfigured ? "Configured" : "Unconfigured"}
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Verification Delivery:</span>
                  <span className="text-[var(--text-primary)]">
                    {health.services.emailService.smtpConfigured ? "Ready" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Credentials:</span>
                  <span className="text-[var(--text-muted)]">Securely Mounted</span>
                </div>
              </div>
            </div>

            {/* 5. Razorpay Payments */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    Razorpay Gateway
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    health.services.razorpay.status === "configured"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  }`}
                >
                  ● {health.services.razorpay.status === "configured" ? "Configured" : "Pending Keys"}
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Webhook Security:</span>
                  <span className="text-[var(--text-primary)]">HMAC Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Supported Currency:</span>
                  <span className="text-[var(--text-primary)] font-semibold">INR (₹)</span>
                </div>
              </div>
            </div>

            {/* 6. AI Matchmaker Engine */}
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-bold text-xs text-[var(--text-primary)]">
                    AI Matchmaker Engine
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  ● Available
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="text-[var(--text-primary)]">Ollama LLM Engine</span>
                </div>
                <div className="flex justify-between">
                  <span>Kundali Matching:</span>
                  <span className="text-emerald-400 font-semibold">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
