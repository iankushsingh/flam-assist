import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Copy, Download, FileJson, FileText, Printer, X, Check } from "lucide-react";
import type { StudyPack } from "@/lib/study.functions";
import { copyToClipboard, download, printPdf, toJson, toMarkdown } from "@/lib/export";

export function ExportModal({
  open,
  onOpenChange,
  pack,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pack: StudyPack | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const doCopy = async (which: "json" | "md") => {
    if (!pack) return;
    const text = which === "json" ? toJson(pack) : toMarkdown(pack);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  const options = [
    {
      key: "pdf",
      label: "Print as PDF",
      desc: "Opens the print dialog. Save as PDF.",
      icon: <Printer className="h-4 w-4" />,
      onClick: () => {
        onOpenChange(false);
        setTimeout(() => printPdf(), 200);
      },
    },
    {
      key: "md",
      label: "Download Markdown",
      desc: "Portable .md file with questions & answers.",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => pack && download(`${pack.title}.md`, toMarkdown(pack), "text/markdown"),
    },
    {
      key: "json",
      label: "Download JSON",
      desc: "Machine-readable structured export.",
      icon: <FileJson className="h-4 w-4" />,
      onClick: () => pack && download(`${pack.title}.json`, toJson(pack), "application/json"),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md p-4"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Export study pack"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="surface-card w-full max-w-md overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Export</h3>
                <p className="text-[13px] text-muted-foreground">Choose a format for your study pack.</p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 p-3">
              {options.map((o) => (
                <button
                  key={o.key}
                  onClick={o.onClick}
                  disabled={!pack}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-muted disabled:opacity-40"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-foreground">{o.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium">{o.label}</span>
                    <span className="block text-[12px] text-muted-foreground">{o.desc}</span>
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => doCopy("md")}
                  disabled={!pack}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-40"
                >
                  {copied === "md" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy MD
                </button>
                <button
                  onClick={() => doCopy("json")}
                  disabled={!pack}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-40"
                >
                  {copied === "json" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy JSON
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
