import type { Localized } from "@/lib/types";

export function BilingualField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
}) {
  const Field = multiline ? "textarea" : "input";
  return (
    <fieldset className="grid gap-3 md:grid-cols-2">
      <label className="text-xs tracking-[0.14em] uppercase text-sand-deep">
        {label} · EN
        <Field
          className="admin-input mt-2"
          rows={multiline ? 6 : undefined}
          value={value.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
        />
      </label>
      <label className="text-xs tracking-[0.14em] uppercase text-sand-deep">
        {label} · ES
        <Field
          className="admin-input mt-2"
          rows={multiline ? 6 : undefined}
          value={value.es}
          onChange={(e) => onChange({ ...value, es: e.target.value })}
        />
      </label>
    </fieldset>
  );
}
