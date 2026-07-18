import type { StudyPack } from "./study.functions";

export function toMarkdown(pack: StudyPack): string {
  const parts = [`# ${pack.title}`, ""];
  parts.push("## Flashcards", "");
  pack.flashcards.forEach((c, i) => {
    parts.push(`### ${i + 1}. ${c.question}`, "", c.answer, "");
  });
  parts.push("## Quiz", "");
  pack.quiz.forEach((q, i) => {
    parts.push(`### ${i + 1}. ${q.question}`);
    q.options.forEach((o, j) => {
      const mark = j === q.correctIndex ? "**✓**" : "○";
      parts.push(`- ${mark} ${o}`);
    });
    if (q.explanation) parts.push("", `_${q.explanation}_`);
    parts.push("");
  });
  return parts.join("\n");
}

export function toJson(pack: StudyPack): string {
  return JSON.stringify(pack, null, 2);
}

export function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function printPdf() {
  window.print();
}
