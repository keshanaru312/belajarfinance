export default async function LangHome({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
  
    return (
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">
          {lang === "bm"
            ? "Selamat datang ke BelajarFinance!"
            : "Welcome to BelajarFinance!"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {lang === "bm"
            ? "Pilih alat kewangan atau panduan untuk bermula."
            : "Choose a financial tool or guide to get started."}
        </p>
      </section>
    );
  }