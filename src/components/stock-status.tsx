import { getStockState, type StockState } from "@/lib/catalog";

const dot: Record<StockState, string> = {
  "in-stock": "bg-success",
  "low-stock": "bg-accent",
  "sold-out": "bg-ink-subtle",
};

export function stockLabel(stock: number) {
  switch (getStockState(stock)) {
    case "in-stock":
      return "In stock";
    case "low-stock":
      return `Only ${stock} left`;
    case "sold-out":
      return "Sold out";
  }
}

export function StockStatus({ stock, className = "" }: { stock: number; className?: string }) {
  const state = getStockState(stock);

  return (
    <p className={`flex items-center gap-2 text-caption ${className}`}>
      <span aria-hidden="true" className={`size-1.5 shrink-0 ${dot[state]}`} />
      <span className={state === "low-stock" ? "text-accent" : state === "sold-out" ? "text-ink-muted" : ""}>
        {stockLabel(stock)}
      </span>
    </p>
  );
}
