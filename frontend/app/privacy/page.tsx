"use client";

import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";
import HeaderNav from "@/components/layout/HeaderNav";
import Footer from "@/components/landing/Footer";
import { ShieldCheck, Lock, ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "info-required", title: "What information is required" },
    { id: "how-uses", title: "How the Platform uses the information" },
    { id: "sharing", title: "With whom does the Platform share" },
    { id: "retention", title: "Retention Duration" },
    { id: "security", title: "Security Precautions" },
    { id: "changes", title: "Change of Privacy Policy" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-colors flex flex-col">
      <HeaderNav />

      {/* Header Banner */}
      <section className="relative border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-soft)]/60 to-[var(--background)] py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Registration
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/terms"
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                Terms & Conditions →
              </Link>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
              <ShieldCheck className="h-4 w-4" /> Privacy & Data Protection
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-[var(--text-primary)]">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
              Connectsoulmate is committed to safeguarding your privacy rights. Please read our official Privacy Policy details below.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-gold)]">
                <BookOpen className="h-4 w-4" /> Contents
              </div>
              <nav className="space-y-1 text-xs">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition flex items-center justify-between group"
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brand-primary)]" />
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-[var(--border)] text-center">
                <Link
                  href="/terms"
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline block"
                >
                  View Terms & Conditions →
                </Link>
              </div>
            </div>
          </aside>

          {/* Policy Text Container */}
          <article className="lg:col-span-3 space-y-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-xl leading-relaxed text-xs sm:text-sm text-[var(--text-secondary)]">
            
            {/* Section 1: Introduction */}
            <section id="intro" className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
                Privacy Policy
              </h2>
              <p>
                Connectsoulmate operates as an online matrimonial portal, dedicated to consistently furnishing you with matrimonial services. As we are deeply committed to safeguarding your privacy rights, we have formulated a privacy statement detailing the information we gather from you. It’s important to note that you are voluntarily providing this information. By accessing or using the Platform and/or supplying your information, you express your consent to the collection, usage, sharing, storage, and processing of the information you disclose on the website/apps, all in accordance with the stipulations of this Privacy Policy. Should you disagree with the utilization of your information, we kindly advise refraining from using or accessing this website/apps.
              </p>
            </section>

            {/* Section 2: What info required */}
            <section id="info-required" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                What information is required for utilizing this Platform?
              </h3>
              <p>
                The information obtained from individuals and visitors who avail themselves of the diverse services provided by our Platform encompasses, but is not restricted to, the following: user photographs, profile videos that you opt to upload, email addresses, names, dates of birth, educational qualifications, identity verification documents submitted at your own discretion for authentication purposes, personally chosen passwords, mailing addresses, zip/pin codes, and telephone/mobile numbers.
              </p>
              <p>
                The collection of user information depends on the context of your interactions with us and the website or Apps, the choices you make, and the products and features you utilize. User Information is used for purposes such as authentication and account access. If a user chooses to register via social networking platforms like Facebook, Google, LinkedIn, and others, we may collect personal data that you permit us to access through their APIs.
              </p>
              <p>
                When users access our websites or apps, data concerning device IDs, log files, geographic location, and device specifications are automatically collected. Moreover, we may employ your personal information for verification, data analysis, usage trends assessment, site/App enhancement, marketing research, and fraud prevention. As we consistently strive to enhance our products and services, we gather and analyze demographic and profile data regarding user activities on our website/apps. We employ your IP address to diagnose server issues, administer the website/apps, identify you, and gather broad demographic data.
              </p>
              <p>
                To safeguard our users’ credit card information during transactions, we employ a secure server, while Cookies are employed to store login credentials. Cookies, which are small files stored on your hard drive, assist in delivering our services. You may also encounter Cookies or similar devices on certain pages of the website/apps that are placed by third parties. However, the utilization of cookies by third parties is beyond our control. If you establish a credit account with us to facilitate payment of applicable fees, we may collect supplementary information including billing addresses, credit/debit card numbers, and expiration dates.
              </p>
            </section>

            {/* Section 3: How platform uses info */}
            <section id="how-uses" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                How the Platform uses the information it collects/tracks
              </h3>
              <p>
                Connectsoulmate gathers information to conduct data analysis, discern usage patterns, assess the efficacy of our promotional initiatives, and to appraise and enhance our websites, apps, products, and services. The collection of data from our users primarily serves to ensure we meet your needs and provide a personalized user experience.
              </p>
            </section>

            {/* Section 4: Sharing info */}
            <section id="sharing" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                With whom does the Platform share the information it gathers/tracks?
              </h3>
              <p>
                We might share such identifiable information with our associates, affiliates, and subsidiaries, and they might reach out to you with marketing initiatives resulting from such sharing. Please be aware that any information you provide to us is treated with the utmost care and security. Moreover, we are obligated to fully cooperate if a situation arises where legal requirements or processes necessitate the provision of information about a customer or visitor.
              </p>
              <p>
                In scenarios mandated or permitted by law, information may be disclosed to others, such as regulatory bodies and law enforcement agencies, for the purpose of safeguarding the rights, assets, or personal safety of other members or the general public. Furthermore, if we perceive a transaction to be of suspicious nature, we may proactively share your information with law enforcement agencies, gateway service providers, or anti-fraud solution providers.
              </p>
              <p>
                Occasionally, we may consider corporate actions like mergers, acquisitions, reorganizations, asset sales, and similar activities. During these instances, we might transfer or grant access to information to facilitate the assessment and execution of such transactions. In the event of purchasing or selling a business or assets, personal information may be conveyed to third parties participating in the transaction.
              </p>
              <p>
                Please note that our Platform may include links to other websites/apps that could gather personally identifiable information about you. We hold no responsibility for the privacy policies or content of those linked websites/apps.
              </p>
            </section>

            {/* Section 5: Retention */}
            <section id="retention" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                For what duration is your information retained by us?
              </h3>
              <p>
                In accordance with the guidelines outlined in the Privacy Policy, we will retain the information to extend throughout the users’ subscription to our services, serving the specific purpose(s) for which it was gathered. This duration also covers the enforcement of agreements, conducting audits, resolving disputes, establishing legal defences, pursuing legitimate business activities, and adhering to pertinent applicable laws.
              </p>
            </section>

            {/* Section 6: Security Precautions */}
            <section id="security" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                What are the Security Precautions in respect of your personal information?
              </h3>
              <p>
                Our objective is to safeguard your personal information through a combination of organizational and technical security protocols. We have integrated suitable internal controls that are devised to uphold the security of any processed personal information. Nevertheless, it’s important to acknowledge that we cannot provide an absolute assurance of the internet’s complete security. Once your information is under our control, we rigorously follow security protocols to defend it against unauthorized access.
              </p>
            </section>

            {/* Section 7: Change of Policy */}
            <section id="changes" className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                Change of Privacy Policy
              </h3>
              <p>
                We reserve the right to modify this Privacy Policy periodically without prior notice to you. Nonetheless, any alterations will be reflected on the Privacy Policy page.
              </p>
            </section>

            {/* Footer Back Button */}
            <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/register"
                className="btn-primary py-2.5 px-6 text-xs font-semibold rounded-full text-center"
              >
                Return to Registration
              </Link>

              <Link
                href="/terms"
                className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
              >
                Read Terms & Conditions →
              </Link>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
