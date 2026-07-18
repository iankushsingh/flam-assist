import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service | StudyAI" },
      { name: "description", content: "Read StudyAI's terms of service." },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container-app flex-1 pt-32 pb-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
          <p className="mt-4 text-muted-foreground">Last updated: July 17, 2026</p>

          <div className="mt-12 space-y-10">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of terms</h2>
              <p className="leading-relaxed text-muted-foreground">
                By accessing or using StudyAI, you agree to be bound by these Terms of Service. If
                you do not agree, please do not use the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. Use of the service</h2>
              <p className="leading-relaxed text-muted-foreground">
                StudyAI generates study materials using artificial intelligence. You are responsible
                for reviewing generated content for accuracy and suitability. Do not use the service
                for unlawful, harmful, or abusive purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Intellectual property</h2>
              <p className="leading-relaxed text-muted-foreground">
                You retain ownership of the notes and content you provide. StudyAI retains ownership of
                its brand, code, and underlying platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Limitation of liability</h2>
              <p className="leading-relaxed text-muted-foreground">
                StudyAI is provided "as is" without warranties of any kind. We are not liable for any
                errors in generated content, exam outcomes, or damages arising from use of the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">5. Contact us</h2>
              <p className="leading-relaxed text-muted-foreground">
                Questions about these terms? Reach out at{" "}
                <a href="mailto:bhadauriyaankushsingh3@gmail.com" className="text-primary hover:underline">
                  bhadauriyaankushsingh3@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
