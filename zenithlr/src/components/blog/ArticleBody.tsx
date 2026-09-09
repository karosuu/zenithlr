import Image from "next/image";
import type { ReactNode } from "react";

type StatsItem = { value: string; label: string };
type ColumnItem = { title: string; text: string };
type TableBlock = { type: "table"; headers: string[]; rows: string[][] };
type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; lines: string[] }
  | { type: "formula"; text: string }
  | { type: "note"; text: string }
  | { type: "intro"; text: string }
  | { type: "cta"; title: string; text: string }
  | { type: "stats"; items: StatsItem[] }
  | { type: "columns"; items: ColumnItem[] }
  | TableBlock;

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function parseTable(lines: string[]): TableBlock | null {
  const rows = lines
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    )
    .filter((cells) => cells.some((cell) => cell.length > 0));
  if (rows.length < 2) return null;
  const [headers, maybeSep, ...rest] = rows;
  const body = maybeSep.every((cell) => /^:?-{3,}:?$/.test(cell)) ? rest : [maybeSep, ...rest];
  return { type: "table", headers, rows: body };
}

export function parseArticle(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim() === ":::stats") {
      const items: StatsItem[] = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const [value, ...label] = lines[i].split("|");
        if (value?.trim()) items.push({ value: value.trim(), label: label.join("|").trim() });
        i += 1;
      }
      blocks.push({ type: "stats", items });
      i += 1;
      continue;
    }

    if (line.trim() === ":::intro") {
      i += 1;
      const text: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        if (lines[i].trim()) text.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "intro", text: text.join(" ") });
      i += 1;
      continue;
    }

    if (line.trim() === ":::cta") {
      i += 1;
      const ctaLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        if (lines[i].trim()) ctaLines.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "cta", title: ctaLines[0] ?? "", text: ctaLines.slice(1).join("\n") });
      i += 1;
      continue;
    }

    if (line.trim() === ":::columns") {
      const items: ColumnItem[] = [];
      let current: ColumnItem | null = null;
      i += 1;
      while (i < lines.length && lines[i].trim() !== ":::") {
        const columnLine = lines[i];
        if (columnLine.startsWith("### ")) {
          if (current) items.push(current);
          current = { title: columnLine.slice(4).trim(), text: "" };
        } else if (columnLine.trim() && current) {
          current.text = current.text ? `${current.text} ${columnLine.trim()}` : columnLine.trim();
        }
        i += 1;
      }
      if (current) items.push(current);
      blocks.push({ type: "columns", items });
      i += 1;
      continue;
    }

    if (line.trim() === ":::note") {
      i += 1;
      const text: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        if (lines[i].trim()) text.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "note", text: text.join(" ") });
      i += 1;
      continue;
    }

    if (line.trim() === ":::formula") {
      i += 1;
      const text: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        if (lines[i].trim()) text.push(lines[i].trim());
        i += 1;
      }
      blocks.push({ type: "formula", text: text.join(" ") });
      i += 1;
      continue;
    }

    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      const table = parseTable(tableLines);
      if (table) blocks.push(table);
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", lines: quote });
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith(":::")
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
}

function CtaBlock({ title, text, compact }: { title: string; text: string; compact?: boolean }) {
  return (
    <div
      className={`border border-gold bg-ink text-center text-white ${
        compact ? "mt-[70px] px-8 py-[34px] max-md:mt-12 max-md:px-5 max-md:py-7" : "mt-12 px-6 py-10"
      }`}
    >
      <p className={`font-extrabold uppercase leading-snug ${compact ? "text-[20px] md:text-2xl" : "text-xl"}`}>
        {title.split(" | ").map((line) => (
          <span key={line} className="block">
            {line.replace(/\*\*/g, "")}
          </span>
        ))}
      </p>
      {text && (
        <p className={`mx-auto text-white ${compact ? "mt-2.5 max-w-[900px] text-base" : "mt-5 max-w-3xl leading-7 text-paper/90"}`}>
          {text.split("\n").map((line, index, lines) => (
            <span key={line}>
              {line}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function renderBlock(block: Block, index: number, bandImage?: string, variant: "default" | "photo" | "lifestyle" = "default") {
  if (block.type === "h2") {
    if (bandImage && /pura vida/i.test(block.text)) {
      const fullBleed = variant !== "lifestyle";
      return (
        <div
          key={index}
          className={`relative overflow-hidden ${
            fullBleed
              ? "left-1/2 right-1/2 mt-16 h-[340px] w-screen -translate-x-1/2"
              : "h-[300px] w-full md:h-[340px]"
          }`}
        >
          <Image src={bandImage} alt="" fill className="object-cover object-[center_58%]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/38 to-black/10" />
          <div className="relative z-10 mx-auto flex h-full max-w-[1180px] items-end px-5 pb-[54px] md:px-7">
            <h2 className="text-[31px] font-extrabold uppercase text-white md:text-[38px]">{block.text}</h2>
          </div>
        </div>
      );
    }
    if (variant === "photo") {
      return (
        <h2 key={index} className="max-w-[760px] text-[32px] font-extrabold uppercase leading-[1.05] text-white md:text-[48px]">
          {block.text}
        </h2>
      );
    }
    return (
      <h2 key={index} className="font-serif mt-0 text-center text-[42px] leading-[1.15] text-ink">
        {block.text}
      </h2>
    );
  }
  if (block.type === "intro" || (block.type === "p" && variant === "photo" && index <= 1)) {
    const text = block.type === "intro" || block.type === "p" ? block.text : "";
    if (variant === "photo") {
      return (
        <div key={index}>
          <p className="mt-0 max-w-[990px] text-[17px] leading-[1.55] text-white md:text-[19px]">{inline(text)}</p>
          <div className="my-10 h-0.5 w-[190px] bg-gold" />
        </div>
      );
    }
    return (
      <p key={index} className="mx-auto mb-[50px] mt-7 max-w-[920px] text-center text-lg leading-8 text-ink/75">
        {inline(text)}
      </p>
    );
  }
  if (block.type === "h3") {
    if (variant === "photo") {
      return (
        <h3 key={index} className="mb-1.5 mt-[26px] text-[20px] font-extrabold uppercase leading-[1.2] text-white md:text-[23px]">
          {block.text}
        </h3>
      );
    }
    return (
      <h3 key={index} className="font-serif mt-7 text-[27px] leading-[1.18] text-gold">
        {block.text}
      </h3>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote key={index} className="mt-10 space-y-2 text-center">
        {block.lines.map((line, lineIndex) => (
          <p key={lineIndex} className="font-serif text-2xl leading-snug text-ink">
            {inline(line)}
          </p>
        ))}
      </blockquote>
    );
  }
  if (block.type === "formula") {
    return (
      <p
        key={index}
        className="mt-8 border border-gold bg-[#f8f5ef] px-5 py-5 text-center text-sm font-extrabold tracking-[0.08em] uppercase text-ink"
      >
        {block.text}
      </p>
    );
  }
  if (block.type === "note") {
    return (
      <p key={index} className="mt-10 border border-gold bg-[#e8ddc8] px-6 py-7 text-center font-extrabold text-ink">
        {block.text}
      </p>
    );
  }
  if (block.type === "cta") {
    return <CtaBlock key={index} title={block.title} text={block.text} compact={variant === "lifestyle"} />;
  }
  if (block.type === "stats") {
    if (variant === "lifestyle") {
      return (
        <div key={index} className="mx-auto grid max-w-[950px] gap-7 px-5 pb-6 pt-[34px] text-center sm:grid-cols-3 sm:gap-5 sm:px-7 sm:pt-[38px] sm:pb-6">
          {block.items.map((item) => (
            <div key={item.value}>
              <p className="text-[34px] font-extrabold leading-none text-gold md:text-[38px]">{item.value}</p>
              <p className="mt-2 text-[12px] font-extrabold uppercase text-ink">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div key={index} className="mb-[52px] mt-[42px] grid border border-gold bg-[#f8f5ef] sm:grid-cols-3">
        {block.items.map((item, itemIndex) => (
          <div
            key={item.value}
            className={`px-[18px] py-[42px] text-center ${
              itemIndex < block.items.length - 1 ? "border-b border-[#e8ddc8] sm:border-b-0 sm:border-r" : ""
            }`}
          >
            <p className="font-serif text-[39px] leading-none text-gold">{item.value}</p>
            <p className="mt-2 text-[12px] font-extrabold tracking-[0.08em] uppercase text-ink">{item.label}</p>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "columns") {
    return (
      <div key={index} className="mt-[34px] grid gap-7 md:grid-cols-2 md:gap-x-[58px] md:gap-y-[34px]">
        {block.items.map((item) => (
          <div key={item.title}>
            <h3 className="mb-2.5 text-2xl font-extrabold uppercase leading-[1.12] text-gold">{item.title}</h3>
            <p className="text-base leading-[1.55] text-[#292725]">{item.text}</p>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "table") {
    return (
      <div key={index} className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden border border-gold text-left text-sm">
          <thead>
            <tr className="bg-gold text-white">
              {block.headers.map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gold/30 bg-[#f8f5ef]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-ink/80">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "p" && /^(sources|fuentes):/i.test(block.text)) {
    return (
      <p key={index} className="mt-12 text-[11px] text-[#6c675f]">
        {block.text}
      </p>
    );
  }
  if (variant === "photo") {
    return (
      <p key={index} className="mb-0 max-w-[1050px] text-base leading-[1.55] text-white">
        {inline(block.text)}
      </p>
    );
  }
  return (
    <p key={index} className="mt-4 leading-8 text-ink/80">
      {inline(block.text)}
    </p>
  );
}

export function ArticleBody({
  markdown,
  bandImage,
  photoImage,
}: {
  markdown: string;
  bandImage?: string;
  photoImage?: string;
}) {
  const blocks = parseArticle(markdown);

  if (photoImage) {
    const splitIndex = blocks.findIndex((block) => block.type === "h2" && /pura vida/i.test(block.text));
    const photoBlocks = splitIndex >= 0 ? blocks.slice(0, splitIndex) : blocks;
    const lifestyleBlocks = splitIndex >= 0 ? blocks.slice(splitIndex) : [];

    return (
      <div className="article-body">
        <section className="relative overflow-hidden py-[54px] text-white md:py-[70px] md:pb-[110px]">
          <Image src={photoImage} alt="" fill className="object-cover object-[center_45%]" sizes="100vw" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 mx-auto max-w-[1180px] px-5 md:px-7">
            {photoBlocks.map((block, index) => renderBlock(block, index, bandImage, "photo"))}
          </div>
        </section>
        <section className="bg-[#f7f3ea] pb-[70px]">
          {lifestyleBlocks[0] ? renderBlock(lifestyleBlocks[0], 0, bandImage, "lifestyle") : null}
          <div className="mx-auto max-w-[1180px] px-5 md:px-7">
            {lifestyleBlocks.slice(1).map((block, index) => renderBlock(block, index + 1, bandImage, "lifestyle"))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="article-body">
      {blocks.map((block, index) => renderBlock(block, index, bandImage))}
    </div>
  );
}
