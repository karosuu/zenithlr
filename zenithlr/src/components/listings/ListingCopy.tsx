import { parseListingCopy, type ListingCopyBlock } from "@/lib/listing-copy";

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="border-l border-sand pl-4 leading-7 text-ink/80"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function CopyBlock({
  block,
}: {
  block: ReturnType<typeof parseListingCopy>[number];
}) {
  if (block.type === "list") {
    return <FeatureList items={block.items} />;
  }
  if (block.type === "heading") {
    return <h3 className="text-xl font-semibold text-ink">{block.text}</h3>;
  }
  return <p className="leading-8 text-ink/75">{block.text}</p>;
}

export function ListingCopy({ text }: { text: string }) {
  const blocks = parseListingCopy(text);
  const nodes = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === "heading") {
      const section: ListingCopyBlock[] = [block];
      while (index + 1 < blocks.length && blocks[index + 1].type !== "heading") {
        index += 1;
        section.push(blocks[index]);
      }
      nodes.push(
        <section key={index} className="space-y-4">
          {section.map((item, itemIndex) => (
            <CopyBlock key={`${index}-${itemIndex}`} block={item} />
          ))}
        </section>,
      );
      continue;
    }

    nodes.push(<CopyBlock key={index} block={block} />);
  }

  return <div className="mt-6 space-y-5">{nodes}</div>;
}
