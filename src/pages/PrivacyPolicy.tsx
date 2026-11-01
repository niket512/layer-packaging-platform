import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "What we collect",
    body: [
      "When you submit a sourcing request, we collect the details you share with us: your packaging requirements, any design files or photos you upload, and your WhatsApp number so our team can reach you.",
      "If you sign in to our procurement dashboard, we also store your account details (such as your email address) and the procurement records you create, such as enquiries, quotes and purchase orders.",
      "Your sourcing conversations are stored on your device and securely saved as you send messages, including before you share a contact number. Only authorised Snaplogo administrators can review these chats to coordinate sourcing and improve support; other visitors cannot see them.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use your brief and contact details to match you with suitable packaging manufacturers and to share quotations with you on WhatsApp.",
      "We may share your requirements with relevant manufacturers so they can prepare a quotation. We do not sell your personal information to anyone.",
      "We may use your contact details to follow up on your request and to tell you about Snaplogo services that are relevant to you.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep your sourcing requests and account records for as long as needed to serve you and to run our business. You can ask us to delete your information at any time.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can clear your on-device conversation history from your browser at any time.",
      "You can ask us to correct or delete the information we hold about you by writing to us using the contact details below.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Snaplogo is operated from India. For any privacy question or request, email us at contact@snapit.club or message us on WhatsApp at +91 74249 60090.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[720px] px-5 py-10 md:py-16">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
          <Link to="/"><ArrowLeft />Back to Snaplogo</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This policy explains what information Snaplogo collects when you use our packaging sourcing platform, and how we use it.
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          We may update this policy from time to time. The latest version is always available on this page.
        </p>
      </main>
    </div>
  );
}
