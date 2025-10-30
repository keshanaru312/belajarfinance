export const runtime = "edge";

export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
  
    return (
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {lang === "bm"
            ? <>Selamat datang ke <span className="brand-belajar">Belajar</span><span className="brand-finance">Finance</span>!</>
            : <>Welcome to <span className="brand-belajar">Belajar</span><span className="brand-finance">Finance</span>!</>}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === "bm"
            ? "Pilih alat kewangan atau panduan untuk bermula."
            : "Choose a financial tool or guide to get started."}
        </p>
      </section>
    );
  }