import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Apex Sportswear — questions about orders, sizing, returns or anything else.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        Help
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase">
        Get in touch
      </h1>
      <p className="mt-3 text-sm text-muted">
        Questions about an order, sizing or returns? Send us a message or email{" "}
        <a
          href="mailto:support@apexswear.co.uk"
          className="text-accent underline-offset-4 hover:underline"
        >
          support@apexswear.co.uk
        </a>
        . We aim to reply within one business day.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
