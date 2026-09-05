import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Nota Alvo — página inicial">
      <span className="brand-mark" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
          <path d="M19 13 29 3M23 3h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span><b>Nota Alvo</b></span>
    </Link>
  );
}
