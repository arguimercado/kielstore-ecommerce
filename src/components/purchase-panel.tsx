"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useCart } from "@/components/cart-provider";
import { CheckIcon } from "@/components/icons";
import { WishlistButton } from "@/components/wishlist-button";
import { getStockState, type Product } from "@/lib/catalog";

type Status =
  | { kind: "idle" | "size-required" | "adding" | "added" | "notify" }
  | { kind: "error"; message: string };

/**
 * Colour and size selection with add-to-bag. The server checks the options
 * and the stock; this only confirms or explains what it decided.
 */
export function PurchasePanel({ product }: { product: Product }) {
  const soldOut = getStockState(product.stock) === "sold-out";
  const hasSizes = product.sizes.length > 0;
  const unavailable = new Set(product.unavailableSizes);

  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const cart = useCart();

  // Let the "Added" confirmation settle back to the normal button.
  useEffect(() => {
    if (status.kind !== "added") return;
    const t = setTimeout(() => setStatus({ kind: "idle" }), 2500);
    return () => clearTimeout(t);
  }, [status]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (status.kind === "adding") return;
    if (soldOut) {
      setStatus({ kind: "notify" });
      return;
    }
    if (hasSizes && !size) {
      setStatus({ kind: "size-required" });
      return;
    }
    setStatus({ kind: "adding" });
    try {
      const result = await cart.add(product.slug, color, size ?? "");
      if (!result || result.ok) {
        setStatus(result ? { kind: "added" } : { kind: "idle" });
      } else if (result.reason === "insufficient-stock") {
        setStatus({
          kind: "error",
          message:
            result.available > 0
              ? `Only ${result.available} available, and they're already in your bag.`
              : "Every piece we have is already in your bag.",
        });
      } else if (result.reason === "signed-out") {
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: "This option is no longer available." });
      }
    } catch {
      setStatus({ kind: "error", message: "We couldn't add this to your bag. Please try again." });
    }
  }

  const sizeError = status.kind === "size-required";

  return (
    <form onSubmit={onAdd} className="space-y-7" noValidate>
      <fieldset>
        <legend className="eyebrow text-ink-muted">
          Colour <span className="ml-1 text-ink normal-case tracking-normal">{color}</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-1">
          {product.colors.map((c) => (
            <label
              key={c.name}
              className="swatch"
              style={{ "--swatch": c.hex } as CSSProperties}
              title={c.name}
            >
              <input
                type="radio"
                name="color"
                value={c.name}
                checked={color === c.name}
                onChange={() => {
                  setColor(c.name);
                  setStatus({ kind: "idle" });
                }}
              />
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {hasSizes && (
        <fieldset aria-describedby={sizeError ? "size-error" : undefined}>
          {/* Floated so the size guide link can share its line. */}
          <legend className="eyebrow float-left text-ink-muted">
            Size {size && <span className="ml-1 text-ink normal-case tracking-normal">{size}</span>}
          </legend>
          <a href="#size-and-fit" className="link float-right text-caption text-ink-muted">
            Size guide
          </a>
          <div className="clear-both flex flex-wrap gap-2 pt-3">
            {product.sizes.map((s) => {
              const disabled = soldOut || unavailable.has(s);
              return (
                <label key={s} className="chip" title={disabled ? `${s}, unavailable` : s}>
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    disabled={disabled}
                    checked={size === s}
                    onChange={() => {
                      setSize(s);
                      setStatus({ kind: "idle" });
                    }}
                  />
                  {s}
                  {disabled && <span className="sr-only">, unavailable</span>}
                </label>
              );
            })}
          </div>
          {sizeError && (
            <p id="size-error" className="mt-3 text-caption text-danger">
              Please select a size.
            </p>
          )}
        </fieldset>
      )}

      <div className="flex gap-2">
        {soldOut ? (
          <button type="submit" className="btn btn-secondary btn-lg flex-1" disabled={status.kind === "notify"}>
            {status.kind === "notify" ? "We'll let you know" : "Notify me when available"}
          </button>
        ) : (
          <button type="submit" className="btn btn-primary btn-lg flex-1" aria-disabled={status.kind === "adding"}>
            {status.kind === "added" ? (
              <>
                <CheckIcon /> Added to bag
              </>
            ) : (
              "Add to bag"
            )}
          </button>
        )}
        <WishlistButton
          slug={product.slug}
          name={product.name}
          className="btn btn-secondary btn-lg btn-icon size-14"
        />
      </div>

      {status.kind === "error" && <p className="-mt-4 text-caption text-danger">{status.message}</p>}

      <p role="status" aria-live="polite" className="sr-only">
        {status.kind === "added" && `${product.name}${size ? `, size ${size}` : ""}, added to your bag.`}
        {status.kind === "notify" && `We'll email you when ${product.name} is back in stock.`}
        {status.kind === "error" && status.message}
      </p>
    </form>
  );
}
