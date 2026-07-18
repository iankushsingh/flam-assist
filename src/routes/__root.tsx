import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="page-gradient flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head home.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border bg-card text-foreground px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StudyAI — Turn Notes Into Interactive Learning" },
      {
        name: "description",
        content:
          "Paste any notes, textbook chapter, or lecture. StudyAI instantly generates beautiful flashcards and quizzes powered by AI.",
      },
      { property: "og:title", content: "StudyAI — Turn Notes Into Interactive Learning" },
      {
        property: "og:description",
        content:
          "AI-powered flashcards and quizzes from your notes. Study smarter with a premium, focused learning experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
