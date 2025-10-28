export const dynamic = "force-static"; // 👈 forces prerendering

export default function StaticTest() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>✅ Static Test Page</h1>
      <p>
        If you can see this, Cloudflare is serving static content correctly
        (no Worker needed).
      </p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </main>
  );
}