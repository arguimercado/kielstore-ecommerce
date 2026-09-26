"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { CheckIcon, HeartIcon } from "@/components/icons";
import { getStockState, type Product } from "@/lib/catalog";

type Status = "idle" | "size-required" | "added" | "notify";

/**
 * Colour and size selection with add-to-bag. There is no cart yet, so adding
 * only confirms in place; wire `onAdd` to a server action once orders exist.
 */
export function PurchasePanel({ product }: { product: Product }) {
  const soldOut = getStockState(product.stock) === "sold-out";
  const hasSizes = product.sizes.length > 0;
  const unavailable = new Set(product.unavailableSizes);

  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [saved, setSaved] = useState(false);

  // Let the "Added" confirmation settle back to the normal button.
  useEffect(() => {
    if (status !== "added") return;
    const t = setTimeout(() => setStatus("idle"), 2500);
    return () => clearTimeout(t);
  }, [status]);

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (soldOut) {
      setStatus("notify");
      return;
    }
    if (hasSizes && !size) {
      setStatus("size-required");
      return;
    }
    setStatus("added");
  }

  const sizeError = status === "size-required";

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
                onChange={() => setColor(c.name)}
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
                      setStatus("idle");
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
          <button type="submit" className="btn btn-secondary btn-lg flex-1" disabled={status === "notify"}>
            {status === "notify" ? "We'll let you know" : "Notify me when available"}
          </button>
        ) : (
          <button type="submit" className="btn btn-primary btn-lg flex-1">
            {status === "added" ? (
              <>
                <CheckIcon /> Added to bag
              </>
            ) : (
              "Add to bag"
            )}
          </button>
        )}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          onClick={() => setSaved((v) => !v)}
          className="btn btn-secondary btn-lg btn-icon size-14"
        >
          <HeartIcon fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status === "added" && `${product.name}${size ? `, size ${size}` : ""}, added to your bag.`}
        {status === "notify" && `We'll email you when ${product.name} is back in stock.`}
      </p>
    </form>
  );
}
