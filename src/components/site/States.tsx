import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, RotateCw, Home, Pencil } from "lucide-react";

export function ErrorCard({
  message,
  onRetry,
  onEdit,
  onHome,
}: {
  message?: string;
  onRetry?: () => void;
  onEdit?: () => void;
  onHome?: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="surface-card mx-auto max-w-md rounded-3xl p-8 text-center"
        role="alert"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-xl font-semibold tracking-tight">Something went sideways</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {message ?? "We received an unexpected AI response. Let's try generating it again."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-transform hover:scale-[1.03]"
            >
              <RotateCw className="h-3.5 w-3.5" /> Retry
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit prompt
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              <Home className="h-3.5 w-3.5" /> Home
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card mx-auto max-w-md rounded-3xl p-10 text-center"
    >
      <div className="relative mx-auto grid h-16 w-16 place-items-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent blur-xl" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-soft text-primary-foreground shadow-[0_10px_30px_rgba(124,92,255,0.35)]">
          {icon}
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
