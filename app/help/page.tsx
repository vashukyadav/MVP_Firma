"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  HelpCircle,
  BookOpen,
  Mail,
  Phone,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ExternalLink,
} from "lucide-react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I add and manage new account administrators?",
      a: "You can click on 'Create New' in the top dashboard banner or navigate to 'Team & Admins' to add new account administrators. Admins can manage projects, assign tasks to field staff, and generate quotations.",
    },
    {
      q: "How are project progress percentages tracked?",
      a: "Project completion percentages are updated based on completed on-site work orders, inspection sign-offs, and project manager milestone audits.",
    },
    {
      q: "How do I upgrade or change our active FIRMA subscription plan?",
      a: "Navigate to the 'Subscription' tab in the left sidebar. There you can view your current plan details and upgrade to Professional or Enterprise with one click.",
    },
    {
      q: "Can field workers log daily tasks from mobile devices?",
      a: "Yes! FIRMA is fully responsive on mobile smartphones and tablets. Field workers can access their 'Jobs' tab to check off inspections and upload site reports.",
    },
    {
      q: "Where can I download tax invoices for our payments?",
      a: "All tax invoices and billing receipts are stored securely under 'Subscription' -> 'Billing History' and can be downloaded as PDF files.",
    },
  ];

  return (
    <FirmaLayout activeNav="Help & Support">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            KNOWLEDGE BASE &amp; ASSISTANCE
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            Help &amp; Support Center
          </h1>
          <p className="text-body text-ash mt-1">
            Browse troubleshooting guides, frequently asked questions, or reach out to our dedicated support team.
          </p>
        </div>
      </div>

      {/* 3 Contact / Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[10px] bg-white p-5 border border-pebble flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-clear-bg text-success-text">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-heading-h3 font-bold text-onyx">Email Support</h3>
              <p className="text-eyebrow text-ash">Response within 2 hours</p>
            </div>
          </div>
          <p className="mt-4 text-body font-semibold text-onyx">
            support@firma.build
          </p>
        </div>

        <div className="rounded-[10px] bg-white p-5 border border-pebble flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-heading-h3 font-bold text-onyx">Priority Phone</h3>
              <p className="text-eyebrow text-ash">Mon-Sat 9am - 8pm IST</p>
            </div>
          </div>
          <p className="mt-4 text-body font-semibold text-onyx">
            +91 1800 209 8899
          </p>
        </div>

        <div className="rounded-[10px] bg-white p-5 border border-pebble flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-breath text-onyx">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-heading-h3 font-bold text-onyx">Documentation</h3>
              <p className="text-eyebrow text-ash">API &amp; User Manuals</p>
            </div>
          </div>
          <p className="mt-4 text-body font-semibold text-onyx flex items-center gap-1">
            docs.firma.build <ExternalLink className="h-3.5 w-3.5 text-ash" />
          </p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="rounded-[10px] bg-white p-6 border border-pebble">
        <h2 className="text-heading-h3 font-bold text-onyx">
          Frequently Asked Questions
        </h2>
        <p className="text-body text-ash mt-0.5 mb-5">
          Quick answers to common questions about accounts, projects, and billing.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[10px] border border-pebble overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-body font-bold text-onyx hover:bg-stone/50 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-ash shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ash shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-3.5 pt-1 text-body text-ash leading-relaxed bg-stone/50 border-t border-pebble">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FirmaLayout>
  );
}