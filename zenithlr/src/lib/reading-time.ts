export function readingMinutes(text: string) {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*|:`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
