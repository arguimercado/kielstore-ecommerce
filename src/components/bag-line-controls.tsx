"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { type BagResult, removeFromBag, updateBagQuantity } from "@/app/bag/actions";
import { useCart } from "@/components/cart-provider";

/**
 * Quantity and Remove for one bag line. The options stop at what the server
 * says is available; the server re-checks every change and the page
 * re-renders with fresh totals when one succeeds.
 */
export function BagLineControls({
  lineId,
  name,
  quantity,
  maxQuantity,
}: {
  lineId: number;
  name: string;
  quantity: number;
  maxQuantity: number;
}) {
  const router = useRouter();
  const { setCount } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const errorId = `line-${lineId}-error`;

  // Keep the current value selectable even when stock has fallen below it.
  const options = Array.from({ length: Math.max(maxQuantity, quantity) }, (_, i) => i + 1);

  function run(action: () => Promise<BagResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) return setCount(result.count);
        if (result.reason === "signed-out") return router.push("/sign-in?callbackURL=%2Fbag");
        if (result.reason === "insufficient-stock") {
          setError(result.available > 0 ? `Only ${result.available} available.` : "This piece is sold out.");
        } else {
          setError("This piece is no longer available.");
        }
        router.refresh();
      } catch {
        setError("We couldn't update your bag. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-end gap-6">
        <label className="block">
          <span className="eyebrow text-ink-muted">Qty</span>
          <select
            className="field mt-1 w-16"
            value={quantity}
            disabled={pending}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            aria-label={`Quantity, ${name}`}
            onChange={(e) => run(() => updateBagQuantity(lineId, Number(e.target.value)))}
          >
            {options.map((n) => (
              <option key={n} value={n} disabled={n > maxQuantity}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending}
          aria-label={`Remove ${name} from bag`}
          onClick={() => run(() => removeFromBag(lineId))}
          className="eyebrow link-reveal pb-2 text-ink-muted hover:text-ink"
        >
          Remove
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
