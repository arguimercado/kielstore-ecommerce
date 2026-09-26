import type { ReactNode } from "react";
import { PlusIcon } from "@/components/icons";

/** Native <details> accordion row: hairline rules, eyebrow summary, plus that turns to a cross. */
export function Disclosure({
  title,
  id,
  defaultOpen = false,
  children,
}: {
  title: string;
  id?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details id={id} open={defaultOpen} className="group scroll-mt-header border-b border-line">
      <summary className="eyebrow flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <PlusIcon className="transition-transform duration-300 ease-luxe group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-body text-ink-muted">{children}</div>
    </details>
  );
}
