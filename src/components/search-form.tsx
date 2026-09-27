"use client";

import Form from "next/form";
import { useId, type Ref } from "react";
import { useFormStatus } from "react-dom";
import { SearchIcon } from "@/components/icons";

function SubmitButton() {
  // Pending until the results route responds; disabled buttons dim via .btn.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Search"
      disabled={pending}
      className="btn btn-ghost btn-icon absolute top-1/2 right-0 -translate-y-1/2 hover:bg-transparent"
    >
      <SearchIcon />
    </button>
  );
}

/** Product search box. Submits to /search?q= with client-side navigation (plain GET without JS). */
export function SearchForm({
  defaultValue,
  inputRef,
  onSubmit,
  className,
}: {
  defaultValue?: string;
  inputRef?: Ref<HTMLInputElement>;
  onSubmit?: () => void;
  className?: string;
}) {
  const id = useId();

  return (
    <Form action="/search" role="search" onSubmit={onSubmit} className={className}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name="q"
          type="search"
          required
          maxLength={100}
          defaultValue={defaultValue}
          placeholder="Search coats, knitwear, leather…"
          autoComplete="off"
          enterKeyHint="search"
          className="field pr-12"
        />
        <SubmitButton />
      </div>
    </Form>
  );
}
