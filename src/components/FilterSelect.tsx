"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterSelect({
  paramKey,
  options,
  placeholder,
  className = "input w-44 py-1.5 text-sm",
}: {
  paramKey: string;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = new URLSearchParams(params.toString());
    if (e.target.value) p.set(paramKey, e.target.value);
    else p.delete(paramKey);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <select className={className} value={params.get(paramKey) ?? ""} onChange={onChange}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
