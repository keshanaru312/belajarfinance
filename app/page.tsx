export const dynamic = "force-static";

// This page serves as the static root index.html needed by Cloudflare Pages.
// All actual routing/redirection is handled by middleware.ts.
export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center" style={{ minHeight: '100vh' }}>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Loading...</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Redirecting to preferred language.</p>
    </main>
  );
}
