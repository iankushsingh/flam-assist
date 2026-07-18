import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy | StudyAI" },
      { name: "description", content: "Read StudyAI's privacy policy." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container-app flex-1 pt-32 pb-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">Last updated: July 17, 2026</p>

          <div className="mt-12 space-y-10">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">1. Information we collect</h2>
              <p className="leading-relaxed text-muted-foreground">
                When you create an account, we collect your email address and authentication details
                provided by our auth provider. When you use StudyAI, we store the notes and study
                packs you generate so you can access them later.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">2. How we use your information</h2>
              <p className="leading-relaxed text-muted-foreground">
                We use your data to provide the study generation service, save your history, and
                improve the quality of AI-generated flashcards and quizzes. We do not sell your
                personal data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">3. Data security</h2>
              <p className="leading-relaxed text-muted-foreground">
                We use industry-standard security measures and rely on trusted backend providers to
                protect your information. However, no online service is completely secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">4. Contact us</h2>
              <p className="leading-relaxed text-muted-foreground">
                If you have questions about this Privacy Policy, contact us at{" "}
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
