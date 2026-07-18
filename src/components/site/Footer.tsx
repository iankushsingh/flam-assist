import { Sparkles, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it Works", href: "/#how" },
    ],
  },
  {
    title: "Study",
    links: [
      { label: "Flashcards", href: "/study?view=flashcards" },
      { label: "Quiz", href: "/study?view=quiz" },
      { label: "History", href: "/history" },
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Help & Support", href: "mailto:bhadauriyaankushsingh3@gmail.com" }],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://www.github.com/iankushsingh" },
      { label: "Twitter / X", href: "https://x.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "mailto:bhadauriyaankushsingh3@gmail.com" },
    ],
  },
];

const socials = [
  { icon: Github, href: "https://www.github.com/iankushsingh", label: "GitHub" },
  { icon: Twitter, href: "https://x.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:bhadauriyaankushsingh3@gmail.com", label: "Email" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="about" className="bg-background">
      <div className="container-app pt-16 pb-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
              <Sparkles className="h-[18px] w-[18px]" />
            </span>
            <span className="text-lg font-semibold tracking-tight">StudyAI</span>
          </div>

          <div className="flex items-center gap-6">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={social.href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={social.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <social.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 max-w-3xl text-[13px] leading-[1.7] text-muted-foreground">
          StudyAI uses artificial intelligence to generate flashcards, quizzes, and study aids from
          your notes. Please review generated content for accuracy. StudyAI is designed to support
          learning and does not replace official course materials or professional advice.
        </p>

        <p className="mt-6 text-[13px] text-muted-foreground">
          © {year} StudyAI. All rights reserved.
        </p>
      </div>

      <div className="border-t border-border/60 bg-surface/50">
        <div className="container-app py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-12">
            {footerLinks.map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 text-sm font-semibold text-foreground">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => {
                    const isExternal =
                      link.href.startsWith("http") || link.href.startsWith("mailto:");
                    return (
                      <li key={link.label}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                            rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
