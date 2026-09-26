import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-reading section flex flex-1 flex-col items-center justify-center text-center">
      <p className="eyebrow text-ink-muted">Error 404</p>
      <h1 className="mt-3 text-headline">This page could not be found</h1>
      <p className="mt-4 text-body-lg text-ink-muted">
        The piece you are looking for may have sold out or moved. Explore the latest arrivals instead.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to the shop
      </Link>
    </main>
  );
}
