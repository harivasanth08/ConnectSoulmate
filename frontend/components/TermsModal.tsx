"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, ChevronDown, X, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  alreadyAccepted?: boolean;
}

export default function TermsModal({
  isOpen,
  onClose,
  onAccept,
  alreadyAccepted = false,
}: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [hasReachedEnd, setHasReachedEnd] = useState(alreadyAccepted);
  const [accepted, setAccepted] = useState(alreadyAccepted);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sync state if already accepted
  useEffect(() => {
    if (alreadyAccepted) {
      setHasReachedEnd(true);
      setAccepted(true);
    }
  }, [alreadyAccepted]);

  // Use IntersectionObserver to detect when user scrolls to bottom of Terms
  useEffect(() => {
    if (!isOpen || activeTab !== "terms") return;

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
        root: scrollContainerRef.current,
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="w-full max-w-3xl my-auto">
        <div className="surface-card p-6 sm:p-8 shadow-2xl space-y-5 relative rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          {/* Close Icon */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1.5 rounded-lg hover:bg-[var(--surface-soft)]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Brand / Title Header */}
          <div className="space-y-1">
            <img
              src="/images/brand/connectsoulmate_logo.png"
              alt="ConnectSoulmate"
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--brand-primary)]" />
              <h2 id="terms-modal-title" className="font-serif text-lg sm:text-xl font-bold">
                {activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Official legal agreement for ConnectSoulmate services.
            </p>
          </div>

          {/* Tab Selection Bar */}
          <div className="flex border-b border-[var(--border)] gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("terms")}
              className={`pb-2.5 border-b-2 transition ${
                activeTab === "terms"
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`pb-2.5 border-b-2 transition ${
                activeTab === "privacy"
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Scrollable Document Content Box */}
          <div
            ref={scrollContainerRef}
            className="max-h-[50vh] overflow-y-auto pr-3 space-y-6 text-xs text-[var(--text-secondary)] leading-relaxed rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 sm:p-6"
          >
            {activeTab === "terms" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                    Terms And Conditions
                  </h3>
                  <p className="font-bold text-[var(--text-primary)]">
                    Welcome to Connectsoulmate.com (herein referred as CSM).
                  </p>
                  <p>
                    This document is an electronic record as per the regulations outlined in the Information Technology Act of 2000, along with the relevant rules and amendments concerning electronic records. It has been produced by a computer system and does not require physical or digital signatures.
                  </p>
                  <p>
                    This document is presented in alignment with the stipulations of Rule 3 (1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021, which mandates the publication of regulations, privacy policy, and terms and conditions for utilizing or accessing www.connectsoulmate.com (referred to as the “Website”).
                  </p>
                  <p className="bg-[var(--surface-soft)] p-3 rounded-xl border border-[var(--border)] font-medium text-[11px] leading-relaxed uppercase text-[var(--text-primary)]">
                    PLEASE READ THE FOLLOWING TERMS AND CONDITIONS VERY CAREFULLY BEFORE USING THE WEBSITE. BY ACCESSING, BROWSING, OR OTHERWISE USING THE WEBSITE, YOU SIGNIFY YOUR CONSENT TO ADHERE TO ALL THESE TERMS AND CONDITIONS (“Agreement”).if you do not wish to be bound by these terms and conditions, refrain from using the website or connectsoulmate services. the terms and conditions also encompass the relevant policies that are integrated here by reference and subject to amendments periodically (the “terms and conditions”).
                  </p>
                  <p>
                    In these Terms, references to “CSM member” shall mean the end user accessing the Website/CSM services, its contents, or using the CSM Services offered. CSM member also includes persons such as father, mother, brother, sister, relative, or a friend (“Registrant”) of the prospective bride/bridegroom. The terms “You” and “User” shall be interchangeably used for “CSM member”. “CSM Services” means a collective reference to the Matrimony service provided by Nxtpro Digital Private Limited.
                  </p>
                </div>

                {/* Scope */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">Scope</h4>
                  <p>
                    You understand and acknowledge that Matrimony (CSM) functions as an “Intermediary” as defined under clause (1) sub-clause (w) of Section 2 of the Information Technology Act, 2000. CSM, a brand owned by Nxtpro Digital Private Limited, retains complete ownership and rights over CSM and the CSM Website/App/CSM Service.
                  </p>
                  <p>
                    CSM provides a platform where users can register by completing both mandatory and optional fields. This registration allows users to voluntarily explore profiles from CSM’s existing database of registered users with the goal of finding suitable lawful matrimonial connections.Additionally, the CSM retail store may assist in creating your profile, provided you have a valid and operational mobile phone number and email ID. The profiles in CSM’s database are broadly categorized by language and region to enhance convenience for members. CSM Members are given free or paid access to view profiles from the CSM database, based on their specified partner preferences on the Website/Applications (App), enabling them to shortlist profiles of interest.
                  </p>
                </div>

                {/* 1. Eligibility */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">1. Eligibility:</h4>
                  <p>1. CSM Membership and rights of admission are reserved solely for:</p>
                  <ul className="list-none space-y-1 pl-3">
                    <li>i. Indian Nationals & Citizens</li>
                    <li>ii. Persons of Indian Origin (PIO)</li>
                    <li>iii. Non-Resident Indians (NRI)</li>
                    <li>iv. Persons who intend to marry persons of Indian Origin</li>
                  </ul>
                  <p>2. Further, in capacity as a CSM member, you confirm that you are:</p>
                  <ul className="list-none space-y-1 pl-3">
                    <li>i. 21 years or above (if you are a man) or 18 years or above (if you are a woman).</li>
                    <li>ii. If you have applied for divorce, you may register on our platform by stating “Awaiting Divorce.”</li>
                    <li>iii. If you are a resident of any other country, you must be legally competent to marry according to local rules and comply with Indian laws for marrying a person of Indian Origin.</li>
                  </ul>
                  <p>3. If you are registering on the CSM Platform on behalf of a prospective bride or bridegroom, or accessing the platform for them, it signifies that you have obtained their consent for profile creation and use of the CSM Platform.</p>
                </div>

                {/* 2. Registration */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">2. Registration</h4>
                  <p>i. We anticipate that you will complete the online registration process with integrity and truthfulness, providing accurate, up-to-date, and complete information. Including recent photos of yourself will aid in aligning with your preferences. Prior to entering details or selecting options, we kindly request that you review the relevant sections and avoid inputting information in fields other than the appropriate ones. This includes refraining from mentioning IDs of other platforms, websites, or apps or duplicating your details in other fields, after already providing them in the relevant sections, as well as refraining from uploading additional photographs. In order to serve you better, our platform requires additional details from you; we kindly ask for your cooperation in providing them. Moreover, if you submit your email ID and phone number as part of our registration campaigns featured on various websites during our advertisements, you may expect a call from our Customer Service department, aiding you in the process of registering your profile on our platform.</p>
                  <p>ii. If at any point in time CSM comes to know or is informed by a third party or has reasons to believe that any information provided by you for registration (including photos) or otherwise is discovered to be false, incorrect, or incomplete, CSM retains the complete authority to suspend or terminate your CSM membership without prior notice. In such cases, any fees you may have paid for CSM membership will be forfeited, and CSM reserves the right to decline offering its services to you thereafter.</p>
                  <p>iii. CSM also reserves the right to decline the registration of your profile on the platform if any of your contact details/links are entered in irrelevant fields or if inaccuracies are detected in the data provided by CSM members in their profiles.</p>
                  <p>iv. Creating duplicate profiles for the same individual is prohibited on the CSM Platform. CSM holds the complete authority to suspend or terminate such duplicate profiles without prior notice.</p>
                  <p>v. You acknowledge and confirm that your registration on CSM and your utilization of CSM services are sincerely intended for marriage purposes and not otherwise. CSM Membership is exclusively limited to individually registered CSM members. Organizations, companies, businesses, and/or individuals engaged in comparable or competitive activities cannot become CSM Members or utilize CSM Service or CSM member data for commercial objectives. CSM reserves the right to initiate suitable legal actions for any violations of these obligations.</p>
                </div>

                {/* 3. Role & Responsibility of CSM */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">3. Role and Responsibility of CSM</h4>
                  <p>i. CSM is solely responsible for providing a platform to its registered members, allowing them to search for potential matches independently, without any assistance.</p>
                  <p>ii. Once you register on our platform, CSM reproduces your information “as is” and also shares your profile with other registered CSM members.</p>
                  <p>iii. The profile searches carried out by CSM members and the resulting matches are generated automatically by CSM, relying on the partner preferences specified by the user. If a CSM member modifies their partner preferences on the platform, the automatically generated potential match results on the platform may also undergo corresponding changes.</p>
                  <p>iv. CSM does not restrict any CSM member from expressing interest in your profile or initiating communication with you in accordance with their partner preferences. However, you have the freedom to decline their interest or take further steps if you find it appealing.</p>
                  <p>v. We cannot guarantee or assume responsibility for any specific results from the use of the data available from the CSM service.</p>
                  <p>vi. CSM shall safeguard sensitive user information using security standards, authentication mechanisms, access controls, and encryption techniques.</p>
                  <p>vii. CSM cannot guarantee the complete protection of user data while it is in transit, or prevent any tampering of the data by a third party with malicious intent before the data reaches our servers.</p>
                  <p>viii. CSM does not authenticate/endorse any information of any profile and hence you as a user need to verify the credentials and information provided by other users.</p>
                </div>

                {/* 4. Role & Responsibility of Member */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">4. Role and Responsibility of CSM Member</h4>
                  <p>i. Any information/data required by CSM for using the CSM services shall be provided by the CSM Member, as and when required.</p>
                  <p>ii. While creating your profile, make sure to enhance the security of your profile information by generating a strong password as per CSM guidelines.</p>
                  <p>iii. You are requested to verify the credentials of the potential candidate and exercise careful consideration when it comes to their profile details, such as marital status, educational background, financial position, occupation, character, and health condition etc. It is important to ensure your satisfaction before selecting a suitable match. CSM shall not be liable for shortcomings due to any discrepancies arising from misrepresentations made by any of its CSM members.</p>
                  <p>iv. To get better search results, CSM Members are advised to provide the latest photograph taken within the past 3 months. Presenting outdated pictures, photographs of persons other than themselves, or sharing inaccurate/false information will be viewed as a violation of the terms and conditions. CSM retains the authority as defined in clause 2 (ii) of the stated terms and conditions.</p>
                  <p>v. CSM members acknowledge that in order to achieve optimal search results for potential matches on the Platform, they should consistently access their profile on the platform. As a free CSM member, you can send automated expressions of interest messages to prospects. If you have opted for the paid CSM premium package, you have the capability to send customized messages to prospects to convey your expression of interest or responses. Additionally, CSM members have the option to review the expressions of interest sent to them or read messages from prospects, and they can respond appropriately.</p>
                  <p>vi. You also consent to abide by the terms and conditions of CSM when utilizing the CSM Platform. This includes, but is not limited to, adhering to the various features of the platform such as instant chat with prospects, accessing prospect horoscopes, adjusting privacy settings (for photos, horoscopes, phone numbers), and viewing the social and professional profiles of members on platforms like Facebook, LinkedIn, and others.</p>
                  <p>vii. CSM Members commit to utilizing secure devices, software, and networks within a private setting when engaging with CSM services.</p>
                  <p>viii. You are also prohibited from making any payments or transferring funds to the accounts of CSM/Nextpro Digital employees. All payments must exclusively be directed to the Nextpro Digital account.</p>
                  <p>ix. CSM members are encouraged to reach out to CSM for the resolution of their complaints and concerns, refraining from airing such grievances on social media platforms.</p>
                </div>

                {/* 5-18 Sections */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">5. Privacy of Membership</h4>
                  <p>To ensure your privacy is safeguarded and to grasp our periodically updated procedures, kindly peruse and adhere to our Privacy Policy. This policy also holds authority over your interactions with the CSM platform. Any personal information or data you furnish to us while utilizing CSM services will be handled confidentially, aligning with both the Privacy Policy and pertinent legal standards. Should you disapprove of your information’s transfer or utilization, we advise refraining from using the Platform.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">6. Confidentiality</h4>
                  <p>Any feedback that you offer to CSM will be considered non-confidential, and CSM will have the liberty to utilize such feedback or information without limitations. Furthermore, by submitting the feedback, you affirm and guarantee that (i) your feedback does not contain confidential or proprietary information belonging to you or any third parties; (ii) there is no existing confidentiality obligation, whether explicit or implicit, that CSM is subject to regarding the feedback; (iii) you are not entitled to any form of compensation or reimbursement from CSM for the feedback under any circumstances.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">7. Disputes between Members</h4>
                  <p>CSM Members hold sole responsibility for their interactions with prospects, using any available communication methods. In clear terms, CSM absolves itself from any responsibility or liability regarding financial transactions, exchanges, engagements, information sharing, or comparable undertakings among CSM members. This encompasses diverse communication avenues, including email, chat, WhatsApp, and other methods, irrespective of whether these interactions transpire through the Platform or independently.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">8. Grievance</h4>
                  <p>Should you encounter any breach committed by another user, encompassing but not restricted to the presence of content on the platform that is indecent, threatening, highly offensive, detrimental to minors, infringing on copyrights, patents, and more, or if you suspect another user of impersonation, you are encouraged to express your concerns in written form via email to: info@connectsoulmate.com.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">9. Limitation of Liability</h4>
                  <p>CSM or its appointed officials will not, under any circumstances, bear liability or accountability towards CSM members, their authorized representatives, registrants, or any third parties, for any form of damages including but not limited to direct, indirect, noteworthy, exemplary, incidental, or consequential damages arising from the utilization of our Platform or services.Disregarding any conflicting provisions stated in this agreement, CSM’s responsibility to you, regardless of the cause or nature of the situation, will consistently be limited to the amount, if any, that you have paid to CSM for a specified CSM paid package, and no further claims will be entertained.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">10. Account Security</h4>
                  <p>It is your responsibility to ensure the confidentiality of your CSM login information, including your user ID, password, OTP, and similar details. You should also take measures to prevent unauthorized access to your account by controlling access to your computer or mobile device. As a company, we never request your password, and it is advised that you refrain from sharing your password with anyone. By using CSM services, you acknowledge that you bear accountability for all actions carried out under your account.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">11. Indemnity</h4>
                  <p>By using our CSM services, you agree to defend, indemnify, and hold harmless CSM, its subsidiaries, affiliates, Directors, officers, agents, and other partners and employees, fully indemnified and harmless from any loss, damage, liability, claim, or demand, including reasonable attorney’s fees, made by any person through improper use of the service provided by CSM. This defense and indemnification obligation will survive in perpetuity.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">12. Termination</h4>
                  <p>A. CSM reserves the right, acting in good faith, to terminate your CSM membership or suspend/delete your profile at our exclusive discretion, without prior notice to you. We also retain the authority to undertake actions as stipulated in clause 2 (ii) of the Terms and Conditions if you meet the conditions for such actions.</p>
                  <ul className="list-none space-y-1 pl-3">
                    <li>i. Attempt to solicit physical or financial favors from other registered members within our community.</li>
                    <li>ii. Furnish inaccurate information on our Platform.</li>
                    <li>iii. Engage in any fraudulent, unlawful, or illegal activities through the utilization of our platform.</li>
                    <li>iv. Breach the provisions stipulated in these Terms and Conditions.</li>
                    <li>v. Infringe upon the rights of others by misusing the name, likeness, email address, contact number, or any personally identifiable details of fellow CSM members. This includes creating a profile on our platform through impersonation, fabrication, falsification, or misrepresentation without obtaining the explicit consent of the individual whose profile is being registered. Such actions also encompass employing only partial information, incorporating photographs of third parties without securing their consent, or engaging in inappropriate or indecent conduct with other members.</li>
                  </ul>
                  <p>B. If CSM receives any complaint against you and consequently, we have suspended/deleted your profile in good faith, then we shall not be liable to you in any manner whatsoever, including for any loss, costs, expenses, or consequence, if any.</p>
                  <p>C. Upon termination/suspension of CSM membership, your right to use or access the CSM Platform services will cease immediately. All provisions of these terms and conditions that by their nature should survive termination shall survive termination, including, without limitation, disclaimers, and limitations of liability. Termination of your access to and use of the CSM Services shall not relieve you of any obligations arising or accruing prior to such termination.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">13. Cancellation & Refund Policy:</h4>
                  <p>You may terminate your membership at any time, for any reason, by deleting your profile from the Site or writing to info@connectsoulmate.com In the event you terminate your membership, you will not be entitled to a refund of any unutilized subscription fees, if any, paid by you, except where otherwise guaranteed in writing.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">14. Renewal</h4>
                  <p>A. We automatically renew all paid Memberships before the expiry of the term of the paid Membership. You agree that your account will be subject to this automatic renewal feature.</p>
                  <p>B. When you first subscribe for your paid Membership, you acknowledge that when your paid Membership expires it will automatically renew for the duration and at the last paid price.</p>
                  <p>C. The maximum tenure of any packages will be 6 months. Every CSM package post validity period (varies from package to package) shall be renewed.</p>
                  <p>D. If you do not want your paid membership to automatically renew, you must cancel your paid membership. In case you have to mail for cancellation, email to info@connectsoulmate.com</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">15. Jurisdiction</h4>
                  <p>A. The registration of CSM membership and all CSM services are deemed to have been entered into within the territorial jurisdiction of Bangalore, India.</p>
                  <p>B. The CSM Members unconditionally agree that all such disputes and/or differences, if any, shall be governed by the Laws of India and submitting to the exclusive Jurisdiction of the appropriate court of law in Bangalore, Karnataka, India.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">16. Arbitration</h4>
                  <p>The Parties shall discuss among themselves and resolve any disputes informally. We are interested in attempting to resolve any Disputes by amicable and informal means, and we encourage you to contact us before resorting to arbitration. If the dispute is not resolved within 30 (thirty) days from the date of such dispute, then such dispute may only be resolved through an individual arbitration conducted in accordance with the provisions of The Arbitration and Conciliation Act, 1996, by a sole arbitrator. The seat of Arbitration shall be Bangalore, Karnataka, India. We shall appoint the sole arbitrator. The arbitration proceedings shall be conducted in the English language.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">17. General</h4>
                  <p>i. In the event you file a false complaint against another prospect on our platform and consequently, we have suspended that prospect’s profile based on your complaint, then we reserve our right to initiate appropriate legal action against you and claim any and all costs and expenses from you, for such irresponsible/misrepresentation/illegal/unlawful action. We also reserve our right to suspend your profile and forfeit any and all amounts paid by you for the CSM services as per clause 2 (ii) of these terms and conditions.</p>
                  <p>ii. CSM does not give any implied or explicit guarantee or warranty of marriage or alliance by you choosing to register on our Platform and using CSM services (both paid and free).</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">18. Customer Care</h4>
                  <p>If you encounter any issues with our services, please feel free to reach out to us at the email address: info@connectsoulmate.com.</p>
                </div>

                <div ref={sentinelRef} className="h-4 w-full" />
              </div>
            ) : (
              /* Privacy Policy Tab */
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                    Privacy Policy
                  </h3>
                  <p>
                    Connectsoulmate operates as an online matrimonial portal, dedicated to consistently furnishing you with matrimonial services. As we are deeply committed to safeguarding your privacy rights, we have formulated a privacy statement detailing the information we gather from you. It’s important to note that you are voluntarily providing this information. By accessing or using the Platform and/or supplying your information, you express your consent to the collection, usage, sharing, storage, and processing of the information you disclose on the website/apps, all in accordance with the stipulations of this Privacy Policy. Should you disagree with the utilization of your information, we kindly advise refraining from using or accessing this website/apps.
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">What information is required for utilizing this Platform?</h4>
                  <p>The information obtained from individuals and visitors who avail themselves of the diverse services provided by our Platform encompasses, but is not restricted to, the following: user photographs, profile videos that you opt to upload, email addresses, names, dates of birth, educational qualifications, identity verification documents submitted at your own discretion for authentication purposes, personally chosen passwords, mailing addresses, zip/pin codes, and telephone/mobile numbers.</p>
                  <p>The collection of user information depends on the context of your interactions with us and the website or Apps, the choices you make, and the products and features you utilize. User Information is used for purposes such as authentication and account access. If a user chooses to register via social networking platforms like Facebook, Google, LinkedIn, and others, we may collect personal data that you permit us to access through their APIs.</p>
                  <p>When users access our websites or apps, data concerning device IDs, log files, geographic location, and device specifications are automatically collected. Moreover, we may employ your personal information for verification, data analysis, usage trends assessment, site/App enhancement, marketing research, and fraud prevention. As we consistently strive to enhance our products and services, we gather and analyze demographic and profile data regarding user activities on our website/apps. We employ your IP address to diagnose server issues, administer the website/apps, identify you, and gather broad demographic data.</p>
                  <p>To safeguard our users’ credit card information during transactions, we employ a secure server, while Cookies are employed to store login credentials. Cookies, which are small files stored on your hard drive, assist in delivering our services. You may also encounter Cookies or similar devices on certain pages of the website/apps that are placed by third parties. However, the utilization of cookies by third parties is beyond our control. If you establish a credit account with us to facilitate payment of applicable fees, we may collect supplementary information including billing addresses, credit/debit card numbers, and expiration dates.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">How the Platform uses the information it collects/tracks</h4>
                  <p>Connectsoulmate gathers information to conduct data analysis, discern usage patterns, assess the efficacy of our promotional initiatives, and to appraise and enhance our websites, apps, products, and services. The collection of data from our users primarily serves to ensure we meet your needs and provide a personalized user experience.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">With whom does the Platform share the information it gathers/tracks?</h4>
                  <p>We might share such identifiable information with our associates, affiliates, and subsidiaries, and they might reach out to you with marketing initiatives resulting from such sharing. Please be aware that any information you provide to us is treated with the utmost care and security. Moreover, we are obligated to fully cooperate if a situation arises where legal requirements or processes necessitate the provision of information about a customer or visitor.</p>
                  <p>In scenarios mandated or permitted by law, information may be disclosed to others, such as regulatory bodies and law enforcement agencies, for the purpose of safeguarding the rights, assets, or personal safety of other members or the general public. Furthermore, if we perceive a transaction to be of suspicious nature, we may proactively share your information with law enforcement agencies, gateway service providers, or anti-fraud solution providers.</p>
                  <p>Occasionally, we may consider corporate actions like mergers, acquisitions, reorganizations, asset sales, and similar activities. During these instances, we might transfer or grant access to information to facilitate the assessment and execution of such transactions. In the event of purchasing or selling a business or assets, personal information may be conveyed to third parties participating in the transaction.</p>
                  <p>Please note that our Platform may include links to other websites/apps that could gather personally identifiable information about you. We hold no responsibility for the privacy policies or content of those linked websites/apps.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">For what duration is your information retained by us?</h4>
                  <p>In accordance with the guidelines outlined in the Privacy Policy, we will retain the information to extend throughout the users’ subscription to our services, serving the specific purpose(s) for which it was gathered. This duration also covers the enforcement of agreements, conducting audits, resolving disputes, establishing legal defences, pursuing legitimate business activities, and adhering to pertinent applicable laws.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">What are the Security Precautions in respect of your personal information?</h4>
                  <p>Our objective is to safeguard your personal information through a combination of organizational and technical security protocols. We have integrated suitable internal controls that are devised to uphold the security of any processed personal information. Nevertheless, it’s important to acknowledge that we cannot provide an absolute assurance of the internet’s complete security. Once your information is under our control, we rigorously follow security protocols to defend it against unauthorized access.</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <h4 className="font-bold text-[var(--text-primary)]">Change of Privacy Policy</h4>
                  <p>We reserve the right to modify this Privacy Policy periodically without prior notice to you. Nonetheless, any alterations will be reflected on the Privacy Policy page.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action / Acceptance Bar */}
          <div className="pt-2 border-t border-[var(--border)] space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  disabled={!hasReachedEnd}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--brand-primary)] cursor-pointer disabled:opacity-50"
                />
                <span>I agree to the Terms & Conditions</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary py-2 px-4 text-xs font-semibold rounded-full"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!accepted}
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="btn-primary py-2 px-5 text-xs font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accept & Continue</span>
                </button>
              </div>
            </div>

            {!hasReachedEnd && activeTab === "terms" && (
              <p className="text-[11px] text-[var(--brand-gold)] font-medium text-center">
                * Please scroll to the bottom of Terms & Conditions to enable acceptance.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
