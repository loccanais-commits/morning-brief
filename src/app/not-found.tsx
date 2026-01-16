import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-black">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Page Not Found
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
            It may have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black font-medium hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </Link>
          <Link
            href="/archive"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Browse Archive
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-sm text-[var(--text-muted)]">
            Need help? Contact us at{" "}
            <a
              href="mailto:hello@morningbrief.news"
              className="text-[var(--accent-primary)] hover:underline"
            >
              hello@morningbrief.news
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
