export const dynamic = "force-static";
export const revalidate = false;

export default function StaticTest() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>✅ Static Test Page</h1>
      <p>If you see this, it’s being served as a static file.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </main>
  );
}