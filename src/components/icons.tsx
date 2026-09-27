import type { SVGProps } from "react";

// 1px-stroke line icons, sized to the text they sit beside.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      aria-hidden="true"
      {...props}
    />
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </Icon>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </Icon>
  );
}

export function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4.5 8h15l-1 13h-13z" />
      <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
    </Icon>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />
    </Icon>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 7h18M3 12h18M3 17h18" />
    </Icon>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m5 5 14 14M19 5 5 19" />
    </Icon>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={16} height={16} {...props}>
      <path d="M12 4v16M4 12h16" />
    </Icon>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={16} height={16} {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  );
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={16} height={16} {...props}>
      <path d="M4 12h15M14 7l5 5-5 5" />
    </Icon>
  );
}

export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z" />
    </Icon>
  );
}

export function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4.5 5.5h4v4h-4zM4.5 14.5h4v4h-4zM11.5 7.5h8M11.5 16.5h8" />
    </Icon>
  );
}

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon width={16} height={16} {...props}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4" />
    </Icon>
  );
}
