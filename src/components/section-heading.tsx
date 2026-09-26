import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <p className="eyebrow text-ink-muted">{eyebrow}</p>
        <h2 className="mt-3 text-headline">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="eyebrow link-reveal self-start sm:self-auto sm:shrink-0 sm:pb-1">
          {action.label}
        </Link>
      )}
    </div>
  );
}
