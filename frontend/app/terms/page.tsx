"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/layout/HeaderNav";
import Footer from "@/components/landing/Footer";
import {
  FileText,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Check if terms already accepted in session
  useEffect(() => {
    try {
      const isAccepted = sessionStorage.getItem("cs_terms_accepted") === "true";
      if (isAccepted) {
        setAccepted(true);
        setHasReachedEnd(true);
      }
    } catch (e) {}
  }, []);

  // Use IntersectionObserver to reliably detect when user scrolls to bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasReachedEnd(true);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleAccept = () => {
    if (!accepted) return;
    try {
      sessionStorage.setItem("cs_terms_accepted", "true");
      sessionStorage.setItem("cs_terms_accepted_at", new Date().toISOString());
    } catch (e) {}
    router.push("/register");
  };

  const sections = [
    { id: "welcome", title: "Welcome & Legal Notice" },
    { id: "scope", title: "Scope" },
    { id: "eligibility", title: "1. Eligibility" },
    { id: "registration", title: "2. Registration" },
    { id: "role-csm", title: "3. Role and Responsibility of CSM" },
    { id: "role-member", title: "4. Role and Responsibility of Member" },
    { id: "privacy-membership", title: "5. Privacy of Membership" },
    { id: "confidentiality", title: "6. Confidentiality" },
    { id: "disputes", title: "7. Disputes between Members" },
    { id: "grievance", title: "8. Grievance" },
    { id: "limitation", title: "9. Limitation of Liability" },
    { id: "account-security", title: "10. Account Security" },
    { id: "indemnity", title: "11. Indemnity" },
    { id: "termination", title: "12. Termination" },
    { id: "cancellation", title: "13. Cancellation & Refund Policy" },
    { id: "renewal", title: "14. Renewal" },
    { id: "jurisdiction", title: "15. Jurisdiction" },
    { id: "arbitration", title: "16. Arbitration" },
    { id: "general", title: "17. General" },
    { id: "customer-care", title: "18. Customer Care" },
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
            <Link
              href="/privacy"
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            >
              Privacy Policy →
            </Link>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary)]">
              <ShieldCheck className="h-4 w-4" /> Official Legal Agreement
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-[var(--text-primary)]">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
              Please read the official ConnectSoulmate Terms & Conditions carefully.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-xs font-bold uppercase tracking-wider text-[var(--brand-gold)]">
                <BookOpen className="h-4 w-4" /> Sections
              </div>
              <nav className="space-y-1 text-[11px]">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="w-full text-left px-2 py-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition flex items-center justify-between group"
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brand-primary)] shrink-0" />
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-[var(--border)] text-center">
                <Link
                  href="/privacy"
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline block"
                >
                  View Privacy Policy →
                </Link>
              </div>
            </div>
          </aside>

          {/* Legal Document Text Container */}
          <article className="lg:col-span-3 space-y-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 shadow-xl leading-relaxed text-xs sm:text-sm text-[var(--text-secondary)]">

            {/* Title / Welcome */}
            <section id="welcome" className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3">
                Terms And Conditions
              </h2>
              <p className="font-bold text-[var(--text-primary)]">
                Welcome to Connectsoulmate.com (herein referred as CSM).
              </p>
              <p>
                This document is an electronic record as per the regulations outlined in the Information Technology Act of 2000, along with the relevant rules and amendments concerning electronic records. It has been produced by a computer system and does not require physical or digital signatures.
              </p>
              <p>
                This document is presented in alignment with the stipulations of Rule 3 (1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021, which mandates the publication of regulations, privacy policy, and terms and conditions for utilizing or accessing www.connectsoulmate.com (referred to as the “Website”).
              </p>
              <p className="font-medium text-[var(--text-primary)] bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] uppercase text-[11px] leading-relaxed">
                PLEASE READ THE FOLLOWING TERMS AND CONDITIONS VERY CAREFULLY BEFORE USING THE WEBSITE. BY ACCESSING, BROWSING, OR OTHERWISE USING THE WEBSITE, YOU SIGNIFY YOUR CONSENT TO ADHERE TO ALL THESE TERMS AND CONDITIONS (“Agreement”).if you do not wish to be bound by these terms and conditions, refrain from using the website or connectsoulmate services. the terms and conditions also encompass the relevant policies that are integrated here by reference and subject to amendments periodically (the “terms and conditions”).
              </p>
              <p>
                In these Terms, references to “CSM member” shall mean the end user accessing the Website/CSM services, its contents, or using the CSM Services offered. CSM member also includes persons such as father, mother, brother, sister, relative, or a friend (“Registrant”) of the prospective bride/bridegroom. The terms “You” and “User” shall be interchangeably used for “CSM member”. “CSM Services” means a collective reference to the Matrimony service provided by Nxtpro Digital Private Limited.
              </p>
            </section>

            {/* Scope */}
            <section id="scope" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Scope</h3>
              <p>
                You understand and acknowledge that Matrimony (CSM) functions as an “Intermediary” as defined under clause (1) sub-clause (w) of Section 2 of the Information Technology Act, 2000. CSM, a brand owned by Nxtpro Digital Private Limited, retains complete ownership and rights over CSM and the CSM Website/App/CSM Service.
              </p>
              <p>
                CSM provides a platform where users can register by completing both mandatory and optional fields. This registration allows users to voluntarily explore profiles from CSM’s existing database of registered users with the goal of finding suitable lawful matrimonial connections.Additionally, the CSM retail store may assist in creating your profile, provided you have a valid and operational mobile phone number and email ID. The profiles in CSM’s database are broadly categorized by language and region to enhance convenience for members. CSM Members are given free or paid access to view profiles from the CSM database, based on their specified partner preferences on the Website/Applications (App), enabling them to shortlist profiles of interest.
              </p>
            </section>

            {/* 1. Eligibility */}
            <section id="eligibility" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">1. Eligibility:</h3>
              <div className="space-y-3 pl-2 sm:pl-4">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">1. CSM Membership and rights of admission are reserved solely for:</p>
                  <ul className="list-none space-y-1 mt-1 pl-4">
                    <li>i. Indian Nationals & Citizens</li>
                    <li>ii. Persons of Indian Origin (PIO)</li>
                    <li>iii. Non-Resident Indians (NRI)</li>
                    <li>iv. Persons who intend to marry persons of Indian Origin</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">2. Further, in capacity as a CSM member, you confirm that you are:</p>
                  <ul className="list-none space-y-1.5 mt-1 pl-4">
                    <li>i. 21 years or above (if you are a man) or 18 years or above (if you are a woman).</li>
                    <li>ii. If you have applied for divorce, you may register on our platform by stating “Awaiting Divorce.”</li>
                    <li>iii. If you are a resident of any other country, you must be legally competent to marry according to local rules and comply with Indian laws for marrying a person of Indian Origin.</li>
                  </ul>
                </div>
                <div>
                  <p>
                    3. If you are registering on the CSM Platform on behalf of a prospective bride or bridegroom, or accessing the platform for them, it signifies that you have obtained their consent for profile creation and use of the CSM Platform.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Registration */}
            <section id="registration" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">2. Registration</h3>
              <ul className="list-none space-y-3 pl-2 sm:pl-4">
                <li>
                  <span className="font-bold text-[var(--text-primary)]">i.</span> We anticipate that you will complete the online registration process with integrity and truthfulness, providing accurate, up-to-date, and complete information. Including recent photos of yourself will aid in aligning with your preferences. Prior to entering details or selecting options, we kindly request that you review the relevant sections and avoid inputting information in fields other than the appropriate ones. This includes refraining from mentioning IDs of other platforms, websites, or apps or duplicating your details in other fields, after already providing them in the relevant sections, as well as refraining from uploading additional photographs. In order to serve you better, our platform requires additional details from you; we kindly ask for your cooperation in providing them. Moreover, if you submit your email ID and phone number as part of our registration campaigns featured on various websites during our advertisements, you may expect a call from our Customer Service department, aiding you in the process of registering your profile on our platform.
                </li>
                <li>
                  <span className="font-bold text-[var(--text-primary)]">ii.</span> If at any point in time CSM comes to know or is informed by a third party or has reasons to believe that any information provided by you for registration (including photos) or otherwise is discovered to be false, incorrect, or incomplete, CSM retains the complete authority to suspend or terminate your CSM membership without prior notice. In such cases, any fees you may have paid for CSM membership will be forfeited, and CSM reserves the right to decline offering its services to you thereafter.
                </li>
                <li>
                  <span className="font-bold text-[var(--text-primary)]">iii.</span> CSM also reserves the right to decline the registration of your profile on the platform if any of your contact details/links are entered in irrelevant fields or if inaccuracies are detected in the data provided by CSM members in their profiles.
                </li>
                <li>
                  <span className="font-bold text-[var(--text-primary)]">iv.</span> Creating duplicate profiles for the same individual is prohibited on the CSM Platform. CSM holds the complete authority to suspend or terminate such duplicate profiles without prior notice.
                </li>
                <li>
                  <span className="font-bold text-[var(--text-primary)]">v.</span> You acknowledge and confirm that your registration on CSM and your utilization of CSM services are sincerely intended for marriage purposes and not otherwise. CSM Membership is exclusively limited to individually registered CSM members. Organizations, companies, businesses, and/or individuals engaged in comparable or competitive activities cannot become CSM Members or utilize CSM Service or CSM member data for commercial objectives. CSM reserves the right to initiate suitable legal actions for any violations of these obligations.
                </li>
              </ul>
            </section>

            {/* 3. Role and Responsibility of CSM */}
            <section id="role-csm" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">3. Role and Responsibility of CSM</h3>
              <ul className="list-none space-y-3 pl-2 sm:pl-4">
                <li><span className="font-bold text-[var(--text-primary)]">i.</span> CSM is solely responsible for providing a platform to its registered members, allowing them to search for potential matches independently, without any assistance.</li>
                <li><span className="font-bold text-[var(--text-primary)]">ii.</span> Once you register on our platform, CSM reproduces your information “as is” and also shares your profile with other registered CSM members.</li>
                <li><span className="font-bold text-[var(--text-primary)]">iii.</span> The profile searches carried out by CSM members and the resulting matches are generated automatically by CSM, relying on the partner preferences specified by the user. If a CSM member modifies their partner preferences on the platform, the automatically generated potential match results on the platform may also undergo corresponding changes.</li>
                <li><span className="font-bold text-[var(--text-primary)]">iv.</span> CSM does not restrict any CSM member from expressing interest in your profile or initiating communication with you in accordance with their partner preferences. However, you have the freedom to decline their interest or take further steps if you find it appealing.</li>
                <li><span className="font-bold text-[var(--text-primary)]">v.</span> We cannot guarantee or assume responsibility for any specific results from the use of the data available from the CSM service.</li>
                <li><span className="font-bold text-[var(--text-primary)]">vi.</span> CSM shall safeguard sensitive user information using security standards, authentication mechanisms, access controls, and encryption techniques.</li>
                <li><span className="font-bold text-[var(--text-primary)]">vii.</span> CSM cannot guarantee the complete protection of user data while it is in transit, or prevent any tampering of the data by a third party with malicious intent before the data reaches our servers.</li>
                <li><span className="font-bold text-[var(--text-primary)]">viii.</span> CSM does not authenticate/endorse any information of any profile and hence you as a user need to verify the credentials and information provided by other users.</li>
              </ul>
            </section>

            {/* 4. Role and Responsibility of CSM Member */}
            <section id="role-member" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">4. Role and Responsibility of CSM Member</h3>
              <ul className="list-none space-y-3 pl-2 sm:pl-4">
                <li><span className="font-bold text-[var(--text-primary)]">i.</span> Any information/data required by CSM for using the CSM services shall be provided by the CSM Member, as and when required.</li>
                <li><span className="font-bold text-[var(--text-primary)]">ii.</span> While creating your profile, make sure to enhance the security of your profile information by generating a strong password as per CSM guidelines.</li>
                <li><span className="font-bold text-[var(--text-primary)]">iii.</span> You are requested to verify the credentials of the potential candidate and exercise careful consideration when it comes to their profile details, such as marital status, educational background, financial position, occupation, character, and health condition etc. It is important to ensure your satisfaction before selecting a suitable match. CSM shall not be liable for shortcomings due to any discrepancies arising from misrepresentations made by any of its CSM members.</li>
                <li><span className="font-bold text-[var(--text-primary)]">iv.</span> To get better search results, CSM Members are advised to provide the latest photograph taken within the past 3 months. Presenting outdated pictures, photographs of persons other than themselves, or sharing inaccurate/false information will be viewed as a violation of the terms and conditions. CSM retains the authority as defined in clause 2 (ii) of the stated terms and conditions.</li>
                <li><span className="font-bold text-[var(--text-primary)]">v.</span> CSM members acknowledge that in order to achieve optimal search results for potential matches on the Platform, they should consistently access their profile on the platform. As a free CSM member, you can send automated expressions of interest messages to prospects. If you have opted for the paid CSM premium package, you have the capability to send customized messages to prospects to convey your expression of interest or responses. Additionally, CSM members have the option to review the expressions of interest sent to them or read messages from prospects, and they can respond appropriately.</li>
                <li><span className="font-bold text-[var(--text-primary)]">vi.</span> You also consent to abide by the terms and conditions of CSM when utilizing the CSM Platform. This includes, but is not limited to, adhering to the various features of the platform such as instant chat with prospects, accessing prospect horoscopes, adjusting privacy settings (for photos, horoscopes, phone numbers), and viewing the social and professional profiles of members on platforms like Facebook, LinkedIn, and others.</li>
                <li><span className="font-bold text-[var(--text-primary)]">vii.</span> CSM Members commit to utilizing secure devices, software, and networks within a private setting when engaging with CSM services.</li>
                <li><span className="font-bold text-[var(--text-primary)]">viii.</span> You are also prohibited from making any payments or transferring funds to the accounts of CSM/Nextpro Digital employees. All payments must exclusively be directed to the Nextpro Digital account.</li>
                <li><span className="font-bold text-[var(--text-primary)]">ix.</span> CSM members are encouraged to reach out to CSM for the resolution of their complaints and concerns, refraining from airing such grievances on social media platforms.</li>
              </ul>
            </section>

            {/* 5. Privacy of Membership */}
            <section id="privacy-membership" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">5. Privacy of Membership</h3>
              <p>
                To ensure your privacy is safeguarded and to grasp our periodically updated procedures, kindly peruse and adhere to our Privacy Policy. This policy also holds authority over your interactions with the CSM platform. Any personal information or data you furnish to us while utilizing CSM services will be handled confidentially, aligning with both the Privacy Policy and pertinent legal standards. Should you disapprove of your information’s transfer or utilization, we advise refraining from using the Platform.
              </p>
            </section>

            {/* 6. Confidentiality */}
            <section id="confidentiality" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">6. Confidentiality</h3>
              <p>
                Any feedback that you offer to CSM will be considered non-confidential, and CSM will have the liberty to utilize such feedback or information without limitations. Furthermore, by submitting the feedback, you affirm and guarantee that (i) your feedback does not contain confidential or proprietary information belonging to you or any third parties; (ii) there is no existing confidentiality obligation, whether explicit or implicit, that CSM is subject to regarding the feedback; (iii) you are not entitled to any form of compensation or reimbursement from CSM for the feedback under any circumstances.
              </p>
            </section>

            {/* 7. Disputes between Members */}
            <section id="disputes" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">7. Disputes between Members</h3>
              <p>
                CSM Members hold sole responsibility for their interactions with prospects, using any available communication methods. In clear terms, CSM absolves itself from any responsibility or liability regarding financial transactions, exchanges, engagements, information sharing, or comparable undertakings among CSM members. This encompasses diverse communication avenues, including email, chat, WhatsApp, and other methods, irrespective of whether these interactions transpire through the Platform or independently.
              </p>
            </section>

            {/* 8. Grievance */}
            <section id="grievance" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">8. Grievance</h3>
              <p>
                Should you encounter any breach committed by another user, encompassing but not restricted to the presence of content on the platform that is indecent, threatening, highly offensive, detrimental to minors, infringing on copyrights, patents, and more, or if you suspect another user of impersonation, you are encouraged to express your concerns in written form via email to: <a href="mailto:info@connectsoulmate.com" className="font-semibold text-[var(--brand-primary)] underline">info@connectsoulmate.com</a>.
              </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section id="limitation" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">9. Limitation of Liability</h3>
              <p>
                CSM or its appointed officials will not, under any circumstances, bear liability or accountability towards CSM members, their authorized representatives, registrants, or any third parties, for any form of damages including but not limited to direct, indirect, noteworthy, exemplary, incidental, or consequential damages arising from the utilization of our Platform or services.Disregarding any conflicting provisions stated in this agreement, CSM’s responsibility to you, regardless of the cause or nature of the situation, will consistently be limited to the amount, if any, that you have paid to CSM for a specified CSM paid package, and no further claims will be entertained.
              </p>
            </section>

            {/* 10. Account Security */}
            <section id="account-security" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">10. Account Security</h3>
              <p>
                It is your responsibility to ensure the confidentiality of your CSM login information, including your user ID, password, OTP, and similar details. You should also take measures to prevent unauthorized access to your account by controlling access to your computer or mobile device. As a company, we never request your password, and it is advised that you refrain from sharing your password with anyone. By using CSM services, you acknowledge that you bear accountability for all actions carried out under your account.
              </p>
            </section>

            {/* 11. Indemnity */}
            <section id="indemnity" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">11. Indemnity</h3>
              <p>
                By using our CSM services, you agree to defend, indemnify, and hold harmless CSM, its subsidiaries, affiliates, Directors, officers, agents, and other partners and employees, fully indemnified and harmless from any loss, damage, liability, claim, or demand, including reasonable attorney’s fees, made by any person through improper use of the service provided by CSM. This defense and indemnification obligation will survive in perpetuity.
              </p>
            </section>

            {/* 12. Termination */}
            <section id="termination" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">12. Termination</h3>
              <div className="space-y-3 pl-2 sm:pl-4">
                <p>
                  <span className="font-bold text-[var(--text-primary)]">A.</span> CSM reserves the right, acting in good faith, to terminate your CSM membership or suspend/delete your profile at our exclusive discretion, without prior notice to you. We also retain the authority to undertake actions as stipulated in clause 2 (ii) of the Terms and Conditions if you meet the conditions for such actions.
                </p>
                <ul className="list-none space-y-1.5 pl-4">
                  <li>i. Attempt to solicit physical or financial favors from other registered members within our community.</li>
                  <li>ii. Furnish inaccurate information on our Platform.</li>
                  <li>iii. Engage in any fraudulent, unlawful, or illegal activities through the utilization of our platform.</li>
                  <li>iv. Breach the provisions stipulated in these Terms and Conditions.</li>
                  <li>v. Infringe upon the rights of others by misusing the name, likeness, email address, contact number, or any personally identifiable details of fellow CSM members. This includes creating a profile on our platform through impersonation, fabrication, falsification, or misrepresentation without obtaining the explicit consent of the individual whose profile is being registered. Such actions also encompass employing only partial information, incorporating photographs of third parties without securing their consent, or engaging in inappropriate or indecent conduct with other members.</li>
                </ul>
                <p>
                  <span className="font-bold text-[var(--text-primary)]">B.</span> If CSM receives any complaint against you and consequently, we have suspended/deleted your profile in good faith, then we shall not be liable to you in any manner whatsoever, including for any loss, costs, expenses, or consequence, if any.
                </p>
                <p>
                  <span className="font-bold text-[var(--text-primary)]">C.</span> Upon termination/suspension of CSM membership, your right to use or access the CSM Platform services will cease immediately. All provisions of these terms and conditions that by their nature should survive termination shall survive termination, including, without limitation, disclaimers, and limitations of liability. Termination of your access to and use of the CSM Services shall not relieve you of any obligations arising or accruing prior to such termination.
                </p>
              </div>
            </section>

            {/* 13. Cancellation & Refund Policy */}
            <section id="cancellation" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">13. Cancellation & Refund Policy:</h3>
              <p>
                You may terminate your membership at any time, for any reason, by deleting your profile from the Site or writing to <a href="mailto:info@connectsoulmate.com" className="font-semibold text-[var(--brand-primary)] underline">info@connectsoulmate.com</a> In the event you terminate your membership, you will not be entitled to a refund of any unutilized subscription fees, if any, paid by you, except where otherwise guaranteed in writing.
              </p>
            </section>

            {/* 14. Renewal */}
            <section id="renewal" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">14. Renewal</h3>
              <ul className="list-none space-y-2 pl-2 sm:pl-4">
                <li><span className="font-bold text-[var(--text-primary)]">A.</span> We automatically renew all paid Memberships before the expiry of the term of the paid Membership. You agree that your account will be subject to this automatic renewal feature.</li>
                <li><span className="font-bold text-[var(--text-primary)]">B.</span> When you first subscribe for your paid Membership, you acknowledge that when your paid Membership expires it will automatically renew for the duration and at the last paid price.</li>
                <li><span className="font-bold text-[var(--text-primary)]">C.</span> The maximum tenure of any packages will be 6 months. Every CSM package post validity period (varies from package to package) shall be renewed.</li>
                <li><span className="font-bold text-[var(--text-primary)]">D.</span> If you do not want your paid membership to automatically renew, you must cancel your paid membership. In case you have to mail for cancellation, email to <a href="mailto:info@connectsoulmate.com" className="font-semibold text-[var(--brand-primary)] underline">info@connectsoulmate.com</a></li>
              </ul>
            </section>

            {/* 15. Jurisdiction */}
            <section id="jurisdiction" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">15. Jurisdiction</h3>
              <ul className="list-none space-y-2 pl-2 sm:pl-4">
                <li><span className="font-bold text-[var(--text-primary)]">A.</span> The registration of CSM membership and all CSM services are deemed to have been entered into within the territorial jurisdiction of Bangalore, India.</li>
                <li><span className="font-bold text-[var(--text-primary)]">B.</span> The CSM Members unconditionally agree that all such disputes and/or differences, if any, shall be governed by the Laws of India and submitting to the exclusive Jurisdiction of the appropriate court of law in Bangalore, Karnataka, India.</li>
              </ul>
            </section>

            {/* 16. Arbitration */}
            <section id="arbitration" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">16. Arbitration</h3>
              <p>
                The Parties shall discuss among themselves and resolve any disputes informally. We are interested in attempting to resolve any Disputes by amicable and informal means, and we encourage you to contact us before resorting to arbitration. If the dispute is not resolved within 30 (thirty) days from the date of such dispute, then such dispute may only be resolved through an individual arbitration conducted in accordance with the provisions of The Arbitration and Conciliation Act, 1996, by a sole arbitrator. The seat of Arbitration shall be Bangalore, Karnataka, India. We shall appoint the sole arbitrator. The arbitration proceedings shall be conducted in the English language.
              </p>
            </section>

            {/* 17. General */}
            <section id="general" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">17. General</h3>
              <ul className="list-none space-y-3 pl-2 sm:pl-4">
                <li>
                  <span className="font-bold text-[var(--text-primary)]">i.</span> In the event you file a false complaint against another prospect on our platform and consequently, we have suspended that prospect’s profile based on your complaint, then we reserve our right to initiate appropriate legal action against you and claim any and all costs and expenses from you, for such irresponsible/misrepresentation/illegal/unlawful action. We also reserve our right to suspend your profile and forfeit any and all amounts paid by you for the CSM services as per clause 2 (ii) of these terms and conditions.
                </li>
                <li>
                  <span className="font-bold text-[var(--text-primary)]">ii.</span> CSM does not give any implied or explicit guarantee or warranty of marriage or alliance by you choosing to register on our Platform and using CSM services (both paid and free).
                </li>
              </ul>
            </section>

            {/* 18. Customer Care */}
            <section id="customer-care" className="space-y-4 pt-6 border-t border-[var(--border)]">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">18. Customer Care</h3>
              <p>
                If you encounter any issues with our services, please feel free to reach out to us at the email address: <a href="mailto:info@connectsoulmate.com" className="font-semibold text-[var(--brand-primary)] underline">info@connectsoulmate.com</a>.
              </p>
            </section>

            {/* Sentinel element for scroll detection */}
            <div ref={sentinelRef} className="h-4 w-full" />

            {/* Bottom Actions Bar */}
            <div className="pt-8 border-t border-[var(--border)] space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    disabled={!hasReachedEnd}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)] accent-[var(--brand-primary)] cursor-pointer disabled:opacity-50"
                  />
                  <span>I have read and agree to the Terms & Conditions</span>
                </label>

                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="btn-primary py-2.5 px-6 text-xs font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accept & Return to Registration</span>
                </button>
              </div>

              {!hasReachedEnd && (
                <p className="text-[11px] text-[var(--brand-gold)] font-medium text-center">
                  * Please scroll to the end of the document to enable acceptance.
                </p>
              )}
            </div>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
