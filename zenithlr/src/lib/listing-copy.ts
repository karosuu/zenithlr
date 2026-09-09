export type ListingCopyBlock =
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string };

function cleanListingText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/^\s*(<\/?html>|\bhtml\b)\s*/i, "")
    .trim();
}

function stripBullet(text: string) {
  return text.replace(/^[•●▪\-–—*]\s+/, "").trim();
}

function isWrappedContinuation(prev: string, next: string) {
  if (/[.:!?]$/.test(prev)) return false;
  if (/^[a-záéíóúüñ]/.test(next)) return true;
  return (
    /^[0-9$]/.test(next) &&
    /\b(a|an|the|of|in|to|for|with|at|from|and|or|specific)$/i.test(prev)
  );
}

function mergeWrappedLines(chunks: string[]) {
  const merged: string[] = [];

  for (const chunk of chunks) {
    const prev = merged[merged.length - 1];
    if (prev && isWrappedContinuation(prev, chunk)) {
      merged[merged.length - 1] = `${prev} ${chunk}`;
    } else {
      merged.push(chunk);
    }
  }

  return merged;
}

function looksLikeSpec(text: string) {
  return /[0-9$]/.test(text) || text.includes(":");
}

export function isHeading(text: string) {
  const normalized = text.replace(/:$/, "").trim();
  if (normalized.length > 70) return false;
  if (/[.!?]$/.test(normalized)) return false;
  if (/[0-9$]/.test(text)) return false;

  if (/:$/.test(text) && !text.slice(text.indexOf(":") + 1).trim()) {
    return true;
  }

  return (
    /\b(highlights?|amenities|amenidades|destacados?|features?|caracter[ií]sticas?)\b/i.test(
      normalized,
    ) && normalized.split(/\s+/).length <= 8
  );
}

function isNarrativeSentence(text: string) {
  if (!/\.$/.test(text)) return false;
  return /^(a|an|the|this|these|that|it|its|our|we|you|located|discover|enjoy|ideal|highly|wake|there)\b/i.test(
    text,
  );
}

function isListItem(text: string) {
  if (isHeading(text)) return false;
  if (isNarrativeSentence(text)) return false;
  if (text.length > 120) return false;
  if (/[!?]$/.test(text)) return false;
  const colon = text.indexOf(":");
  if (colon >= 0 && text.slice(colon + 1).trim().length > 50) return false;
  return true;
}

export function parseListingCopy(text: string): ListingCopyBlock[] {
  const chunks = mergeWrappedLines(
    cleanListingText(text)
      .split(/\n\n+/)
      .map((chunk) => stripBullet(chunk.replace(/\n/g, " ").trim()))
      .filter((chunk) => chunk && !/^html$/i.test(chunk)),
  );

  const blocks: ListingCopyBlock[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    if (list.length === 1 && !looksLikeSpec(list[0]) && !/\.$/.test(list[0])) {
      blocks.push({ type: "paragraph", text: list[0] });
    } else {
      blocks.push({ type: "list", items: list });
    }
    list = [];
  };

  for (const chunk of chunks) {
    if (isHeading(chunk)) {
      flushList();
      blocks.push({ type: "heading", text: chunk.replace(/:$/, "") });
      continue;
    }
    if (isListItem(chunk)) {
      list.push(chunk);
      continue;
    }
    flushList();
    blocks.push({ type: "paragraph", text: chunk });
  }

  flushList();
  return blocks;
}
